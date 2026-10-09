import { Product, Category, Transaction, User, Facility, ReorderRule, PurchaseOrder, SqlQueryResult } from '../types/warehouse';

export interface DatabaseTables {
  products: Product[];
  categories: Category[];
  transactions: Transaction[];
  users: User[];
  facilities: Facility[];
  reorder_rules: ReorderRule[];
  purchase_orders: PurchaseOrder[];
}

export function executeSqlSimulation(
  rawSql: string,
  tables: DatabaseTables
): SqlQueryResult {
  const startTime = performance.now();
  const sql = rawSql.trim();

  if (!sql) {
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: 0.1,
      error: 'Empty SQL query provided.',
    };
  }

  try {
    const normalized = sql.replace(/;/g, '').trim();

    // SHOW TABLES
    if (/^SHOW\s+TABLES/i.test(normalized)) {
      const tableNames = Object.keys(tables).map((name) => ({ table_name: name }));
      return {
        columns: ['table_name'],
        rows: tableNames,
        rowCount: tableNames.length,
        executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
      };
    }

    // SELECT
    if (/^SELECT/i.test(normalized)) {
      // Find table name
      const fromMatch = normalized.match(/FROM\s+([a-zA-Z_]+)(?:\s+(?:AS\s+)?([a-zA-Z_]+))?/i);
      if (!fromMatch) {
        throw new Error("Syntax error: Missing FROM clause or unsupported query structure.");
      }

      const tableName = fromMatch[1].toLowerCase() as keyof DatabaseTables;
      if (!(tableName in tables)) {
        throw new Error(`Table '${tableName}' does not exist in WarehouseDB SQLite schema.`);
      }

      let data: any[] = [...(tables[tableName] as any[])];

      // Handle simple join if requested e.g. JOIN categories ON ...
      const joinMatch = normalized.match(/JOIN\s+([a-zA-Z_]+)\s+ON\s+([a-zA-Z0-9_.]+)\s*=\s*([a-zA-Z0-9_.]+)/i);
      if (joinMatch) {
        const joinTable = joinMatch[1].toLowerCase() as keyof DatabaseTables;
        if (joinTable in tables) {
          const joinTargetData = tables[joinTable] as any[];
          data = data.map((item) => {
            const cat = joinTargetData.find((c) => c.id === item.categoryId || c.id === item.category_id);
            return {
              ...item,
              category_name: cat ? cat.name : 'Unknown',
              category_desc: cat ? cat.description : '',
            };
          });
        }
      }

      // Handle WHERE
      const whereMatch = normalized.match(/WHERE\s+([^ORDER|GROUP|LIMIT;]+)/i);
      if (whereMatch) {
        const condition = whereMatch[1].trim();

        // status = 'value'
        const statusMatch = condition.match(/status\s*=\s*['"]([^'"]+)['"]/i);
        if (statusMatch) {
          data = data.filter((row) => String(row.status).toLowerCase() === statusMatch[1].toLowerCase());
        }

        // type = 'IN' / 'OUT'
        const typeMatch = condition.match(/type\s*=\s*['"]([^'"]+)['"]/i);
        if (typeMatch) {
          data = data.filter((row) => String(row.type).toUpperCase() === typeMatch[1].toUpperCase());
        }

        // quantity <= / < / >= / > / = number
        const qtyMatch = condition.match(/quantity\s*([<>=!]+)\s*(\d+)/i);
        if (qtyMatch) {
          const op = qtyMatch[1];
          const val = Number(qtyMatch[2]);
          data = data.filter((row) => {
            const q = Number(row.quantity);
            if (op === '<=') return q <= val;
            if (op === '<') return q < val;
            if (op === '>=') return q >= val;
            if (op === '>') return q > val;
            if (op === '=' || op === '==') return q === val;
            if (op === '!=' || op === '<>') return q !== val;
            return true;
          });
        }

        // min_threshold or minStockThreshold
        if (condition.includes('quantity <= min_stock') || condition.includes('quantity <= minStockThreshold')) {
          data = data.filter((row) => Number(row.quantity) <= Number(row.minStockThreshold || 10));
        }
      }

      // Handle ORDER BY
      const orderMatch = normalized.match(/ORDER\s+BY\s+([a-zA-Z_]+)(?:\s+(ASC|DESC))?/i);
      if (orderMatch) {
        const field = orderMatch[1];
        const dir = (orderMatch[2] || 'ASC').toUpperCase();
        data.sort((a, b) => {
          const valA = a[field] ?? '';
          const valB = b[field] ?? '';
          if (typeof valA === 'number' && typeof valB === 'number') {
            return dir === 'DESC' ? valB - valA : valA - valB;
          }
          return dir === 'DESC'
            ? String(valB).localeCompare(String(valA))
            : String(valA).localeCompare(String(valB));
        });
      }

      // Handle LIMIT
      const limitMatch = normalized.match(/LIMIT\s+(\d+)/i);
      if (limitMatch) {
        data = data.slice(0, Number(limitMatch[1]));
      }

      // Handle SELECT column projection
      const selectColMatch = normalized.match(/^SELECT\s+(.*?)\s+FROM/i);
      let columns: string[] = [];

      if (data.length === 0) {
        // Return dummy column headers if empty
        return {
          columns: ['result'],
          rows: [],
          rowCount: 0,
          executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
        };
      }

      if (selectColMatch && selectColMatch[1].trim() !== '*') {
        const rawCols = selectColMatch[1].split(',').map((c) => c.trim());
        const projectedRows = data.map((row) => {
          const outRow: Record<string, any> = {};
          rawCols.forEach((colExp) => {
            const aliasMatch = colExp.match(/(?:[a-zA-Z0-9_.]+\s+(?:AS\s+)?([a-zA-Z0-9_]+))|([a-zA-Z0-9_]+)/i);
            const key = aliasMatch ? (aliasMatch[1] || aliasMatch[2]) : colExp;
            outRow[key] = row[key] !== undefined ? row[key] : (row[colExp] ?? null);
          });
          return outRow;
        });
        columns = rawCols.map((c) => {
          const alias = c.match(/(?:AS\s+)?([a-zA-Z0-9_]+)$/i);
          return alias ? alias[1] : c;
        });
        return {
          columns,
          rows: projectedRows,
          rowCount: projectedRows.length,
          executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
        };
      } else {
        columns = Object.keys(data[0] || {});
        // Omit complex nested objects for clean grid view
        const cleanRows = data.map((item) => {
          const clone: Record<string, any> = {};
          for (const k of columns) {
            if (typeof item[k] === 'object' && item[k] !== null) {
              clone[k] = JSON.stringify(item[k]);
            } else {
              clone[k] = item[k];
            }
          }
          return clone;
        });

        return {
          columns,
          rows: cleanRows,
          rowCount: cleanRows.length,
          executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
        };
      }
    }

    // Default response for INSERT / UPDATE / PRAGMA
    return {
      columns: ['status', 'message'],
      rows: [{ status: 'SUCCESS', message: `Query executed successfully: ${sql.slice(0, 40)}...` }],
      rowCount: 1,
      executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
    };
  } catch (err: any) {
    return {
      columns: [],
      rows: [],
      rowCount: 0,
      executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
      error: err?.message || 'SQL execution failed.',
    };
  }
}

export const SAMPLE_SQL_QUERIES = [
  {
    title: 'Low Stock Products',
    sql: "SELECT id, name, categoryName, quantity, minStockThreshold, status FROM products WHERE status = 'Low Stock';",
  },
  {
    title: 'All Inbound Transactions',
    sql: "SELECT id, productName, type, quantity, date, handledBy, notes FROM transactions WHERE type = 'IN' ORDER BY date DESC LIMIT 10;",
  },
  {
    title: 'Products with Zero Inventory (Stockout)',
    sql: "SELECT id, name, unitPrice, location, status FROM products WHERE quantity <= 0;",
  },
  {
    title: 'Top Inventory by Quantity',
    sql: "SELECT id, name, categoryName, quantity, unitPrice FROM products ORDER BY quantity DESC LIMIT 6;",
  },
  {
    title: 'Active Warehouse Facilities',
    sql: "SELECT id, name, code, city, capacityUnits, activeStatus FROM facilities;",
  },
  {
    title: 'Automated Reorder Rules',
    sql: "SELECT id, productName, minThreshold, reorderBatchSize, supplier, autoApprove FROM reorder_rules WHERE isActive = true;",
  },
];

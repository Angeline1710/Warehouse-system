import React, { useState } from 'react';
import {
  Database,
  Table,
  Eye,
  Key,
  Play,
  Download,
  Plus,
  Pencil,
  Trash2,
  Search,
  CheckCircle2,
  FileCode,
  Layers,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { executeSqlSimulation, SAMPLE_SQL_QUERIES } from '../utils/sqlEngine';
import { SqlQueryResult } from '../types/warehouse';

type DbTab = 'structure' | 'browse' | 'sql';

export const WarehouseDBView: React.FC = () => {
  const {
    products,
    categories,
    transactions,
    users,
    facilities,
    reorderRules,
    purchaseOrders,
    deleteProduct,
    showToast,
  } = useWarehouse();

  const [activeTab, setActiveTab] = useState<DbTab>('browse');
  const [selectedTable, setSelectedTable] = useState<string>('products');

  // Filters for Browse Data tables
  const [productFilter, setProductFilter] = useState('');
  const [transactionFilter, setTransactionFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  // SQL Execution state
  const [sqlQuery, setSqlQuery] = useState<string>(
    "SELECT id, name, categoryName, quantity, status FROM products WHERE status = 'Low Stock';"
  );
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);

  // Run SQL simulation
  const handleRunSql = (overrideSql?: string) => {
    const toRun = overrideSql !== undefined ? overrideSql : sqlQuery;
    const res = executeSqlSimulation(toRun, {
      products,
      categories,
      transactions,
      users,
      facilities,
      reorder_rules: reorderRules,
      purchase_orders: purchaseOrders,
    });
    setQueryResult(res);
  };

  // Export current table or query results to CSV
  const handleExportCsv = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
            return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast({
      type: 'success',
      title: 'CSV Exported',
      message: `Downloaded ${filename}.csv successfully.`,
    });
  };

  // Filtered rows for 2x2 grid
  const filteredProducts = products.filter((p) => {
    if (!productFilter) return true;
    const q = productFilter.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q)
    );
  });

  const filteredTransactions = transactions.filter((t) => {
    if (!transactionFilter) return true;
    const q = transactionFilter.toLowerCase();
    return (
      t.productName.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      t.handledBy.toLowerCase().includes(q) ||
      t.notes.toLowerCase().includes(q)
    );
  });

  const filteredCategories = categories.filter((c) => {
    if (!categoryFilter) return true;
    const q = categoryFilter.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
  });

  const filteredUsers = users.filter((u) => {
    if (!userFilter) return true;
    const q = userFilter.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col min-h-[750px]">
      {/* Top Application Bar matching Image 2 */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide">
            WarehouseDB - Database Browser (SQLite)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span>In-Memory SQLite v3.45</span>
        </div>
      </div>

      {/* Database Navigation Tabs matching Image 2 */}
      <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-4">
        <button
          onClick={() => setActiveTab('structure')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'structure'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Database Structure
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'browse'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Browse Data
        </button>
        <button
          onClick={() => {
            setActiveTab('sql');
            if (!queryResult) handleRunSql();
          }}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'sql'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Execute SQL
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar Table Navigator matching Image 2 */}
        <div className="w-full lg:w-56 bg-slate-900 text-slate-300 p-3 shrink-0 border-r border-slate-800 space-y-4">
          <div>
            <div className="flex items-center gap-2 px-2 py-1.5 text-white font-bold text-sm">
              <Database className="w-4 h-4 text-blue-400" />
              <span>WarehouseDB</span>
            </div>
            <div className="text-[11px] text-slate-400 px-2 pb-2">
              SQLite Database
            </div>
          </div>

          <div>
            <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Tables
            </div>
            <div className="space-y-0.5">
              {[
                { name: 'products', count: products.length },
                { name: 'categories', count: categories.length },
                { name: 'transactions', count: transactions.length },
                { name: 'users', count: users.length },
                { name: 'facilities', count: facilities.length },
                { name: 'reorder_rules', count: reorderRules.length },
                { name: 'purchase_orders', count: purchaseOrders.length },
              ].map((tbl) => (
                <button
                  key={tbl.name}
                  onClick={() => setSelectedTable(tbl.name)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    selectedTable === tbl.name
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Table className="w-3.5 h-3.5 shrink-0 opacity-80" />
                    <span>{tbl.name}</span>
                  </div>
                  <span className="text-[10px] opacity-70">
                    ({tbl.count})
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Schema Objects
            </div>
            <div className="space-y-1 text-xs text-slate-400">
              <div className="px-2 py-1 flex items-center gap-2 hover:text-white cursor-default">
                <Eye className="w-3.5 h-3.5" />
                <span>Views (2)</span>
              </div>
              <div className="px-2 py-1 flex items-center gap-2 hover:text-white cursor-default">
                <Key className="w-3.5 h-3.5" />
                <span>Indexes (8)</span>
              </div>
              <div className="px-2 py-1 flex items-center gap-2 hover:text-white cursor-default">
                <Layers className="w-3.5 h-3.5" />
                <span>Triggers (3)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Content Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50">
          {/* TAB 1: BROWSE DATA (Matches 2x2 layout in Image 2!) */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* 1. products (12 rows) */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold text-slate-900">
                        products ({products.length} rows)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          showToast({
                            type: 'info',
                            title: 'SQLite Record Creator',
                            message: 'Use Quick Actions or Add Product dialog to insert verified records.',
                          })
                        }
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>New Record</span>
                      </button>
                      <button
                        onClick={() => handleExportCsv(products, 'warehouse_products')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter input */}
                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter in any column..."
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto max-h-64 border border-slate-100 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-semibold text-slate-600">
                        <tr>
                          <th className="py-2 px-2.5">id</th>
                          <th className="py-2 px-2.5">name</th>
                          <th className="py-2 px-2.5 text-center">category_id</th>
                          <th className="py-2 px-2.5 text-center">quantity</th>
                          <th className="py-2 px-2.5 text-right">unit_price</th>
                          <th className="py-2 px-2.5 text-center">location</th>
                          <th className="py-2 px-2.5 text-center">status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="py-1.5 px-2.5 font-sans font-medium text-slate-800">
                              {p.dbId}
                            </td>
                            <td className="py-1.5 px-2.5 font-sans font-medium text-slate-900">
                              {p.name}
                            </td>
                            <td className="py-1.5 px-2.5 text-center">{p.categoryId}</td>
                            <td className="py-1.5 px-2.5 text-center font-bold">{p.quantity}</td>
                            <td className="py-1.5 px-2.5 text-right font-sans">
                              ${p.unitPrice.toLocaleString()}
                            </td>
                            <td className="py-1.5 px-2.5 text-center">{p.location}</td>
                            <td className="py-1.5 px-2.5 text-center font-sans">
                              {p.status === 'In Stock' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                  In Stock
                                </span>
                              )}
                              {p.status === 'Low Stock' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                                  Low Stock
                                </span>
                              )}
                              {p.status === 'Out of Stock' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">
                                  Out of Stock
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. transactions (15 rows) */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold text-slate-900">
                        transactions ({transactions.length} rows)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleExportCsv(transactions, 'warehouse_transactions')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>CSV</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter input */}
                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Filter in any column..."
                      value={transactionFilter}
                      onChange={(e) => setTransactionFilter(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto max-h-64 border border-slate-100 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 font-semibold text-slate-600">
                        <tr>
                          <th className="py-2 px-2.5">id</th>
                          <th className="py-2 px-2.5 text-center">product_id</th>
                          <th className="py-2 px-2.5 text-center">type</th>
                          <th className="py-2 px-2.5 text-center">quantity</th>
                          <th className="py-2 px-2.5">date</th>
                          <th className="py-2 px-2.5">handled_by</th>
                          <th className="py-2 px-2.5">notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                        {filteredTransactions.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="py-1.5 px-2.5 font-sans font-medium text-slate-800">
                              {t.dbId}
                            </td>
                            <td className="py-1.5 px-2.5 text-center">{t.productId}</td>
                            <td className="py-1.5 px-2.5 text-center font-sans">
                              {t.type === 'IN' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  IN
                                </span>
                              )}
                              {t.type === 'OUT' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                  OUT
                                </span>
                              )}
                              {t.type === 'TRANSFER' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                                  TRANSFER
                                </span>
                              )}
                            </td>
                            <td className="py-1.5 px-2.5 text-center font-bold">
                              {t.quantity}
                            </td>
                            <td className="py-1.5 px-2.5 text-slate-600">{t.date}</td>
                            <td className="py-1.5 px-2.5 font-sans text-slate-700">
                              {t.handledBy}
                            </td>
                            <td className="py-1.5 px-2.5 font-sans text-slate-600 max-w-[130px] truncate">
                              {t.notes}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. categories (3 rows) */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold text-slate-900">
                        categories ({categories.length} rows)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleExportCsv(categories, 'warehouse_categories')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>CSV</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                        <tr>
                          <th className="py-2 px-2.5">id</th>
                          <th className="py-2 px-2.5">name</th>
                          <th className="py-2 px-2.5">description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {filteredCategories.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50">
                            <td className="py-2 px-2.5 font-mono">{c.id}</td>
                            <td className="py-2 px-2.5 font-semibold text-slate-900">
                              {c.name}
                            </td>
                            <td className="py-2 px-2.5 text-slate-600">{c.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. users (3 rows) */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-3.5 flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold text-slate-900">
                        users ({users.length} rows)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleExportCsv(users, 'warehouse_users')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>CSV</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-lg">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                        <tr>
                          <th className="py-2 px-2.5">id</th>
                          <th className="py-2 px-2.5">username</th>
                          <th className="py-2 px-2.5">role</th>
                          <th className="py-2 px-2.5">full_name</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50">
                            <td className="py-2 px-2.5 font-mono">{u.id}</td>
                            <td className="py-2 px-2.5 font-semibold text-slate-900">
                              {u.username}
                            </td>
                            <td className="py-2 px-2.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                                {u.role}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 text-slate-700">{u.fullName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATABASE STRUCTURE */}
          {activeTab === 'structure' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span>SQLite Schema DDL Specifications</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Relational table definitions, primary keys, and foreign key constraints enforcing warehouse inventory integrity.
                </p>

                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-3.5 py-2 font-mono text-xs font-bold text-slate-800">
                      CREATE TABLE products (
                    </div>
                    <div className="p-3 bg-slate-900 text-slate-200 font-mono text-xs space-y-1">
                      <div>  id TEXT PRIMARY KEY,</div>
                      <div>  name TEXT NOT NULL,</div>
                      <div>  sku TEXT UNIQUE NOT NULL,</div>
                      <div>  category_id INTEGER REFERENCES categories(id),</div>
                      <div>  quantity INTEGER NOT NULL DEFAULT 0 CHECK(quantity &gt;= 0),</div>
                      <div>  min_stock_threshold INTEGER NOT NULL DEFAULT 10,</div>
                      <div>  reorder_quantity INTEGER NOT NULL DEFAULT 25,</div>
                      <div>  unit_price NUMERIC(10,2) NOT NULL,</div>
                      <div>  location TEXT NOT NULL,</div>
                      <div>  status TEXT CHECK(status IN ('In Stock', 'Low Stock', 'Out of Stock'))</div>
                      <div className="text-slate-400">);</div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-3.5 py-2 font-mono text-xs font-bold text-slate-800">
                      CREATE TABLE transactions (
                    </div>
                    <div className="p-3 bg-slate-900 text-slate-200 font-mono text-xs space-y-1">
                      <div>  id TEXT PRIMARY KEY,</div>
                      <div>  product_id TEXT REFERENCES products(id),</div>
                      <div>  type TEXT CHECK(type IN ('IN', 'OUT', 'TRANSFER')),</div>
                      <div>  quantity INTEGER NOT NULL CHECK(quantity &gt; 0),</div>
                      <div>  facility_id TEXT REFERENCES facilities(id),</div>
                      <div>  date DATE NOT NULL,</div>
                      <div>  handled_by TEXT REFERENCES users(username),</div>
                      <div>  notes TEXT</div>
                      <div className="text-slate-400">);</div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-100 px-3.5 py-2 font-mono text-xs font-bold text-slate-800">
                      CREATE TABLE facilities (
                    </div>
                    <div className="p-3 bg-slate-900 text-slate-200 font-mono text-xs space-y-1">
                      <div>  id TEXT PRIMARY KEY,</div>
                      <div>  name TEXT NOT NULL,</div>
                      <div>  code TEXT UNIQUE NOT NULL,</div>
                      <div>  city TEXT NOT NULL,</div>
                      <div>  state TEXT NOT NULL,</div>
                      <div>  capacity_units INTEGER NOT NULL,</div>
                      <div>  active_status TEXT DEFAULT 'Active'</div>
                      <div className="text-slate-400">);</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EXECUTE SQL */}
          {activeTab === 'sql' && (
            <div className="space-y-4">
              {/* Presets */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs">
                <div className="text-xs font-bold text-slate-700 mb-2">
                  Sample Query Presets:
                </div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_SQL_QUERIES.map((sample, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSqlQuery(sample.sql);
                        handleRunSql(sample.sql);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors"
                    >
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* SQL Console */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800">
                    SQL Command:
                  </label>
                  <button
                    onClick={() => handleRunSql()}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Query</span>
                  </button>
                </div>

                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={4}
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-cyan-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/30"
                  placeholder="Enter SQL command here..."
                />
              </div>

              {/* Results Grid */}
              {queryResult && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-800">
                        Query Results ({queryResult.rowCount} rows returned in{' '}
                        {queryResult.executionTimeMs} ms)
                      </span>
                    </div>

                    {queryResult.rows.length > 0 && (
                      <button
                        onClick={() => handleExportCsv(queryResult.rows, 'sql_query_result')}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                    )}
                  </div>

                  {queryResult.error ? (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
                      {queryResult.error}
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-80 border border-slate-100 rounded-xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 sticky top-0 border-b border-slate-200 font-semibold text-slate-700">
                          <tr>
                            {queryResult.columns.map((col) => (
                              <th key={col} className="py-2 px-3">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                          {queryResult.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              {queryResult.columns.map((col) => (
                                <td key={col} className="py-1.5 px-3">
                                  {typeof row[col] === 'boolean'
                                    ? String(row[col])
                                    : String(row[col] ?? '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

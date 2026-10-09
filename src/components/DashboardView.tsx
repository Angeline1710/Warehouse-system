import React, { useState, useMemo } from 'react';
import {
  Box,
  Boxes,
  AlertTriangle,
  Truck,
  Plus,
  Pencil,
  Trash2,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  ExternalLink,
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Building2,
  X,
  RotateCcw,
  CheckCircle2,
  PackagePlus,
  ArrowRightLeft,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { Product, ProductStatus } from '../types/warehouse';
import { ActiveNavTab } from './Sidebar';

interface DashboardViewProps {
  onOpenAddProduct: () => void;
  onOpenStockIn: (productId?: string) => void;
  onOpenStockOut: (productId?: string) => void;
  onEditProduct: (product: Product) => void;
  setActiveTab: (tab: ActiveNavTab) => void;
  searchQuery: string;
}

type SortField = 'id' | 'name' | 'category' | 'quantity' | 'status';
type SortDirection = 'asc' | 'desc';

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddProduct,
  onOpenStockIn,
  onOpenStockOut,
  onEditProduct,
  setActiveTab,
  searchQuery: externalSearchQuery,
}) => {
  const {
    viewProducts,
    totalProductsCount,
    totalStockCount,
    lowStockCount,
    outOfStockCount,
    inStockCount,
    totalOrdersCount,
    transactions,
    deleteProduct,
    selectedFacilityId,
    setSelectedFacilityId,
    facilities,
    categories,
    stockIn,
    stockOut,
  } = useWarehouse();

  // Interactive dashboard filter states
  const [showInventoryItems, setShowInventoryItems] = useState(false);
  const [internalSearch, setInternalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ProductStatus>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [txTypeFilter, setTxTypeFilter] = useState<'ALL' | 'IN' | 'OUT' | 'TRANSFER'>('ALL');
  const [donutHovered, setDonutHovered] = useState<string | null>(null);

  // Active combined search
  const effectiveSearch = (externalSearchQuery || internalSearch).trim().toLowerCase();

  // Filtered & Sorted products
  const processedProducts = useMemo(() => {
    let result = [...viewProducts];

    // Search filter
    if (effectiveSearch) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(effectiveSearch) ||
          p.id.toLowerCase().includes(effectiveSearch) ||
          p.categoryName.toLowerCase().includes(effectiveSearch) ||
          p.location.toLowerCase().includes(effectiveSearch) ||
          p.sku.toLowerCase().includes(effectiveSearch)
      );
    }

    // Status filter (from KPI cards or donut clicks)
    if (statusFilter !== 'All') {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'All') {
      result = result.filter((p) => p.categoryName === categoryFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') {
        comparison = a.dbId - b.dbId;
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'category') {
        comparison = a.categoryName.localeCompare(b.categoryName);
      } else if (sortField === 'quantity') {
        comparison = a.quantity - b.quantity;
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [
    viewProducts,
    effectiveSearch,
    statusFilter,
    categoryFilter,
    sortField,
    sortDirection,
  ]);

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered transactions for recent activity widget
  const filteredTransactions = useMemo(() => {
    let txs = transactions;
    if (txTypeFilter !== 'ALL') {
      txs = txs.filter((t) => t.type === txTypeFilter);
    }
    return txs.slice(0, 5);
  }, [transactions, txTypeFilter]);

  // SVG Donut calculation
  const totalItems = totalProductsCount || 1;
  const inStockPct = (inStockCount / totalItems) * 100;
  const lowStockPct = (lowStockCount / totalItems) * 100;
  const outOfStockPct = (outOfStockCount / totalItems) * 100;

  const radius = 58;
  const circumference = 2 * Math.PI * radius; // ~364.4

  const inStockDash = (inStockPct / 100) * circumference;
  const lowStockDash = (lowStockPct / 100) * circumference;
  const outOfStockDash = (outOfStockPct / 100) * circumference;

  const inStockOffset = 0;
  const lowStockOffset = -inStockDash;
  const outOfStockOffset = -(inStockDash + lowStockDash);

  return (
    <div className="space-y-6">
      {/* 4 Interactive Stat Metric Cards matching Image 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Products */}
        <button
          onClick={() => {
            setShowInventoryItems((prev) => !prev);
            setStatusFilter('All');
          }}
          className={`bg-[#eef5ff] border rounded-2xl p-5 flex items-center justify-between shadow-xs transition-all text-left cursor-pointer group hover:-translate-y-1 ${
            showInventoryItems
              ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-md bg-blue-50/90'
              : 'border-blue-100/90 hover:border-blue-300'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-100 group-hover:bg-blue-200/80 flex items-center justify-center text-blue-600 shrink-0 transition-colors">
            <Box className="w-8 h-8" />
          </div>
          <div className="text-right">
            <div className="text-xs sm:text-sm font-medium text-slate-600 flex items-center justify-end gap-1">
              <span>Total Products</span>
              {showInventoryItems && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              )}
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {totalProductsCount}
            </div>
            <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
              {showInventoryItems ? '✓ Items Displayed (Click to hide)' : 'Click to display items'}
            </div>
          </div>
        </button>

        {/* Card 2: Total Stock */}
        <button
          onClick={() => {
            setStatusFilter('All');
          }}
          className="bg-[#ebfbf3] border border-emerald-100/90 hover:border-emerald-300 rounded-2xl p-5 flex items-center justify-between shadow-xs transition-all text-left cursor-pointer group hover:-translate-y-1"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 group-hover:bg-emerald-200/80 flex items-center justify-center text-emerald-600 shrink-0 transition-colors">
            <Boxes className="w-8 h-8" />
          </div>
          <div className="text-right">
            <div className="text-xs sm:text-sm font-medium text-slate-600">
              Total Stock
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {totalStockCount}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              Across all bays
            </div>
          </div>
        </button>

        {/* Card 3: Low Stock Items (Interactive click filters immediately!) */}
        <button
          onClick={() => {
            setStatusFilter(statusFilter === 'Low Stock' ? 'All' : 'Low Stock');
          }}
          className={`bg-[#fff8e7] border rounded-2xl p-5 flex items-center justify-between shadow-xs transition-all text-left cursor-pointer group hover:-translate-y-1 ${
            statusFilter === 'Low Stock'
              ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-md bg-amber-50'
              : 'border-amber-100/90 hover:border-amber-300'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-100 group-hover:bg-amber-200/80 flex items-center justify-center text-amber-600 shrink-0 transition-colors">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="text-right">
            <div className="text-xs sm:text-sm font-medium text-slate-600 flex items-center justify-end gap-1">
              <span>Low Stock Items</span>
              {statusFilter === 'Low Stock' && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
              )}
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {lowStockCount}
            </div>
            <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
              {statusFilter === 'Low Stock' ? '✓ Filter Active' : 'Click to filter'}
            </div>
          </div>
        </button>

        {/* Card 4: Total Orders */}
        <button
          onClick={() => setActiveTab('reorders')}
          className="bg-[#fff0f2] border border-rose-100/90 hover:border-rose-300 rounded-2xl p-5 flex items-center justify-between shadow-xs transition-all text-left cursor-pointer group hover:-translate-y-1"
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-100 group-hover:bg-rose-200/80 flex items-center justify-center text-rose-600 shrink-0 transition-colors">
            <Truck className="w-8 h-8" />
          </div>
          <div className="text-right">
            <div className="text-xs sm:text-sm font-medium text-slate-600">
              Total Orders
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mt-1">
              {totalOrdersCount}
            </div>
            <div className="text-[10px] text-rose-600 font-semibold mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              View procurement queue
            </div>
          </div>
        </button>
      </div>

      {/* Main Grid: Left (Inventory table + Quick actions) and Right (Stock overview + Recent transactions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section (7 columns on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Inventory Items Interactive Card (Shown when Total Products is clicked) */}
          {showInventoryItems ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 animate-scale-in">
              {/* Header with Title, Hide button and Add Product */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Inventory Items</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {processedProducts.length} items
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click column headers to sort. Click any row to view bin details.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInventoryItems(false)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Hide Table
                  </button>
                  <button
                    onClick={onOpenAddProduct}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

            {/* Interactive Filters & Search Toolbar */}
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/70 mb-4 space-y-2.5">
              {/* Row 1: Search bar & Quick Category Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={internalSearch}
                    onChange={(e) => setInternalSearch(e.target.value)}
                    placeholder="Search by product name, SKU, or bay..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 text-slate-800"
                  />
                  {internalSearch && (
                    <button
                      onClick={() => setInternalSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Status Quick Filter Chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {(['All', 'In Stock', 'Low Stock', 'Out of Stock'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                          statusFilter === st
                            ? st === 'In Stock'
                              ? 'bg-emerald-600 text-white'
                              : st === 'Low Stock'
                              ? 'bg-amber-500 text-white'
                              : st === 'Out of Stock'
                              ? 'bg-rose-600 text-white'
                              : 'bg-blue-600 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Row 2: Category Chips & Facility Scope */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/50">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Category:
                  </span>
                  <button
                    onClick={() => setCategoryFilter('All')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      categoryFilter === 'All'
                        ? 'bg-slate-800 text-white font-bold'
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    All
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategoryFilter(c.name)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                        categoryFilter === c.name
                          ? 'bg-slate-800 text-white font-bold'
                          : 'bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                {/* Facility Scope Indicator */}
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Building2 className="w-3 h-3 text-blue-600" />
                  <span className="font-medium">
                    {selectedFacilityId === 'all'
                      ? 'All Hubs'
                      : facilities.find((f) => f.id === selectedFacilityId)?.code}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Filters Reset Pill */}
            {(statusFilter !== 'All' || categoryFilter !== 'All' || effectiveSearch) && (
              <div className="mb-3 flex items-center justify-between text-xs bg-blue-50/70 border border-blue-200/60 rounded-xl px-3 py-1.5 text-blue-800">
                <span className="font-medium">
                  Active filter: {statusFilter !== 'All' ? `${statusFilter} • ` : ''}
                  {categoryFilter !== 'All' ? `${categoryFilter} • ` : ''}
                  {effectiveSearch ? `"${effectiveSearch}"` : ''}
                </span>
                <button
                  onClick={() => {
                    setStatusFilter('All');
                    setCategoryFilter('All');
                    setInternalSearch('');
                  }}
                  className="font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Filters</span>
                </button>
              </div>
            )}

            {/* Interactive Table with Sort & Inline Expand */}
            <div className="overflow-x-auto -mx-5 sm:mx-0">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] sm:text-xs">
                    <th
                      onClick={() => handleSort('id')}
                      className="py-3 px-3 sm:px-4 cursor-pointer hover:text-slate-900 select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>ID</span>
                        <ArrowUpDown className="w-3 h-3 opacity-60" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('name')}
                      className="py-3 px-3 sm:px-4 cursor-pointer hover:text-slate-900 select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Product Name</span>
                        <ArrowUpDown className="w-3 h-3 opacity-60" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('category')}
                      className="py-3 px-3 sm:px-4 cursor-pointer hover:text-slate-900 select-none"
                    >
                      <div className="flex items-center gap-1">
                        <span>Category</span>
                        <ArrowUpDown className="w-3 h-3 opacity-60" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('quantity')}
                      className="py-3 px-3 sm:px-4 text-center cursor-pointer hover:text-slate-900 select-none"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Quantity</span>
                        <ArrowUpDown className="w-3 h-3 opacity-60" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="py-3 px-3 sm:px-4 text-center cursor-pointer hover:text-slate-900 select-none"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>Status</span>
                        <ArrowUpDown className="w-3 h-3 opacity-60" />
                      </div>
                    </th>
                    <th className="py-3 px-3 sm:px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No products match your active search or filters.
                      </td>
                    </tr>
                  ) : (
                    processedProducts.map((prod) => {
                      const isExpanded = expandedProductId === prod.id;
                      return (
                        <React.Fragment key={prod.id}>
                          <tr className="hover:bg-slate-50/70 transition-colors group">
                            <td className="py-3.5 px-3 sm:px-4 font-medium text-slate-600">
                              <button
                                onClick={() =>
                                  setExpandedProductId(isExpanded ? null : prod.id)
                                }
                                className="font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                              >
                                <span>{prod.id}</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </button>
                            </td>
                            <td className="py-3.5 px-3 sm:px-4 font-semibold text-slate-900">
                              <div
                                onClick={() =>
                                  setExpandedProductId(isExpanded ? null : prod.id)
                                }
                                className="cursor-pointer hover:text-blue-600"
                              >
                                {prod.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                Bay: {prod.location} • ${prod.unitPrice.toLocaleString()}
                              </div>
                            </td>
                            <td className="py-3.5 px-3 sm:px-4 text-slate-600">
                              {prod.categoryName}
                            </td>
                            <td className="py-3.5 px-3 sm:px-4 text-center">
                              <div className="font-bold text-slate-800 text-sm">
                                {prod.quantity}
                              </div>
                              {/* Quick inline + and - buttons for instant stock adjustments */}
                              <div className="inline-flex items-center gap-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    stockIn(prod.id, 1, selectedFacilityId === 'all' ? 'F01' : selectedFacilityId, 'Quick +1 Restock');
                                  }}
                                  title="Add 1 unit"
                                  className="w-4 h-4 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold text-[10px] flex items-center justify-center cursor-pointer"
                                >
                                  +
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    stockOut(prod.id, 1, selectedFacilityId === 'all' ? 'F01' : selectedFacilityId, 'Quick -1 Dispatch');
                                  }}
                                  disabled={prod.quantity <= 0}
                                  title="Dispatch 1 unit"
                                  className="w-4 h-4 rounded bg-rose-100 hover:bg-rose-200 disabled:opacity-30 text-rose-700 font-bold text-[10px] flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 sm:px-4 text-center">
                              {prod.status === 'In Stock' && (
                                <button
                                  onClick={() => setStatusFilter('In Stock')}
                                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/80 hover:bg-emerald-200 text-emerald-700 cursor-pointer transition-colors"
                                >
                                  In Stock
                                </button>
                              )}
                              {prod.status === 'Low Stock' && (
                                <button
                                  onClick={() => setStatusFilter('Low Stock')}
                                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-700 cursor-pointer transition-colors"
                                >
                                  Low Stock
                                </button>
                              )}
                              {prod.status === 'Out of Stock' && (
                                <button
                                  onClick={() => setStatusFilter('Out of Stock')}
                                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 hover:bg-rose-200 text-rose-700 cursor-pointer transition-colors"
                                >
                                  Out of Stock
                                </button>
                              )}
                            </td>
                            <td className="py-3.5 px-3 sm:px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => onEditProduct(prod)}
                                  title="Edit Product"
                                  className="w-7 h-7 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteProduct(prod.id)}
                                  title="Delete Product"
                                  className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expandable Multi-Facility Distribution details */}
                          {isExpanded && (
                            <tr className="bg-blue-50/40 border-y border-blue-100">
                              <td colSpan={6} className="p-3 sm:p-4">
                                <div className="bg-white rounded-xl border border-blue-200/80 p-3 shadow-xs">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                      <span>Multi-Facility Distribution: {prod.name} ({prod.sku})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => onOpenStockIn(prod.id)}
                                        className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                                      >
                                        <ArrowDownToLine className="w-3 h-3" />
                                        <span>Stock In</span>
                                      </button>
                                      <span className="text-slate-300">•</span>
                                      <button
                                        onClick={() => onOpenStockOut(prod.id)}
                                        className="text-[11px] font-semibold text-rose-700 hover:underline flex items-center gap-1"
                                      >
                                        <ArrowUpFromLine className="w-3 h-3" />
                                        <span>Stock Out</span>
                                      </button>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {facilities.map((fac) => {
                                      const facQty = prod.facilityDistribution[fac.id] || 0;
                                      const facLoc = prod.facilityLocations[fac.id] || 'A1';
                                      return (
                                        <div
                                          key={fac.id}
                                          className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                                        >
                                          <div>
                                            <div className="text-xs font-bold text-slate-800">{fac.code}</div>
                                            <div className="text-[10px] text-slate-400">Bin: {facLoc}</div>
                                          </div>
                                          <div className="text-sm font-extrabold text-slate-900">
                                            {facQty} <span className="text-[10px] font-normal text-slate-500">units</span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* View full inventory button */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {processedProducts.length} of {totalProductsCount} total items
              </span>
              <button
                onClick={() => setActiveTab('inventory')}
                className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Catalog</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
          ) : (
            /* Collapsed state when Total Products is not clicked */
            <div className="bg-white rounded-2xl border border-dashed border-slate-200/90 p-8 shadow-xs text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Box className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Inventory Items Collapsed
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-5">
                Click the <strong>Total Products ({totalProductsCount})</strong> card above to display and manage the warehouse inventory items table.
              </p>
              <button
                onClick={() => setShowInventoryItems(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Box className="w-4 h-4" />
                <span>Display Inventory Items ({totalProductsCount})</span>
              </button>
            </div>
          )}

          {/* Quick Actions Card matching Image 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {/* Add Product */}
              <button
                onClick={onOpenAddProduct}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-50/60 hover:bg-blue-100/70 border border-blue-100 transition-all text-center group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 group-hover:bg-blue-200/80 flex items-center justify-center text-blue-600 mb-2 transition-colors">
                  <Box className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  Add Product
                </span>
              </button>

              {/* Stock In */}
              <button
                onClick={() => onOpenStockIn()}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-100 transition-all text-center group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 group-hover:bg-emerald-200/80 flex items-center justify-center text-emerald-600 mb-2 transition-colors">
                  <ArrowDownToLine className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  Stock In
                </span>
              </button>

              {/* Stock Out */}
              <button
                onClick={() => onOpenStockOut()}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-rose-50/60 hover:bg-rose-100/70 border border-rose-100 transition-all text-center group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-100 group-hover:bg-rose-200/80 flex items-center justify-center text-rose-600 mb-2 transition-colors">
                  <ArrowUpFromLine className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  Stock Out
                </span>
              </button>

              {/* View Reports */}
              <button
                onClick={() => setActiveTab('reports')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50/60 hover:bg-purple-100/70 border border-purple-100 transition-all text-center group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 group-hover:bg-purple-200/80 flex items-center justify-center text-purple-600 mb-2 transition-colors">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  View Reports
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Section (5 columns on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Stock Overview Card with Interactive Donut Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Stock Overview
              </h2>
              {statusFilter !== 'All' && (
                <button
                  onClick={() => setStatusFilter('All')}
                  className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Reset Chart Filter
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              {/* Donut Chart (Interactive Hover & Click) */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  {/* Background Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="20"
                  />
                  {/* In Stock Arc (Green) */}
                  {inStockCount > 0 && (
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth={donutHovered === 'In Stock' || statusFilter === 'In Stock' ? 24 : 20}
                      strokeDasharray={`${inStockDash} ${circumference}`}
                      strokeDashoffset={inStockOffset}
                      strokeLinecap="round"
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setDonutHovered('In Stock')}
                      onMouseLeave={() => setDonutHovered(null)}
                      onClick={() =>
                        setStatusFilter(statusFilter === 'In Stock' ? 'All' : 'In Stock')
                      }
                    />
                  )}
                  {/* Low Stock Arc (Yellow) */}
                  {lowStockCount > 0 && (
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke="#f59e0b"
                      strokeWidth={donutHovered === 'Low Stock' || statusFilter === 'Low Stock' ? 24 : 20}
                      strokeDasharray={`${lowStockDash} ${circumference}`}
                      strokeDashoffset={lowStockOffset}
                      strokeLinecap="round"
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setDonutHovered('Low Stock')}
                      onMouseLeave={() => setDonutHovered(null)}
                      onClick={() =>
                        setStatusFilter(statusFilter === 'Low Stock' ? 'All' : 'Low Stock')
                      }
                    />
                  )}
                  {/* Out of Stock Arc (Red) */}
                  {outOfStockCount > 0 && (
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke="#ef4444"
                      strokeWidth={donutHovered === 'Out of Stock' || statusFilter === 'Out of Stock' ? 24 : 20}
                      strokeDasharray={`${outOfStockDash} ${circumference}`}
                      strokeDashoffset={outOfStockOffset}
                      strokeLinecap="round"
                      className="cursor-pointer transition-all duration-200"
                      onMouseEnter={() => setDonutHovered('Out of Stock')}
                      onMouseLeave={() => setDonutHovered(null)}
                      onClick={() =>
                        setStatusFilter(statusFilter === 'Out of Stock' ? 'All' : 'Out of Stock')
                      }
                    />
                  )}
                </svg>

                {/* Center text */}
                <div
                  onClick={() => setStatusFilter('All')}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center cursor-pointer select-none"
                >
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {totalStockCount}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {donutHovered ? donutHovered : 'Total Stock'}
                  </span>
                </div>
              </div>

              {/* Interactive Legend matching Image 1 */}
              <div className="space-y-3 min-w-[130px]">
                <button
                  onClick={() =>
                    setStatusFilter(statusFilter === 'In Stock' ? 'All' : 'In Stock')
                  }
                  className={`w-full flex items-center justify-between gap-4 p-1.5 rounded-xl transition-all cursor-pointer text-left ${
                    statusFilter === 'In Stock'
                      ? 'bg-emerald-50 ring-1 ring-emerald-300'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      In Stock
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {inStockCount}
                  </span>
                </button>

                <button
                  onClick={() =>
                    setStatusFilter(statusFilter === 'Low Stock' ? 'All' : 'Low Stock')
                  }
                  className={`w-full flex items-center justify-between gap-4 p-1.5 rounded-xl transition-all cursor-pointer text-left ${
                    statusFilter === 'Low Stock'
                      ? 'bg-amber-50 ring-1 ring-amber-300'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      Low Stock
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {lowStockCount}
                  </span>
                </button>

                <button
                  onClick={() =>
                    setStatusFilter(statusFilter === 'Out of Stock' ? 'All' : 'Out of Stock')
                  }
                  className={`w-full flex items-center justify-between gap-4 p-1.5 rounded-xl transition-all cursor-pointer text-left ${
                    statusFilter === 'Out of Stock'
                      ? 'bg-rose-50 ring-1 ring-rose-300'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-slate-700">
                      Out of Stock
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    {outOfStockCount}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Recent Transactions Card matching Image 1 */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h2 className="text-lg font-bold text-slate-900">
                Recent Transactions
              </h2>

              {/* Transaction filter pills */}
              <div className="flex items-center gap-1">
                {(['ALL', 'IN', 'OUT', 'TRANSFER'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTxTypeFilter(type)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                      txTypeFilter === type
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto -mx-5 sm:mx-0">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-semibold text-[11px] sm:text-xs">
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3 text-center">Type</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-default"
                      title={`${tx.notes} (Handled by: ${tx.handledBy})`}
                    >
                      <td className="py-3 px-3 font-medium text-slate-600">
                        {tx.id}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <div>{tx.productName}</div>
                        <div className="text-[10px] text-slate-400 font-normal truncate max-w-[120px]">
                          {tx.notes}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {tx.type === 'IN' && (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100/90 text-emerald-700">
                            IN
                          </span>
                        )}
                        {tx.type === 'OUT' && (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-700">
                            OUT
                          </span>
                        )}
                        {tx.type === 'TRANSFER' && (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-700">
                            TRF
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {tx.quantity}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-500 font-mono text-[11px] sm:text-xs">
                        {tx.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 text-right">
              <button
                onClick={() => setActiveTab('reports')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View Complete Audit Trail &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

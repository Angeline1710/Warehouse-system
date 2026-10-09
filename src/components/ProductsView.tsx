import React, { useState } from 'react';
import {
  Box,
  Plus,
  Pencil,
  Trash2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Filter,
  Building2,
  AlertTriangle,
  ArrowRightLeft,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { Product, ProductStatus } from '../types/warehouse';

interface ProductsViewProps {
  onOpenAddProduct: () => void;
  onOpenStockIn: (productId?: string) => void;
  onOpenStockOut: (productId?: string) => void;
  onOpenTransfer: (productId?: string) => void;
  onEditProduct: (product: Product) => void;
  searchQuery: string;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onOpenAddProduct,
  onOpenStockIn,
  onOpenStockOut,
  onOpenTransfer,
  onEditProduct,
  searchQuery,
}) => {
  const {
    viewProducts,
    categories,
    facilities,
    selectedFacilityId,
    deleteProduct,
  } = useWarehouse();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Filter products
  const filteredProducts = viewProducts.filter((p) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category
    if (selectedCategory !== 'all' && String(p.categoryId) !== selectedCategory) {
      return false;
    }

    // Status
    if (selectedStatus !== 'all' && p.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs sm:text-sm bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-slate-700 focus:outline-hidden focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedStatus('all');
              }}
              className="text-xs text-blue-600 hover:underline font-semibold ml-2 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Product List Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Inventory Catalog ({filteredProducts.length} items)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {selectedFacilityId === 'all'
              ? 'Showing Total Consolidated Across All Facilities'
              : `Showing Facility Stock for ${facilities.find((f) => f.id === selectedFacilityId)?.code}`}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-semibold text-[11px] sm:text-xs">
                <th className="py-3 px-4">SKU / ID</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Shelf Location</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isExpanded = expandedProductId === prod.id;
                  return (
                    <React.Fragment key={prod.id}>
                      <tr className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-600">
                          <div className="font-semibold text-slate-900">{prod.id}</div>
                          <div className="text-[11px] text-slate-400">{prod.sku}</div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div>{prod.name}</div>
                          <div className="text-[11px] font-normal text-slate-400">
                            Supplier: {prod.supplier}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {prod.categoryName}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {prod.location}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                          ${prod.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-base font-extrabold text-slate-900">
                            {prod.quantity}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            Min: {prod.minStockThreshold}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {prod.status === 'In Stock' && (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                              In Stock
                            </span>
                          )}
                          {prod.status === 'Low Stock' && (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              Low Stock
                            </span>
                          )}
                          {prod.status === 'Out of Stock' && (
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Stock In */}
                            <button
                              onClick={() => onOpenStockIn(prod.id)}
                              title="Stock In (+)"
                              className="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                            >
                              <ArrowDownToLine className="w-3.5 h-3.5" />
                            </button>
                            {/* Stock Out */}
                            <button
                              onClick={() => onOpenStockOut(prod.id)}
                              title="Stock Out (-)"
                              className="p-1.5 rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                            >
                              <ArrowUpFromLine className="w-3.5 h-3.5" />
                            </button>
                            {/* Inter-facility Transfer */}
                            <button
                              onClick={() => onOpenTransfer(prod.id)}
                              title="Transfer between facilities"
                              className="p-1.5 rounded-lg text-blue-700 hover:bg-blue-50 border border-blue-200 transition-colors"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                            {/* Facility Distribution Toggle */}
                            <button
                              onClick={() =>
                                setExpandedProductId(isExpanded ? null : prod.id)
                              }
                              title="Facility Stock Breakdown"
                              className={`p-1.5 rounded-lg border transition-colors ${
                                isExpanded
                                  ? 'bg-purple-100 border-purple-300 text-purple-700'
                                  : 'text-purple-600 hover:bg-purple-50 border-purple-200'
                              }`}
                            >
                              <Building2 className="w-3.5 h-3.5" />
                            </button>
                            {/* Edit */}
                            <button
                              onClick={() => onEditProduct(prod)}
                              title="Edit"
                              className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => deleteProduct(prod.id)}
                              title="Delete"
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Multi-Facility Breakdown Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-y border-slate-200/80">
                          <td colSpan={8} className="p-4">
                            <div className="bg-white rounded-xl border border-slate-200 p-3.5">
                              <div className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
                                <Building2 className="w-4 h-4 text-purple-600" />
                                <span>Multi-Facility Stock Distribution for {prod.name} ({prod.id}):</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                {facilities.map((fac) => {
                                  const facQty = prod.facilityDistribution[fac.id] || 0;
                                  const facLoc = prod.facilityLocations[fac.id] || 'A1';
                                  return (
                                    <div
                                      key={fac.id}
                                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                                    >
                                      <div>
                                        <div className="text-xs font-bold text-slate-800">
                                          {fac.code}
                                        </div>
                                        <div className="text-[11px] text-slate-500">
                                          {fac.name}
                                        </div>
                                      </div>
                                      <div className="mt-2 pt-2 border-t border-slate-200/70 flex items-center justify-between">
                                        <span className="text-[11px] text-slate-500 font-mono">
                                          Bin: {facLoc}
                                        </span>
                                        <span className="text-sm font-extrabold text-slate-900">
                                          {facQty} units
                                        </span>
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
      </div>
    </div>
  );
};

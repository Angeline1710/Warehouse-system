import React from 'react';
import {
  LayoutDashboard,
  Box,
  PlusCircle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Layers,
  Search,
  BarChart3,
  Building2,
  RefreshCw,
  Database,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';

export type ActiveNavTab =
  | 'dashboard'
  | 'products'
  | 'stock-in'
  | 'stock-out'
  | 'inventory'
  | 'search'
  | 'reports'
  | 'facilities'
  | 'reorders'
  | 'warehousedb';

interface SidebarProps {
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenAddProduct: () => void;
  onOpenStockIn: () => void;
  onOpenStockOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
  onOpenAddProduct,
  onOpenStockIn,
  onOpenStockOut,
}) => {
  const { lowStockCount } = useWarehouse();

  const handleNavClick = (tab: ActiveNavTab) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#111927] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out shrink-0 border-r border-slate-800/80 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo and Brand */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight leading-tight">
                Warehouse
              </div>
              <div className="text-xs text-slate-400 font-medium tracking-wide">
                Management
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {/* Main Primary Views */}
          <button
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => {
              onOpenAddProduct();
              setIsOpenMobile(false);
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all text-left group"
          >
            <PlusCircle className="w-4 h-4 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => {
              onOpenStockIn();
              setIsOpenMobile(false);
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all text-left group"
          >
            <ArrowDownToLine className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span>Stock In</span>
          </button>

          <button
            onClick={() => {
              onOpenStockOut();
              setIsOpenMobile(false);
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all text-left group"
          >
            <ArrowUpFromLine className="w-4 h-4 text-rose-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span>Stock Out</span>
          </button>

          <button
            onClick={() => handleNavClick('inventory')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'inventory'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>View Inventory</span>
          </button>

          <button
            onClick={() => handleNavClick('reports')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'reports'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>Reports</span>
          </button>

          {/* Additional Enterprise Modules */}
          <div className="pt-3 pb-1">
            <div className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Multi-Facility & Automation
            </div>
          </div>

          <button
            onClick={() => handleNavClick('facilities')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'facilities'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>Facilities</span>
            </div>
            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400">
              4 hubs
            </span>
          </button>

          <button
            onClick={() => handleNavClick('reorders')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'reorders'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="w-4 h-4 shrink-0" />
              <span>Auto-Reorder</span>
            </div>
            {lowStockCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {lowStockCount} alert
              </span>
            )}
          </button>

          <div className="pt-3 pb-1">
            <div className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Developer & Database
            </div>
          </div>

          <button
            onClick={() => handleNavClick('warehousedb')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'warehousedb'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <Database className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>WarehouseDB</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              SQLite
            </span>
          </button>
        </div>

        {/* Sidebar footer matching Image 1 */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
          <div className="text-xs font-medium text-slate-400">
            Multi-Facility Network
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            4 regional warehouses connected
          </p>
        </div>
      </aside>
    </>
  );
};

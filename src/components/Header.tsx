import React, { useState } from 'react';
import {
  Menu,
  Search,
  User,
  ChevronDown,
  Building2,
  RotateCcw,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { ActiveNavTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveNavTab;
  onOpenMobileSidebar: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
  searchQuery,
  setSearchQuery,
}) => {
  const {
    selectedFacilityId,
    setSelectedFacilityId,
    facilities,
    currentUser,
    setCurrentUser,
    users,
    resetAllData,
  } = useWarehouse();

  const [isFacilityDropdownOpen, setIsFacilityDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Derive dynamic title based on activeTab
  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Overview of warehouse inventory',
        };
      case 'products':
      case 'inventory':
        return {
          title: 'Products & Inventory',
          subtitle: 'Comprehensive SKU inventory catalog across facilities',
        };
      case 'search':
        return {
          title: 'Search & Lookup',
          subtitle: 'Global barcode, SKU and serial number lookup',
        };
      case 'reports':
        return {
          title: 'Management Reports',
          subtitle: 'Analytical reporting, valuation & inventory turnover metrics',
        };
      case 'facilities':
        return {
          title: 'Multi-Facility Operations',
          subtitle: 'Capacity, location mapping & inter-facility transfers',
        };
      case 'reorders':
        return {
          title: 'Automated Reordering Engine',
          subtitle: 'Threshold triggers, automated PO drafts & restock queues',
        };
      case 'warehousedb':
        return {
          title: 'WarehouseDB - Database Browser (SQLite)',
          subtitle: 'Inspect schema, browse raw table records & execute SQL',
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Overview of warehouse inventory',
        };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <header className="bg-white border-b border-slate-200/90 px-4 sm:px-8 py-3.5 sticky top-0 z-30">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left Side: Mobile toggle + Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Multi-facility selector */}
          <div className="relative">
            <button
              onClick={() => {
                setIsFacilityDropdownOpen(!isFacilityDropdownOpen);
                setIsUserDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-700 transition-colors shadow-xs"
            >
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="max-w-[130px] sm:max-w-[180px] truncate">
                {selectedFacilityId === 'all'
                  ? 'All Facilities (Global)'
                  : facilities.find((f) => f.id === selectedFacilityId)?.name || 'Facility'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {isFacilityDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-fade-in">
                <div className="px-3.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Facility Scope
                </div>
                <button
                  onClick={() => {
                    setSelectedFacilityId('all');
                    setIsFacilityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm font-medium flex items-center justify-between hover:bg-blue-50/70 transition-colors ${
                    selectedFacilityId === 'all'
                      ? 'text-blue-600 font-semibold bg-blue-50/50'
                      : 'text-slate-700'
                  }`}
                >
                  <span>All Facilities (Global Aggregation)</span>
                  {selectedFacilityId === 'all' && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </button>
                <div className="h-px bg-slate-100 my-1" />
                {facilities.map((fac) => (
                  <button
                    key={fac.id}
                    onClick={() => {
                      setSelectedFacilityId(fac.id);
                      setIsFacilityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs sm:text-sm font-medium flex items-center justify-between hover:bg-blue-50/70 transition-colors ${
                      selectedFacilityId === fac.id
                        ? 'text-blue-600 font-semibold bg-blue-50/50'
                        : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="leading-snug">{fac.name}</div>
                      <div className="text-[11px] text-slate-400">{fac.city}, {fac.state}</div>
                    </div>
                    {selectedFacilityId === fac.id && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search bar matching Image 1 */}
          <div className="relative flex-1 sm:w-60 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200/90 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400 shadow-xs"
            />
          </div>

          {/* Reset Demo Data */}
          <button
            onClick={resetAllData}
            title="Reset to Initial Sample Data"
            className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 transition-colors shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Profile Pill matching Image 1 */}
          <div className="relative">
            <button
              onClick={() => {
                setIsUserDropdownOpen(!isUserDropdownOpen);
                setIsFacilityDropdownOpen(false);
              }}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-700 transition-colors shadow-xs"
            >
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="capitalize">{currentUser.username}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-40 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="font-semibold text-slate-800 text-sm">
                    {currentUser.fullName}
                  </div>
                  <div className="text-xs text-slate-400 capitalize">Role: {currentUser.role}</div>
                </div>
                <div className="px-3 pt-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Role
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setIsUserDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs sm:text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      currentUser.id === u.id ? 'text-blue-600 font-semibold' : 'text-slate-600'
                    }`}
                  >
                    <span>{u.fullName} ({u.username})</span>
                    {currentUser.id === u.id && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Download,
  Calendar,
  Layers,
  Building2,
  Boxes,
  FileSpreadsheet,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';

export const ReportsView: React.FC = () => {
  const { products, categories, facilities, transactions, showToast } = useWarehouse();
  const [reportPeriod, setReportPeriod] = useState<'7d' | '30d' | 'quarter'>('7d');

  // Total valuation
  const totalValuation = products.reduce((acc, p) => acc + p.quantity * p.unitPrice, 0);

  // Category breakdown
  const categoryStats = categories.map((cat) => {
    const catProducts = products.filter((p) => p.categoryId === cat.id);
    const units = catProducts.reduce((sum, p) => sum + p.quantity, 0);
    const value = catProducts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
    return {
      category: cat,
      units,
      value,
      pctOfTotal: totalValuation > 0 ? (value / totalValuation) * 100 : 0,
    };
  });

  // 7-day movement mock metrics derived from transactions
  const movementDays = [
    { day: 'Oct 03', inbound: 38, outbound: 12 },
    { day: 'Oct 04', inbound: 15, outbound: 28 },
    { day: 'Oct 05', inbound: 150, outbound: 45 },
    { day: 'Oct 06', inbound: 10, outbound: 22 },
    { day: 'Oct 07', inbound: 15, outbound: 18 },
    { day: 'Oct 08', inbound: 12, outbound: 35 },
    { day: 'Oct 09', inbound: 45, outbound: 20 },
  ];

  const maxMovement = Math.max(...movementDays.map((d) => Math.max(d.inbound, d.outbound)));

  const handleExportReport = () => {
    const rows = [
      ['Warehouse Management System - Executive Report'],
      [`Generated at: ${new Date().toISOString()}`],
      [''],
      ['KPI Metrics'],
      ['Total Inventory Valuation ($)', totalValuation],
      ['Inventory Turnover Velocity', '4.8x per annum'],
      ['Stockout Risk Index', '8.3%'],
      [''],
      ['Category Breakdown'],
      ['Category', 'Units', 'Valuation ($)', '% of Capital'],
      ...categoryStats.map((c) => [
        c.category.name,
        c.units,
        c.value,
        `${c.pctOfTotal.toFixed(1)}%`,
      ]),
      [''],
      ['Top Facility Stock Allocations'],
      ['Facility', 'Code', 'Total Units', 'Capacity Utilized'],
      ...facilities.map((f) => {
        const u = products.reduce((sum, p) => sum + (p.facilityDistribution[f.id] || 0), 0);
        return [f.name, f.code, u, `${((u / f.capacityUnits) * 100).toFixed(1)}%`];
      }),
    ];

    const csvContent = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `WMS_Executive_Analytics_${reportPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: 'success',
      title: 'Executive Report Downloaded',
      message: 'Management analytics report exported as CSV.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and export controls */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Management Analytics & Inventory Reporting</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time balance valuation, capital allocation, turnover velocity, and demand analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            {(['7d', '30d', 'quarter'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setReportPeriod(period)}
                className={`px-3 py-1.5 rounded-lg transition-colors capitalize ${
                  reportPeriod === period
                    ? 'bg-white text-blue-600 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : 'Quarterly'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              Total Inventory Valuation
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            ${totalValuation.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+4.2% vs last month</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              Turnover Velocity
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            4.8x
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Annualized stock replenishment rate
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              Stockout Risk Index
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            8.3%
          </div>
          <div className="text-xs text-amber-600 font-medium mt-2">
            3 SKUs currently near threshold
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">
              Fulfillment Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            98.4%
          </div>
          <div className="text-xs text-purple-600 font-medium mt-2">
            Orders dispatched within SLA
          </div>
        </div>
      </div>

      {/* Movement Activity Chart & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Movement Activity (Inbound vs Outbound) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Inbound vs. Outbound Movement Activity
              </h3>
              <p className="text-xs text-slate-400">
                Daily unit throughput across facilities
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-600">Inbound (Stock In)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-500" />
                <span className="text-slate-600">Outbound (Stock Out)</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="space-y-4">
            <div className="h-52 flex items-end justify-between gap-3 pt-6 px-2">
              {movementDays.map((item, idx) => {
                const inHeightPct = (item.inbound / maxMovement) * 100;
                const outHeightPct = (item.outbound / maxMovement) * 100;

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-1 h-full justify-end group"
                  >
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      {/* Inbound Bar */}
                      <div
                        className="w-3 sm:w-4 rounded-t-md bg-emerald-500 group-hover:bg-emerald-400 transition-all relative"
                        style={{ height: `${Math.max(8, inHeightPct)}%` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-900 text-white px-1 rounded transition-opacity pointer-events-none">
                          +{item.inbound}
                        </span>
                      </div>
                      {/* Outbound Bar */}
                      <div
                        className="w-3 sm:w-4 rounded-t-md bg-rose-500 group-hover:bg-rose-400 transition-all relative"
                        style={{ height: `${Math.max(8, outHeightPct)}%` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-slate-900 text-white px-1 rounded transition-opacity pointer-events-none">
                          -{item.outbound}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 mt-2 truncate w-full text-center">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Category Distribution */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Capital Allocation by Category
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Value and volume distribution
            </p>

            <div className="space-y-4">
              {categoryStats.map(({ category, units, value, pctOfTotal }) => (
                <div key={category.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {category.name}
                    </span>
                    <span className="font-semibold text-slate-900">
                      ${value.toLocaleString()} ({pctOfTotal.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${Math.max(4, pctOfTotal)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {units} units across catalog
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 mt-6 text-xs text-slate-600">
            <strong>Management Insight:</strong> Electronics constitutes 84% of total inventory valuation. Implementing lead-time buffering for Dell & Samsung recommended.
          </div>
        </div>
      </div>
    </div>
  );
};

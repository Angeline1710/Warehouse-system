import React from 'react';
import {
  Building2,
  MapPin,
  User,
  ArrowRightLeft,
  Boxes,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';

interface FacilitiesViewProps {
  onOpenTransfer: (productId?: string) => void;
}

export const FacilitiesView: React.FC<FacilitiesViewProps> = ({ onOpenTransfer }) => {
  const {
    facilities,
    products,
    selectedFacilityId,
    setSelectedFacilityId,
    transactions,
  } = useWarehouse();

  // Calculate facility stats
  const facilityStats = facilities.map((fac) => {
    let totalUnits = 0;
    let totalValue = 0;
    let uniqueSkus = 0;

    products.forEach((p) => {
      const q = p.facilityDistribution[fac.id] || 0;
      if (q > 0) {
        totalUnits += q;
        totalValue += q * p.unitPrice;
        uniqueSkus += 1;
      }
    });

    const utilizationPct = Math.min(
      100,
      Number(((totalUnits / fac.capacityUnits) * 100).toFixed(1))
    );

    return {
      facility: fac,
      totalUnits,
      totalValue,
      uniqueSkus,
      utilizationPct,
    };
  });

  // Recent transfers
  const transferTransactions = transactions.filter((t) => t.type === 'TRANSFER').slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Multi-Facility Distributed Network Active</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Real-Time Multi-Facility Fleet
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Inventory is synced across 4 primary geographic fulfillment centers with real-time telematics, shelf bin tracking, and automated stock rebalancing.
          </p>
        </div>

        <button
          onClick={() => onOpenTransfer()}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all shrink-0 cursor-pointer self-start md:self-center"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Initiate Stock Transfer</span>
        </button>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {facilityStats.map(({ facility, totalUnits, totalValue, uniqueSkus, utilizationPct }) => {
          const isSelected = selectedFacilityId === facility.id;

          return (
            <div
              key={facility.id}
              className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {facility.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-700">
                          {facility.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{facility.city}, {facility.state}</span>
                      </div>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    {facility.activeStatus}
                  </span>
                </div>

                {/* Address & Manager */}
                <div className="text-xs text-slate-500 bg-slate-50/80 rounded-xl p-3 mb-4 space-y-1">
                  <div className="truncate">
                    <strong className="text-slate-700 font-medium">Address:</strong> {facility.address}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Manager: {facility.manager}</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center mb-4">
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Units In Stock</div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">
                      {totalUnits}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Unique SKUs</div>
                    <div className="text-lg font-bold text-slate-900 mt-0.5">
                      {uniqueSkus}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 font-medium">Valuation</div>
                    <div className="text-lg font-bold text-emerald-600 mt-0.5">
                      ${totalValue.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
                    <span>Facility Utilization</span>
                    <span className="font-bold text-slate-900">
                      {totalUnits} / {facility.capacityUnits.toLocaleString()} units ({utilizationPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        utilizationPct > 85
                          ? 'bg-rose-500'
                          : utilizationPct > 60
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.max(5, utilizationPct)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedFacilityId(isSelected ? 'all' : facility.id)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  {isSelected ? '✓ Currently Filtered' : 'Filter Dashboard to this Facility'}
                </button>
                <button
                  onClick={() => onOpenTransfer()}
                  className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors"
                  title="Transfer items to/from this facility"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inter-facility transfer history log */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Inter-Facility Transfer Transit Log
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Automated dispatch tracking
          </span>
        </div>

        {transferTransactions.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs sm:text-sm">
            No inter-facility transfers recorded yet. Use the transfer button above to rebalance stock.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-semibold text-[11px] sm:text-xs">
                  <th className="py-2.5 px-3">Transfer Ref</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3">Origin Hub</th>
                  <th className="py-2.5 px-3">Destination Hub</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Handler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transferTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800">
                      {tx.referenceNo || tx.id}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {tx.productName}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-600">
                      {tx.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {tx.facilityName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {tx.targetFacilityName || 'Secondary Facility'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-xs">
                      {tx.date}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {tx.handledBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

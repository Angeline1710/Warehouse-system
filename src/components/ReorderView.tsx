import React from 'react';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  Plus,
  Play,
  FileCheck,
  Check,
  X,
  PackageCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useWarehouse } from '../context/WarehouseContext';

interface ReorderViewProps {
  onOpenCreatePO?: () => void;
}

export const ReorderView: React.FC<ReorderViewProps> = () => {
  const {
    products,
    reorderRules,
    purchaseOrders,
    facilities,
    autoReorderingEnabled,
    setAutoReorderingEnabled,
    triggerAutoReorderCheck,
    approvePurchaseOrder,
    receivePurchaseOrder,
    cancelPurchaseOrder,
    createPurchaseOrder,
    updateReorderRule,
    showToast,
  } = useWarehouse();

  // Find products that are low or out of stock
  const lowOrOutProducts = products.filter(
    (p) => p.quantity <= p.minStockThreshold
  );

  // Group purchase orders
  const pendingPOs = purchaseOrders.filter(
    (po) => po.status === 'Pending Approval' || po.status === 'Draft'
  );
  const inTransitPOs = purchaseOrders.filter((po) => po.status === 'In Transit');
  const receivedPOs = purchaseOrders.filter((po) => po.status === 'Received');

  const handleApproveAll = () => {
    pendingPOs.forEach((po) => {
      approvePurchaseOrder(po.id);
    });
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // fallback
    }
  };

  const handleReceiveAllInTransit = () => {
    inTransitPOs.forEach((po) => {
      receivePurchaseOrder(po.id);
    });
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Engine Status Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              autoReorderingEnabled
                ? 'bg-blue-100 text-blue-600'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <RefreshCw
              className={`w-6 h-6 ${
                autoReorderingEnabled ? 'animate-spin-slow' : ''
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Automated Reordering System
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  autoReorderingEnabled
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {autoReorderingEnabled ? 'ACTIVE & MONITORING' : 'PAUSED'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Continuously monitors stock levels against configured safety thresholds across all warehouse facilities.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              triggerAutoReorderCheck();
              showToast({
                type: 'info',
                title: 'Threshold Audit Finished',
                message: 'All inventory items verified against reorder rules.',
              });
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Audit Thresholds Now</span>
          </button>

          <button
            onClick={() => setAutoReorderingEnabled(!autoReorderingEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              autoReorderingEnabled
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {autoReorderingEnabled ? 'Disable Engine' : 'Enable Engine'}
          </button>
        </div>
      </div>

      {/* Low Stock Items Requiring Restock */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">
              Low Stock Items Needing Restock ({lowOrOutProducts.length})
            </h3>
          </div>
          {lowOrOutProducts.length > 0 && (
            <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Threshold alert triggered
            </span>
          )}
        </div>

        {lowOrOutProducts.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs sm:text-sm bg-slate-50/50 rounded-xl border border-slate-100">
            All warehouse inventory is above minimum threshold levels. No items currently require urgent reordering.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-semibold text-[11px] sm:text-xs">
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3 text-center">Current Qty</th>
                  <th className="py-2.5 px-3 text-center">Min Threshold</th>
                  <th className="py-2.5 px-3 text-center">Recommended Order</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3 text-center">Lead Time</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowOrOutProducts.map((p) => {
                  const hasActivePO = purchaseOrders.some(
                    (po) =>
                      po.productId === p.id &&
                      (po.status === 'Pending Approval' || po.status === 'In Transit')
                  );

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {p.id} · {p.categoryName}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`font-bold text-sm ${
                            p.quantity === 0
                              ? 'text-rose-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {p.quantity} units
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-600 font-mono">
                        {p.minStockThreshold}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-900">
                        +{p.reorderQuantity} units
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {p.supplier}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-500">
                        {p.leadTimeDays} days
                      </td>
                      <td className="py-3 px-3 text-right">
                        {hasActivePO ? (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg">
                            <Clock className="w-3 h-3" />
                            <span>PO Active</span>
                          </span>
                        ) : (
                          <button
                            onClick={() =>
                              createPurchaseOrder(p.id, 'F01', p.reorderQuantity)
                            }
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                          >
                            Draft PO
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Purchase Orders Queue */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span>Purchase Orders & Restock Pipeline</span>
            </h3>
            <p className="text-xs text-slate-400">
              Track lifecycle: Draft → Pending Approval → In Transit → Received & Restocked
            </p>
          </div>

          <div className="flex items-center gap-2">
            {pendingPOs.length > 0 && (
              <button
                onClick={handleApproveAll}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve All ({pendingPOs.length})</span>
              </button>
            )}

            {inTransitPOs.length > 0 && (
              <button
                onClick={handleReceiveAllInTransit}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Receive All In Transit ({inTransitPOs.length})</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold text-[11px] sm:text-xs">
                <th className="py-2.5 px-3">PO Number</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Facility</th>
                <th className="py-2.5 px-3 text-center">Quantity</th>
                <th className="py-2.5 px-3 text-right">Total Cost</th>
                <th className="py-2.5 px-3">Supplier</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-medium text-slate-800">
                    <div className="font-bold text-slate-900">{po.id}</div>
                    <div className="text-[10px] text-slate-400">{po.generatedBy}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {po.productName}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {po.facilityName}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900">
                    {po.quantity}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-700">
                    ${po.totalCost.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {po.supplier}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {po.status === 'Draft' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        Draft
                      </span>
                    )}
                    {po.status === 'Pending Approval' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        Pending Approval
                      </span>
                    )}
                    {po.status === 'In Transit' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center justify-center gap-1">
                        <Truck className="w-3 h-3" />
                        <span>In Transit</span>
                      </span>
                    )}
                    {po.status === 'Received' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Received</span>
                      </span>
                    )}
                    {po.status === 'Cancelled' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                        Cancelled
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {po.status === 'Pending Approval' && (
                        <>
                          <button
                            onClick={() => approvePurchaseOrder(po.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => cancelPurchaseOrder(po.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg text-xs font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {po.status === 'In Transit' && (
                        <button
                          onClick={() => receivePurchaseOrder(po.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          <span>Receive & Restock</span>
                        </button>
                      )}

                      {po.status === 'Received' && (
                        <span className="text-[11px] text-slate-400 italic">
                          Restocked on {po.expectedDate}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reorder Rules Configuration Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Automated Reorder Threshold Rules
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Configure min thresholds and auto-approval permissions for individual SKUs.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold text-[11px] sm:text-xs">
                <th className="py-2.5 px-3">Rule ID</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 text-center">Safety Threshold</th>
                <th className="py-2.5 px-3 text-center">Batch Order Qty</th>
                <th className="py-2.5 px-3 text-center">Lead Time</th>
                <th className="py-2.5 px-3 text-center">Auto-Approve PO</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reorderRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                    {rule.id}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {rule.productName}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">
                    {rule.minThreshold} units
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-blue-600">
                    {rule.reorderBatchSize} units
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-500">
                    {rule.leadTimeDays} days
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() =>
                        updateReorderRule(rule.id, { autoApprove: !rule.autoApprove })
                      }
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                        rule.autoApprove
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {rule.autoApprove ? '✓ Yes (Auto-order)' : 'No (Requires Admin)'}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() =>
                        updateReorderRule(rule.id, { isActive: !rule.isActive })
                      }
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                        rule.isActive
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

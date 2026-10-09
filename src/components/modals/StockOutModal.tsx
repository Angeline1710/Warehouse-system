import React, { useState } from 'react';
import { X, ArrowUpFromLine, Check } from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';

interface StockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProductId?: string;
}

export const StockOutModal: React.FC<StockOutModalProps> = ({
  isOpen,
  onClose,
  defaultProductId,
}) => {
  const { products, facilities, stockOut } = useWarehouse();

  const [productId, setProductId] = useState<string>(
    defaultProductId || products[0]?.id || ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [facilityId, setFacilityId] = useState<string>(facilities[0]?.id || 'F01');
  const [notes, setNotes] = useState<string>('Outbound dispatch for customer fulfillment');
  const [refNo, setRefNo] = useState<string>('');

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === productId);
  const currentFacilityStock = currentProduct?.facilityDistribution[facilityId] || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || quantity <= 0) return;

    stockOut(
      productId,
      Number(quantity),
      facilityId,
      notes.trim() || 'Outbound customer order dispatch',
      refNo.trim() || `ORD-${Math.floor(1000 + Math.random() * 9000)}`
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <ArrowUpFromLine className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Stock Out (Dispatch / Pick)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Product
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) - Total: {p.quantity} units
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispatch Facility
              </label>
              <select
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Available at hub: <strong>{currentFacilityStock} units</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity to Dispatch *
              </label>
              <input
                type="number"
                min="1"
                max={Math.max(1, currentFacilityStock)}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Order / Dispatch Reference # (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. ORD-9021 or SHIP-442"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Dispatched to freight carrier track #9921"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Stock Out</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

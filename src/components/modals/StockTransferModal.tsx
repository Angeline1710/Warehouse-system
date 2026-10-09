import React, { useState } from 'react';
import { X, ArrowRightLeft, Check, AlertCircle } from 'lucide-react';
import { useWarehouse } from '../../context/WarehouseContext';

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProductId?: string;
}

export const StockTransferModal: React.FC<StockTransferModalProps> = ({
  isOpen,
  onClose,
  defaultProductId,
}) => {
  const { products, facilities, transferStock } = useWarehouse();

  const [productId, setProductId] = useState<string>(
    defaultProductId || products[0]?.id || ''
  );
  const [fromFacilityId, setFromFacilityId] = useState<string>('F01');
  const [toFacilityId, setToFacilityId] = useState<string>('F02');
  const [quantity, setQuantity] = useState<number>(5);
  const [notes, setNotes] = useState<string>('Inventory rebalancing across fulfillment zones');

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === productId);
  const availableAtOrigin = currentProduct?.facilityDistribution[fromFacilityId] || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || quantity <= 0 || fromFacilityId === toFacilityId) return;

    transferStock(productId, Number(quantity), fromFacilityId, toFacilityId, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Inter-Facility Stock Transfer</h3>
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
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Origin Facility (From)
              </label>
              <select
                value={fromFacilityId}
                onChange={(e) => setFromFacilityId(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Available at origin: <strong>{availableAtOrigin} units</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination Facility (To)
              </label>
              <select
                value={toFacilityId}
                onChange={(e) => setToFacilityId(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
              >
                {facilities.map((f) => (
                  <option key={f.id} value={f.id} disabled={f.id === fromFacilityId}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quantity to Transfer *
            </label>
            <input
              type="number"
              min="1"
              max={Math.max(1, availableAtOrigin)}
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Transfer Note / Internal BOL
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-500"
            />
          </div>

          {fromFacilityId === toFacilityId && (
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Origin and Destination facilities must be different.</span>
            </div>
          )}

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
              disabled={fromFacilityId === toFacilityId || availableAtOrigin < quantity}
              className="px-5 py-2 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Execute Transfer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

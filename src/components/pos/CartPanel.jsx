import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  DollarSign,
  Tag,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { formatUSD } from '../../utils/money';

/**
 * Sticky Cart Panel for POS terminal.
 *
 * @param {Object} props
 * @param {Array} props.items - Detailed items from useCart
 * @param {string} props.subtotal - Formatted subtotal ($X.XX)
 * @param {string} props.discountTotal - Formatted total discounts ($X.XX)
 * @param {string} props.total - Formatted grand total ($X.XX)
 * @param {number} props.itemCount - Total items in cart
 * @param {Function} props.onIncrement - (productId)
 * @param {Function} props.onDecrement - (productId)
 * @param {Function} props.onRemove - (productId)
 * @param {Function} props.onSetDiscount - (productId, discountDollar)
 * @param {Function} props.onClear - ()
 * @param {Function} props.onOpenCheckout - ()
 */
export default function CartPanel({
  items = [],
  subtotal,
  discountTotal,
  total,
  itemCount = 0,
  onIncrement,
  onDecrement,
  onRemove,
  onSetDiscount,
  onClear,
  onOpenCheckout,
}) {
  const [editingDiscountId, setEditingDiscountId] = useState(null);
  const [discountInputVal, setDiscountInputVal] = useState('');

  const fallbackImg =
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80';

  const handleStartDiscount = (item) => {
    setEditingDiscountId(item.productId);
    setDiscountInputVal(item.discount > 0 ? String(item.discount) : '');
  };

  const handleApplyDiscount = (productId) => {
    const parsed = Number(discountInputVal) || 0;
    onSetDiscount(productId, parsed);
    setEditingDiscountId(null);
    setDiscountInputVal('');
  };

  return (
    <div className="flex flex-col h-full bg-base-100 rounded-3xl border border-base-300 shadow-xl overflow-hidden">
      {/* Cart Header */}
      <div className="p-4 bg-base-200/50 border-b border-base-300/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base tracking-tight leading-tight">
              Current Order
            </h2>
            <p className="text-xs text-base-content/60 font-medium">
              {itemCount} {itemCount === 1 ? 'bottle' : 'bottles'} selected
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="btn btn-ghost btn-xs text-error hover:bg-error/10 gap-1 font-medium transition-colors"
            title="Empty cart"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-base-200/60">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-base-content/50">
            <div className="w-16 h-16 rounded-2xl bg-base-200/70 flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8 opacity-40 text-primary" />
            </div>
            <h4 className="font-bold text-sm text-base-content/80 mb-1">
              Your cart is empty
            </h4>
            <p className="text-xs max-w-[200px] leading-relaxed">
              Click any perfume bottle or scan a barcode to add it to this order.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const maxStock =
              typeof item.product.quantity === 'number' ? item.product.quantity : 999;
            const isAtMaxStock = item.qty >= maxStock;
            const isEditingThis = editingDiscountId === item.productId;

            return (
              <div
                key={item.productId}
                className="pt-2.5 first:pt-0 flex flex-col gap-2 group/item"
              >
                {/* Top Row: Thumbnail + Title + Price */}
                <div className="flex items-start gap-2.5">
                  <img
                    src={item.product.imageUrl || fallbackImg}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-xl object-cover bg-base-200 border border-base-300 flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = fallbackImg;
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4
                        className="font-semibold text-xs text-base-content line-clamp-1 leading-tight"
                        title={item.product.name}
                      >
                        {item.product.name}
                      </h4>
                      <button
                        type="button"
                        onClick={() => onRemove(item.productId)}
                        className="text-base-content/40 hover:text-error p-0.5 rounded transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-base-content/60">
                      <span className="font-medium">{formatUSD(item.product.price)}</span>
                      {item.product.sizeMl && <span>• {item.product.sizeMl}ml</span>}
                      {item.product.brandName && <span>• {item.product.brandName}</span>}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Stepper + Discount Input + Line Total */}
                <div className="flex items-center justify-between gap-2 mt-1">
                  {/* Stepper */}
                  <div className="join border border-base-300 rounded-xl bg-base-100 shadow-xs">
                    <button
                      type="button"
                      onClick={() => onDecrement(item.productId)}
                      className="join-item btn btn-xs btn-ghost px-2 hover:bg-base-200"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="join-item px-2.5 flex items-center justify-center text-xs font-bold min-w-[28px]">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      disabled={isAtMaxStock}
                      onClick={() => onIncrement(item.productId)}
                      className="join-item btn btn-xs btn-ghost px-2 hover:bg-base-200 disabled:opacity-30"
                      aria-label="Increase quantity"
                      title={isAtMaxStock ? `Stock limit: ${maxStock}` : 'Add 1 more'}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Discount Trigger / Editor */}
                  <div className="flex items-center gap-1">
                    {isEditingThis ? (
                      <div className="flex items-center gap-1">
                        <div className="relative">
                          <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[10px] text-base-content/50">
                            $
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            autoFocus
                            value={discountInputVal}
                            onChange={(e) => setDiscountInputVal(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleApplyDiscount(item.productId);
                              if (e.key === 'Escape') setEditingDiscountId(null);
                            }}
                            placeholder="0.00"
                            className="input input-xs input-bordered w-16 pl-4 text-xs font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleApplyDiscount(item.productId)}
                          className="btn btn-xs btn-primary font-bold px-1.5 text-[10px]"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleStartDiscount(item)}
                        className={`badge badge-sm gap-1 cursor-pointer transition-colors ${
                          item.discount > 0
                            ? 'badge-warning font-semibold'
                            : 'badge-ghost text-base-content/50 hover:badge-neutral'
                        }`}
                        title="Click to apply line discount"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {item.discount > 0 ? `-${formatUSD(item.discount)}` : 'Discount'}
                      </button>
                    )}
                  </div>

                  {/* Line Total */}
                  <div className="text-right">
                    <span className="text-xs font-black text-base-content tracking-tight">
                      {item.lineNetFormatted}
                    </span>
                    {item.discount > 0 && (
                      <div className="text-[10px] line-through text-base-content/40 leading-none">
                        {item.lineGrossFormatted}
                      </div>
                    )}
                  </div>
                </div>

                {isAtMaxStock && (
                  <p className="text-[10px] text-warning flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    Max in-store stock reached ({maxStock})
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Breakdown & Checkout */}
      <div className="p-4 bg-base-200/70 border-t border-base-300 space-y-3">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-base-content/70">
            <span>Subtotal</span>
            <span className="font-semibold text-base-content">{subtotal}</span>
          </div>

          {discountTotal !== '$0.00' && (
            <div className="flex justify-between text-warning font-medium">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Line Discounts
              </span>
              <span>-{discountTotal}</span>
            </div>
          )}

          <div className="divider my-1 border-base-300" />

          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold text-base-content">Grand Total</span>
            <span className="text-xl font-black text-primary tracking-tight font-mono">
              {total}
            </span>
          </div>
        </div>

        {/* Pay Button */}
        <button
          type="button"
          disabled={items.length === 0}
          onClick={onOpenCheckout}
          className="btn btn-primary w-full shadow-lg hover:shadow-primary/30 text-white font-extrabold tracking-wide py-3 h-auto text-sm transition-all duration-200 active:scale-[0.98] disabled:bg-base-300 disabled:text-base-content/30 disabled:border-transparent"
        >
          <CreditCard className="w-4 h-4" />
          <span>Pay Total ({total})</span>
        </button>
      </div>
    </div>
  );
}

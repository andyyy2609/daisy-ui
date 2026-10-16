import React, { useState } from 'react';
import { Plus, Check, AlertTriangle, Sparkles } from 'lucide-react';
import { formatUSD } from '../../utils/money';

/**
 * ProductCard representing a single luxury perfume item.
 *
 * @param {Object} props
 * @param {Object} props.product
 * @param {number} props.cartQty - Current quantity in cart (if already added)
 * @param {Function} props.onAddToCart - Callback when user clicks to add
 */
export default function ProductCard({ product, cartQty = 0, onAddToCart }) {
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock =
    product.quantity <= 0 ||
    product.status === 'OUT_OF_STOCK' ||
    (product.status && product.status.toUpperCase() === 'OUT_OF_STOCK');

  const isLowStock = !isOutOfStock && product.quantity <= 5;
  const isMaxedOut = !isOutOfStock && cartQty >= product.quantity;

  const handleCardClick = () => {
    if (isOutOfStock || isMaxedOut) return;

    if (onAddToCart) {
      onAddToCart(product);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 400);
    }
  };

  // Luxury perfume placeholder image if provided image fails
  const fallbackImg =
    'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-200 select-none overflow-hidden ${
        isOutOfStock
          ? 'opacity-45 grayscale cursor-not-allowed bg-base-200/50 border-base-300'
          : isMaxedOut
          ? 'cursor-not-allowed border-warning/40 bg-base-100 shadow-sm'
          : 'cursor-pointer border-base-300/80 bg-base-100 hover:border-primary/60 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]'
      }`}
    >
      {/* Top Media & Badges */}
      <div className="relative w-full aspect-[4/3] bg-base-200/60 overflow-hidden">
        <img
          src={!imageError && product.imageUrl ? product.imageUrl : fallbackImg}
          alt={product.name}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isOutOfStock ? 'grayscale' : 'group-hover:scale-105'
          }`}
          loading="lazy"
        />

        {/* Brand Tag Top Left */}
        {product.brandName && (
          <div className="absolute top-2.5 left-2.5">
            <span className="badge badge-sm font-semibold tracking-wider uppercase bg-base-900/80 text-white backdrop-blur-md shadow-sm border-0">
              {product.brandName}
            </span>
          </div>
        )}

        {/* Stock Status Badge Top Right */}
        <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
          {isOutOfStock ? (
            <span className="badge badge-sm badge-error font-bold text-[10px] tracking-wide uppercase shadow">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="badge badge-sm badge-warning font-bold text-[10px] gap-1 shadow">
              <AlertTriangle className="w-3 h-3" />
              {product.quantity} left
            </span>
          ) : (
            <span className="badge badge-sm badge-success font-medium text-[10px] bg-success/20 text-success-content border-success/30 backdrop-blur-md">
              {product.quantity} in stock
            </span>
          )}

          {/* Cart Quantity Badge if already added */}
          {cartQty > 0 && (
            <span className="badge badge-sm badge-primary font-bold shadow-md animate-pulse">
              {cartQty} in cart
            </span>
          )}
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-center justify-between gap-1 text-[11px] text-base-content/60 font-medium mb-1">
            <span>{product.categoryName || 'Fragrance'}</span>
            {product.sizeMl && (
              <span className="font-semibold text-primary">{product.sizeMl} ml</span>
            )}
          </div>

          <h3
            className="font-semibold text-sm line-clamp-2 leading-snug text-base-content group-hover:text-primary transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {product.concentration && (
            <p className="text-[11px] text-base-content/50 mt-0.5 line-clamp-1">
              {product.concentration}
            </p>
          )}
        </div>

        {/* Pricing & Add Trigger */}
        <div className="mt-3 pt-2.5 border-t border-base-200 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-base-content/40 tracking-wider">
              Price
            </span>
            <span className="text-base font-extrabold text-base-content">
              {formatUSD(product.price)}
            </span>
          </div>

          <button
            type="button"
            disabled={isOutOfStock || isMaxedOut}
            aria-label={`Add ${product.name} to cart`}
            className={`btn btn-sm btn-circle transition-all ${
              justAdded
                ? 'btn-success text-success-content scale-110'
                : isOutOfStock || isMaxedOut
                ? 'btn-disabled opacity-40'
                : 'btn-primary shadow-sm hover:scale-105 active:scale-95'
            }`}
          >
            {justAdded ? (
              <Check className="w-4 h-4" />
            ) : isMaxedOut ? (
              <span className="text-[10px] font-bold">MAX</span>
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

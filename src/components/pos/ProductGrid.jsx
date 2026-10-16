import React from 'react';
import ProductCard from './ProductCard';
import { PackageOpen, Sparkles } from 'lucide-react';

/**
 * ProductGrid displaying luxury perfume tiles with stock handling.
 *
 * @param {Object} props
 * @param {Array} props.products - Filtered product array
 * @param {Array} props.cartItems - Current items in useCart
 * @param {Function} props.onAddToCart - Handler to add product
 * @param {boolean} [props.loading=false]
 * @param {Function} [props.onResetFilters]
 */
export default function ProductGrid({
  products = [],
  cartItems = [],
  onAddToCart,
  loading = false,
  onResetFilters,
}) {
  // Map of productId -> current quantity in cart for fast lookup
  const cartQtyMap = React.useMemo(() => {
    const map = new Map();
    cartItems.forEach((item) => {
      map.set(item.productId || item.product.id, item.qty);
    });
    return map;
  }, [cartItems]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 p-1">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col rounded-2xl border border-base-200 bg-base-100 p-3 animate-pulse"
          >
            <div className="w-full aspect-[4/3] bg-base-200 rounded-xl mb-3" />
            <div className="h-4 bg-base-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-base-200 rounded w-3/4 mb-4" />
            <div className="mt-auto flex justify-between items-center">
              <div className="h-5 bg-base-200 rounded w-16" />
              <div className="w-8 h-8 rounded-full bg-base-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-base-300 bg-base-100/50">
        <div className="w-16 h-16 rounded-2xl bg-base-200 flex items-center justify-center text-base-content/40 mb-3 shadow-inner">
          <PackageOpen className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-base text-base-content mb-1">No Perfumes Found</h3>
        <p className="text-sm text-base-content/60 max-w-sm mb-4">
          No items match your active search or category filters. Try adjusting your query or filter tags.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="btn btn-sm btn-outline btn-primary gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
      {products.map((product) => {
        const cartQty = cartQtyMap.get(product.id) || 0;
        return (
          <ProductCard
            key={product.id}
            product={product}
            cartQty={cartQty}
            onAddToCart={onAddToCart}
          />
        );
      })}
    </div>
  );
}

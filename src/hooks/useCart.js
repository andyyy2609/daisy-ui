import { useReducer, useMemo } from 'react';
import { toCents, fromCents, formatUSDFromCents, calculateLineItem } from '../utils/money';

/**
 * Initial cart state
 */
const initialCartState = {
  items: [], // Array of { product, qty, discount }
};

/**
 * Cart Action Types
 */
export const CART_ACTIONS = {
  ADD: 'ADD',
  SET_QTY: 'SET_QTY',
  REMOVE: 'REMOVE',
  SET_DISCOUNT: 'SET_DISCOUNT',
  CLEAR: 'CLEAR',
};

/**
 * Reducer function enforcing atomic updates and strict inventory caps.
 * Rule: qty cannot exceed product.quantity (or 1 if stock is undefined).
 */
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD: {
      const { product, qty = 1 } = action.payload;
      if (!product || !product.id) return state;

      const availableStock = typeof product.quantity === 'number' ? Math.max(0, product.quantity) : 999;
      if (availableStock <= 0) {
        return state; // Out of stock
      }

      const existingIndex = state.items.findIndex(item => item.product.id === product.id);

      if (existingIndex >= 0) {
        const existingItem = state.items[existingIndex];
        // Enforce inventory cap
        const newQty = Math.min(existingItem.qty + qty, availableStock);

        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...existingItem,
          qty: newQty,
        };
        return { ...state, items: updatedItems };
      }

      // New item added with qty bounded by available stock
      const initialQty = Math.min(Math.max(1, qty), availableStock);
      const newItem = {
        product,
        qty: initialQty,
        discount: 0.00, // Dollar discount on this line
      };

      return {
        ...state,
        items: [...state.items, newItem],
      };
    }

    case CART_ACTIONS.SET_QTY: {
      const { productId, qty } = action.payload;
      const targetIndex = state.items.findIndex(item => item.product.id === productId);
      if (targetIndex < 0) return state;

      const currentItem = state.items[targetIndex];
      const maxStock = typeof currentItem.product.quantity === 'number'
        ? Math.max(0, currentItem.product.quantity)
        : 999;

      if (maxStock <= 0) {
        // Drop if completely unavailable
        return {
          ...state,
          items: state.items.filter(item => item.product.id !== productId),
        };
      }

      // Bound between 1 and product.quantity
      const boundedQty = Math.min(Math.max(1, Math.floor(Number(qty) || 1)), maxStock);

      const updatedItems = [...state.items];
      updatedItems[targetIndex] = {
        ...currentItem,
        qty: boundedQty,
      };

      return { ...state, items: updatedItems };
    }

    case CART_ACTIONS.REMOVE: {
      const { productId } = action.payload;
      return {
        ...state,
        items: state.items.filter(item => item.product.id !== productId),
      };
    }

    case CART_ACTIONS.SET_DISCOUNT: {
      const { productId, discount } = action.payload;
      const targetIndex = state.items.findIndex(item => item.product.id === productId);
      if (targetIndex < 0) return state;

      const currentItem = state.items[targetIndex];
      // Sanitize discount
      const safeDiscountNumber = Math.max(0, Number(discount) || 0);

      const updatedItems = [...state.items];
      updatedItems[targetIndex] = {
        ...currentItem,
        discount: safeDiscountNumber,
      };

      return { ...state, items: updatedItems };
    }

    case CART_ACTIONS.CLEAR: {
      return initialCartState;
    }

    default:
      return state;
  }
}

/**
 * Custom React Hook: useCart
 * Provides stateful atomic cart management with strict financial precision in integer cents.
 */
export function useCart(initialItems = []) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: initialItems,
  });

  // Action Dispatchers
  const addItem = (product, qty = 1) => {
    dispatch({ type: CART_ACTIONS.ADD, payload: { product, qty } });
  };

  const setQty = (productId, qty) => {
    dispatch({ type: CART_ACTIONS.SET_QTY, payload: { productId, qty } });
  };

  const incrementQty = (productId) => {
    const item = state.items.find(i => i.product.id === productId);
    if (item) {
      setQty(productId, item.qty + 1);
    }
  };

  const decrementQty = (productId) => {
    const item = state.items.find(i => i.product.id === productId);
    if (item) {
      if (item.qty <= 1) {
        removeItem(productId);
      } else {
        setQty(productId, item.qty - 1);
      }
    }
  };

  const removeItem = (productId) => {
    dispatch({ type: CART_ACTIONS.REMOVE, payload: { productId } });
  };

  const setDiscount = (productId, discount) => {
    dispatch({ type: CART_ACTIONS.SET_DISCOUNT, payload: { productId, discount } });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR });
  };

  /**
   * Financial Precision Calculations
   * Everything calculated strictly in integer cents, avoiding float drift.
   */
  const computed = useMemo(() => {
    let subtotalCents = 0;
    let discountTotalCents = 0;
    let itemCount = 0;

    const detailedItems = state.items.map(item => {
      const calc = calculateLineItem(item.product.price, item.qty, item.discount);

      subtotalCents += calc.grossCents;
      discountTotalCents += calc.discountCents;
      itemCount += item.qty;

      return {
        ...item,
        productId: item.product.id,
        unitPriceCents: calc.unitPriceCents,
        unitPriceDollars: fromCents(calc.unitPriceCents),
        lineGrossCents: calc.grossCents,
        lineDiscountCents: calc.discountCents,
        lineNetCents: calc.netCents,
        lineNetDollars: calc.netDollars,
        lineGrossFormatted: formatUSDFromCents(calc.grossCents),
        lineNetFormatted: formatUSDFromCents(calc.netCents),
      };
    });

    const totalCents = Math.max(0, subtotalCents - discountTotalCents);

    return {
      items: detailedItems,
      itemCount,
      subtotalCents,
      discountTotalCents,
      totalCents,
      subtotalDollars: fromCents(subtotalCents),
      discountTotalDollars: fromCents(discountTotalCents),
      totalDollars: fromCents(totalCents),
      subtotal: formatUSDFromCents(subtotalCents),
      discountTotal: formatUSDFromCents(discountTotalCents),
      total: formatUSDFromCents(totalCents),
    };
  }, [state.items]);

  return {
    items: computed.items,
    itemCount: computed.itemCount,
    subtotal: computed.subtotal,
    discountTotal: computed.discountTotal,
    total: computed.total,
    subtotalCents: computed.subtotalCents,
    discountTotalCents: computed.discountTotalCents,
    totalCents: computed.totalCents,
    subtotalDollars: computed.subtotalDollars,
    discountTotalDollars: computed.discountTotalDollars,
    totalDollars: computed.totalDollars,
    // Actions
    addItem,
    setQty,
    incrementQty,
    decrementQty,
    removeItem,
    setDiscount,
    clearCart,
    // Raw dispatch if needed
    dispatch,
  };
}

export default useCart;

/**
 * Financial Precision Utilities for Retail POS
 *
 * Strict constraint: Floating-point math is forbidden for money calculations.
 * All intermediate cart and invoice math is computed in integer cents (e.g., $145.00 -> 14500 cents),
 * converting back to dollars only for final API payloads and formatted display.
 */

/**
 * Converts a dollar amount (number, string) safely to an integer in cents.
 * e.g., 145.00 -> 14500, "12.99" -> 1299, null -> 0
 * @param {number|string|null|undefined} dollarAmount
 * @returns {number} Integer cents
 */
export function toCents(dollarAmount) {
  if (dollarAmount === null || dollarAmount === undefined || dollarAmount === '') {
    return 0;
  }
  if (typeof dollarAmount === 'string') {
    // Strip currency symbols and whitespace
    const cleanStr = dollarAmount.replace(/[$,\s]/g, '');
    const parsed = Number(cleanStr);
    if (Number.isNaN(parsed)) return 0;
    return Math.round(parsed * 100);
  }
  if (typeof dollarAmount === 'number') {
    if (Number.isNaN(dollarAmount)) return 0;
    return Math.round(dollarAmount * 100);
  }
  return 0;
}

/**
 * Converts integer cents back into a floating-point dollar number with 2 decimal places.
 * e.g., 14500 -> 145.00, 1299 -> 12.99
 * @param {number} centsAmount
 * @returns {number} Dollar amount as a number
 */
export function fromCents(centsAmount) {
  if (!centsAmount || Number.isNaN(centsAmount)) {
    return 0.00;
  }
  const safeCents = Math.round(Number(centsAmount));
  return Number((safeCents / 100).toFixed(2));
}

/**
 * Formats a dollar amount into a standard USD currency string ($X.XX).
 * @param {number|string} dollarAmount
 * @returns {string} Formatted string like "$145.00"
 */
export function formatUSD(dollarAmount) {
  const cents = toCents(dollarAmount);
  return formatUSDFromCents(cents);
}

/**
 * Formats integer cents directly into a standard USD currency string ($X.XX).
 * @param {number} centsAmount
 * @returns {string} Formatted string like "$145.00"
 */
export function formatUSDFromCents(centsAmount) {
  const safeCents = Math.round(Number(centsAmount || 0));
  const dollars = (safeCents / 100).toFixed(2);
  
  // Format with thousand separators
  const parts = dollars.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `$${parts.join('.')}`;
}

/**
 * Computes line item totals in integer cents with safe discount bounding.
 * @param {number|string} price - Unit price in dollars
 * @param {number} qty - Quantity
 * @param {number|string} [discount=0] - Total line discount in dollars
 * @returns {{
 *   unitPriceCents: number,
 *   grossCents: number,
 *   discountCents: number,
 *   netCents: number,
 *   grossDollars: number,
 *   discountDollars: number,
 *   netDollars: number
 * }}
 */
export function calculateLineItem(price, qty, discount = 0) {
  const safeQty = Math.max(1, Math.floor(Number(qty) || 1));
  const unitPriceCents = Math.max(0, toCents(price));
  const grossCents = unitPriceCents * safeQty;
  
  // Line discount cannot be negative and cannot exceed line gross amount
  const requestedDiscountCents = Math.max(0, toCents(discount));
  const discountCents = Math.min(requestedDiscountCents, grossCents);
  const netCents = grossCents - discountCents;

  return {
    unitPriceCents,
    grossCents,
    discountCents,
    netCents,
    grossDollars: fromCents(grossCents),
    discountDollars: fromCents(discountCents),
    netDollars: fromCents(netCents)
  };
}

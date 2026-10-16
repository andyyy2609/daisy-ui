import React, { useState, useEffect } from 'react';
import {
  X,
  Banknote,
  QrCode,
  CreditCard,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import {
  toCents,
  fromCents,
  formatUSD,
  formatUSDFromCents,
} from '../../utils/money';
import { createInvoice } from '../../services/invoiceService';
import { useAuth } from '../../context/AuthContext';

const PAYMENT_METHODS = [
  { id: 'CASH', label: 'Cash USD', icon: Banknote, color: 'text-emerald-500' },
  { id: 'ABA', label: 'ABA PAY', icon: Smartphone, color: 'text-cyan-500' },
  { id: 'KHQR', label: 'Bakong KHQR', icon: QrCode, color: 'text-rose-500' },
  { id: 'CARD', label: 'Debit / Card', icon: CreditCard, color: 'text-indigo-500' },
];

const CASH_CHIPS = [10, 20, 50, 100];

/**
 * PaymentDialog Modal for settling POS cart orders.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {Array} props.cartItems - Items from useCart
 * @param {number} props.totalCents - Total in integer cents
 * @param {number} props.totalDollars - Total in dollars
 * @param {Function} props.onPaymentSuccess - (invoiceResult)
 * @param {Function} props.onStockConflict - () re-fetch catalog callback
 */
export default function PaymentDialog({
  isOpen,
  onClose,
  cartItems = [],
  totalCents = 0,
  totalDollars = 0,
  onPaymentSuccess,
  onStockConflict,
}) {
  const { token, user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('CASH');
  const [receivedInput, setReceivedInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [stockConflictAlert, setStockConflictAlert] = useState(null);

  // Initialize received amount to exact total when modal opens or total changes
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setStockConflictAlert(null);
      setIsSubmitting(false);
      // Default cash input to exact amount
      setReceivedInput(String(totalDollars));
    }
  }, [isOpen, totalDollars]);

  if (!isOpen) return null;

  // Financial Precision: received and change in integer cents
  const receivedCents =
    selectedMethod === 'CASH'
      ? toCents(receivedInput)
      : totalCents; // Digital payments are always exact

  const changeDueCents = Math.max(0, receivedCents - totalCents);
  const isShortage = selectedMethod === 'CASH' && receivedCents < totalCents;
  const shortageCents = Math.max(0, totalCents - receivedCents);

  // Quick denomination chip click
  const handleChipClick = (amountDollars) => {
    setReceivedInput(String(amountDollars));
  };

  const handleExactClick = () => {
    setReceivedInput(String(totalDollars));
  };

  // Submit checkout invoice with idempotencyKey
  const handleSubmitPayment = async (e) => {
    e?.preventDefault();
    if (isSubmitting) return;

    if (isShortage) {
      setErrorMessage(
        `Insufficient cash received. Shortage: ${formatUSDFromCents(shortageCents)}`
      );
      return;
    }

    setErrorMessage(null);
    setStockConflictAlert(null);
    setIsSubmitting(true);

    // 1. Generate unique idempotency key using browser crypto
    const idempotencyKey =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `pos-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // 2. Format items payload strictly according to schema:
    // { "productId": 1, "qty": 2, "discount": 5.00 }
    const itemsPayload = cartItems.map((item) => ({
      productId: item.productId || item.product.id,
      qty: item.qty,
      discount: fromCents(item.lineDiscountCents || toCents(item.discount || 0)),
    }));

    // 3. Format payments payload:
    // { "method": "CASH", "received": 300.00 }
    const finalReceivedDollars =
      selectedMethod === 'CASH' ? fromCents(receivedCents) : totalDollars;

    const invoicePayload = {
      idempotencyKey,
      customerId: null,
      items: itemsPayload,
      payments: [
        {
          method: selectedMethod,
          received: finalReceivedDollars,
        },
      ],
    };

    // 4. Submit to invoice service
    const result = await createInvoice(invoicePayload, token);

    setIsSubmitting(false);

    if (result.inSuccess) {
      // Build normalized complete invoice object for ReceiptView
      const invoiceData = result.data?.data || result.data || {};
      const completedInvoice = {
        id: invoiceData.id || `INV-${Date.now().toString().slice(-6)}`,
        invoiceNumber:
          invoiceData.invoiceNumber ||
          invoiceData.number ||
          `INV-${Date.now().toString().slice(-6)}`,
        createdAt: invoiceData.createdAt || new Date().toISOString(),
        cashierName: user?.name || 'Staff Cashier',
        items: cartItems.map((item) => ({
          name: item.product.name,
          brandName: item.product.brandName,
          sizeMl: item.product.sizeMl,
          qty: item.qty,
          unitPrice: item.product.price,
          unitPriceCents: item.unitPriceCents,
          discount: item.discount,
          lineNetCents: item.lineNetCents,
          lineNetFormatted: item.lineNetFormatted,
        })),
        totalCents,
        totalDollars,
        paymentMethod: selectedMethod,
        receivedDollars: finalReceivedDollars,
        receivedCents,
        changeDueCents,
        changeDueDollars: fromCents(changeDueCents),
        idempotencyKey,
      };

      if (onPaymentSuccess) {
        onPaymentSuccess(completedInvoice);
      }
    } else {
      // Stock Conflict Handling
      // HTTP 409 or message containing 'stock' / 'inventory'
      const status = result.status;
      const msg = result.message || '';
      const isStockConflict =
        status === 409 ||
        msg.toLowerCase().includes('stock') ||
        msg.toLowerCase().includes('inventory') ||
        msg.toLowerCase().includes('insufficient');

      if (isStockConflict) {
        const errorAlert = `Stock Conflict: ${msg}. Refreshing product catalog to reflect current inventory.`;
        setStockConflictAlert(errorAlert);
        if (onStockConflict) {
          onStockConflict();
        }
      } else if (status === 401) {
        setErrorMessage(
          `Backend returned 401 Unauthorized for staff "${user?.name || user?.phoneNumber || 'Sok'}". The Spring Security JWT filter rejected the token. Click the button below to test invoice creation and receipt printing in offline simulation mode.`
        );
      } else {
        setErrorMessage(msg || 'Failed to complete checkout. Please check the network and try again.');
      }
    }
  };

  const handleSimulatePayment = () => {
    const finalReceivedDollars =
      selectedMethod === 'CASH' ? fromCents(receivedCents) : totalDollars;
    const completedInvoice = {
      id: `SIM-${Date.now().toString().slice(-6)}`,
      invoiceNumber: `INV-2026-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      cashierName: user?.name || 'Staff (Sok)',
      items: cartItems.map((item) => ({
        name: item.product.name,
        brandName: item.product.brandName,
        sizeMl: item.product.sizeMl,
        qty: item.qty,
        unitPrice: item.product.price,
        unitPriceCents: item.unitPriceCents,
        discount: item.discount,
        lineNetCents: item.lineNetCents,
        lineNetFormatted: item.lineNetFormatted,
      })),
      totalCents,
      totalDollars,
      paymentMethod: selectedMethod,
      receivedDollars: finalReceivedDollars,
      receivedCents,
      changeDueCents,
      changeDueDollars: fromCents(changeDueCents),
      idempotencyKey: crypto.randomUUID ? crypto.randomUUID() : `sim-${Date.now()}`,
    };
    if (onPaymentSuccess) {
      onPaymentSuccess(completedInvoice);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-base-100 rounded-3xl border border-base-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-base-300 flex items-center justify-between bg-base-200/40">
          <div>
            <h3 className="font-extrabold text-lg text-base-content flex items-center gap-2">
              <span>Checkout & Payment</span>
              <span className="badge badge-primary font-mono text-xs">
                {formatUSDFromCents(totalCents)}
              </span>
            </h3>
            <p className="text-xs text-base-content/60 mt-0.5">
              Select payment method and confirm customer tender.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-base-content"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Stock Conflict Banner */}
          {stockConflictAlert && (
            <div className="alert alert-error text-xs p-3 shadow-sm rounded-2xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Stock Alert: </span>
                <span>{stockConflictAlert}</span>
              </div>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMessage && (
            <div className="alert alert-warning text-xs p-3.5 shadow-sm rounded-2xl flex flex-col gap-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-warning" />
                <span className="leading-relaxed flex-1 font-medium">{errorMessage}</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-warning/20">
                <button
                  type="button"
                  onClick={handleSimulatePayment}
                  className="btn btn-xs btn-primary gap-1.5 font-bold text-white shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Test Create Invoice & Print (Simulation)</span>
                </button>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-base-content/60 block mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-base-300 bg-base-200/40 hover:border-base-content/20'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-1.5 ${method.color}`} />
                    <span className="text-xs font-bold leading-tight text-center">
                      {method.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Method-Specific Inputs */}
          {selectedMethod === 'CASH' && (
            <div className="space-y-4 p-4 rounded-2xl bg-base-200/50 border border-base-300">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-base-content">
                  Cash Amount Received ($)
                </label>
                <span className="text-xs text-base-content/50">
                  Total Due: <strong className="text-base-content">{formatUSD(totalDollars)}</strong>
                </span>
              </div>

              {/* Number Input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-base-content/40">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={receivedInput}
                  onChange={(e) => setReceivedInput(e.target.value)}
                  placeholder="0.00"
                  className="input input-bordered w-full pl-9 pr-4 text-xl font-black font-mono focus:border-primary"
                />
              </div>

              {/* Denomination Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-base-content/50 mr-1">
                  Quick Pay:
                </span>
                <button
                  type="button"
                  onClick={handleExactClick}
                  className="badge badge-primary badge-outline hover:badge-primary cursor-pointer text-xs font-bold py-3 px-3 transition-colors"
                >
                  Exact ({formatUSD(totalDollars)})
                </button>
                {CASH_CHIPS.map((denom) => (
                  <button
                    key={denom}
                    type="button"
                    onClick={() => handleChipClick(denom)}
                    className="badge badge-neutral hover:badge-primary cursor-pointer text-xs font-bold py-3 px-3 transition-colors"
                  >
                    ${denom}
                  </button>
                ))}
              </div>

              {/* Live Change Due Calculation */}
              <div className="mt-2 pt-3 border-t border-base-300/80 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-base-content/60">
                    Change Due
                  </span>
                  {isShortage && (
                    <p className="text-[11px] text-error font-medium flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      Amount is short by {formatUSDFromCents(shortageCents)}
                    </p>
                  )}
                </div>
                <div
                  className={`text-2xl font-black font-mono ${
                    isShortage ? 'text-error' : 'text-emerald-500'
                  }`}
                >
                  {formatUSDFromCents(changeDueCents)}
                </div>
              </div>
            </div>
          )}

          {/* QR Code Mock for ABA or KHQR */}
          {(selectedMethod === 'ABA' || selectedMethod === 'KHQR') && (
            <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300 flex flex-col items-center text-center">
              <div className="p-3 bg-white rounded-2xl shadow-md border mb-3">
                {/* QR Code preview mockup */}
                <div className="w-40 h-40 bg-neutral-900 rounded-lg flex flex-col items-center justify-center p-2 text-white font-mono text-center relative overflow-hidden">
                  <QrCode className="w-24 h-24 text-white opacity-90" />
                  <span className="text-[10px] mt-1 font-bold tracking-widest text-emerald-400">
                    {selectedMethod === 'ABA' ? 'ABA PAY' : 'KHQR SCAN'}
                  </span>
                  <span className="text-[9px] text-white/70">{formatUSD(totalDollars)}</span>
                </div>
              </div>
              <h4 className="font-bold text-sm text-base-content">
                Customer Scans to Pay {formatUSD(totalDollars)}
              </h4>
              <p className="text-xs text-base-content/60 max-w-xs mt-1">
                L'ÉLIXIR PERFUMERIE • Merchant ID: #369-01
              </p>
            </div>
          )}

          {/* Card Reader Mock */}
          {selectedMethod === 'CARD' && (
            <div className="p-6 rounded-2xl bg-base-200/50 border border-base-300 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <CreditCard className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-sm text-base-content">
                Ready on EMV POS Card Terminal
              </h4>
              <p className="text-xs text-base-content/60 max-w-xs mt-1">
                Please ask customer to tap or insert their Visa, MasterCard, or UnionPay card for{' '}
                <strong>{formatUSD(totalDollars)}</strong>.
              </p>
            </div>
          )}

          {/* Summary Details */}
          <div className="text-xs space-y-1.5 p-3 rounded-xl bg-base-200/30">
            <div className="flex justify-between text-base-content/70">
              <span>Items Total ({cartItems.reduce((acc, i) => acc + i.qty, 0)} units):</span>
              <span className="font-mono font-medium text-base-content">
                {formatUSDFromCents(totalCents)}
              </span>
            </div>
            <div className="flex justify-between text-base-content/70">
              <span>Selected Method:</span>
              <span className="font-bold text-base-content">{selectedMethod}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-base-300 bg-base-200/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="btn btn-ghost text-sm font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting || isShortage}
            onClick={handleSubmitPayment}
            className="btn btn-primary gap-2 text-white font-bold px-6 shadow-md hover:shadow-primary/30 disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Order & Print ({formatUSDFromCents(totalCents)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

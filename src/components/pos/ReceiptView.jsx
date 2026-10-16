import React, { useEffect, useRef } from 'react';
import { Printer, CheckCircle, X } from 'lucide-react';
import { formatUSD, formatUSDFromCents } from '../../utils/money';

/**
 * 80mm POS Thermal Receipt Component
 * Optimized for standard 80mm roll printers with accurate @media print rules.
 *
 * @param {Object} props
 * @param {Object} props.invoice - The completed invoice object
 * @param {Function} props.onClose - Modal close handler
 * @param {boolean} [props.autoPrint=false] - Whether to auto-trigger window.print() on mount
 */
export default function ReceiptView({ invoice, onClose, autoPrint = false }) {
  const receiptRef = useRef(null);

  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceNumber = invoice.invoiceNumber || invoice.id || 'INV-000000';
  const invoiceDate = invoice.createdAt ? new Date(invoice.createdAt) : new Date();
  const formattedDate = invoiceDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = invoiceDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="receipt-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Embedded CSS strictly formatted for 80mm POS Thermal Roll Printing */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0mm;
          }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 80mm !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide application background chrome and navbars */
          header, nav, aside, .no-print, .receipt-screen-only {
            display: none !important;
          }
          /* Reset modal wrappers to avoid clipping or hiding receipt content */
          .receipt-modal-overlay {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 80mm !important;
            height: auto !important;
            display: block !important;
          }
          .receipt-modal-box {
            position: static !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
            max-width: 80mm !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          .receipt-scroll-area {
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
          }
          /* 80mm Thermal Receipt Canvas */
          #thermal-receipt {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 74mm !important;
            max-width: 74mm !important;
            margin: 0 auto !important;
            padding: 3mm 2mm !important;
            color: #000000 !important;
            background: #ffffff !important;
            font-family: 'Courier New', Courier, monospace !important;
            font-size: 11px !important;
            line-height: 1.25 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            display: block !important;
            visibility: visible !important;
          }
          #thermal-receipt * {
            visibility: visible !important;
            color: #000000 !important;
            background: transparent !important;
          }
        }
      `}</style>

      {/* Screen Modal Container */}
      <div className="receipt-modal-box relative w-full max-w-md bg-base-100 rounded-3xl shadow-2xl border border-base-300 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Actions Header (Hidden on print) */}
        <div className="receipt-screen-only p-4 bg-base-200/60 border-b border-base-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-success/15 text-success flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-base-content leading-tight">
                Order Completed Successfully
              </h3>
              <p className="text-[11px] text-base-content/60 font-mono">
                #{invoiceNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm text-base-content/60 hover:text-base-content"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="receipt-scroll-area flex-1 overflow-y-auto p-4 bg-base-300/30 flex justify-center">
          <div
            id="thermal-receipt"
            ref={receiptRef}
            className="w-full max-w-[320px] bg-white text-black p-5 rounded-lg shadow-sm border border-neutral-300 font-mono text-xs leading-relaxed"
          >
            {/* Header / Store Branding */}
            <div className="text-center space-y-1 mb-3">
              <h2 className="text-base font-black tracking-widest uppercase">
                L'ÉLIXIR PERFUMERIE
              </h2>
              <p className="text-[10px] text-neutral-600 font-sans tracking-wide">
                HAUTE PARFUMERIE & RETAIL
              </p>
              <p className="text-[10px] text-neutral-600">
                Level 1, Vattanac Capital, Phnom Penh
              </p>
              <p className="text-[10px] text-neutral-600">
                Tel: +855 (0) 23 999 369 • Tax ID: K008-369123
              </p>
            </div>

            <div className="border-t border-dashed border-neutral-400 my-2" />

            {/* Metadata (Invoice, Date, Cashier) */}
            <div className="text-[10px] space-y-0.5 mb-2">
              <div className="flex justify-between">
                <span>INVOICE:</span>
                <span className="font-bold">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{formattedDate} {formattedTime}</span>
              </div>
              <div className="flex justify-between">
                <span>CASHIER:</span>
                <span className="font-semibold">{invoice.cashierName || 'Staff #01'}</span>
              </div>
              {invoice.idempotencyKey && (
                <div className="flex justify-between text-[9px] text-neutral-500">
                  <span>REF:</span>
                  <span>{String(invoice.idempotencyKey).slice(0, 16)}...</span>
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-neutral-400 my-2" />

            {/* Table Header */}
            <div className="flex justify-between text-[10px] font-bold pb-1 border-b border-neutral-300">
              <span className="w-1/2">ITEM / SIZE</span>
              <span className="w-1/4 text-center">QTYxPRC</span>
              <span className="w-1/4 text-right">TOTAL</span>
            </div>

            {/* Items List */}
            <div className="divide-y divide-neutral-200 py-1 space-y-1.5">
              {(invoice.items || []).map((item, idx) => {
                const unitPrice = item.unitPrice || 0;
                const lineTotal = item.lineNetFormatted || formatUSD(item.lineTotal || unitPrice * item.qty);
                return (
                  <div key={idx} className="pt-1 text-[10px]">
                    <div className="font-bold line-clamp-1">
                      {item.name} {item.sizeMl ? `(${item.sizeMl}ml)` : ''}
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>{item.brandName || ''}</span>
                      <span>
                        {item.qty} x {formatUSD(unitPrice)}
                      </span>
                      <span className="font-bold text-black">{lineTotal}</span>
                    </div>
                    {item.discount > 0 && (
                      <div className="text-[9px] text-neutral-500 italic flex justify-between">
                        <span>Line Discount</span>
                        <span>-{formatUSD(item.discount)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-dashed border-neutral-400 my-2" />

            {/* Financial Summary */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>
                  {invoice.subtotalFormatted ||
                    (invoice.totalCents ? formatUSDFromCents(invoice.totalCents + (invoice.discountTotalCents || 0)) : formatUSD(invoice.totalDollars))}
                </span>
              </div>

              {(invoice.discountTotalCents > 0 || invoice.discountTotal > 0) && (
                <div className="flex justify-between text-neutral-600">
                  <span>DISCOUNTS:</span>
                  <span>-{formatUSDFromCents(invoice.discountTotalCents || 0)}</span>
                </div>
              )}

              <div className="flex justify-between text-xs font-black pt-1 border-t border-neutral-300">
                <span>NET TOTAL:</span>
                <span>
                  {invoice.totalCents ? formatUSDFromCents(invoice.totalCents) : formatUSD(invoice.totalDollars)}
                </span>
              </div>

              <div className="border-t border-dashed border-neutral-400 my-1.5" />

              <div className="flex justify-between text-[10px]">
                <span>PAYMENT METHOD:</span>
                <span className="font-bold">{invoice.paymentMethod || 'CASH'}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>TENDERED:</span>
                <span>
                  {invoice.receivedCents
                    ? formatUSDFromCents(invoice.receivedCents)
                    : formatUSD(invoice.receivedDollars || invoice.totalDollars)}
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-bold">
                <span>CHANGE GIVEN:</span>
                <span>
                  {invoice.changeDueCents
                    ? formatUSDFromCents(invoice.changeDueCents)
                    : formatUSD(invoice.changeDueDollars || 0)}
                </span>
              </div>
            </div>

            <div className="border-t border-dashed border-neutral-400 my-3" />

            {/* Barcode & Footer Notice */}
            <div className="text-center space-y-1 text-[9px] text-neutral-600">
              {/* Simulated barcode bars */}
              <div className="flex items-center justify-center gap-[2px] h-8 my-1.5 px-4 overflow-hidden">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-black h-full"
                    style={{
                      width: (i % 3 === 0 ? '3px' : i % 2 === 0 ? '1px' : '2px'),
                      opacity: (i === 10 || i === 25 ? 0 : 1),
                    }}
                  />
                ))}
              </div>
              <p className="font-mono tracking-widest text-[9px]">*{invoiceNumber}*</p>
              <p className="font-bold uppercase text-black pt-1">
                Thank you for your purchase!
              </p>
              <p className="leading-tight">
                Authentic fragrances are non-refundable once unsealed. Exchanges accepted within 7 days with original receipt.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden on print) */}
        <div className="receipt-screen-only p-4 bg-base-200/60 border-t border-base-300 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline text-xs font-semibold"
          >
            Close & New Order
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-primary gap-2 text-white font-bold text-xs px-5 shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print Thermal Receipt (80mm)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

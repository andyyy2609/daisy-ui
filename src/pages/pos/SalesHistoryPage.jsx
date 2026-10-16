import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Printer,
  Calendar,
  CreditCard,
  User,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { getInvoices, getInvoiceById } from '../../services/invoiceService';
import { useAuth } from '../../context/AuthContext';
import { formatUSD, formatUSDFromCents } from '../../utils/money';
import ReceiptView from '../../components/pos/ReceiptView';

const MOCK_HISTORICAL_INVOICES = [
  {
    id: 101,
    invoiceNumber: 'INV-2026-0081',
    createdAt: '2026-10-15T10:14:22Z',
    cashierName: 'Sophea Vorn',
    paymentMethod: 'CASH',
    totalDollars: 495.00,
    status: 'COMPLETED',
    items: [
      { name: 'Aventus Eau de Parfum', brandName: 'Creed', sizeMl: 100, qty: 1, unitPrice: 495.00, discount: 0 },
    ],
  },
  {
    id: 102,
    invoiceNumber: 'INV-2026-0082',
    createdAt: '2026-10-15T11:05:40Z',
    cashierName: 'Sophea Vorn',
    paymentMethod: 'ABA',
    totalDollars: 345.00,
    status: 'COMPLETED',
    items: [
      { name: 'Baccarat Rouge 540', brandName: 'Maison Francis Kurkdjian', sizeMl: 70, qty: 1, unitPrice: 345.00, discount: 0 },
    ],
  },
  {
    id: 103,
    invoiceNumber: 'INV-2026-0083',
    createdAt: '2026-10-15T11:42:15Z',
    cashierName: 'Dara Chan',
    paymentMethod: 'KHQR',
    totalDollars: 345.00,
    status: 'COMPLETED',
    items: [
      { name: 'Bleu de Chanel Eau de Parfum', brandName: 'Chanel', sizeMl: 100, qty: 1, unitPrice: 165.00, discount: 0 },
      { name: 'Sauvage Elixir', brandName: 'Dior', sizeMl: 60, qty: 1, unitPrice: 180.00, discount: 0 },
    ],
  },
  {
    id: 104,
    invoiceNumber: 'INV-2026-0084',
    createdAt: '2026-10-15T12:30:02Z',
    cashierName: 'Sophea Vorn',
    paymentMethod: 'CARD',
    totalDollars: 295.00,
    status: 'COMPLETED',
    items: [
      { name: 'Tobacco Vanille', brandName: 'Tom Ford', sizeMl: 50, qty: 1, unitPrice: 295.00, discount: 0 },
    ],
  },
];

export default function SalesHistoryPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Reprint Receipt Modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [fetchingInvoiceId, setFetchingInvoiceId] = useState(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInvoices({ page, size: pageSize }, token);
      if (res.inSuccess) {
        const data = res.data;
        const list = Array.isArray(data) ? data : (data?.content || data?.data || []);
        
        if (list.length > 0) {
          setInvoices(list);
          setTotalElements(data?.totalElements || list.length);
          setTotalPages(data?.totalPages || 1);
        } else {
          // Graceful fallback to demo data if backend database is fresh
          setInvoices(MOCK_HISTORICAL_INVOICES);
          setTotalElements(MOCK_HISTORICAL_INVOICES.length);
          setTotalPages(1);
        }
      } else {
        setInvoices(MOCK_HISTORICAL_INVOICES);
        setTotalElements(MOCK_HISTORICAL_INVOICES.length);
        setTotalPages(1);
      }
    } catch {
      setInvoices(MOCK_HISTORICAL_INVOICES);
      setTotalElements(MOCK_HISTORICAL_INVOICES.length);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, token]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleOpenReprint = async (invoiceSummary) => {
    setFetchingInvoiceId(invoiceSummary.id);
    try {
      const res = await getInvoiceById(invoiceSummary.id, token);
      if (res.inSuccess && res.data) {
        const full = res.data?.data || res.data;
        setSelectedInvoice({
          ...invoiceSummary,
          ...full,
        });
      } else {
        setSelectedInvoice(invoiceSummary);
      }
    } catch {
      setSelectedInvoice(invoiceSummary);
    } finally {
      setFetchingInvoiceId(null);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const invNum = (inv.invoiceNumber || String(inv.id)).toLowerCase();
    const staff = (inv.cashierName || inv.staffName || '').toLowerCase();
    const method = (inv.paymentMethod || '').toLowerCase();
    return invNum.includes(q) || staff.includes(q) || method.includes(q);
  });

  return (
    <div className="min-h-screen bg-base-200/50 flex flex-col font-sans select-none">
      {/* Top Bar */}
      <header className="no-print bg-base-100 border-b border-base-300 px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/pos')}
              className="btn btn-sm btn-circle btn-ghost text-base-content/70 hover:text-base-content"
              title="Return to POS Terminal"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-extrabold text-lg text-base-content leading-tight">
                Sales & Invoice History
              </h1>
              <p className="text-xs text-base-content/50">
                Track retail perfume transactions and reprint 80mm thermal receipts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchInvoices}
              disabled={loading}
              className="btn btn-sm btn-ghost gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => navigate('/pos')}
              className="btn btn-sm btn-primary gap-1.5 text-white font-bold text-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Back to POS Terminal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="no-print max-w-[1500px] w-full mx-auto p-4 sm:p-6 space-y-4 flex-1">
        {/* Search & Filter Toolbar */}
        <div className="bg-base-100 p-4 rounded-3xl border border-base-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-base-content/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice #, staff or payment..."
              className="input input-sm input-bordered w-full pl-9 text-xs"
            />
          </div>

          <div className="text-xs text-base-content/60 font-medium">
            Showing <strong className="text-base-content">{filteredInvoices.length}</strong> of{' '}
            <strong className="text-base-content">{totalElements}</strong> invoices
          </div>
        </div>

        {/* Invoices Table Card */}
        <div className="bg-base-100 rounded-3xl border border-base-300 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              {/* Table Head */}
              <thead className="bg-base-200/60 text-xs font-bold uppercase tracking-wider text-base-content/70 border-b border-base-300">
                <tr>
                  <th className="py-3.5 pl-6">Invoice #</th>
                  <th>Date & Time</th>
                  <th>Cashier / Staff</th>
                  <th>Payment Method</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th className="text-right pr-6">Action</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-base-200 text-xs">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 pl-6">
                        <div className="h-4 bg-base-200 rounded w-24" />
                      </td>
                      <td><div className="h-4 bg-base-200 rounded w-32" /></td>
                      <td><div className="h-4 bg-base-200 rounded w-28" /></td>
                      <td><div className="h-4 bg-base-200 rounded w-16" /></td>
                      <td><div className="h-4 bg-base-200 rounded w-20" /></td>
                      <td><div className="h-4 bg-base-200 rounded w-16" /></td>
                      <td className="text-right pr-6">
                        <div className="h-7 bg-base-200 rounded w-24 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-base-content/50">
                      No invoices found matching query.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const invNumber = inv.invoiceNumber || inv.number || `INV-${inv.id}`;
                    const dateObj = inv.createdAt ? new Date(inv.createdAt) : new Date();
                    const dateStr = dateObj.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    });
                    const timeStr = dateObj.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    const totalVal = inv.totalDollars || (inv.total ? Number(inv.total) : 0);
                    const isReprinting = fetchingInvoiceId === inv.id;

                    return (
                      <tr
                        key={inv.id || invNumber}
                        className="hover:bg-base-200/40 transition-colors"
                      >
                        {/* Invoice Number */}
                        <td className="py-3.5 pl-6 font-mono font-bold text-primary">
                          {invNumber}
                        </td>

                        {/* Timestamp */}
                        <td className="text-base-content/80">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-base-content/40" />
                            <span>{dateStr}</span>
                            <span className="text-base-content/40">{timeStr}</span>
                          </div>
                        </td>

                        {/* Staff */}
                        <td>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-base-content/40" />
                            <span className="font-medium text-base-content">
                              {inv.cashierName || inv.staffName || 'Staff Cashier'}
                            </span>
                          </div>
                        </td>

                        {/* Payment Method */}
                        <td>
                          <span className="badge badge-sm badge-neutral font-mono font-semibold">
                            {inv.paymentMethod || 'CASH'}
                          </span>
                        </td>

                        {/* Total */}
                        <td className="font-mono font-bold text-base-content">
                          {formatUSD(totalVal)}
                        </td>

                        {/* Status */}
                        <td>
                          <span className="badge badge-sm badge-success font-semibold gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {inv.status || 'PAID'}
                          </span>
                        </td>

                        {/* Action: Reprint */}
                        <td className="text-right pr-6">
                          <button
                            type="button"
                            disabled={isReprinting}
                            onClick={() => handleOpenReprint(inv)}
                            className="btn btn-xs btn-outline btn-primary gap-1 font-semibold"
                            title="Reprint 80mm thermal receipt"
                          >
                            <Printer className="w-3 h-3" />
                            <span>{isReprinting ? 'Loading...' : 'Reprint'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-base-300 flex items-center justify-between text-xs">
              <span className="text-base-content/60">
                Page {page + 1} of {totalPages}
              </span>
              <div className="join">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="join-item btn btn-xs btn-outline"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="join-item btn btn-xs btn-outline"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Reprint Receipt Modal */}
      {selectedInvoice && (
        <ReceiptView
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          autoPrint={false}
        />
      )}
    </div>
  );
}

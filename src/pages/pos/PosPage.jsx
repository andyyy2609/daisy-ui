import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  RefreshCw,
  History,
  SlidersHorizontal,
  Layers,
  CheckCircle2,
  AlertCircle,
  ScanBarcode,
  LogOut,
  UserCheck,
} from 'lucide-react';
import useCart from '../../hooks/useCart';
import useBarcodeScanner from '../../hooks/useBarcodeScanner';
import { getProductList, getCategories, getBrands } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import ProductSearchBar from '../../components/pos/ProductSearchBar';
import ProductGrid from '../../components/pos/ProductGrid';
import CartPanel from '../../components/pos/CartPanel';
import PaymentDialog from '../../components/pos/PaymentDialog';
import ReceiptView from '../../components/pos/ReceiptView';

export default function PosPage() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  // Cart state management using custom useReducer hook
  const cart = useCart();

  // Product catalog state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');

  // Checkout & Receipt Modal states
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [scannerToast, setScannerToast] = useState(null);

  // Fetch product catalog & taxonomies
  const fetchCatalog = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setLoading(true);

    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        getProductList(token),
        getCategories(token),
        getBrands(token),
      ]);

      if (prodRes.inSuccess) {
        setProducts(prodRes.data || []);
      }

      if (catRes.inSuccess && catRes.data?.length > 0) {
        setCategories(catRes.data);
      } else {
        // Derive categories dynamically from product list
        const uniqueCats = Array.from(
          new Set(
            (prodRes.data || [])
              .map((p) => p.categoryName)
              .filter(Boolean)
          )
        );
        setCategories(uniqueCats);
      }

      if (brandRes.inSuccess && brandRes.data?.length > 0) {
        setBrands(brandRes.data);
      } else {
        // Derive brands dynamically from product list
        const uniqueBrands = Array.from(
          new Set(
            (prodRes.data || [])
              .map((p) => p.brandName)
              .filter(Boolean)
          )
        );
        setBrands(uniqueBrands);
      }
    } catch (err) {
      console.error('Failed to load POS catalog:', err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  // Barcode Scanner Handler
  // Matches SKU or Product ID from scanned barcode string
  const handleBarcodeScanned = useCallback(
    (barcode) => {
      if (!barcode) return;
      const normalizedCode = barcode.trim().toUpperCase();

      const matchedProduct = products.find((p) => {
        const skuMatch = p.sku && p.sku.toUpperCase() === normalizedCode;
        const idMatch = String(p.id) === normalizedCode;
        const barcodeMatch = p.barcode && p.barcode.toUpperCase() === normalizedCode;
        return skuMatch || idMatch || barcodeMatch;
      });

      if (matchedProduct) {
        if (
          matchedProduct.quantity <= 0 ||
          matchedProduct.status === 'OUT_OF_STOCK'
        ) {
          setScannerToast({
            type: 'error',
            message: `Scanned "${matchedProduct.name}" is OUT OF STOCK.`,
          });
        } else {
          cart.addItem(matchedProduct, 1);
          setScannerToast({
            type: 'success',
            message: `Scanned & Added: ${matchedProduct.name}`,
          });
        }
      } else {
        setScannerToast({
          type: 'warning',
          message: `Barcode "${barcode}" not found in catalog.`,
        });
      }

      setTimeout(() => setScannerToast(null), 3500);
    },
    [products, cart]
  );

  // Activate hardware barcode scanner listener
  useBarcodeScanner({
    onScan: handleBarcodeScanned,
    enabled: true,
  });

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // 1. Text Search Filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const nameMatch = prod.name?.toLowerCase().includes(query);
        const brandMatch = prod.brandName?.toLowerCase().includes(query);
        const catMatch = prod.categoryName?.toLowerCase().includes(query);
        const skuMatch = prod.sku?.toLowerCase().includes(query);
        const idMatch = String(prod.id).includes(query);

        if (!nameMatch && !brandMatch && !catMatch && !skuMatch && !idMatch) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategory !== 'ALL') {
        const catName = typeof selectedCategory === 'object' ? selectedCategory.name : selectedCategory;
        if (prod.categoryName !== catName) return false;
      }

      // 3. Brand Filter
      if (selectedBrand !== 'ALL') {
        const brandName = typeof selectedBrand === 'object' ? selectedBrand.name : selectedBrand;
        if (prod.brandName !== brandName) return false;
      }

      return true;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedBrand('ALL');
  };

  const handlePaymentSuccess = (invoice) => {
    setIsPaymentOpen(false);
    cart.clearCart();
    setActiveReceipt(invoice);
    // Refresh stock levels after successful sale
    fetchCatalog(true);
  };

  return (
    <div className="min-h-screen bg-base-200/50 flex flex-col font-sans select-none">
      {/* Top POS Navigation Bar */}
      <header className="no-print bg-base-100 border-b border-base-300 px-4 py-2.5 sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
          {/* Brand & Store Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-primary-content font-black shadow-md shadow-primary/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base tracking-tight text-base-content leading-none">
                  L'ÉLIXIR POS
                </h1>
                <span className="badge badge-neutral badge-xs font-mono font-bold">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-base-content/50 font-medium">
                Haute Parfumerie Terminal
              </p>
            </div>
          </div>

          {/* Search Bar in Header for wide screens */}
          <div className="flex-1 max-w-xl mx-2">
            <ProductSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              onBarcodeDirect={handleBarcodeScanned}
            />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5">
            {/* Sales History Button */}
            <button
              type="button"
              onClick={() => navigate('/pos/sales')}
              className="btn btn-sm btn-ghost gap-1.5 font-bold text-xs hover:bg-base-200"
              title="View Sales History"
            >
              <History className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">Sales History</span>
            </button>

            {/* Catalog Refresh */}
            <button
              type="button"
              onClick={() => fetchCatalog(true)}
              disabled={isRefreshing || loading}
              className="btn btn-sm btn-ghost btn-circle text-base-content/60 hover:text-base-content"
              title="Refresh inventory"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            </button>

            <div className="divider divider-horizontal my-2" />

            {/* Cashier Badge */}
            <div className="flex items-center gap-2 bg-base-200/80 py-1 px-2.5 rounded-2xl border border-base-300/70">
              <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold leading-tight line-clamp-1">
                  {user?.name || 'Staff Cashier'}
                </p>
                <p className="text-[10px] text-base-content/50 font-mono leading-none">
                  {user?.role || 'STAFF'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="btn btn-ghost btn-circle btn-xs text-error/80 hover:text-error ml-1"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Barcode Scanner Toast Notification */}
      {scannerToast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom duration-300">
          <div
            className={`alert ${
              scannerToast.type === 'error'
                ? 'alert-error'
                : scannerToast.type === 'warning'
                ? 'alert-warning'
                : 'alert-success'
            } text-xs font-bold shadow-2xl rounded-2xl flex items-center gap-2 py-2.5 px-4`}
          >
            <ScanBarcode className="w-4 h-4" />
            <span>{scannerToast.message}</span>
          </div>
        </div>
      )}

      {/* Main 2-Column POS Body Layout: 2fr left (Products), 1fr right (Cart) */}
      <main className="no-print flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2fr): Product Explorer */}
        <section className="lg:col-span-2 flex flex-col space-y-3.5 min-w-0">
          {/* Category & Brand Filter Tabs */}
          <div className="bg-base-100 p-3 rounded-2xl border border-base-300/80 shadow-xs space-y-2.5">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              <span className="font-bold text-base-content/40 uppercase tracking-wider text-[10px] px-1 flex items-center gap-1 flex-shrink-0">
                <Layers className="w-3 h-3" />
                Category:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`badge badge-sm py-3 px-3 rounded-xl font-bold cursor-pointer transition-all flex-shrink-0 ${
                  selectedCategory === 'ALL'
                    ? 'badge-primary text-primary-content shadow-xs'
                    : 'badge-ghost text-base-content/70 hover:badge-neutral'
                }`}
              >
                All Categories ({products.length})
              </button>
              {categories.map((cat, idx) => {
                const catName = typeof cat === 'object' ? cat.name : cat;
                const isSelected = selectedCategory === catName;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedCategory(catName)}
                    className={`badge badge-sm py-3 px-3 rounded-xl font-bold cursor-pointer transition-all flex-shrink-0 ${
                      isSelected
                        ? 'badge-primary text-primary-content shadow-xs'
                        : 'badge-ghost text-base-content/70 hover:badge-neutral'
                    }`}
                  >
                    {catName}
                  </button>
                );
              })}
            </div>

            {/* Brand Filter Pills */}
            {brands.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs border-t border-base-200/80 pt-2">
                <span className="font-bold text-base-content/40 uppercase tracking-wider text-[10px] px-1 flex items-center gap-1 flex-shrink-0">
                  <SlidersHorizontal className="w-3 h-3" />
                  Brand:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedBrand('ALL')}
                  className={`badge badge-xs py-2 px-2.5 rounded-lg font-semibold cursor-pointer transition-all flex-shrink-0 ${
                    selectedBrand === 'ALL'
                      ? 'badge-neutral text-neutral-content'
                      : 'badge-ghost text-base-content/60 hover:badge-neutral'
                  }`}
                >
                  All Brands
                </button>
                {brands.map((brand, idx) => {
                  const bName = typeof brand === 'object' ? brand.name : brand;
                  const isSelected = selectedBrand === bName;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedBrand(bName)}
                      className={`badge badge-xs py-2 px-2.5 rounded-lg font-semibold cursor-pointer transition-all flex-shrink-0 ${
                        isSelected
                          ? 'badge-neutral text-neutral-content'
                          : 'badge-ghost text-base-content/60 hover:badge-neutral'
                      }`}
                    >
                      {bName}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Grid Area */}
          <div className="flex-1 overflow-y-auto">
            <ProductGrid
              products={filteredProducts}
              cartItems={cart.items}
              onAddToCart={(product) => cart.addItem(product, 1)}
              loading={loading}
              onResetFilters={handleResetFilters}
            />
          </div>
        </section>

        {/* Right Column (1fr): Sticky Cart Panel */}
        <aside className="lg:col-span-1 h-[calc(100vh-5rem)] sticky top-20">
          <CartPanel
            items={cart.items}
            subtotal={cart.subtotal}
            discountTotal={cart.discountTotal}
            total={cart.total}
            itemCount={cart.itemCount}
            onIncrement={cart.incrementQty}
            onDecrement={cart.decrementQty}
            onRemove={cart.removeItem}
            onSetDiscount={cart.setDiscount}
            onClear={cart.clearCart}
            onOpenCheckout={() => setIsPaymentOpen(true)}
          />
        </aside>
      </main>

      {/* Payment Checkout Modal Dialog */}
      <PaymentDialog
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        cartItems={cart.items}
        totalCents={cart.totalCents}
        totalDollars={cart.totalDollars}
        onPaymentSuccess={handlePaymentSuccess}
        onStockConflict={() => {
          fetchCatalog(true);
        }}
      />

      {/* 80mm Thermal Receipt View Modal */}
      {activeReceipt && (
        <ReceiptView
          invoice={activeReceipt}
          onClose={() => setActiveReceipt(null)}
          autoPrint={true}
        />
      )}
    </div>
  );
}

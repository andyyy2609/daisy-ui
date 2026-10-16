import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ScanBarcode } from 'lucide-react';

/**
 * ProductSearchBar with 200ms debounce and barcode quick-entry option.
 *
 * @param {Object} props
 * @param {string} props.value - Search term
 * @param {Function} props.onChange - Debounced callback (searchTerm: string)
 * @param {Function} [props.onBarcodeDirect] - Optional manual barcode submit
 * @param {string} [props.placeholder]
 */
export default function ProductSearchBar({
  value = '',
  onChange,
  onBarcodeDirect,
  placeholder = 'Search perfume by name, brand, SKU or scan barcode...',
}) {
  const [internalValue, setInternalValue] = useState(value);
  const inputRef = useRef(null);

  // Sync internal value if external prop changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // 200ms debounce implementation
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onChange) {
        onChange(internalValue);
      }
    }, 200);

    return () => {
      clearTimeout(handler);
    };
  }, [internalValue, onChange]);

  const handleClear = () => {
    setInternalValue('');
    if (onChange) {
      onChange('');
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onBarcodeDirect && internalValue.trim()) {
      onBarcodeDirect(internalValue.trim());
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-base-content/50 pointer-events-none">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={internalValue}
          onChange={(e) => setInternalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input input-bordered w-full pl-11 pr-24 bg-base-100/90 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
        />

        <div className="absolute right-2.5 flex items-center gap-1.5">
          {internalValue && (
            <button
              type="button"
              onClick={handleClear}
              className="btn btn-ghost btn-circle btn-xs text-base-content/60 hover:text-base-content"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div
            className="tooltip tooltip-bottom text-xs"
            data-tip="Scanner active: scan barcode anytime"
          >
            <div className="badge badge-neutral gap-1 text-[11px] font-mono py-2 px-2.5 opacity-80">
              <ScanBarcode className="w-3.5 h-3.5 text-primary" />
              <span>SCAN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

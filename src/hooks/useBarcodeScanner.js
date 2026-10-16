import { useEffect, useRef } from 'react';

/**
 * POS Barcode Scanner Hook
 *
 * Hardware barcode scanners emit rapid keystroke events (typically < 40ms apart)
 * terminated by an 'Enter' key.
 *
 * @param {Object} options
 * @param {Function} options.onScan - Callback with the scanned barcode string
 * @param {boolean} [options.enabled=true] - Whether scanner listener is active
 * @param {number} [options.maxInterval=50] - Max milliseconds between keystrokes to be considered a scanner
 * @param {number} [options.minLength=3] - Minimum barcode string length
 */
export function useBarcodeScanner({ onScan, enabled = true, maxInterval = 50, minLength = 2 }) {
  const bufferRef = useRef('');
  const lastTimeRef = useRef(0);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Don't intercept function keys or modifier keys
      if (e.key.length > 1 && e.key !== 'Enter') {
        return;
      }

      const now = Date.now();
      const timeDiff = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // If key is Enter, evaluate if we collected a rapid burst
      if (e.key === 'Enter') {
        const scannedCode = bufferRef.current.trim();
        bufferRef.current = '';

        if (scannedCode.length >= minLength) {
          // If rapid entry (< 100ms average), it's definitely a barcode scan
          e.preventDefault();
          if (onScanRef.current) {
            onScanRef.current(scannedCode);
          }
        }
        return;
      }

      // Check if time between characters is within barcode scanner speed
      if (timeDiff > maxInterval && bufferRef.current.length > 0) {
        // Reset buffer if delay too long (normal human typing)
        bufferRef.current = '';
      }

      // Append printable characters
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, maxInterval, minLength]);
}

export default useBarcodeScanner;

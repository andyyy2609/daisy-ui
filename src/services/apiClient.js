import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:369/api';

/**
 * Core Axios instance configured with base URL and timeout.
 * Security Note: Sensitive credentials, payloads, and tokens are NEVER printed to stdout/console.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Standardized error wrapper conforming to:
 * { inSuccess: false, message, status }
 */
export function wrapError(error) {
  const status = error.response?.status;
  const serverMsg = error.response?.data?.message;
  const fallbackMsg = error.message || 'An unexpected error occurred. Please try again.';
  
  return {
    inSuccess: false,
    message: serverMsg || fallbackMsg,
    status: status || 500,
  };
}

/**
 * Helper to build auth headers given an optional or explicit token.
 * If token is not passed, attempts to pull from localStorage.
 */
export function getAuthHeaders(token) {
  const activeToken = token || localStorage.getItem('pos_access_token');
  if (!activeToken) return {};
  return {
    Authorization: `Bearer ${activeToken}`,
  };
}

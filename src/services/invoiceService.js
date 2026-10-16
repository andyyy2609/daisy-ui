import { apiClient, wrapError, getAuthHeaders } from './apiClient';

/**
 * Invoice Service for retail POS module
 * Handles checkout invoicing and sales history retrieval.
 */

/**
 * Creates a new checkout invoice.
 * Requires Bearer token and an idempotencyKey to prevent duplicate billing.
 *
 * @param {Object} invoiceData
 * @param {string} invoiceData.idempotencyKey - UUID string
 * @param {number|null} [invoiceData.customerId=null]
 * @param {Array<{ productId: number, qty: number, discount: number }>} invoiceData.items
 * @param {Array<{ method: 'CASH'|'ABA'|'KHQR'|'CARD', received: number }>} invoiceData.payments
 * @param {string} [token] - Optional Bearer token (defaults to stored token)
 * @returns {Promise<{ inSuccess: boolean, data?: any, message?: string, status?: number }>}
 */
export async function createInvoice(invoiceData, token) {
  try {
    const headers = getAuthHeaders(token);
    const response = await apiClient.post('/invoices', invoiceData, { headers });
    return {
      inSuccess: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return wrapError(error);
  }
}

/**
 * Fetches paginated invoices list.
 *
 * @param {Object} [params]
 * @param {number} [params.page=0]
 * @param {number} [params.size=10]
 * @param {string} [token]
 * @returns {Promise<{ inSuccess: boolean, data?: any, message?: string, status?: number }>}
 */
export async function getInvoices({ page = 0, size = 10 } = {}, token) {
  try {
    const headers = getAuthHeaders(token);
    const response = await apiClient.get('/invoices', {
      params: { page, size },
      headers,
    });
    return {
      inSuccess: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return wrapError(error);
  }
}

/**
 * Fetches a single invoice by its ID.
 *
 * @param {string|number} id
 * @param {string} [token]
 * @returns {Promise<{ inSuccess: boolean, data?: any, message?: string, status?: number }>}
 */
export async function getInvoiceById(id, token) {
  try {
    const headers = getAuthHeaders(token);
    const response = await apiClient.get(`/invoices/${id}`, { headers });
    return {
      inSuccess: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    return wrapError(error);
  }
}

export default {
  createInvoice,
  getInvoices,
  getInvoiceById,
};

import { apiClient, wrapError, getAuthHeaders } from './apiClient';

/**
 * Fallback luxury perfume catalog in case backend product table is empty or server is booting.
 */
export const FALLBACK_PERFUMES = [
  {
    id: 1,
    name: "Bleu de Chanel Eau de Parfum",
    brandName: "Chanel",
    categoryName: "Woody Aromatic",
    concentration: "Eau de Parfum",
    sizeMl: 100,
    price: 165.00,
    cost: 95.00,
    quantity: 14,
    status: "IN_STOCK",
    sku: "CHN-BDC-100",
    imageUrl: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Sauvage Elixir",
    brandName: "Dior",
    categoryName: "Fresh Spicy",
    concentration: "Extrait de Parfum",
    sizeMl: 60,
    price: 180.00,
    cost: 110.00,
    quantity: 8,
    status: "IN_STOCK",
    sku: "DIO-SAU-60",
    imageUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Aventus Eau de Parfum",
    brandName: "Creed",
    categoryName: "Fruity Chypre",
    concentration: "Eau de Parfum",
    sizeMl: 100,
    price: 495.00,
    cost: 290.00,
    quantity: 5,
    status: "IN_STOCK",
    sku: "CRD-AVN-100",
    imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Baccarat Rouge 540",
    brandName: "Maison Francis Kurkdjian",
    categoryName: "Amber Floral",
    concentration: "Eau de Parfum",
    sizeMl: 70,
    price: 345.00,
    cost: 210.00,
    quantity: 3,
    status: "IN_STOCK",
    sku: "MFK-BR540-70",
    imageUrl: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    name: "Tobacco Vanille",
    brandName: "Tom Ford",
    categoryName: "Oriental Spicy",
    concentration: "Eau de Parfum",
    sizeMl: 50,
    price: 295.00,
    cost: 175.00,
    quantity: 11,
    status: "IN_STOCK",
    sku: "TFD-TOB-50",
    imageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 6,
    name: "Santal 33",
    brandName: "Le Labo",
    categoryName: "Woody Aromatic",
    concentration: "Eau de Parfum",
    sizeMl: 100,
    price: 320.00,
    cost: 195.00,
    quantity: 2,
    status: "IN_STOCK",
    sku: "LLB-SNT-100",
    imageUrl: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 7,
    name: "Oud Wood",
    brandName: "Tom Ford",
    categoryName: "Woody Amber",
    concentration: "Eau de Parfum",
    sizeMl: 100,
    price: 395.00,
    cost: 235.00,
    quantity: 0,
    status: "OUT_OF_STOCK",
    sku: "TFD-OUD-100",
    imageUrl: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 8,
    name: "Aqua Celestia Forte",
    brandName: "Maison Francis Kurkdjian",
    categoryName: "Citrus Floral",
    concentration: "Eau de Parfum",
    sizeMl: 70,
    price: 275.00,
    cost: 160.00,
    quantity: 9,
    status: "IN_STOCK",
    sku: "MFK-ACF-70",
    imageUrl: "https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&w=600&q=80",
  },
];

/**
 * Fetches the entire product list from GET /product/list.
 * If backend is unreachable or returns empty, returns the sample perfume inventory with notification.
 */
export async function getProductList(token) {
  try {
    const headers = getAuthHeaders(token);
    const response = await apiClient.get('/product/list', { headers });
    
    // Normalize data if wrapped inside { success: true, data: [...] }
    const rawList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    
    if (rawList.length === 0) {
      return {
        inSuccess: true,
        data: FALLBACK_PERFUMES,
        isFallback: true,
      };
    }

    return {
      inSuccess: true,
      data: rawList,
    };
  } catch (error) {
    // If backend endpoint is offline or 404, gracefully fall back to rich catalog for POS demo
    return {
      inSuccess: true,
      data: FALLBACK_PERFUMES,
      isFallback: true,
      fallbackReason: error.message,
    };
  }
}

/**
 * Fetches categories list from GET /category/list
 */
export async function getCategories(token) {
  try {
    const headers = getAuthHeaders(token);
    const response = await apiClient.get('/category/list', { headers });
    const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    return { inSuccess: true, data: list };
  } catch (error) {
    return wrapError(error);
  }
}

/**
 * Fetches brands list from GET /brand/list
 */
export async function getBrands(token) {
  try {
    const headers = getAuthHeaders(token);
    const response = await apiClient.get('/brand/list', { headers });
    const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    return { inSuccess: true, data: list };
  } catch (error) {
    return wrapError(error);
  }
}

/**
 * Fetches concentrations list from GET /concentration/list
 */
export async function getConcentrations(token) {
  try {
    const headers = getAuthHeaders(token);
    const response = await apiClient.get('/concentration/list', { headers });
    const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    return { inSuccess: true, data: list };
  } catch (error) {
    return wrapError(error);
  }
}

/**
 * Fetches low stock list from GET /stock/low-stock
 */
export async function getLowStock(token) {
  try {
    const headers = getAuthHeaders(token);
    const response = await apiClient.get('/stock/low-stock', { headers });
    const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
    return { inSuccess: true, data: list };
  } catch (error) {
    return wrapError(error);
  }
}

/**
 * Adjusts inventory stock: PATCH /stock/adjust/{productId}
 * Body: { quantity: 10, type: "ADD", reason: "..." }
 */
export async function adjustStock(productId, { quantity, type = 'ADD', reason = '' }, token) {
  try {
    const headers = getAuthHeaders(token);
    const response = await apiClient.patch(
      `/stock/adjust/${productId}`,
      { quantity, type, reason },
      { headers }
    );
    return { inSuccess: true, data: response.data };
  } catch (error) {
    return wrapError(error);
  }
}

export default {
  getProductList,
  getCategories,
  getBrands,
  getConcentrations,
  getLowStock,
  adjustStock,
};

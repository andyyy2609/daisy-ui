import { apiClient, wrapError } from './apiClient';

const TOKEN_KEY = 'pos_access_token';
const REFRESH_KEY = 'pos_refresh_token';
const USER_KEY = 'pos_current_user';

/**
 * Authentication service for POS staff / admins
 */
export async function login(phoneNumber, password) {
  try {
    const response = await apiClient.post('/oauth/token', {
      phoneNumber,
      password,
    });

    const resData = response.data;
    // Expected structure: { success: true, data: { accessToken, refreshToken, role: "STAFF"|"ADMIN", name, ... } }
    const authPayload = resData.data || resData;

    if (authPayload && (authPayload.accessToken || authPayload.token)) {
      const accessToken = authPayload.accessToken || authPayload.token;
      const refreshToken = authPayload.refreshToken;
      const user = {
        phoneNumber: authPayload.phoneNumber || phoneNumber,
        name: authPayload.name || authPayload.username || (authPayload.role === 'ADMIN' ? 'Store Manager' : 'Sales Staff'),
        role: authPayload.role || 'STAFF',
      };

      localStorage.setItem(TOKEN_KEY, accessToken);
      if (refreshToken) {
        localStorage.setItem(REFRESH_KEY, refreshToken);
      }
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      return {
        inSuccess: true,
        data: {
          accessToken,
          user,
        },
      };
    }

    return {
      inSuccess: false,
      message: resData.message || 'Authentication failed: Missing token in response',
      status: 401,
    };
  } catch (error) {
    return wrapError(error);
  }
}

/**
 * Quick local session set for offline demonstration/testing.
 */
export function setLocalDemoSession(role = 'STAFF', name = 'Sophea Vorn') {
  const mockToken = 'mock_jwt_pos_token_' + Date.now();
  const user = {
    phoneNumber: '012345678',
    name,
    role,
  };
  localStorage.setItem(TOKEN_KEY, mockToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return { token: mockToken, user };
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Check if the user role is authorized for POS and Sales History
 */
export function hasPosAccess(user) {
  if (!user || !user.role) return false;
  const role = String(user.role).toUpperCase();
  return (
    role === 'STAFF' ||
    role === 'ROLE_STAFF' ||
    role === 'ADMIN' ||
    role === 'ROLE_ADMIN' ||
    role === 'MANAGER'
  );
}

export default {
  login,
  logout,
  getStoredToken,
  getStoredUser,
  hasPosAccess,
  setLocalDemoSession,
};

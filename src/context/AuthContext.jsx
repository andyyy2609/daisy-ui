import React, { createContext, useContext, useState, useEffect } from 'react';
import authService, { getStoredToken, getStoredUser, hasPosAccess } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If no user/token is set on first run in development, we can optionally keep it null or ready
    const existingToken = getStoredToken();
    const existingUser = getStoredUser();
    if (existingToken && existingUser) {
      setToken(existingToken);
      setUser(existingUser);
    }
  }, []);

  const handleLogin = async (phoneNumber, password) => {
    setLoading(true);
    const result = await authService.login(phoneNumber, password);
    setLoading(false);
    if (result.inSuccess) {
      setToken(result.data.accessToken);
      setUser(result.data.user);
    }
    return result;
  };

  const handleDemoLogin = (role = 'STAFF') => {
    const session = authService.setLocalDemoSession(role, role === 'ADMIN' ? 'Store Manager' : 'Perfume Specialist');
    setToken(session.token);
    setUser(session.user);
    return { inSuccess: true, data: session };
  };

  const handleLogout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const isAuthorized = hasPosAccess(user);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        isAuthenticated: !!token,
        isAuthorized,
        login: handleLogin,
        demoLogin: handleDemoLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

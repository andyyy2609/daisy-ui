import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, LogIn } from 'lucide-react';

/**
 * Route Guard protecting POS Terminal & Sales History routes.
 * Ensures user is authenticated and possesses ROLE_STAFF or ROLE_ADMIN.
 */
export default function ProtectedRoute({ children, allowedRoles = ['STAFF', 'ROLE_STAFF', 'ADMIN', 'ROLE_ADMIN', 'MANAGER'] }) {
  const { isAuthenticated, user, isAuthorized } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to /login preserving target location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Validate Role
  const userRole = (user?.role || '').toUpperCase();
  const hasRequiredRole = allowedRoles.some((role) => userRole === role.toUpperCase());

  if (!hasRequiredRole && !isAuthorized) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-base-100 p-8 rounded-3xl border border-base-300 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-base-content">
            Access Restricted
          </h2>
          <p className="text-sm text-base-content/60">
            Your current role (<span className="font-mono font-semibold text-error">{user?.role || 'UNKNOWN'}</span>) does not have authorization to access the Retail POS Terminal.
          </p>
          <div className="pt-2">
            <Navigate to="/login" replace />
          </div>
        </div>
      </div>
    );
  }

  return children;
}

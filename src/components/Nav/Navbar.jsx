import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, ShoppingBag, History, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({ disable, action }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="bg-base-100 border-b border-base-300 px-4 py-2 select-none shadow-xs">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-content font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-base-content">
              L'ÉLIXIR
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 ml-4">
            <Link
              to="/pos"
              className="btn btn-sm btn-ghost gap-1.5 font-bold text-xs text-primary"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>POS Terminal</span>
            </Link>

            <Link
              to="/pos/sales"
              className="btn btn-sm btn-ghost gap-1.5 font-bold text-xs"
            >
              <History className="w-4 h-4" />
              <span>Sales History</span>
            </Link>

            <Link
              to="/"
              className="btn btn-sm btn-ghost font-medium text-xs text-base-content/60"
            >
              Home
            </Link>
          </div>
        </div>

        {/* Right Auth controls */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-base-content/70 hidden sm:inline">
                {user?.name || 'Staff'} ({user?.role || 'STAFF'})
              </span>
              <button
                className="btn btn-xs btn-outline btn-error gap-1"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut className="w-3 h-3" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <button
              className="btn btn-sm btn-primary text-white font-bold text-xs"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Phone, Lock, AlertCircle, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, demoLogin, loading } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('0984123458');
  const [password, setPassword] = useState('kk121212@');
  const [errorMsg, setErrorMsg] = useState(null);

  const destination = location.state?.from?.pathname || '/pos';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!phoneNumber || !password) {
      setErrorMsg('Please enter both phone number and password.');
      return;
    }

    const res = await login(phoneNumber, password);
    if (res.inSuccess) {
      navigate(destination, { replace: true });
    } else {
      setErrorMsg(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handleQuickDemo = (role = 'STAFF') => {
    demoLogin(role);
    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-screen bg-base-200/50 flex flex-col justify-center items-center p-4 select-none">
      <div className="w-full max-w-md bg-base-100 rounded-3xl border border-base-300 shadow-2xl overflow-hidden p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-primary text-primary-content flex items-center justify-center mx-auto shadow-lg shadow-primary/30">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-base-content">
            L'ÉLIXIR POS
          </h2>
          <p className="text-xs text-base-content/60 font-medium">
            Authorized Staff & Cashier Terminal Access
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="alert alert-error text-xs p-3 rounded-2xl flex items-start gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone Number Field */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-base-content/60">
              Staff Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="012345678"
                className="input input-bordered w-full pl-10 text-sm font-medium"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/60">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input input-bordered w-full pl-10 text-sm font-medium"
                required
              />
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full text-white font-bold text-sm tracking-wide shadow-md hover:shadow-primary/30 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to POS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Bypass for Testing */}
        <div className="pt-3 border-t border-base-200 text-center space-y-2">
          <p className="text-[11px] font-semibold text-base-content/50 uppercase tracking-wider">
            Quick Dev & Evaluation Bypass
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('STAFF')}
              className="btn btn-xs btn-outline btn-neutral gap-1 text-[11px]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Demo Staff</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="btn btn-xs btn-outline btn-neutral gap-1 text-[11px]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
              <span>Demo Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

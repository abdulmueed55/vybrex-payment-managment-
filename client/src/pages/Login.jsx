import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    const result = await login(email, password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-5">
            <span className="text-black font-bold text-xl">V</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vybrex CRM</h1>
          <p className="text-zinc-600 text-sm mt-1">Business Management System</p>
        </div>

        {/* Card */}
        <div className="bg-[#111111] rounded-2xl p-7 border border-[#222222]">
          <p className="text-sm text-zinc-500 mb-5">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="you@vybrex.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 text-xs"
                >
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-1"
            >
              {loading ? <><div className="spinner w-4 h-4" /><span>Signing in...</span></> : 'Sign In →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-700 mt-5">
          Private system — authorized users only
        </p>
        <p className="text-center text-xs text-zinc-800 mt-1">
          © {new Date().getFullYear()} Vybrex Solutions
        </p>
      </div>
    </div>
  );
}

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
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Vybrex CRM</h1>
          <p className="text-zinc-500 text-sm mt-1">Business Management System</p>
        </div>

        <div className="bg-white rounded-2xl p-7 border border-zinc-200 shadow-sm">
          <p className="text-sm text-zinc-500 mb-5 font-medium">Sign in to continue</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="form-input" placeholder="you@vybrex.com" autoComplete="email" required />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pr-14" placeholder="••••••••" autoComplete="current-password" required />
                <button type="button" onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 text-xs font-semibold">
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-1">
              {loading ? <><div className="spinner w-4 h-4" /><span>Signing in...</span></> : 'Sign In →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-400 mt-5">
          Private system — authorized users only · © {new Date().getFullYear()} Vybrex Solutions
        </p>
      </div>
    </div>
  );
}

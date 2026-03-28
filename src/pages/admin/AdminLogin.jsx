import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../api/admin';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) { setError('All fields are required'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await adminLogin(username, password);
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-white rounded-xl p-8 w-full max-w-md" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#0A0A0A] tracking-tight">PayPro</h1>
          <p className="text-[#6B6B6B] mt-1 text-sm font-medium">Admin Panel</p>
        </div>

        <h2 className="text-lg font-semibold text-[#0A0A0A] mb-6">Admin Login</h2>

        {error && (
          <div className="bg-red-50 text-[#DC2626] text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">{error}</div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Username</label>
          <input type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 outline-none text-[#0A0A0A] bg-[#FAF9F6] text-sm focus:border-[#0A0A0A] transition" />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Password</label>
          <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 outline-none text-[#0A0A0A] bg-[#FAF9F6] text-sm focus:border-[#0A0A0A] transition" />
        </div>

        <button onClick={handleLogin} disabled={loading}
          className="w-full bg-[#0A0A0A] hover:bg-[#1a1a1a] disabled:bg-[#a0a0a0] text-white font-semibold py-3 rounded-xl transition text-sm">
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center text-xs text-[#6B6B6B] mt-6">&copy; 2026 PayPro.ge</p>
      </div>
    </div>
  );
};

export default AdminLogin;

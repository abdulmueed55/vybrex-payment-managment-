import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOtp, register } from '../api/auth';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (phone.length < 9) return;
    setError('');
    setLoading(true);
    try {
      const fullPhone = '+995' + phone;
      await sendOtp(fullPhone);
      localStorage.setItem('phone', fullPhone);
      navigate('/otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || phone.length < 9 || !password) {
      setError('All fields are required');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const fullPhone = '+995' + phone;
      await register(name, fullPhone, password);
      setSuccess('Registration successful! Sending OTP...');
      await sendOtp(fullPhone);
      localStorage.setItem('phone', fullPhone);
      navigate('/otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-white rounded-xl p-8 w-full max-w-md" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#0A0A0A] tracking-tight">PayPro</h1>
          <p className="text-[#6B6B6B] mt-1 text-sm font-medium">Yandex Driver Portal</p>
        </div>

        <h2 className="text-lg font-semibold text-[#0A0A0A] mb-6">
          {isRegister ? 'Create your account' : 'Login to your account'}
        </h2>

        {error && (
          <div className="bg-red-50 text-[#DC2626] text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-[#16A34A] text-sm px-4 py-3 rounded-xl mb-4 border border-green-100">
            {success}
          </div>
        )}

        {isRegister && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 outline-none text-[#0A0A0A] bg-[#FAF9F6] text-sm focus:border-[#0A0A0A] transition"
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Phone Number</label>
          <div className="flex border border-[#E8E8E4] rounded-xl overflow-hidden focus-within:border-[#0A0A0A] transition">
            <span className="bg-[#FAF9F6] px-4 py-3 text-[#6B6B6B] font-medium border-r border-[#E8E8E4] text-sm">
              +995
            </span>
            <input
              type="tel"
              placeholder="555 123 456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 px-4 py-3 outline-none text-[#0A0A0A] text-sm bg-white"
            />
          </div>
        </div>

        {isRegister && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 outline-none text-[#0A0A0A] bg-[#FAF9F6] text-sm focus:border-[#0A0A0A] transition"
            />
          </div>
        )}

        <button
          onClick={isRegister ? handleRegister : handleSendOtp}
          disabled={loading || phone.length < 9}
          className="w-full bg-[#0A0A0A] hover:bg-[#1a1a1a] disabled:bg-[#a0a0a0] text-white font-semibold py-3 rounded-xl transition duration-200 mt-2 text-sm"
        >
          {loading ? (isRegister ? 'Registering...' : 'Sending...') : (isRegister ? 'Register & Continue' : 'Send OTP')}
        </button>

        <p className="text-center text-sm text-[#6B6B6B] mt-5">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
            className="text-[#0A0A0A] font-semibold hover:underline"
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>

        <p className="text-center text-xs text-[#6B6B6B] mt-6">
          &copy; 2026 PayPro.ge
        </p>
      </div>
    </div>
  );
};

export default Login;

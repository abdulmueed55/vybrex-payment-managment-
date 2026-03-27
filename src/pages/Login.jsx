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
      // Auto send OTP after registration
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
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0f172a]">PayPro</h1>
          <p className="text-gray-500 mt-1 text-sm">Yandex Driver Portal</p>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {isRegister ? 'Create your account' : 'Login to your account'}
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Name Input (Register only) */}
        {isRegister && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none text-gray-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Phone Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="flex border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <span className="bg-gray-100 px-4 py-3 text-gray-600 font-medium border-r border-gray-300">
              +995
            </span>
            <input
              type="tel"
              placeholder="555 123 456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 px-4 py-3 outline-none text-gray-800"
            />
          </div>
        </div>

        {/* Password Input (Register only) */}
        {isRegister && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none text-gray-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* Button */}
        <button
          onClick={isRegister ? handleRegister : handleSendOtp}
          disabled={loading || phone.length < 9}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition duration-200 mt-2"
        >
          {loading ? (isRegister ? 'Registering...' : 'Sending...') : (isRegister ? 'Register & Continue' : 'Send OTP')}
        </button>

        {/* Toggle */}
        <p className="text-center text-sm text-gray-500 mt-4">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); }}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; 2026 PayPro.ge — Powered by Yandex
        </p>
      </div>
    </div>
  );
};

export default Login;

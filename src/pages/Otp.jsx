import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOtp, sendOtp } from '../api/auth';

const Otp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const phone = localStorage.getItem('phone');

  useEffect(() => {
    if (!phone) {
      navigate('/');
    }
  }, [phone, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtp(phone, otpCode);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('driver', JSON.stringify(res.data.driver));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await sendOtp(phone);
      setTimer(60);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="bg-white rounded-xl p-8 w-full max-w-md" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#0A0A0A] tracking-tight">PayPro</h1>
          <p className="text-[#6B6B6B] mt-1 text-sm font-medium">Yandex Driver Portal</p>
        </div>

        <h2 className="text-lg font-semibold text-[#0A0A0A] mb-2">Enter OTP Code</h2>
        <p className="text-[#6B6B6B] text-sm mb-6">We sent a 6-digit code to {phone}</p>

        {error && (
          <div className="bg-red-50 text-[#DC2626] text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">
            {error}
          </div>
        )}

        <div className="flex justify-between gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              className="w-12 h-14 text-center text-xl font-bold border-2 border-[#E8E8E4] rounded-xl focus:border-[#0A0A0A] focus:outline-none bg-[#FAF9F6] text-[#0A0A0A] transition"
            />
          ))}
        </div>

        <div className="text-center mb-6">
          {timer > 0 ? (
            <p className="text-[#6B6B6B] text-sm">Resend OTP in <span className="text-[#0A0A0A] font-semibold">{timer}s</span></p>
          ) : (
            <button className="text-[#0A0A0A] font-semibold text-sm hover:underline" onClick={handleResend}>
              Resend OTP
            </button>
          )}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || otp.join('').length !== 6}
          className="w-full bg-[#0A0A0A] hover:bg-[#1a1a1a] disabled:bg-[#a0a0a0] text-white font-semibold py-3 rounded-xl transition duration-200 text-sm"
        >
          {loading ? 'Verifying...' : 'Verify & Login'}
        </button>

        <p className="text-center text-xs text-[#6B6B6B] mt-6">
          &copy; 2026 PayPro.ge
        </p>
      </div>
    </div>
  );
};

export default Otp;

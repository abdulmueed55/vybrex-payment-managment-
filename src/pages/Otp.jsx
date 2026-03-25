import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Otp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate();

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

  const handleVerify = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0f172a]">PayPro</h1>
          <p className="text-gray-500 mt-1 text-sm">Yandex Driver Portal</p>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-2">Enter OTP Code</h2>
        <p className="text-gray-500 text-sm mb-6">We sent a 6-digit code to your phone</p>

        {/* OTP Boxes */}
        <div className="flex justify-between gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          {timer > 0 ? (
            <p className="text-gray-500 text-sm">Resend OTP in <span className="text-blue-600 font-semibold">{timer}s</span></p>
          ) : (
            <button className="text-blue-600 font-semibold text-sm" onClick={() => setTimer(60)}>
              Resend OTP
            </button>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
        >
          Verify & Login
        </button>

        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 PayPro.ge — Powered by Yandex
        </p>
      </div>
    </div>
  );
};

export default Otp;
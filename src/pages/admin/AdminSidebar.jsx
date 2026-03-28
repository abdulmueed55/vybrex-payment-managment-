import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
    { path: '/admin/drivers', label: 'Drivers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { path: '/admin/withdrawals', label: 'Withdrawals', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { path: '/admin/parks', label: 'Parks', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { path: '/admin/bank-accounts', label: 'Bank Accounts', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  return (
    <div className="w-64 bg-white flex flex-col py-8 px-4 border-r border-[#E8E8E4] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>
      <h1 className="text-2xl font-extrabold text-[#0A0A0A] mb-0.5 tracking-tight">PayPro</h1>
      <p className="text-[#6B6B6B] text-xs font-medium mb-8">Admin Panel</p>

      <div className="bg-[#FAF9F6] rounded-xl p-3 mb-6 border border-[#E8E8E4]">
        <p className="text-[#0A0A0A] text-sm font-semibold">Administrator</p>
        <p className="text-[#6B6B6B] text-xs">Full access</p>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <button key={item.path} onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              location.pathname === item.path ? 'bg-[#0A0A0A] text-white' : 'text-[#6B6B6B] hover:bg-[#FAF9F6] hover:text-[#0A0A0A]'
            }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto">
        <button onClick={handleLogout} className="flex items-center gap-3 text-[#6B6B6B] hover:text-[#DC2626] px-4 py-2.5 rounded-xl text-sm font-medium transition w-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getBalance, getEarnings, syncEarnings } from '../api/earnings';

const Sidebar = ({ navigate, active }) => {
  const location = useLocation();
  const current = active || location.pathname;
  const driver = JSON.parse(localStorage.getItem('driver') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4' },
    { path: '/withdrawal', label: 'Withdrawal', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { path: '/parks', label: 'Parks', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { path: '/bonus', label: 'Bonus', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' },
  ];

  return (
    <div className="w-64 bg-white flex flex-col py-8 px-4 border-r border-[#E8E8E4]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <h1 className="text-2xl font-extrabold text-[#0A0A0A] mb-0.5 tracking-tight">PayPro</h1>
      <p className="text-[#6B6B6B] text-xs font-medium mb-8">Yandex Driver Portal</p>

      {driver.name && (
        <div className="bg-[#FAF9F6] rounded-xl p-3 mb-6 border border-[#E8E8E4]">
          <p className="text-[#0A0A0A] text-sm font-semibold">{driver.name}</p>
          <p className="text-[#6B6B6B] text-xs">{driver.phone}</p>
        </div>
      )}

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              current === item.path
                ? 'bg-[#0A0A0A] text-white'
                : 'text-[#6B6B6B] hover:bg-[#FAF9F6] hover:text-[#0A0A0A]'
            }`}
          >
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

const Dashboard = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState({ total_earnings: '0.00', total_withdrawn: '0.00', balance: '0.00' });
  const [chartData, setChartData] = useState([]);
  const [recentEarnings, setRecentEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const driver = JSON.parse(localStorage.getItem('driver') || '{}');

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      await syncEarnings();
      const [balRes, earnRes] = await Promise.all([getBalance(), getEarnings()]);
      setBalance(balRes.data);

      const earnings = earnRes.data.earnings;
      setRecentEarnings(earnings.slice(0, 5));

      const dayMap = {};
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      earnings.forEach((e) => {
        const day = days[new Date(e.ride_date).getDay()];
        dayMap[day] = (dayMap[day] || 0) + parseFloat(e.amount);
      });

      const chartArr = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        .map((day) => ({ day, amount: Math.round(dayMap[day] || 0) }));
      setChartData(chartArr);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
        <p className="text-[#6B6B6B] text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar navigate={navigate} active="/dashboard" />

      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#0A0A0A]">Welcome back, {driver.name || 'Driver'}</h2>
            <p className="text-[#6B6B6B] text-sm mt-1">Here's your earnings overview</p>
          </div>
          <div className="bg-white text-[#16A34A] border border-[#E8E8E4] px-4 py-2 rounded-xl text-sm font-medium" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            ● Online
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <p className="text-[#6B6B6B] text-sm mb-1 font-medium">Total Earnings</p>
            <h3 className="text-3xl font-bold text-[#0A0A0A]">{parseFloat(balance.total_earnings).toLocaleString()} <span className="text-lg font-medium">GEL</span></h3>
            <p className="text-[#16A34A] text-xs mt-2 font-medium">From Yandex rides</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <p className="text-[#6B6B6B] text-sm mb-1 font-medium">Available Balance</p>
            <h3 className="text-3xl font-bold text-[#0A0A0A]">{parseFloat(balance.balance).toLocaleString()} <span className="text-lg font-medium">GEL</span></h3>
            <p className="text-[#6B6B6B] text-xs mt-2 font-medium">Ready to withdraw</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <p className="text-[#6B6B6B] text-sm mb-1 font-medium">Total Withdrawn</p>
            <h3 className="text-3xl font-bold text-[#0A0A0A]">{parseFloat(balance.total_withdrawn).toLocaleString()} <span className="text-lg font-medium">GEL</span></h3>
            <p className="text-[#6B6B6B] text-xs mt-2 font-medium">This month</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 mb-8 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 className="text-[#0A0A0A] font-semibold mb-6">Weekly Earnings</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A0A0A" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#0A0A0A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E4" />
              <XAxis dataKey="day" stroke="#6B6B6B" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6B6B6B" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E8E8E4', borderRadius: '12px', color: '#0A0A0A', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} />
              <Area type="monotone" dataKey="amount" stroke="#0A0A0A" fill="url(#colorAmount)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 className="text-[#0A0A0A] font-semibold mb-4">Recent Rides</h3>
          <div className="flex flex-col">
            {recentEarnings.map((e) => (
              <div key={e.id} className="flex justify-between items-center py-3 border-b border-[#E8E8E4] last:border-b-0">
                <div>
                  <p className="text-[#0A0A0A] text-sm font-medium">Ride {e.ride_id.split('-').pop()}</p>
                  <p className="text-[#6B6B6B] text-xs">{new Date(e.ride_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#16A34A] text-sm font-semibold">+ {parseFloat(e.amount).toFixed(2)} GEL</p>
                </div>
              </div>
            ))}
            {recentEarnings.length === 0 && (
              <p className="text-[#6B6B6B] text-sm text-center py-4">No earnings yet. Sync your Yandex rides.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { Sidebar };
export default Dashboard;

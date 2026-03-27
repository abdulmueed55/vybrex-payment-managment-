import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getBalance, getEarnings, syncEarnings } from '../api/earnings';

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
      // Sync earnings first (will skip if already synced)
      await syncEarnings();

      const [balRes, earnRes] = await Promise.all([getBalance(), getEarnings()]);
      setBalance(balRes.data);

      // Group earnings by day for chart
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex">

      {/* Sidebar */}
      <div className="w-64 bg-[#1e293b] flex flex-col py-8 px-4">
        <h1 className="text-2xl font-bold text-white mb-1">PayPro</h1>
        <p className="text-gray-400 text-xs mb-10">Yandex Driver Portal</p>

        <nav className="flex flex-col gap-2">
          <button className="flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium">
            📊 Dashboard
          </button>
          <button onClick={() => navigate('/withdrawal')} className="flex items-center gap-3 text-gray-400 hover:bg-[#334155] hover:text-white px-4 py-3 rounded-lg text-sm transition">
            🏦 Withdrawal
          </button>
          <button onClick={() => navigate('/parks')} className="flex items-center gap-3 text-gray-400 hover:bg-[#334155] hover:text-white px-4 py-3 rounded-lg text-sm transition">
            🚗 Parks
          </button>
          <button onClick={() => navigate('/bonus')} className="flex items-center gap-3 text-gray-400 hover:bg-[#334155] hover:text-white px-4 py-3 rounded-lg text-sm transition">
            🎁 Bonus
          </button>
        </nav>

        <div className="mt-auto">
          <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-red-400 px-4 py-3 rounded-lg text-sm transition">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome back, {driver.name || 'Driver'}! 👋</h2>
            <p className="text-gray-400 text-sm">Here's your earnings overview</p>
          </div>
          <div className="bg-[#1e293b] text-white px-4 py-2 rounded-lg text-sm">
            🟢 Online
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1e293b] rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Earnings</p>
            <h3 className="text-3xl font-bold text-white">₾ {parseFloat(balance.total_earnings).toLocaleString()}</h3>
            <p className="text-green-400 text-xs mt-2">↑ From Yandex rides</p>
          </div>
          <div className="bg-[#1e293b] rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Available Balance</p>
            <h3 className="text-3xl font-bold text-white">₾ {parseFloat(balance.balance).toLocaleString()}</h3>
            <p className="text-blue-400 text-xs mt-2">Ready to withdraw</p>
          </div>
          <div className="bg-[#1e293b] rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Withdrawn</p>
            <h3 className="text-3xl font-bold text-white">₾ {parseFloat(balance.total_withdrawn).toLocaleString()}</h3>
            <p className="text-gray-400 text-xs mt-2">This month</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-[#1e293b] rounded-2xl p-6 mb-8">
          <h3 className="text-white font-semibold mb-6">Weekly Earnings</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="url(#colorAmount)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Earnings */}
        <div className="bg-[#1e293b] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Recent Rides</h3>
          <div className="flex flex-col gap-3">
            {recentEarnings.map((e) => (
              <div key={e.id} className="flex justify-between items-center py-3 border-b border-[#334155]">
                <div>
                  <p className="text-white text-sm font-medium">Ride {e.ride_id.split('-').pop()}</p>
                  <p className="text-gray-400 text-xs">{new Date(e.ride_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 text-sm font-semibold">+ ₾ {parseFloat(e.amount).toFixed(2)}</p>
                </div>
              </div>
            ))}
            {recentEarnings.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">No earnings yet. Sync your Yandex rides.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;

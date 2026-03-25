import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const earningsData = [
  { day: 'Mon', amount: 120 },
  { day: 'Tue', amount: 185 },
  { day: 'Wed', amount: 90 },
  { day: 'Thu', amount: 220 },
  { day: 'Fri', amount: 310 },
  { day: 'Sat', amount: 280 },
  { day: 'Sun', amount: 195 },
];

const Dashboard = () => {
  const navigate = useNavigate();

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
          <button onClick={() => navigate('/')} className="flex items-center gap-3 text-gray-400 hover:text-red-400 px-4 py-3 rounded-lg text-sm transition">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome back, Driver! 👋</h2>
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
            <h3 className="text-3xl font-bold text-white">₾ 1,400</h3>
            <p className="text-green-400 text-xs mt-2">↑ +12% this week</p>
          </div>
          <div className="bg-[#1e293b] rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Available Balance</p>
            <h3 className="text-3xl font-bold text-white">₾ 850</h3>
            <p className="text-blue-400 text-xs mt-2">Ready to withdraw</p>
          </div>
          <div className="bg-[#1e293b] rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">Total Withdrawn</p>
            <h3 className="text-3xl font-bold text-white">₾ 550</h3>
            <p className="text-gray-400 text-xs mt-2">This month</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-[#1e293b] rounded-2xl p-6 mb-8">
          <h3 className="text-white font-semibold mb-6">Weekly Earnings</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={earningsData}>
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

        {/* Recent Transactions */}
        <div className="bg-[#1e293b] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Recent Transactions</h3>
          <div className="flex flex-col gap-3">
            {[
              { date: 'Mar 25, 2026', amount: '₾ 200', status: 'Approved', type: 'Withdrawal' },
              { date: 'Mar 23, 2026', amount: '₾ 150', status: 'Pending', type: 'Withdrawal' },
              { date: 'Mar 20, 2026', amount: '₾ 200', status: 'Approved', type: 'Withdrawal' },
            ].map((tx, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-[#334155]">
                <div>
                  <p className="text-white text-sm font-medium">{tx.type}</p>
                  <p className="text-gray-400 text-xs">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-semibold">{tx.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${tx.status === 'Approved' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
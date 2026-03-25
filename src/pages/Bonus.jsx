import React from 'react';
import { useNavigate } from 'react-router-dom';

const bonuses = [
  {
    id: 1,
    icon: '⛽',
    title: 'Fuel Voucher',
    subtitle: 'Up to 300 ₾',
    description: 'Complete 50 rides this month and get a fuel voucher worth up to 300 ₾ credited to your account.',
    color: 'from-orange-600 to-orange-400',
    status: 'Active',
    progress: 32,
    total: 50,
  },
  {
    id: 2,
    icon: '🏎️',
    title: 'Formula 1 Pro',
    subtitle: 'Top Speed Bonus',
    description: 'Maintain a 4.9+ rating with 100+ rides to unlock the Formula 1 Pro bonus this season.',
    color: 'from-red-600 to-red-400',
    status: 'Active',
    progress: 78,
    total: 100,
  },
  {
    id: 3,
    icon: '🏆',
    title: 'Top Driver',
    subtitle: 'Weekly Champion',
    description: 'Be the top rated driver in your park this week and earn a special Top Driver bonus reward.',
    color: 'from-yellow-600 to-yellow-400',
    status: 'Active',
    progress: 4.8,
    total: 5.0,
  },
  {
    id: 4,
    icon: '👥',
    title: 'Referral Program',
    subtitle: 'Earn per referral',
    description: 'Invite other drivers to join PayPro. Earn 20 ₾ for every driver who completes their first withdrawal.',
    color: 'from-blue-600 to-blue-400',
    status: 'Active',
    progress: 3,
    total: 10,
  },
  {
    id: 5,
    icon: '💰',
    title: 'Weekly Cashback',
    subtitle: '5% every week',
    description: 'Get 5% cashback on all your withdrawals every week. Automatically credited every Monday.',
    color: 'from-green-600 to-green-400',
    status: 'Active',
    progress: 42,
    total: 100,
  },
  {
    id: 6,
    icon: '🌙',
    title: '24/7 Withdrawal',
    subtitle: 'Always available',
    description: 'Withdraw your earnings any time of day or night. No waiting, no delays — instant transfers.',
    color: 'from-purple-600 to-purple-400',
    status: 'Unlocked',
    progress: 100,
    total: 100,
  },
];

const Bonus = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f172a] flex">
      <div className="w-64 bg-[#1e293b] flex flex-col py-8 px-4">
        <h1 className="text-2xl font-bold text-white mb-1">PayPro</h1>
        <p className="text-gray-400 text-xs mb-10">Yandex Driver Portal</p>
        <nav className="flex flex-col gap-2">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 text-gray-400 hover:bg-[#334155] hover:text-white px-4 py-3 rounded-lg text-sm transition">
            📊 Dashboard
          </button>
          <button onClick={() => navigate('/withdrawal')} className="flex items-center gap-3 text-gray-400 hover:bg-[#334155] hover:text-white px-4 py-3 rounded-lg text-sm transition">
            🏦 Withdrawal
          </button>
          <button onClick={() => navigate('/parks')} className="flex items-center gap-3 text-gray-400 hover:bg-[#334155] hover:text-white px-4 py-3 rounded-lg text-sm transition">
            🚗 Parks
          </button>
          <button className="flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium">
            🎁 Bonus
          </button>
        </nav>
        <div className="mt-auto">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 text-gray-400 hover:text-red-400 px-4 py-3 rounded-lg text-sm transition">
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Bonus & Rewards</h2>
        <p className="text-gray-400 text-sm mb-8">Complete challenges and earn extra rewards</p>

        <div className="grid grid-cols-3 gap-6">
          {bonuses.map((bonus) => (
            <div key={bonus.id} className="bg-[#1e293b] rounded-2xl p-6 flex flex-col gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${bonus.color} flex items-center justify-center text-2xl`}>
                {bonus.icon}
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-white font-bold">{bonus.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${bonus.status === 'Unlocked' ? 'bg-green-900 text-green-400' : 'bg-blue-900 text-blue-400'}`}>
                    {bonus.status}
                  </span>
                </div>
                <p className="text-blue-400 text-xs font-medium mb-2">{bonus.subtitle}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{bonus.description}</p>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{bonus.progress} / {bonus.total}</span>
                </div>
                <div className="w-full bg-[#334155] rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${bonus.color}`}
                    style={{ width: `${(bonus.progress / bonus.total) * 100}%` }}
                  />
                </div>
              </div>
              <button className={`w-full py-2 rounded-lg text-white text-sm font-semibold bg-gradient-to-r ${bonus.color} hover:opacity-90 transition`}>
                {bonus.status === 'Unlocked' ? 'Claimed ✓' : 'View Details'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bonus;
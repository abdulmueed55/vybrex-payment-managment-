import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Dashboard';
import { getBalance, getEarnings } from '../api/earnings';
import { getWithdrawals } from '../api/withdrawal';

const Bonus = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState(0);
  const [cashbackBase, setCashbackBase] = useState(0);
  const [referrals, setReferrals] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [eRes, wRes] = await Promise.all([getEarnings(), getWithdrawals()]);
      setRides(eRes.data.earnings.length);
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
      const weeklyWithdrawals = wRes.data.withdrawals.filter(w => new Date(w.created_at) >= weekAgo && w.status === 'approved');
      setCashbackBase(weeklyWithdrawals.reduce((s, w) => s + parseFloat(w.amount), 0));
      try {
        const { default: API } = await import('../api/axios');
        const rRes = await API.get('/api/driver/referrals');
        setReferrals(rRes.data.count);
      } catch { setReferrals(0); }
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate('/login'); }
    } finally { setLoading(false); }
  };

  const bonuses = [
    { id: 1, icon: '⛽', title: 'Fuel Voucher', subtitle: 'Up to 300 GEL', description: 'Complete 50 rides this month and get a fuel voucher worth up to 300 GEL credited to your account.', iconBg: '#FFF7ED', barColor: '#D97706', status: 'Active', progress: Math.min(rides, 50), total: 50 },
    { id: 2, icon: '🏎️', title: 'Formula 1 Pro', subtitle: 'Top Speed Bonus', description: 'Maintain a 4.9+ rating with 100+ rides to unlock the Formula 1 Pro bonus this season.', iconBg: '#FEF2F2', barColor: '#DC2626', status: 'Active', progress: Math.min(rides, 100), total: 100 },
    { id: 3, icon: '🏆', title: 'Top Driver', subtitle: 'Weekly Champion', description: 'Be the top rated driver in your park this week and earn a special Top Driver bonus reward.', iconBg: '#FEFCE8', barColor: '#D97706', status: 'Active', progress: 4.8, total: 5.0 },
    { id: 4, icon: '👥', title: 'Referral Program', subtitle: 'Earn per referral', description: 'Invite other drivers to join PayPro. Earn 20 GEL for every driver who completes their first withdrawal.', iconBg: '#EFF6FF', barColor: '#0A0A0A', status: 'Active', progress: referrals, total: 10 },
    { id: 5, icon: '💰', title: 'Weekly Cashback', subtitle: '5% every week', description: `Get 5% cashback on all your withdrawals every week. This week: ${(cashbackBase * 0.05).toFixed(2)} GEL earned.`, iconBg: '#F0FDF4', barColor: '#16A34A', status: 'Active', progress: Math.min(Math.round(cashbackBase / 20), 100), total: 100 },
    { id: 6, icon: '🌙', title: '24/7 Withdrawal', subtitle: 'Always available', description: 'Withdraw your earnings any time of day or night. No waiting, no delays — instant transfers.', iconBg: '#F5F3FF', barColor: '#16A34A', status: 'Unlocked', progress: 100, total: 100 },
  ];

  if (loading) return <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}><p className="text-[#6B6B6B]">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar navigate={navigate} active="/bonus" />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-[#0A0A0A] mb-1">Bonus & Rewards</h2>
        <p className="text-[#6B6B6B] text-sm mb-8">Complete challenges and earn extra rewards</p>

        <div className="grid grid-cols-3 gap-6">
          {bonuses.map((bonus) => (
            <div key={bonus.id} className="bg-white rounded-xl p-6 flex flex-col gap-4 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: bonus.iconBg }}>{bonus.icon}</div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-[#0A0A0A] font-bold">{bonus.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bonus.status === 'Unlocked' ? 'bg-green-50 text-[#16A34A]' : 'bg-[#FAF9F6] text-[#6B6B6B]'}`}>{bonus.status}</span>
                </div>
                <p className="text-[#6B6B6B] text-xs font-medium mb-2">{bonus.subtitle}</p>
                <p className="text-[#6B6B6B] text-xs leading-relaxed">{bonus.description}</p>
              </div>
              <div>
                <div className="flex justify-between text-xs text-[#6B6B6B] mb-1.5">
                  <span className="font-medium">Progress</span>
                  <span className="font-medium">{bonus.progress} / {bonus.total}</span>
                </div>
                <div className="w-full bg-[#FAF9F6] rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${(bonus.progress / bonus.total) * 100}%`, backgroundColor: bonus.barColor }} />
                </div>
              </div>
              <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition ${bonus.status === 'Unlocked' ? 'bg-[#FAF9F6] text-[#16A34A] border border-[#E8E8E4]' : 'bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white'}`}>
                {bonus.status === 'Unlocked' ? 'Claimed' : 'View Details'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Bonus;

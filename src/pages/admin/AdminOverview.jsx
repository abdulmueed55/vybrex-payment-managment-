import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { getAdminDrivers, getAdminWithdrawals } from '../../api/admin';

const AdminOverview = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { navigate('/admin/login'); return; }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [dRes, wRes] = await Promise.all([getAdminDrivers(), getAdminWithdrawals()]);
      setDrivers(dRes.data.drivers);
      setWithdrawals(wRes.data.withdrawals);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) { localStorage.removeItem('adminToken'); navigate('/admin/login'); }
    } finally {
      setLoading(false);
    }
  };

  const pending = withdrawals.filter(w => w.status === 'pending');
  const totalEarnings = drivers.reduce((sum, d) => sum + parseFloat(d.balance), 0);

  if (loading) return <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}><p className="text-[#6B6B6B]">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar />
      <div className="flex-1 p-8 overflow-auto">
        <h2 className="text-2xl font-bold text-[#0A0A0A] mb-1">Overview</h2>
        <p className="text-[#6B6B6B] text-sm mb-8">Admin dashboard summary</p>

        <div className="grid grid-cols-4 gap-5 mb-8">
          {[
            { label: 'Total Drivers', value: drivers.length, sub: 'Registered' },
            { label: 'Total Withdrawals', value: withdrawals.length, sub: 'All time' },
            { label: 'Pending', value: pending.length, sub: 'Needs review', color: '#D97706' },
            { label: 'Total Balances', value: `${totalEarnings.toLocaleString()} GEL`, sub: 'Driver balances' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <p className="text-[#6B6B6B] text-sm mb-1 font-medium">{s.label}</p>
              <h3 className="text-2xl font-bold text-[#0A0A0A]">{s.value}</h3>
              <p className="text-xs mt-1 font-medium" style={{ color: s.color || '#6B6B6B' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 className="text-[#0A0A0A] font-semibold mb-4">Recent Withdrawals</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E8E4]">
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Driver</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Bank</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Amount</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Date</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.slice(0, 10).map((w) => (
                <tr key={w.id} className="border-b border-[#E8E8E4] last:border-b-0">
                  <td className="py-3 text-sm text-[#0A0A0A] font-medium">{w.driver_name}</td>
                  <td className="py-3 text-sm text-[#6B6B6B]">{w.bank_name}</td>
                  <td className="py-3 text-sm text-[#0A0A0A] font-semibold">{parseFloat(w.amount).toFixed(2)} GEL</td>
                  <td className="py-3 text-xs text-[#6B6B6B]">{new Date(w.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      w.status === 'approved' ? 'bg-green-50 text-[#16A34A]' : w.status === 'pending' ? 'bg-yellow-50 text-[#D97706]' : 'bg-red-50 text-[#DC2626]'
                    }`}>{w.status.charAt(0).toUpperCase() + w.status.slice(1)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {withdrawals.length === 0 && <p className="text-[#6B6B6B] text-sm text-center py-6">No withdrawals yet</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

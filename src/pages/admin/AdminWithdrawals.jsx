import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { getAdminWithdrawals, approveWithdrawal, rejectWithdrawal, getCommissionRate, updateCommissionRate } from '../../api/admin';

const AdminWithdrawals = () => {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState(5);
  const [editingRate, setEditingRate] = useState(false);
  const [newRate, setNewRate] = useState('5');

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { navigate('/admin/login'); return; }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [wRes, cRes] = await Promise.all([getAdminWithdrawals(), getCommissionRate()]);
      setWithdrawals(wRes.data.withdrawals);
      setCommissionRate(cRes.data.commission_rate);
      setNewRate(String(cRes.data.commission_rate));
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) { localStorage.removeItem('adminToken'); navigate('/admin/login'); }
    } finally { setLoading(false); }
  };

  const handleUpdateRate = async () => {
    try {
      await updateCommissionRate(parseFloat(newRate));
      setCommissionRate(parseFloat(newRate));
      setEditingRate(false);
      setMessage({ text: 'Commission rate updated', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed', type: 'error' });
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveWithdrawal(id);
      setMessage({ text: 'Withdrawal approved', type: 'success' });
      await loadData();
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed', type: 'error' });
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectWithdrawal(id);
      setMessage({ text: 'Withdrawal rejected, amount refunded', type: 'success' });
      await loadData();
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed', type: 'error' });
    }
  };

  const filtered = filter === 'all' ? withdrawals : withdrawals.filter(w => w.status === filter);
  const totalCommission = withdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + parseFloat(w.commission_amount || 0), 0);

  if (loading) return <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}><p className="text-[#6B6B6B]">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar />
      <div className="flex-1 p-8 overflow-auto">
        <h2 className="text-2xl font-bold text-[#0A0A0A] mb-1">Withdrawals</h2>
        <p className="text-[#6B6B6B] text-sm mb-6">Review and manage withdrawal requests</p>

        {message.text && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border ${message.type === 'success' ? 'bg-green-50 text-[#16A34A] border-green-100' : 'bg-red-50 text-[#DC2626] border-red-100'}`}>{message.text}</div>
        )}

        {/* Commission Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <p className="text-[#6B6B6B] text-sm mb-1">Commission Rate</p>
            {editingRate ? (
              <div className="flex gap-2 items-center">
                <input type="number" value={newRate} onChange={(e) => setNewRate(e.target.value)} min="0" max="100" step="0.5"
                  className="w-20 border border-[#E8E8E4] rounded-lg px-2 py-1.5 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] outline-none" />
                <span className="text-sm text-[#6B6B6B]">%</span>
                <button onClick={handleUpdateRate} className="bg-[#0A0A0A] text-white text-xs px-3 py-1.5 rounded-lg">Save</button>
                <button onClick={() => setEditingRate(false)} className="text-[#6B6B6B] text-xs">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-[#0A0A0A]">{commissionRate}%</h3>
                <button onClick={() => { setEditingRate(true); setNewRate(String(commissionRate)); }} className="text-[#6B6B6B] text-xs hover:text-[#0A0A0A]">Edit</button>
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <p className="text-[#6B6B6B] text-sm mb-1">Total Commission Earned</p>
            <h3 className="text-2xl font-bold text-[#16A34A]">{totalCommission.toFixed(2)} GEL</h3>
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <p className="text-[#6B6B6B] text-sm mb-1">Pending Requests</p>
            <h3 className="text-2xl font-bold text-[#D97706]">{withdrawals.filter(w => w.status === 'pending').length}</h3>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === f ? 'bg-[#0A0A0A] text-white' : 'bg-white text-[#6B6B6B] border border-[#E8E8E4] hover:bg-[#FAF9F6]'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${withdrawals.filter(w => w.status === f).length})`}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E8E4]">
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3 px-6">Driver</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Bank</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Account</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Amount</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Commission</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Date</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Status</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w) => (
                <tr key={w.id} className="border-b border-[#E8E8E4] last:border-b-0">
                  <td className="py-3 px-6">
                    <p className="text-sm text-[#0A0A0A] font-medium">{w.driver_name}</p>
                    <p className="text-xs text-[#6B6B6B]">{w.driver_phone}</p>
                  </td>
                  <td className="py-3 text-sm text-[#6B6B6B]">{w.bank_name}</td>
                  <td className="py-3 text-sm text-[#6B6B6B]">{w.account_number}</td>
                  <td className="py-3 text-sm text-[#0A0A0A] font-semibold">{parseFloat(w.amount).toFixed(2)} GEL</td>
                  <td className="py-3 text-sm text-[#16A34A] font-medium">{parseFloat(w.commission_amount || 0).toFixed(2)} GEL</td>
                  <td className="py-3 text-xs text-[#6B6B6B]">{new Date(w.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      w.status === 'approved' ? 'bg-green-50 text-[#16A34A]' : w.status === 'pending' ? 'bg-yellow-50 text-[#D97706]' : 'bg-red-50 text-[#DC2626]'
                    }`}>{w.status.charAt(0).toUpperCase() + w.status.slice(1)}</span>
                  </td>
                  <td className="py-3">
                    {w.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(w.id)} className="bg-[#16A34A] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-green-700 transition">Approve</button>
                        <button onClick={() => handleReject(w.id)} className="bg-[#DC2626] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-700 transition">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-[#6B6B6B] text-sm text-center py-8">No withdrawals found</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminWithdrawals;

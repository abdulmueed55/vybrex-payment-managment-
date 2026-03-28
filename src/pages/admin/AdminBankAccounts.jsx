import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { getAdminBankAccounts, verifyBankAccount, rejectBankAccount } from '../../api/admin';

const AdminBankAccounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { navigate('/admin/login'); return; }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const res = await getAdminBankAccounts();
      setAccounts(res.data.bank_accounts);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) { localStorage.removeItem('adminToken'); navigate('/admin/login'); }
    } finally { setLoading(false); }
  };

  const handleVerify = async (id) => {
    try {
      await verifyBankAccount(id);
      setMessage({ text: 'Bank account verified', type: 'success' });
      await loadData();
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed', type: 'error' });
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectBankAccount(id);
      setMessage({ text: 'Bank account rejected and removed', type: 'success' });
      await loadData();
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed', type: 'error' });
    }
  };

  const filtered = filter === 'all' ? accounts :
    filter === 'pending' ? accounts.filter(a => !a.is_verified) :
    accounts.filter(a => a.is_verified);

  if (loading) return <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}><p className="text-[#6B6B6B]">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar />
      <div className="flex-1 p-8 overflow-auto">
        <h2 className="text-2xl font-bold text-[#0A0A0A] mb-1">Bank Accounts</h2>
        <p className="text-[#6B6B6B] text-sm mb-6">Verify driver bank accounts for withdrawals</p>

        {message.text && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border ${message.type === 'success' ? 'bg-green-50 text-[#16A34A] border-green-100' : 'bg-red-50 text-[#DC2626] border-red-100'}`}>{message.text}</div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <p className="text-[#6B6B6B] text-sm mb-1">Total Accounts</p>
            <h3 className="text-2xl font-bold text-[#0A0A0A]">{accounts.length}</h3>
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <p className="text-[#6B6B6B] text-sm mb-1">Pending Verification</p>
            <h3 className="text-2xl font-bold text-[#D97706]">{accounts.filter(a => !a.is_verified).length}</h3>
          </div>
          <div className="bg-white rounded-xl p-5 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <p className="text-[#6B6B6B] text-sm mb-1">Verified</p>
            <h3 className="text-2xl font-bold text-[#16A34A]">{accounts.filter(a => a.is_verified).length}</h3>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'verified'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filter === f ? 'bg-[#0A0A0A] text-white' : 'bg-white text-[#6B6B6B] border border-[#E8E8E4] hover:bg-[#FAF9F6]'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E8E4]">
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3 px-6">Driver</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Bank</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">IBAN</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">SWIFT</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Date Added</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Status</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-[#E8E8E4] last:border-b-0">
                  <td className="py-3 px-6">
                    <p className="text-sm text-[#0A0A0A] font-medium">{a.driver_name}</p>
                    <p className="text-xs text-[#6B6B6B]">{a.driver_phone}</p>
                  </td>
                  <td className="py-3 text-sm text-[#0A0A0A]">{a.bank_name}</td>
                  <td className="py-3 text-sm text-[#6B6B6B] font-mono">{a.iban || a.account_number}</td>
                  <td className="py-3 text-sm text-[#6B6B6B]">{a.swift_code || '-'}</td>
                  <td className="py-3 text-xs text-[#6B6B6B]">{new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.is_verified ? 'bg-green-50 text-[#16A34A]' : 'bg-yellow-50 text-[#D97706]'}`}>
                      {a.is_verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3">
                    {!a.is_verified && (
                      <div className="flex gap-2">
                        <button onClick={() => handleVerify(a.id)} className="bg-[#16A34A] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-green-700 transition">Verify</button>
                        <button onClick={() => handleReject(a.id)} className="bg-[#DC2626] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-red-700 transition">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-[#6B6B6B] text-sm text-center py-8">No bank accounts found</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminBankAccounts;

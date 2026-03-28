import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { getAdminDrivers, adjustDriverBalance } from '../../api/admin';

const AdminDrivers = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustDesc, setAdjustDesc] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { navigate('/admin/login'); return; }
    loadDrivers();
  }, [navigate]);

  const loadDrivers = async () => {
    try {
      const res = await getAdminDrivers();
      setDrivers(res.data.drivers);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) { localStorage.removeItem('adminToken'); navigate('/admin/login'); }
    } finally { setLoading(false); }
  };

  const handleAdjust = async () => {
    if (!adjustAmount) return;
    try {
      await adjustDriverBalance(modal.id, parseFloat(adjustAmount), adjustDesc || 'Admin adjustment');
      setModal(null); setAdjustAmount(''); setAdjustDesc('');
      setMessage('Balance adjusted successfully');
      await loadDrivers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to adjust');
    }
  };

  const filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) || d.phone.includes(search)
  );

  if (loading) return <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}><p className="text-[#6B6B6B]">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar />
      <div className="flex-1 p-8 overflow-auto">
        <h2 className="text-2xl font-bold text-[#0A0A0A] mb-1">Drivers</h2>
        <p className="text-[#6B6B6B] text-sm mb-6">Manage all registered drivers</p>

        {message && <div className="bg-green-50 text-[#16A34A] text-sm px-4 py-3 rounded-xl mb-4 border border-green-100">{message}</div>}

        <input type="text" placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-white text-[#0A0A0A] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0A0A0A] transition mb-6"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} />

        <div className="bg-white rounded-xl border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E8E4]">
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3 px-6">ID</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Name</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Phone</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Balance</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Joined</th>
                <th className="text-left text-xs font-medium text-[#6B6B6B] py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-[#E8E8E4] last:border-b-0">
                  <td className="py-3 px-6 text-sm text-[#6B6B6B]">#{d.id}</td>
                  <td className="py-3 text-sm text-[#0A0A0A] font-medium">{d.name}</td>
                  <td className="py-3 text-sm text-[#6B6B6B]">{d.phone}</td>
                  <td className="py-3 text-sm text-[#0A0A0A] font-semibold">{parseFloat(d.balance).toFixed(2)} GEL</td>
                  <td className="py-3 text-xs text-[#6B6B6B]">{new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="py-3">
                    <button onClick={() => setModal(d)} className="bg-[#0A0A0A] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[#1a1a1a] transition">
                      Adjust Balance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-[#6B6B6B] text-sm text-center py-8">No drivers found</p>}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <h3 className="text-lg font-bold text-[#0A0A0A] mb-1">Adjust Balance</h3>
            <p className="text-[#6B6B6B] text-sm mb-4">{modal.name} — Current: {parseFloat(modal.balance).toFixed(2)} GEL</p>
            <div className="mb-3">
              <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Amount (+ to add, - to deduct)</label>
              <input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="e.g. 500 or -200"
                className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 outline-none text-[#0A0A0A] bg-[#FAF9F6] text-sm focus:border-[#0A0A0A] transition" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Description</label>
              <input type="text" value={adjustDesc} onChange={(e) => setAdjustDesc(e.target.value)} placeholder="Reason for adjustment"
                className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 outline-none text-[#0A0A0A] bg-[#FAF9F6] text-sm focus:border-[#0A0A0A] transition" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleAdjust} className="flex-1 bg-[#0A0A0A] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#1a1a1a] transition">Confirm</button>
              <button onClick={() => { setModal(null); setAdjustAmount(''); setAdjustDesc(''); }} className="flex-1 bg-[#FAF9F6] text-[#0A0A0A] font-semibold py-2.5 rounded-xl text-sm border border-[#E8E8E4] hover:bg-white transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDrivers;

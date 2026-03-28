import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { getAdminParks, createPark, updatePark, deletePark } from '../../api/admin';

const AdminParks = () => {
  const navigate = useNavigate();
  const [parks, setParks] = useState([]);
  const [modal, setModal] = useState(null); // null | 'add' | park object for edit
  const [form, setForm] = useState({ name: '', address: '', rating: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) { navigate('/admin/login'); return; }
    loadParks();
  }, [navigate]);

  const loadParks = async () => {
    try {
      const res = await getAdminParks();
      setParks(res.data.parks);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) { localStorage.removeItem('adminToken'); navigate('/admin/login'); }
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.name || !form.address) { setMessage({ text: 'Name and address are required', type: 'error' }); return; }
    try {
      if (modal === 'add') {
        await createPark({ ...form, rating: parseFloat(form.rating) || 5.0 });
        setMessage({ text: 'Park created', type: 'success' });
      } else {
        await updatePark(modal.id, { ...form, rating: parseFloat(form.rating) || modal.rating });
        setMessage({ text: 'Park updated', type: 'success' });
      }
      setModal(null); setForm({ name: '', address: '', rating: '' });
      await loadParks();
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePark(id);
      setMessage({ text: 'Park deleted', type: 'success' });
      await loadParks();
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed', type: 'error' });
    }
  };

  const openEdit = (park) => {
    setForm({ name: park.name, address: park.address, rating: park.rating.toString() });
    setModal(park);
  };

  if (loading) return <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}><p className="text-[#6B6B6B]">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <AdminSidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0A0A0A] mb-1">Parks Management</h2>
            <p className="text-[#6B6B6B] text-sm">Add, edit and manage taxi parks</p>
          </div>
          <button onClick={() => { setModal('add'); setForm({ name: '', address: '', rating: '' }); }}
            className="bg-[#0A0A0A] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1a1a1a] transition">
            + Add Park
          </button>
        </div>

        {message.text && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-4 border ${message.type === 'success' ? 'bg-green-50 text-[#16A34A] border-green-100' : 'bg-red-50 text-[#DC2626] border-red-100'}`}>{message.text}</div>
        )}

        <div className="grid grid-cols-3 gap-5">
          {parks.map((park) => (
            <div key={park.id} className="bg-white rounded-xl p-5 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div className="flex justify-between items-start mb-3">
                <div className="bg-[#FAF9F6] w-10 h-10 rounded-xl flex items-center justify-center text-[#0A0A0A] font-bold text-sm border border-[#E8E8E4]">
                  {park.name.charAt(0)}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#0A0A0A] text-sm">★</span>
                  <span className="text-[#0A0A0A] text-xs font-semibold">{parseFloat(park.rating).toFixed(1)}</span>
                </div>
              </div>
              <h3 className="text-[#0A0A0A] font-semibold mb-1">{park.name}</h3>
              <p className="text-[#6B6B6B] text-xs mb-4">{park.address}</p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(park)} className="flex-1 bg-[#FAF9F6] text-[#0A0A0A] text-xs font-medium py-2 rounded-lg border border-[#E8E8E4] hover:bg-white transition">Edit</button>
                <button onClick={() => handleDelete(park.id)} className="flex-1 bg-red-50 text-[#DC2626] text-xs font-medium py-2 rounded-lg border border-red-100 hover:bg-red-100 transition">Delete</button>
              </div>
            </div>
          ))}
          {parks.length === 0 && <p className="text-[#6B6B6B] text-sm col-span-3 text-center py-8">No parks yet. Add your first park.</p>}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <h3 className="text-lg font-bold text-[#0A0A0A] mb-4">{modal === 'add' ? 'Add New Park' : 'Edit Park'}</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Park Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Go Pro Taxi"
                className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 outline-none text-[#0A0A0A] bg-[#FAF9F6] text-sm focus:border-[#0A0A0A] transition" />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Address</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Park address"
                className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 outline-none text-[#0A0A0A] bg-[#FAF9F6] text-sm focus:border-[#0A0A0A] transition" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Rating (1-5)</label>
              <input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} placeholder="5.0"
                className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 outline-none text-[#0A0A0A] bg-[#FAF9F6] text-sm focus:border-[#0A0A0A] transition" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="flex-1 bg-[#0A0A0A] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#1a1a1a] transition">{modal === 'add' ? 'Create' : 'Update'}</button>
              <button onClick={() => { setModal(null); setForm({ name: '', address: '', rating: '' }); }} className="flex-1 bg-[#FAF9F6] text-[#0A0A0A] font-semibold py-2.5 rounded-xl text-sm border border-[#E8E8E4] hover:bg-white transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminParks;

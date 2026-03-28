import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Dashboard';
import { getDriverProfile, joinPark } from '../api/driver';

const parksData = [
  { id: 1, name: 'Go Pro', rating: 5.0, address: 'Saakadze St 6, 7th Floor', drivers: 245 },
  { id: 2, name: 'GS Tbilisi', rating: 5.0, address: 'Moscow Ave 21', drivers: 189 },
  { id: 3, name: 'Urban Taxi', rating: 5.0, address: 'Lech-Kaczynski St 12', drivers: 312 },
  { id: 4, name: 'Draivi', rating: 5.0, address: 'Mirian Mepe 110', drivers: 178 },
  { id: 5, name: 'New Tech', rating: 5.0, address: 'Varketili, Javakheti 180', drivers: 95 },
  { id: 6, name: 'Neo Taxi', rating: 5.0, address: 'Peking St 35', drivers: 134 },
  { id: 7, name: 'Sani Go', rating: 4.8, address: 'Javakhishvili St 3', drivers: 67 },
  { id: 8, name: 'Golden Driver', rating: 4.8, address: 'Tbilisi', drivers: 43 },
  { id: 9, name: 'City Taxi', rating: 4.6, address: 'Temqa, Isaakian St 16', drivers: 88 },
  { id: 10, name: 'Space Taxi', rating: 4.5, address: 'Oniani St 61', drivers: 55 },
  { id: 11, name: 'Geo Auto Taxi', rating: 4.1, address: 'Nakhlovka, Zestaponi St 31', drivers: 32 },
  { id: 12, name: 'Omega Taxi', rating: 4.0, address: 'Tbilisi', drivers: 28 },
];

const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <span key={star} className={`text-sm ${star <= Math.floor(rating) ? 'text-[#0A0A0A]' : 'text-[#E8E8E4]'}`}>★</span>
    ))}
    <span className="text-[#0A0A0A] text-xs font-semibold ml-1">{rating.toFixed(1)}</span>
  </div>
);

const Parks = () => {
  const [search, setSearch] = useState('');
  const [joinedPark, setJoinedPark] = useState(null);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    getDriverProfile().then(res => setJoinedPark(res.data.driver.park_id)).catch(() => {});
  }, [navigate]);

  const handleJoin = async () => {
    setLoading(true);
    try {
      await joinPark(modal.id);
      setJoinedPark(modal.id);
      setModal(null);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const filtered = parksData.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar navigate={navigate} active="/parks" />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-[#0A0A0A] mb-1">Taxi Parks</h2>
        <p className="text-[#6B6B6B] text-sm mb-6">Choose your Yandex taxi park</p>

        <div className="mb-6">
          <input type="text" placeholder="Search parks..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md bg-white text-[#0A0A0A] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0A0A0A] transition"
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }} />
        </div>

        <div className="grid grid-cols-3 gap-5">
          {filtered.map((park) => (
            <div key={park.id} className="bg-white rounded-xl p-5 border border-[#E8E8E4] hover:border-[#0A0A0A] transition" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div className="flex justify-between items-start mb-3">
                <div className="bg-[#FAF9F6] w-10 h-10 rounded-xl flex items-center justify-center text-[#0A0A0A] font-bold text-sm border border-[#E8E8E4]">
                  {park.name.charAt(0)}
                </div>
                <Stars rating={park.rating} />
              </div>
              <h3 className="text-[#0A0A0A] font-semibold mb-1">{park.name}</h3>
              <p className="text-[#6B6B6B] text-xs mb-4">{park.address}</p>
              <div className="flex justify-between items-center">
                <span className="text-[#6B6B6B] text-xs font-medium">{park.drivers} drivers</span>
                {joinedPark === park.id ? (
                  <span className="bg-green-50 text-[#16A34A] text-xs font-medium px-3 py-1.5 rounded-lg border border-green-100">Joined</span>
                ) : (
                  <button onClick={() => setModal(park)} className="bg-[#0A0A0A] hover:bg-[#1a1a1a] text-white text-xs font-medium px-4 py-1.5 rounded-lg transition">Join</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Join Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <h3 className="text-lg font-bold text-[#0A0A0A] mb-2">Join Park</h3>
            <p className="text-[#6B6B6B] text-sm mb-6">You are about to join <strong className="text-[#0A0A0A]">{modal.name}</strong></p>
            <div className="flex gap-3">
              <button onClick={handleJoin} disabled={loading}
                className="flex-1 bg-[#0A0A0A] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#1a1a1a] transition disabled:bg-[#a0a0a0]">
                {loading ? 'Joining...' : 'Confirm'}
              </button>
              <button onClick={() => setModal(null)} className="flex-1 bg-[#FAF9F6] text-[#0A0A0A] font-semibold py-2.5 rounded-xl text-sm border border-[#E8E8E4] hover:bg-white transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parks;

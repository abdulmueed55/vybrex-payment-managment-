import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

const Stars = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`text-sm ${star <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-600'}`}>
          ★
        </span>
      ))}
      <span className="text-yellow-400 text-sm font-semibold ml-1">{rating.toFixed(1)}</span>
    </div>
  );
};

const Parks = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = parksData.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

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
          <button className="flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium">
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

      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Taxi Parks</h2>
        <p className="text-gray-400 text-sm mb-6">Choose your Yandex taxi park</p>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search parks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md bg-[#1e293b] text-white border border-[#334155] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {filtered.map((park) => (
            <div key={park.id} className="bg-[#1e293b] rounded-2xl p-5 cursor-pointer hover:border hover:border-blue-500 transition">
              <div className="flex justify-between items-start mb-3">
                <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  {park.name.charAt(0)}
                </div>
                <Stars rating={park.rating} />
              </div>
              <h3 className="text-white font-semibold mb-1">{park.name}</h3>
              <p className="text-gray-400 text-xs mb-3">{park.address}</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs">🚗 {park.drivers} drivers</span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg transition">
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Parks;
import React from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '⚡', title: '24/7 Withdrawal', desc: 'Withdraw your earnings anytime, day or night. No delays, instant transfers to your bank.' },
  { icon: '⛽', title: 'Fuel Voucher', desc: 'Complete 50 rides monthly and earn fuel vouchers worth up to 300 GEL.' },
  { icon: '🏎️', title: 'Formula 1 Pro', desc: 'Maintain a 4.9+ rating with 100+ rides to unlock exclusive speed bonuses.' },
  { icon: '🏆', title: 'Top Driver', desc: 'Be the highest rated driver in your park and earn weekly champion rewards.' },
  { icon: '👥', title: 'Referral Program', desc: 'Invite drivers to PayPro. Earn 20 GEL for every successful referral.' },
  { icon: '💰', title: 'Weekly Cashback', desc: 'Get 5% cashback on all withdrawals every week. Credited automatically.' },
];

const parks = [
  { name: 'Go Pro', rating: 5.0, drivers: 245 },
  { name: 'GS Tbilisi', rating: 5.0, drivers: 189 },
  { name: 'Urban Taxi', rating: 5.0, drivers: 312 },
  { name: 'Draivi', rating: 5.0, drivers: 178 },
  { name: 'New Tech', rating: 5.0, drivers: 95 },
  { name: 'Neo Taxi', rating: 5.0, drivers: 134 },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF9F6]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E4]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-[#0A0A0A] tracking-tight">PayPro</h1>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#0A0A0A] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1a1a1a] transition"
          >
            Login
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-5xl font-extrabold text-[#0A0A0A] leading-tight mb-4 tracking-tight">
          Withdraw Your Yandex<br />Earnings 24/7
        </h2>
        <p className="text-[#6B6B6B] text-lg max-w-xl mx-auto mb-10">
          Fast, secure withdrawals directly to your bank account. Join thousands of drivers already using PayPro.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="bg-[#0A0A0A] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#1a1a1a] transition text-sm"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/login')}
            className="bg-white text-[#0A0A0A] font-semibold px-8 py-3.5 rounded-xl border border-[#E8E8E4] hover:bg-[#FAF9F6] transition text-sm"
          >
            Login
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h3 className="text-2xl font-bold text-[#0A0A0A] text-center mb-3">Why Drivers Choose PayPro</h3>
        <p className="text-[#6B6B6B] text-center mb-12">Everything you need to manage your Yandex earnings</p>
        <div className="grid grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] flex items-center justify-center text-2xl mb-4">{f.icon}</div>
              <h4 className="text-[#0A0A0A] font-bold mb-2">{f.title}</h4>
              <p className="text-[#6B6B6B] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Parks */}
      <section className="bg-white border-y border-[#E8E8E4] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-[#0A0A0A] text-center mb-3">Top Taxi Parks</h3>
          <p className="text-[#6B6B6B] text-center mb-12">Join a park and start earning today</p>
          <div className="grid grid-cols-3 gap-5">
            {parks.map((p, i) => (
              <div key={i} className="bg-[#FAF9F6] rounded-xl p-5 border border-[#E8E8E4]">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center text-[#0A0A0A] font-bold text-sm border border-[#E8E8E4]">
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#0A0A0A] text-sm">★</span>
                    <span className="text-[#0A0A0A] text-xs font-semibold">{p.rating.toFixed(1)}</span>
                  </div>
                </div>
                <h4 className="text-[#0A0A0A] font-semibold mb-1">{p.name}</h4>
                <p className="text-[#6B6B6B] text-xs">{p.drivers} active drivers</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => navigate('/login')}
              className="bg-[#0A0A0A] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#1a1a1a] transition text-sm"
            >
              View All Parks
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-10 flex justify-between items-center">
        <div>
          <h4 className="text-lg font-extrabold text-[#0A0A0A] tracking-tight">PayPro</h4>
          <p className="text-[#6B6B6B] text-xs mt-1">&copy; 2026 PayPro.ge</p>
        </div>
        <button onClick={() => navigate('/terms')} className="text-[#6B6B6B] text-sm hover:text-[#0A0A0A] transition">
          Terms & Conditions
        </button>
      </footer>
    </div>
  );
};

export default Landing;

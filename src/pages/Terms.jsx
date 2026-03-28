import React from 'react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    { title: '1. Introduction', body: 'PayPro is a financial service platform designed for Yandex taxi drivers in Georgia. By using PayPro, you agree to these terms and conditions. PayPro facilitates the withdrawal of earnings from your Yandex driver account directly to your bank account.' },
    { title: '2. Eligibility', body: 'To use PayPro, you must be a registered Yandex taxi driver in Georgia with an active driver account. You must be at least 18 years of age and have a valid Georgian bank account in your name.' },
    { title: '3. Withdrawal Rules', body: 'The minimum withdrawal amount is 50 GEL per transaction. Maximum daily withdrawal limit is 10,000 GEL. Withdrawals are processed within 1-24 hours depending on your bank. Weekend and holiday processing times may vary.' },
    { title: '4. Commission Policy', body: 'PayPro charges a small service fee on each withdrawal. The fee structure is transparent and displayed before you confirm any withdrawal. No hidden charges or monthly fees apply to your PayPro account.' },
    { title: '5. Bonus Terms', body: 'Bonus programs including Fuel Voucher, Formula 1 Pro, Top Driver, Referral Program, and Weekly Cashback are subject to specific terms. Progress resets at the beginning of each month unless otherwise stated. PayPro reserves the right to modify bonus programs with 7 days prior notice.' },
    { title: '6. Privacy Policy', body: 'PayPro collects and stores your personal information including name, phone number, and bank details solely for the purpose of providing our services. We do not share your data with third parties except as required by Georgian law. All data is encrypted and stored securely.' },
    { title: '7. Contact Information', body: 'For support and inquiries, contact us at support@paypro.ge. Our support team is available Monday through Friday, 9:00 AM to 6:00 PM Georgian time. For urgent withdrawal issues, use the in-app support chat.' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <header className="bg-white border-b border-[#E8E8E4]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <button onClick={() => navigate('/')} className="text-2xl font-extrabold text-[#0A0A0A] tracking-tight">PayPro</button>
          <button onClick={() => navigate(-1)} className="text-[#6B6B6B] text-sm hover:text-[#0A0A0A] transition font-medium">Back</button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-[#0A0A0A] mb-2">Terms & Conditions</h2>
        <p className="text-[#6B6B6B] text-sm mb-10">Last updated: March 2026</p>

        <div className="flex flex-col gap-8">
          {sections.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 className="text-[#0A0A0A] font-bold mb-3">{s.title}</h3>
              <p className="text-[#6B6B6B] text-sm leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[#6B6B6B] mt-12">&copy; 2026 PayPro.ge — All rights reserved</p>
      </div>
    </div>
  );
};

export default Terms;

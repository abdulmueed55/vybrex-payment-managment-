import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestWithdrawal, getWithdrawals } from '../api/withdrawal';
import { getBalance } from '../api/earnings';
import { Sidebar } from './Dashboard';

const Withdrawal = () => {
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState('');
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0.00');
  const [withdrawals, setWithdrawals] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [balRes, wRes] = await Promise.all([getBalance(), getWithdrawals()]);
      setBalance(balRes.data.balance);
      setWithdrawals(wRes.data.withdrawals);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  const handleWithdraw = async () => {
    if (!bank || !account || !amount) {
      setMessage({ text: 'All fields are required', type: 'error' });
      return;
    }
    setMessage({ text: '', type: '' });
    setLoading(true);
    try {
      await requestWithdrawal({
        amount: parseFloat(amount),
        bank_name: bank,
        account_number: account,
      });
      setMessage({ text: 'Withdrawal request submitted successfully!', type: 'success' });
      setAmount('');
      setBank('');
      setAccount('');
      await loadData();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Withdrawal failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar navigate={navigate} active="/withdrawal" />

      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-[#0A0A0A] mb-1">Withdrawal</h2>
        <p className="text-[#6B6B6B] text-sm mb-8">Withdraw your earnings to your bank account</p>

        <div className="grid grid-cols-2 gap-8">

          <div className="bg-white rounded-xl p-6 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>

            <div className="bg-[#0A0A0A] rounded-xl p-5 mb-6">
              <p className="text-[#a0a0a0] text-sm font-medium">Available Balance</p>
              <h3 className="text-3xl font-bold text-white mt-1">{parseFloat(balance).toLocaleString()} <span className="text-lg font-medium">GEL</span></h3>
            </div>

            {message.text && (
              <div className={`text-sm px-4 py-3 rounded-xl mb-4 border ${message.type === 'success' ? 'bg-green-50 text-[#16A34A] border-green-100' : 'bg-red-50 text-[#DC2626] border-red-100'}`}>
                {message.text}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-[#0A0A0A] text-sm font-medium mb-2">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. TBC Bank, Bank of Georgia"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full bg-[#FAF9F6] text-[#0A0A0A] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0A0A0A] transition"
              />
            </div>

            <div className="mb-4">
              <label className="block text-[#0A0A0A] text-sm font-medium mb-2">Account Number</label>
              <input
                type="text"
                placeholder="Enter your bank account number"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full bg-[#FAF9F6] text-[#0A0A0A] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0A0A0A] transition"
              />
            </div>

            <div className="mb-6">
              <label className="block text-[#0A0A0A] text-sm font-medium mb-2">Amount (GEL)</label>
              <input
                type="number"
                placeholder="Min: 50 GEL"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#FAF9F6] text-[#0A0A0A] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0A0A0A] transition"
              />
            </div>

            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="w-full bg-[#0A0A0A] hover:bg-[#1a1a1a] disabled:bg-[#a0a0a0] text-white font-semibold py-3 rounded-xl transition text-sm"
            >
              {loading ? 'Submitting...' : 'Request Withdrawal'}
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h3 className="text-[#0A0A0A] font-semibold mb-4">Withdrawal History</h3>
            <div className="flex flex-col">
              {withdrawals.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center py-3 border-b border-[#E8E8E4] last:border-b-0">
                  <div>
                    <p className="text-[#0A0A0A] text-sm font-medium">{tx.bank_name}</p>
                    <p className="text-[#6B6B6B] text-xs">{new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#0A0A0A] text-sm font-semibold">{parseFloat(tx.amount).toFixed(2)} GEL</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      tx.status === 'approved' ? 'bg-green-50 text-[#16A34A]' :
                      tx.status === 'pending' ? 'bg-yellow-50 text-[#D97706]' :
                      'bg-red-50 text-[#DC2626]'
                    }`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
              {withdrawals.length === 0 && (
                <p className="text-[#6B6B6B] text-sm text-center py-8">No withdrawal history yet</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Withdrawal;

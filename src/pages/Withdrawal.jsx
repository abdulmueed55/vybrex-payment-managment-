import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestWithdrawal, getWithdrawals } from '../api/withdrawal';
import { getBalance } from '../api/earnings';

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
      navigate('/');
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
        navigate('/');
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex">

      {/* Sidebar */}
      <div className="w-64 bg-[#1e293b] flex flex-col py-8 px-4">
        <h1 className="text-2xl font-bold text-white mb-1">PayPro</h1>
        <p className="text-gray-400 text-xs mb-10">Yandex Driver Portal</p>
        <nav className="flex flex-col gap-2">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 text-gray-400 hover:bg-[#334155] hover:text-white px-4 py-3 rounded-lg text-sm transition">
            📊 Dashboard
          </button>
          <button className="flex items-center gap-3 bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium">
            🏦 Withdrawal
          </button>
          <button onClick={() => navigate('/parks')} className="flex items-center gap-3 text-gray-400 hover:bg-[#334155] hover:text-white px-4 py-3 rounded-lg text-sm transition">
            🚗 Parks
          </button>
          <button onClick={() => navigate('/bonus')} className="flex items-center gap-3 text-gray-400 hover:bg-[#334155] hover:text-white px-4 py-3 rounded-lg text-sm transition">
            🎁 Bonus
          </button>
        </nav>
        <div className="mt-auto">
          <button onClick={handleLogout} className="flex items-center gap-3 text-gray-400 hover:text-red-400 px-4 py-3 rounded-lg text-sm transition">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold text-white mb-2">Withdrawal</h2>
        <p className="text-gray-400 text-sm mb-8">Withdraw your earnings to your bank account</p>

        <div className="grid grid-cols-2 gap-8">

          {/* Left - Withdrawal Form */}
          <div className="bg-[#1e293b] rounded-2xl p-6">

            {/* Balance */}
            <div className="bg-blue-600 rounded-xl p-4 mb-6">
              <p className="text-blue-200 text-sm">Available Balance</p>
              <h3 className="text-3xl font-bold text-white mt-1">₾ {parseFloat(balance).toLocaleString()}</h3>
            </div>

            {message.text && (
              <div className={`text-sm px-4 py-3 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                {message.text}
              </div>
            )}

            {/* Bank Name */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Bank Name</label>
              <input
                type="text"
                placeholder="e.g. TBC Bank, Bank of Georgia"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full bg-[#0f172a] text-white border border-[#334155] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Account Number */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Account Number</label>
              <input
                type="text"
                placeholder="Enter your bank account number"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="w-full bg-[#0f172a] text-white border border-[#334155] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="block text-gray-400 text-sm mb-2">Amount (₾)</label>
              <input
                type="number"
                placeholder="Min: 50 ₾"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0f172a] text-white border border-[#334155] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'Submitting...' : 'Request Withdrawal'}
            </button>
          </div>

          {/* Right - History */}
          <div className="bg-[#1e293b] rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Withdrawal History</h3>
            <div className="flex flex-col gap-3">
              {withdrawals.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center py-3 border-b border-[#334155]">
                  <div>
                    <p className="text-white text-sm font-medium">{tx.bank_name}</p>
                    <p className="text-gray-400 text-xs">{new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-semibold">₾ {parseFloat(tx.amount).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tx.status === 'approved' ? 'bg-green-900 text-green-400' :
                      tx.status === 'pending' ? 'bg-yellow-900 text-yellow-400' :
                      'bg-red-900 text-red-400'
                    }`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
              {withdrawals.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">No withdrawal history yet</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Withdrawal;

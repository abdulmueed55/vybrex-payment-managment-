import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestWithdrawal, getWithdrawals, getCommissionRate } from '../api/withdrawal';
import { getBalance } from '../api/earnings';
import { getBankAccounts, addBankAccount, deleteBankAccount } from '../api/driver';
import { Sidebar } from './Dashboard';

const BANKS = [
  { code: 'TBC', name: 'TBC Bank', swift: 'TBCBGE22' },
  { code: 'BOG', name: 'Bank of Georgia', swift: 'BAGAGE22' },
];

const validateIBAN = (iban) => {
  if (!iban) return false;
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  return /^GE\d{2}[A-Z0-9]{18}$/.test(cleaned) && cleaned.length === 22;
};

const Withdrawal = () => {
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [balance, setBalance] = useState('0.00');
  const [withdrawals, setWithdrawals] = useState([]);
  const [commissionRate, setCommissionRate] = useState(10);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBank, setNewBank] = useState({ bank_code: '', iban: '' });
  const [ibanError, setIbanError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [balRes, wRes, baRes, crRes] = await Promise.all([
        getBalance(), getWithdrawals(), getBankAccounts(), getCommissionRate()
      ]);
      setBalance(balRes.data.balance);
      setWithdrawals(wRes.data.withdrawals);
      setBankAccounts(baRes.data.bank_accounts);
      setCommissionRate(crRes.data.commission_rate);
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate('/login'); }
    }
  };

  const handleIbanChange = (value) => {
    const cleaned = value.replace(/\s/g, '').toUpperCase();
    setNewBank({ ...newBank, iban: cleaned });
    if (cleaned.length > 0 && cleaned.length < 22) {
      setIbanError(`IBAN must be 22 characters (${cleaned.length}/22)`);
    } else if (cleaned.length === 22 && !validateIBAN(cleaned)) {
      setIbanError('Invalid Georgian IBAN format (must start with GE)');
    } else {
      setIbanError('');
    }
  };

  const handleAddBank = async () => {
    if (!newBank.bank_code) {
      setMessage({ text: 'Please select a bank', type: 'error' });
      return;
    }
    if (!validateIBAN(newBank.iban)) {
      setMessage({ text: 'Invalid IBAN. Must be Georgian format (GE + 20 chars, 22 total)', type: 'error' });
      return;
    }
    try {
      await addBankAccount(newBank.bank_code, newBank.iban);
      setMessage({ text: 'Bank account added! Pending admin verification.', type: 'success' });
      setNewBank({ bank_code: '', iban: '' });
      setIbanError('');
      setShowAddBank(false);
      await loadData();
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to add bank account', type: 'error' });
    }
  };

  const handleDeleteBank = async (id) => {
    try {
      await deleteBankAccount(id);
      await loadData();
    } catch (err) {
      setMessage({ text: 'Failed to remove account', type: 'error' });
    }
  };

  const handleWithdraw = async () => {
    if (!selectedAccount || !amount) {
      setMessage({ text: 'Select a bank account and enter amount', type: 'error' });
      return;
    }
    setMessage({ text: '', type: '' });
    setLoading(true);
    try {
      const res = await requestWithdrawal({
        amount: parseFloat(amount),
        bank_name: selectedAccount.bank_name,
        account_number: selectedAccount.iban || selectedAccount.account_number,
      });
      const commission = res.data.commission || '0.00';
      const driverGets = res.data.driver_receives || amount;
      setMessage({ text: `Withdrawal submitted! Commission: ${commission} GEL. You receive: ${driverGets} GEL`, type: 'success' });
      setAmount('');
      setSelectedAccount(null);
      await loadData();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Withdrawal failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const rate = commissionRate / 100;
  const commissionPreview = amount ? (parseFloat(amount) * rate).toFixed(2) : '0.00';
  const receivePreview = amount ? (parseFloat(amount) - parseFloat(commissionPreview)).toFixed(2) : '0.00';

  const selectedBankInfo = newBank.bank_code ? BANKS.find(b => b.code === newBank.bank_code) : null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar navigate={navigate} active="/withdrawal" />

      <div className="flex-1 p-8 overflow-auto">
        <h2 className="text-2xl font-bold text-[#0A0A0A] mb-1">Withdrawal</h2>
        <p className="text-[#6B6B6B] text-sm mb-8">Withdraw your earnings to your bank account</p>

        {message.text && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-6 border ${message.type === 'success' ? 'bg-green-50 text-[#16A34A] border-green-100' : 'bg-red-50 text-[#DC2626] border-red-100'}`}>{message.text}</div>
        )}

        <div className="grid grid-cols-2 gap-8">
          <div>
            {/* Balance Card */}
            <div className="bg-[#0A0A0A] rounded-xl p-5 mb-6">
              <p className="text-[#a0a0a0] text-sm font-medium">Available Balance</p>
              <h3 className="text-3xl font-bold text-white mt-1">{parseFloat(balance).toLocaleString()} <span className="text-lg font-medium">GEL</span></h3>
            </div>

            {/* Bank Accounts */}
            <div className="bg-white rounded-xl p-6 border border-[#E8E8E4] mb-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#0A0A0A] font-semibold">Bank Accounts</h3>
                <button onClick={() => setShowAddBank(!showAddBank)} className="text-sm text-[#0A0A0A] font-medium hover:underline">
                  {showAddBank ? 'Cancel' : '+ Add Account'}
                </button>
              </div>

              {showAddBank && (
                <div className="bg-[#FAF9F6] rounded-xl p-4 mb-4 border border-[#E8E8E4]">
                  <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Select Bank</label>
                  <div className="flex gap-3 mb-4">
                    {BANKS.map((bank) => (
                      <button key={bank.code} onClick={() => setNewBank({ ...newBank, bank_code: bank.code })}
                        className={`flex-1 p-3 rounded-xl border text-sm font-medium transition ${
                          newBank.bank_code === bank.code ? 'border-[#0A0A0A] bg-white text-[#0A0A0A]' : 'border-[#E8E8E4] bg-white text-[#6B6B6B] hover:border-[#0A0A0A]'
                        }`}>
                        <p className="font-semibold">{bank.name}</p>
                        <p className="text-xs text-[#6B6B6B] mt-0.5">SWIFT: {bank.swift}</p>
                      </button>
                    ))}
                  </div>

                  <label className="block text-sm font-medium text-[#0A0A0A] mb-2">IBAN</label>
                  <input type="text" placeholder="GE00XX0000000000000000" value={newBank.iban}
                    onChange={(e) => handleIbanChange(e.target.value)} maxLength={22}
                    className="w-full border border-[#E8E8E4] rounded-xl px-4 py-2.5 text-sm text-[#0A0A0A] bg-white mb-1 focus:outline-none focus:border-[#0A0A0A] font-mono tracking-wider" />
                  {ibanError && <p className="text-[#DC2626] text-xs mb-2">{ibanError}</p>}
                  {!ibanError && newBank.iban.length === 22 && <p className="text-[#16A34A] text-xs mb-2">Valid IBAN format</p>}
                  <p className="text-[#6B6B6B] text-xs mb-3">Georgian IBAN: GE + 2 check digits + 18 alphanumeric characters</p>

                  {selectedBankInfo && (
                    <div className="bg-white rounded-lg p-2 mb-3 border border-[#E8E8E4] text-xs text-[#6B6B6B]">
                      Bank: {selectedBankInfo.name} | SWIFT: {selectedBankInfo.swift}
                    </div>
                  )}

                  <button onClick={handleAddBank}
                    disabled={!newBank.bank_code || !validateIBAN(newBank.iban)}
                    className="bg-[#0A0A0A] disabled:bg-[#a0a0a0] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#1a1a1a] transition">
                    Add Account
                  </button>
                </div>
              )}

              {bankAccounts.length === 0 && !showAddBank && (
                <p className="text-[#6B6B6B] text-sm text-center py-4">No bank accounts added yet. Add one to start withdrawing.</p>
              )}

              {bankAccounts.map((ba) => (
                <div key={ba.id} onClick={() => ba.is_verified && setSelectedAccount(ba)}
                  className={`flex justify-between items-center p-3 rounded-xl mb-2 border transition cursor-pointer ${
                    selectedAccount?.id === ba.id ? 'border-[#0A0A0A] bg-[#FAF9F6]' : 'border-[#E8E8E4] hover:bg-[#FAF9F6]'
                  } ${!ba.is_verified ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  <div>
                    <p className="text-sm text-[#0A0A0A] font-medium">{ba.bank_name}</p>
                    <p className="text-xs text-[#6B6B6B] font-mono">{ba.iban || ba.account_number}</p>
                    {ba.swift_code && <p className="text-xs text-[#6B6B6B]">SWIFT: {ba.swift_code}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ba.is_verified ? 'bg-green-50 text-[#16A34A]' : 'bg-yellow-50 text-[#D97706]'}`}>
                      {ba.is_verified ? 'Verified' : 'Pending'}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteBank(ba.id); }} className="text-[#6B6B6B] hover:text-[#DC2626] text-xs">Remove</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Withdrawal Form */}
            <div className="bg-white rounded-xl p-6 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 className="text-[#0A0A0A] font-semibold mb-4">Request Withdrawal</h3>
              {selectedAccount ? (
                <div className="bg-[#FAF9F6] rounded-xl p-3 mb-4 border border-[#E8E8E4]">
                  <p className="text-xs text-[#6B6B6B]">Withdrawing to</p>
                  <p className="text-sm text-[#0A0A0A] font-medium">{selectedAccount.bank_name}</p>
                  <p className="text-xs text-[#6B6B6B] font-mono">{selectedAccount.iban || selectedAccount.account_number}</p>
                </div>
              ) : (
                <p className="text-[#D97706] text-sm mb-4 bg-yellow-50 px-4 py-3 rounded-xl border border-yellow-100">Select a verified bank account above</p>
              )}

              <div className="mb-4">
                <label className="block text-[#0A0A0A] text-sm font-medium mb-2">Amount (GEL)</label>
                <input type="number" placeholder="Min: 50 GEL" value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-[#FAF9F6] text-[#0A0A0A] border border-[#E8E8E4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0A0A0A] transition" />
              </div>

              {amount && parseFloat(amount) >= 50 && (
                <div className="bg-[#FAF9F6] rounded-xl p-3 mb-4 border border-[#E8E8E4] text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="text-[#6B6B6B]">Amount</span>
                    <span className="text-[#0A0A0A] font-medium">{parseFloat(amount).toFixed(2)} GEL</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#6B6B6B]">Commission ({commissionRate}%)</span>
                    <span className="text-[#DC2626] font-medium">-{commissionPreview} GEL</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-[#E8E8E4]">
                    <span className="text-[#0A0A0A] font-semibold">You receive</span>
                    <span className="text-[#16A34A] font-bold">{receivePreview} GEL</span>
                  </div>
                </div>
              )}

              <button onClick={handleWithdraw} disabled={loading || !selectedAccount || !amount}
                className="w-full bg-[#0A0A0A] hover:bg-[#1a1a1a] disabled:bg-[#a0a0a0] text-white font-semibold py-3 rounded-xl transition text-sm">
                {loading ? 'Submitting...' : 'Request Withdrawal'}
              </button>
            </div>
          </div>

          {/* Withdrawal History */}
          <div className="bg-white rounded-xl p-6 border border-[#E8E8E4] h-fit" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h3 className="text-[#0A0A0A] font-semibold mb-4">Withdrawal History</h3>
            <div className="flex flex-col">
              {withdrawals.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center py-3 border-b border-[#E8E8E4] last:border-b-0">
                  <div>
                    <p className="text-[#0A0A0A] text-sm font-medium">{tx.bank_name}</p>
                    <p className="text-[#6B6B6B] text-xs">{new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    {parseFloat(tx.commission_amount) > 0 && (
                      <p className="text-[#6B6B6B] text-xs">Commission: {parseFloat(tx.commission_amount).toFixed(2)} GEL</p>
                    )}
                    {tx.iban && <p className="text-[#6B6B6B] text-xs font-mono">{tx.iban}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-[#0A0A0A] text-sm font-semibold">{parseFloat(tx.amount).toFixed(2)} GEL</p>
                    {parseFloat(tx.net_amount || 0) > 0 && (
                      <p className="text-[#16A34A] text-xs font-medium">Net: {parseFloat(tx.net_amount).toFixed(2)} GEL</p>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      tx.status === 'approved' ? 'bg-green-50 text-[#16A34A]' :
                      tx.status === 'pending' ? 'bg-yellow-50 text-[#D97706]' :
                      tx.status === 'processed' ? 'bg-blue-50 text-blue-600' :
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

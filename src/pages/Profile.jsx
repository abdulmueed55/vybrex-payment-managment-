import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Dashboard';
import { getDriverProfile, updateProfile, changePassword, linkYandexId } from '../api/driver';
import { getBalance, getEarnings } from '../api/earnings';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ rides: 0, earnings: '0.00', withdrawn: '0.00' });
  const [editName, setEditName] = useState('');
  const [editing, setEditing] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [yandexIdInput, setYandexIdInput] = useState('');
  const [editingYandex, setEditingYandex] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [pRes, bRes, eRes] = await Promise.all([
        getDriverProfile(), getBalance(), getEarnings(),
      ]);
      setProfile(pRes.data.driver);
      setEditName(pRes.data.driver.name);
      setStats({ rides: eRes.data.earnings.length, earnings: bRes.data.total_earnings, withdrawn: bRes.data.total_withdrawn });
    } catch (err) {
      if (err.response?.status === 401) { localStorage.clear(); navigate('/login'); }
    }
  };

  const handleUpdateName = async () => {
    try {
      await updateProfile(editName);
      const driver = JSON.parse(localStorage.getItem('driver') || '{}');
      driver.name = editName;
      localStorage.setItem('driver', JSON.stringify(driver));
      setProfile({ ...profile, name: editName });
      setEditing(false);
      setMessage({ text: 'Name updated', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed', type: 'error' });
    }
  };

  const handleChangePassword = async () => {
    if (pwForm.new !== pwForm.confirm) { setMessage({ text: 'Passwords do not match', type: 'error' }); return; }
    if (pwForm.new.length < 6) { setMessage({ text: 'Password must be at least 6 characters', type: 'error' }); return; }
    try {
      await changePassword(pwForm.current, pwForm.new);
      setPwForm({ current: '', new: '', confirm: '' });
      setShowPw(false);
      setMessage({ text: 'Password changed successfully', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed', type: 'error' });
    }
  };

  const handleLinkYandex = async () => {
    if (!yandexIdInput.trim()) { setMessage({ text: 'Please enter your Yandex Driver ID', type: 'error' }); return; }
    try {
      await linkYandexId(yandexIdInput.trim());
      setProfile({ ...profile, yandex_driver_id: yandexIdInput.trim() });
      setEditingYandex(false);
      setMessage({ text: 'Yandex Driver ID linked successfully', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to link Yandex ID', type: 'error' });
    }
  };

  if (!profile) return <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}><p className="text-[#6B6B6B]">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Sidebar navigate={navigate} active="/profile" />
      <div className="flex-1 p-8 overflow-auto">
        <h2 className="text-2xl font-bold text-[#0A0A0A] mb-1">Profile</h2>
        <p className="text-[#6B6B6B] text-sm mb-8">Manage your account</p>

        {message.text && (
          <div className={`text-sm px-4 py-3 rounded-xl mb-6 border ${message.type === 'success' ? 'bg-green-50 text-[#16A34A] border-green-100' : 'bg-red-50 text-[#DC2626] border-red-100'}`}>{message.text}</div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* Driver Info */}
          <div className="bg-white rounded-xl p-6 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h3 className="text-[#0A0A0A] font-semibold mb-4">Driver Information</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#0A0A0A] flex items-center justify-center text-white text-2xl font-bold">
                {profile.name.charAt(0)}
              </div>
              <div>
                {editing ? (
                  <div className="flex gap-2">
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                      className="border border-[#E8E8E4] rounded-lg px-3 py-1.5 text-sm text-[#0A0A0A] bg-[#FAF9F6] focus:border-[#0A0A0A] outline-none" />
                    <button onClick={handleUpdateName} className="bg-[#0A0A0A] text-white text-xs px-3 py-1.5 rounded-lg">Save</button>
                    <button onClick={() => { setEditing(false); setEditName(profile.name); }} className="text-[#6B6B6B] text-xs px-2">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-[#0A0A0A] font-semibold">{profile.name}</p>
                    <button onClick={() => setEditing(true)} className="text-[#6B6B6B] text-xs hover:text-[#0A0A0A]">Edit</button>
                  </div>
                )}
                <p className="text-[#6B6B6B] text-sm">{profile.phone}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between py-2 border-b border-[#E8E8E4]">
                <span className="text-[#6B6B6B]">Joined</span>
                <span className="text-[#0A0A0A] font-medium">{new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#E8E8E4]">
                <span className="text-[#6B6B6B]">Yandex ID</span>
                {editingYandex ? (
                  <div className="flex gap-2">
                    <input type="text" value={yandexIdInput} onChange={(e) => setYandexIdInput(e.target.value)}
                      placeholder="Enter Yandex Driver ID"
                      className="border border-[#E8E8E4] rounded-lg px-3 py-1.5 text-sm text-[#0A0A0A] bg-[#FAF9F6] focus:border-[#0A0A0A] outline-none w-44" />
                    <button onClick={handleLinkYandex} className="bg-[#0A0A0A] text-white text-xs px-3 py-1.5 rounded-lg">Save</button>
                    <button onClick={() => setEditingYandex(false)} className="text-[#6B6B6B] text-xs px-2">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[#0A0A0A] font-medium">{profile.yandex_driver_id || 'Not linked'}</span>
                    <button onClick={() => { setEditingYandex(true); setYandexIdInput(profile.yandex_driver_id || ''); }}
                      className="text-[#6B6B6B] text-xs hover:text-[#0A0A0A]">{profile.yandex_driver_id ? 'Edit' : 'Link'}</button>
                  </div>
                )}
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#6B6B6B]">Current Balance</span>
                <span className="text-[#0A0A0A] font-semibold">{parseFloat(profile.balance).toFixed(2)} GEL</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-xl p-6 border border-[#E8E8E4]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h3 className="text-[#0A0A0A] font-semibold mb-4">Statistics</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-[#FAF9F6] rounded-xl p-4 text-center border border-[#E8E8E4]">
                <p className="text-2xl font-bold text-[#0A0A0A]">{stats.rides}</p>
                <p className="text-xs text-[#6B6B6B] mt-1">Total Rides</p>
              </div>
              <div className="bg-[#FAF9F6] rounded-xl p-4 text-center border border-[#E8E8E4]">
                <p className="text-2xl font-bold text-[#0A0A0A]">{parseFloat(stats.earnings).toLocaleString()}</p>
                <p className="text-xs text-[#6B6B6B] mt-1">Earned (GEL)</p>
              </div>
              <div className="bg-[#FAF9F6] rounded-xl p-4 text-center border border-[#E8E8E4]">
                <p className="text-2xl font-bold text-[#0A0A0A]">{parseFloat(stats.withdrawn).toLocaleString()}</p>
                <p className="text-xs text-[#6B6B6B] mt-1">Withdrawn (GEL)</p>
              </div>
            </div>

          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl p-6 border border-[#E8E8E4] col-span-2" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#0A0A0A] font-semibold">Security</h3>
              {!showPw && <button onClick={() => setShowPw(true)} className="text-sm text-[#0A0A0A] font-medium hover:underline">Change Password</button>}
            </div>
            {showPw && (
              <div className="max-w-md">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Current Password</label>
                  <input type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                    className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 outline-none text-[#0A0A0A] bg-[#FAF9F6] text-sm focus:border-[#0A0A0A] transition" />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-[#0A0A0A] mb-1">New Password</label>
                  <input type="password" value={pwForm.new} onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })}
                    className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 outline-none text-[#0A0A0A] bg-[#FAF9F6] text-sm focus:border-[#0A0A0A] transition" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Confirm New Password</label>
                  <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    className="w-full border border-[#E8E8E4] rounded-xl px-4 py-3 outline-none text-[#0A0A0A] bg-[#FAF9F6] text-sm focus:border-[#0A0A0A] transition" />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleChangePassword} className="bg-[#0A0A0A] text-white font-semibold py-2.5 px-6 rounded-xl text-sm hover:bg-[#1a1a1a] transition">Update Password</button>
                  <button onClick={() => { setShowPw(false); setPwForm({ current: '', new: '', confirm: '' }); }} className="bg-[#FAF9F6] text-[#0A0A0A] font-semibold py-2.5 px-6 rounded-xl text-sm border border-[#E8E8E4]">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

import { useState, useEffect } from 'react';
import { settingsApi, authApi } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Settings() {
  const [settings, setSettings] = useState({ name: '', email: '', address: '', phone: '', logo_url: '' });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [savingPass, setSavingPass] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await settingsApi.get();
        setSettings({
          name: data.name || '',
          email: data.email || '',
          address: data.address || '',
          phone: data.phone || '',
          logo_url: data.logo_url || '',
        });
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await settingsApi.update(settings);
      toast.success('Company settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwords.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSavingPass(true);
    try {
      await authApi.changePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      toast.success('Password changed successfully');
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSavingPass(false);
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await settingsApi.export();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vybrex-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch {
      toast.error('Export failed');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-zinc-500 text-sm mt-0.5">Manage your account and company information</p>
      </div>

      {/* Company Settings */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <span>🏢</span> Company Information
        </h2>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="form-label">Company Name</label>
            <input className="form-input" value={settings.name}
              onChange={(e) => setSettings((s) => ({ ...s, name: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Company Email</label>
            <input type="email" className="form-input" value={settings.email}
              onChange={(e) => setSettings((s) => ({ ...s, email: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Address</label>
            <textarea className="form-input resize-none" rows={2} value={settings.address}
              onChange={(e) => setSettings((s) => ({ ...s, address: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input className="form-input" value={settings.phone}
              onChange={(e) => setSettings((s) => ({ ...s, phone: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Company Logo URL</label>
            <input className="form-input" placeholder="https://example.com/logo.png"
              value={settings.logo_url}
              onChange={(e) => setSettings((s) => ({ ...s, logo_url: e.target.value }))} />
            <p className="text-xs text-zinc-400 mt-1">
              Upload your logo to a hosting service (e.g. imgbb.com) and paste the direct image URL here. Used on PDFs and payslips.
            </p>
            {settings.logo_url && (
              <div className="mt-2 p-3 bg-zinc-50 rounded-lg border border-zinc-200 inline-flex items-center gap-3">
                <img src={settings.logo_url} alt="Logo preview" className="h-10 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                <span className="text-xs text-zinc-500">Logo preview</span>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingSettings} className="btn-primary flex items-center gap-2">
              {savingSettings && <div className="spinner w-4 h-4" />}
              Save Settings
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-4 flex items-center gap-2">
          <span>🔐</span> Change Password
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="form-label">Current Password</label>
            <input type="password" required className="form-input" value={passwords.current_password}
              onChange={(e) => setPasswords((p) => ({ ...p, current_password: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">New Password</label>
            <input type="password" required minLength={8} className="form-input" value={passwords.new_password}
              onChange={(e) => setPasswords((p) => ({ ...p, new_password: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Confirm New Password</label>
            <input type="password" required className="form-input" value={passwords.confirm_password}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm_password: e.target.value }))}
              style={{ borderColor: passwords.confirm_password && passwords.new_password !== passwords.confirm_password ? '#EF4444' : '' }} />
            {passwords.confirm_password && passwords.new_password !== passwords.confirm_password && (
              <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={savingPass} className="btn-primary flex items-center gap-2">
              {savingPass && <div className="spinner w-4 h-4" />}
              Change Password
            </button>
          </div>
        </form>
      </div>

      {/* Data Export */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-2 flex items-center gap-2">
          <span>📦</span> Data Export
        </h2>
        <p className="text-zinc-500 text-sm mb-4">
          Download a complete backup of all your data as a JSON file. This includes clients, employees, payments, and expenses.
        </p>
        <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
          <span>📥</span> Export All Data (JSON)
        </button>
      </div>

      {/* App Info */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-zinc-900 mb-3 flex items-center gap-2">
          <span>ℹ️</span> About
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-3">
            <span className="text-zinc-500 w-28">Application</span>
            <span className="text-zinc-900">Vybrex CRM</span>
          </div>
          <div className="flex gap-3">
            <span className="text-zinc-500 w-28">Version</span>
            <span className="text-zinc-900">1.0.0</span>
          </div>
          <div className="flex gap-3">
            <span className="text-zinc-500 w-28">Built For</span>
            <span className="text-zinc-900">Vybrex Solutions — Internal Use Only</span>
          </div>
          <div className="flex gap-3">
            <span className="text-zinc-500 w-28">Users</span>
            <span className="text-zinc-900">Abdul (Owner) · Amina (Owner)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

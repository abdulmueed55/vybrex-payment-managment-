import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientsApi } from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatDate, daysSince } from '../utils/format';
import toast from 'react-hot-toast';

const METHODS = ['Bank Transfer', 'PayPal', 'Stripe', 'Cash', 'Cheque', 'Crypto', 'Other'];

export default function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [deletePayId, setDeletePayId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', payment_date: new Date().toISOString().split('T')[0], method: '', notes: '' });

  const load = async () => {
    try {
      const { data } = await clientsApi.getOne(id);
      setClient(data);
    } catch {
      toast.error('Failed to load client');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!payForm.amount || parseFloat(payForm.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    setSaving(true);
    try {
      await clientsApi.addPayment(id, payForm);
      toast.success('Payment added');
      setShowPayModal(false);
      setPayForm({ amount: '', payment_date: new Date().toISOString().split('T')[0], method: '', notes: '' });
      load();
    } catch {
      toast.error('Failed to add payment');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async () => {
    try {
      await clientsApi.deletePayment(id, deletePayId);
      toast.success('Payment deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
    setDeletePayId(null);
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!client) return <div className="text-center py-20 text-zinc-400">Client not found</div>;

  const progressPct = client.total_amount > 0
    ? Math.min(100, (client.total_paid / client.total_amount) * 100)
    : 0;

  const overdueDays = client.end_date && new Date(client.end_date) < new Date() && !client.is_ongoing
    ? daysSince(client.end_date)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate('/clients')} className="text-zinc-400 hover:text-zinc-900 transition-colors">
          ← Back
        </button>
      </div>

      {/* Overdue Banner */}
      {overdueDays !== null && overdueDays > 0 && client.remaining > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="text-red-600 font-semibold">Payment Overdue</p>
            <p className="text-red-500 text-sm">
              {overdueDays} days late · {formatCurrency(client.remaining)} outstanding
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="card p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900">{client.name}</h2>
              {client.company && <p className="text-zinc-500 text-sm">{client.company}</p>}
            </div>
            <span className={`badge ${
              client.status === 'active' ? 'badge-green' :
              client.status === 'on_hold' ? 'badge-yellow' : 'badge-gray'
            } capitalize`}>
              {client.status?.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            {client.email && (
              <div className="flex gap-2"><span className="text-zinc-500">Email</span><span className="text-zinc-900">{client.email}</span></div>
            )}
            {client.phone && (
              <div className="flex gap-2"><span className="text-zinc-500">Phone</span><span className="text-zinc-900">{client.phone}</span></div>
            )}
            {client.country && (
              <div className="flex gap-2"><span className="text-zinc-500">Country</span><span className="text-zinc-900">{client.country}</span></div>
            )}
            {client.service_type && (
              <div className="flex gap-2"><span className="text-zinc-500">Service</span><span className="text-zinc-900">{client.service_type}</span></div>
            )}
            <div className="flex gap-2">
              <span className="text-zinc-500">Contract</span>
              <span className="text-zinc-900">{client.contract_type === 'monthly' ? 'Monthly Retainer' : 'Project-Based'}</span>
            </div>
            <div className="flex gap-2"><span className="text-zinc-500">Start</span><span className="text-zinc-900">{formatDate(client.start_date)}</span></div>
            <div className="flex gap-2">
              <span className="text-zinc-500">End</span>
              <span className="text-zinc-900">
                {client.is_ongoing ? <span className="badge badge-blue">Ongoing</span> : formatDate(client.end_date)}
              </span>
            </div>
          </div>

          {client.notes && (
            <div className="pt-3 border-t border-zinc-200">
              <p className="text-xs text-zinc-500 mb-1">Notes</p>
              <p className="text-sm text-zinc-700">{client.notes}</p>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="xl:col-span-2 space-y-6">
          {/* Financials */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card">
              <p className="text-xs text-zinc-500 uppercase mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-zinc-900">{formatCurrency(client.total_amount)}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-zinc-500 uppercase mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(client.total_paid)}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-zinc-500 uppercase mb-1">Remaining</p>
              <p className={`text-2xl font-bold ${client.remaining > 0 ? 'text-amber-500' : 'text-emerald-600'}`}>
                {formatCurrency(client.remaining)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-500">Payment Progress</span>
              <span className="text-sm font-semibold text-zinc-900">{progressPct.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${progressPct >= 100 ? 'bg-emerald-500' : 'bg-zinc-900'}`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-zinc-400">
              <span>{formatCurrency(client.total_paid)} paid</span>
              <span>{formatCurrency(client.total_amount)} total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-zinc-200">
          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Payment History</h3>
          <button onClick={() => setShowPayModal(true)} className="btn-primary text-xs px-3 py-2">
            + Add Payment
          </button>
        </div>
        {client.payments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-3 opacity-50">💳</div>
            <p className="text-zinc-400">No payments recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase">Notes</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {client.payments.map((p) => (
                  <tr key={p.id} className="table-row-hover">
                    <td className="px-4 py-3 text-zinc-700">{formatDate(p.payment_date)}</td>
                    <td className="px-4 py-3 text-emerald-600 font-semibold">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3 text-zinc-500">{p.method || '—'}</td>
                    <td className="px-4 py-3 text-zinc-500">{p.notes || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeletePayId(p.id)}
                        className="p-1 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded transition-colors"
                        title="Delete"
                      >🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Add Payment" size="sm">
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div>
            <label className="form-label">Amount (Rs) *</label>
            <input
              type="number" step="0.01" min="0.01" required
              className="form-input"
              value={payForm.amount}
              onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
            />
          </div>
          <div>
            <label className="form-label">Payment Date *</label>
            <input
              type="date" required
              className="form-input"
              value={payForm.payment_date}
              onChange={(e) => setPayForm((f) => ({ ...f, payment_date: e.target.value }))}
            />
          </div>
          <div>
            <label className="form-label">Method</label>
            <select className="form-input" value={payForm.method}
              onChange={(e) => setPayForm((f) => ({ ...f, method: e.target.value }))}>
              <option value="">Select method...</option>
              {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea className="form-input resize-none" rows={2}
              value={payForm.notes}
              onChange={(e) => setPayForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={() => setShowPayModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving && <div className="spinner w-4 h-4" />}
              Add Payment
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletePayId}
        onClose={() => setDeletePayId(null)}
        onConfirm={handleDeletePayment}
        title="Delete Payment"
        message="Are you sure you want to delete this payment record?"
      />
    </div>
  );
}

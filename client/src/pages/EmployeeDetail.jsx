import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeesApi, settingsApi } from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/format';
import { generatePayslip } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [deletePayId, setDeletePayId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [payForm, setPayForm] = useState({
    amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    month_covered: '',
    notes: '',
  });

  const load = async () => {
    try {
      const { data } = await employeesApi.getOne(id);
      setEmployee(data);
    } catch {
      toast.error('Failed to load employee');
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
      await employeesApi.addSalaryPayment(id, payForm);
      toast.success('Salary payment added');
      setShowPayModal(false);
      setPayForm({ amount: employee?.monthly_salary || '', payment_date: new Date().toISOString().split('T')[0], month_covered: '', notes: '' });
      load();
    } catch {
      toast.error('Failed to add payment');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePayment = async () => {
    try {
      await employeesApi.deleteSalaryPayment(id, deletePayId);
      toast.success('Payment deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
    setDeletePayId(null);
  };

  const handleGeneratePayslip = async (payment) => {
    try {
      const { data: company } = await settingsApi.get();
      generatePayslip(employee, payment, company);
      toast.success('Payslip downloaded');
    } catch {
      toast.error('Failed to generate payslip');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!employee) return <div className="text-center py-20 text-slate-500">Employee not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/employees')} className="text-slate-400 hover:text-white transition-colors">
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">{employee.name[0]}</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{employee.name}</h2>
                <p className="text-slate-400 text-sm">{employee.role || '—'}</p>
              </div>
            </div>
          </div>

          {employee.status === 'left' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 font-semibold text-sm">
                Left on {formatDate(employee.leave_date)}
              </p>
              {employee.leave_reason && (
                <p className="text-red-300 text-xs mt-1">{employee.leave_reason}</p>
              )}
            </div>
          )}

          <div className="space-y-2 text-sm">
            {employee.email && (
              <div className="flex gap-2"><span className="text-slate-500">Email</span><span className="text-white truncate">{employee.email}</span></div>
            )}
            {employee.phone && (
              <div className="flex gap-2"><span className="text-slate-500">Phone</span><span className="text-white">{employee.phone}</span></div>
            )}
            <div className="flex gap-2">
              <span className="text-slate-500">Join Date</span>
              <span className="text-white">{formatDate(employee.join_date)}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-500">Salary Type</span>
              <span className="text-white capitalize">{employee.salary_type?.replace('_', ' ')}</span>
            </div>
            {employee.monthly_salary && (
              <div className="flex gap-2">
                <span className="text-slate-500">Monthly Salary</span>
                <span className="text-white">{formatCurrency(employee.monthly_salary)}</span>
              </div>
            )}
            {employee.bank_details && (
              <div className="flex gap-2"><span className="text-slate-500">Bank</span><span className="text-white text-xs">{employee.bank_details}</span></div>
            )}
            <div className="flex gap-2">
              <span className="text-slate-500">Status</span>
              <span className={`badge ${employee.status === 'active' ? 'badge-green' : 'badge-red'} capitalize`}>
                {employee.status}
              </span>
            </div>
          </div>

          {employee.notes && (
            <div className="pt-3 border-t border-slate-700/50">
              <p className="text-xs text-slate-500 mb-1">Notes</p>
              <p className="text-sm text-slate-300">{employee.notes}</p>
            </div>
          )}
        </div>

        {/* Salary Summary */}
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="stat-card">
              <p className="text-xs text-slate-500 uppercase mb-1">Total Paid (Lifetime)</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(employee.total_paid)}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs text-slate-500 uppercase mb-1">Monthly Salary</p>
              <p className="text-2xl font-bold text-white">
                {employee.monthly_salary ? formatCurrency(employee.monthly_salary) : '—'}
              </p>
            </div>
          </div>

          {/* Salary Payment History */}
          <div className="card">
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Salary Payments</h3>
              <button onClick={() => { setPayForm((f) => ({ ...f, amount: employee.monthly_salary || '' })); setShowPayModal(true); }}
                className="btn-primary text-xs px-3 py-2">
                + Add Payment
              </button>
            </div>

            {employee.salary_payments.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-3xl mb-3 opacity-50">💸</div>
                <p className="text-slate-500">No salary payments recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">Payment Date</th>
                      <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">Month Covered</th>
                      <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">Notes</th>
                      <th className="px-4 py-3 text-left text-xs text-slate-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {employee.salary_payments.map((p) => (
                      <tr key={p.id} className="table-row-hover">
                        <td className="px-4 py-3 text-slate-300">{formatDate(p.payment_date)}</td>
                        <td className="px-4 py-3 text-slate-400">{p.month_covered || '—'}</td>
                        <td className="px-4 py-3 text-green-400 font-semibold">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3 text-slate-400">{p.notes || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleGeneratePayslip(p)}
                              className="px-2 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded transition-colors"
                              title="Generate Payslip"
                            >
                              📄 Payslip
                            </button>
                            <button onClick={() => setDeletePayId(p.id)}
                              className="p-1 hover:bg-red-500/20 text-slate-600 hover:text-red-400 rounded transition-colors">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Salary Payment Modal */}
      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="Add Salary Payment" size="sm">
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div>
            <label className="form-label">Amount ($) *</label>
            <input type="number" step="0.01" min="0.01" required className="form-input"
              value={payForm.amount}
              onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Payment Date *</label>
            <input type="date" required className="form-input"
              value={payForm.payment_date}
              onChange={(e) => setPayForm((f) => ({ ...f, payment_date: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Month Covered</label>
            <input className="form-input" placeholder="e.g. January 2025"
              value={payForm.month_covered}
              onChange={(e) => setPayForm((f) => ({ ...f, month_covered: e.target.value }))} />
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

      <ConfirmDialog isOpen={!!deletePayId} onClose={() => setDeletePayId(null)} onConfirm={handleDeletePayment}
        title="Delete Payment" message="Delete this salary payment record?" />
    </div>
  );
}

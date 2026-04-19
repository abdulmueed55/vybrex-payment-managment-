import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeesApi } from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/format';
import toast from 'react-hot-toast';

const initialForm = {
  name: '', role: '', email: '', phone: '',
  join_date: '', leave_date: '', leave_reason: '',
  salary_type: 'monthly', monthly_salary: '',
  bank_details: '', status: 'active', notes: '',
};

function EmployeeForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState(initial || initialForm);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Full Name *</label>
          <input className="form-input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div>
          <label className="form-label">Role / Designation</label>
          <input className="form-input" value={form.role} onChange={(e) => set('role', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input type="email" className="form-input" value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Phone</label>
          <input className="form-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Join Date</label>
          <input type="date" className="form-input" value={form.join_date} onChange={(e) => set('join_date', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Salary Type</label>
          <select className="form-input" value={form.salary_type} onChange={(e) => set('salary_type', e.target.value)}>
            <option value="monthly">Monthly</option>
            <option value="per_project">Per Project</option>
          </select>
        </div>
        <div>
          <label className="form-label">Monthly Salary (Rs)</label>
          <input type="number" step="0.01" className="form-input" value={form.monthly_salary}
            onChange={(e) => set('monthly_salary', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Bank / Payment Details</label>
          <input className="form-input" value={form.bank_details} onChange={(e) => set('bank_details', e.target.value)}
            placeholder="Account number, PayPal, etc." />
        </div>
        <div>
          <label className="form-label">Status</label>
          <select className="form-input" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="left">Left</option>
          </select>
        </div>
      </div>

      {form.status === 'left' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <div>
            <label className="form-label">Leave Date</label>
            <input type="date" className="form-input" value={form.leave_date}
              onChange={(e) => set('leave_date', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Reason for Leaving</label>
            <input className="form-input" value={form.leave_reason}
              onChange={(e) => set('leave_reason', e.target.value)} />
          </div>
        </div>
      )}

      <div>
        <label className="form-label">Notes</label>
        <textarea className="form-input resize-none" rows={2} value={form.notes}
          onChange={(e) => set('notes', e.target.value)} />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <div className="spinner w-4 h-4" />}
          Save Employee
        </button>
      </div>
    </form>
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [payTarget, setPayTarget] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', payment_date: new Date().toISOString().split('T')[0], month_covered: '', notes: '' });
  const [payingSalary, setPayingSalary] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await employeesApi.getAll(params);
      setEmployees(data);
    } catch {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editEmp) {
        await employeesApi.update(editEmp.id, form);
        toast.success('Employee updated');
      } else {
        await employeesApi.create(form);
        toast.success('Employee added');
      }
      setShowModal(false);
      setEditEmp(null);
      load();
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await employeesApi.delete(deleteId);
      toast.success('Employee deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
    setDeleteId(null);
  };

  const openPay = (emp) => {
    setPayTarget(emp);
    setPayForm({ amount: emp.monthly_salary || '', payment_date: new Date().toISOString().split('T')[0], month_covered: '', notes: '' });
  };

  const handleQuickPay = async (e) => {
    e.preventDefault();
    if (!payForm.amount || parseFloat(payForm.amount) <= 0) { toast.error('Amount required'); return; }
    setPayingSalary(true);
    try {
      await employeesApi.addSalaryPayment(payTarget.id, payForm);
      toast.success(`Salary paid to ${payTarget.name}`);
      setPayTarget(null);
      load();
    } catch { toast.error('Payment failed'); }
    finally { setPayingSalary(false); }
  };

  const openEdit = (emp) => {
    setEditEmp({
      ...emp,
      join_date: emp.join_date ? emp.join_date.split('T')[0] : '',
      leave_date: emp.leave_date ? emp.leave_date.split('T')[0] : '',
      monthly_salary: emp.monthly_salary || '',
    });
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{employees.length} employees</p>
        </div>
        <button
          onClick={() => { setEditEmp(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <span>+</span> Add Employee
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {['active', 'left', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize
              ${filter === f ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:text-zinc-900'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner fullPage />
        ) : employees.length === 0 ? (
          <EmptyState
            icon="👤"
            title="No employees found"
            message="Add team members to track salaries and performance."
            action={<button onClick={() => setShowModal(true)} className="btn-primary">Add Employee</button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  {['Name', 'Role', 'Join Date', 'Salary', 'Type', 'Total Paid', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {employees.map((emp) => (
                  <tr key={emp.id} className="table-row-hover">
                    <td className="px-4 py-3">
                      <div
                        className="font-medium text-zinc-900 hover:text-blue-600 cursor-pointer transition-colors"
                        onClick={() => navigate(`/employees/${emp.id}`)}
                      >
                        {emp.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{emp.role || '—'}</td>
                    <td className="px-4 py-3 text-zinc-500">{formatDate(emp.join_date)}</td>
                    <td className="px-4 py-3 text-zinc-900">{emp.monthly_salary ? formatCurrency(emp.monthly_salary) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className="badge badge-blue capitalize">
                        {emp.salary_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{formatCurrency(emp.total_paid)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${emp.status === 'active' ? 'badge-green' : 'badge-red'} capitalize`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openPay(emp)}
                          className="px-2 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded transition-colors font-medium" title="Pay Salary">
                          💰 Pay
                        </button>
                        <button onClick={() => navigate(`/employees/${emp.id}`)}
                          className="p-1.5 hover:bg-blue-50 text-zinc-400 hover:text-blue-600 rounded transition-colors" title="View History">👁️</button>
                        <button onClick={() => openEdit(emp)}
                          className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 rounded transition-colors" title="Edit">✏️</button>
                        <button onClick={() => setDeleteId(emp.id)}
                          className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded transition-colors" title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditEmp(null); }}
        title={editEmp ? 'Edit Employee' : 'Add Employee'} size="lg">
        <EmployeeForm initial={editEmp} onSubmit={handleSave} loading={saving} />
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Employee" message="Delete this employee and all their salary records?" />

      <Modal isOpen={!!payTarget} onClose={() => setPayTarget(null)} title={`Pay Salary — ${payTarget?.name}`} size="sm">
        <form onSubmit={handleQuickPay} className="space-y-4">
          <div className="bg-zinc-50 rounded-lg p-3 text-sm border border-zinc-200">
            <span className="text-zinc-500">Monthly Salary: </span>
            <span className="text-zinc-900 font-semibold">{payTarget?.monthly_salary ? formatCurrency(payTarget.monthly_salary) : 'Not set'}</span>
            <span className="text-zinc-500 ml-4">Total Paid: </span>
            <span className="text-emerald-600 font-semibold">{formatCurrency(payTarget?.total_paid || 0)}</span>
          </div>
          <div>
            <label className="form-label">Amount (Rs) *</label>
            <input type="number" step="0.01" min="0.01" required className="form-input"
              value={payForm.amount} onChange={(e) => setPayForm(f => ({ ...f, amount: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Payment Date *</label>
            <input type="date" required className="form-input"
              value={payForm.payment_date} onChange={(e) => setPayForm(f => ({ ...f, payment_date: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Month Covered (e.g. April 2026)</label>
            <input className="form-input" placeholder="e.g. April 2026"
              value={payForm.month_covered} onChange={(e) => setPayForm(f => ({ ...f, month_covered: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Notes</label>
            <input className="form-input" value={payForm.notes} onChange={(e) => setPayForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={() => setPayTarget(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={payingSalary} className="btn-primary flex items-center gap-2">
              {payingSalary && <div className="spinner w-4 h-4" />} Confirm Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

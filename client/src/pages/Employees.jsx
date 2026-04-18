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
          <label className="form-label">Monthly Salary ($)</label>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
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
          <p className="text-slate-500 text-sm mt-0.5">{employees.length} employees</p>
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
              ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:text-white'}`}
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
                <tr className="border-b border-slate-700/50">
                  {['Name', 'Role', 'Join Date', 'Salary', 'Type', 'Total Paid', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {employees.map((emp) => (
                  <tr key={emp.id} className="table-row-hover">
                    <td className="px-4 py-3">
                      <div
                        className="font-medium text-white hover:text-blue-400 cursor-pointer transition-colors"
                        onClick={() => navigate(`/employees/${emp.id}`)}
                      >
                        {emp.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{emp.role || '—'}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(emp.join_date)}</td>
                    <td className="px-4 py-3 text-white">{emp.monthly_salary ? formatCurrency(emp.monthly_salary) : '—'}</td>
                    <td className="px-4 py-3">
                      <span className="badge badge-blue capitalize">
                        {emp.salary_type?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-green-400 font-medium">{formatCurrency(emp.total_paid)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${emp.status === 'active' ? 'badge-green' : 'badge-red'} capitalize`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => navigate(`/employees/${emp.id}`)}
                          className="p-1.5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded transition-colors" title="View">👁️</button>
                        <button onClick={() => openEdit(emp)}
                          className="p-1.5 hover:bg-slate-600 text-slate-400 hover:text-white rounded transition-colors" title="Edit">✏️</button>
                        <button onClick={() => setDeleteId(emp.id)}
                          className="p-1.5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded transition-colors" title="Delete">🗑️</button>
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
    </div>
  );
}

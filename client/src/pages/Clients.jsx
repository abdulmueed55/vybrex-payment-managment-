import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsApi } from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/format';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  active: 'badge-green',
  on_hold: 'badge-yellow',
  completed: 'badge-gray',
};

const ALERT_COLORS = {
  overdue: 'badge-red',
  due_soon: 'badge-yellow',
  retainer_ending: 'badge-orange',
};

const ALERT_LABELS = {
  overdue: 'Overdue',
  due_soon: 'Due Soon',
  retainer_ending: 'Ending Soon',
};

const SERVICE_TYPES = [
  'Web Design', 'Web Development', 'Mobile App', 'Branding',
  'SEO', 'Social Media', 'Content Creation', 'Digital Marketing',
  'UI/UX Design', 'Video Production', 'Consulting', 'Other',
];

const initialForm = {
  name: '', company: '', email: '', phone: '', country: '',
  service_type: '', contract_type: 'project', monthly_amount: '',
  project_amount: '', start_date: '', end_date: '', is_ongoing: false,
  status: 'active', notes: '',
};

function ClientForm({ initial, onSubmit, loading }) {
  const [form, setForm] = useState(initial || initialForm);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Client name is required'); return; }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Client Name *</label>
          <input className="form-input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
        </div>
        <div>
          <label className="form-label">Company</label>
          <input className="form-input" value={form.company} onChange={(e) => set('company', e.target.value)} />
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
          <label className="form-label">Country</label>
          <input className="form-input" value={form.country} onChange={(e) => set('country', e.target.value)} />
        </div>
        <div>
          <label className="form-label">Service Type</label>
          <select className="form-input" value={form.service_type} onChange={(e) => set('service_type', e.target.value)}>
            <option value="">Select service...</option>
            {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="form-label">Contract Type</label>
        <div className="flex gap-3">
          {['monthly', 'project'].map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="contract_type"
                value={t}
                checked={form.contract_type === t}
                onChange={() => set('contract_type', t)}
                className="accent-zinc-900"
              />
              <span className="text-sm text-zinc-700">
                {t === 'monthly' ? 'Monthly Retainer' : 'Project-Based'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {form.contract_type === 'monthly' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Monthly Amount (Rs)</label>
            <input type="number" step="0.01" className="form-input" value={form.monthly_amount}
              onChange={(e) => set('monthly_amount', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Start Date</label>
            <input type="date" className="form-input" value={form.start_date}
              onChange={(e) => set('start_date', e.target.value)} />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input type="date" className="form-input" value={form.end_date}
              onChange={(e) => set('end_date', e.target.value)} disabled={form.is_ongoing} />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input type="checkbox" id="ongoing" checked={form.is_ongoing}
              onChange={(e) => set('is_ongoing', e.target.checked)} className="accent-zinc-900" />
            <label htmlFor="ongoing" className="text-sm text-zinc-700 cursor-pointer">Ongoing (no end date)</label>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Total Amount (Rs)</label>
            <input type="number" step="0.01" className="form-input" value={form.project_amount}
              onChange={(e) => set('project_amount', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Start Date</label>
            <input type="date" className="form-input" value={form.start_date}
              onChange={(e) => set('start_date', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Delivery Date</label>
            <input type="date" className="form-input" value={form.end_date}
              onChange={(e) => set('end_date', e.target.value)} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label">Status</label>
          <select className="form-input" value={form.status} onChange={(e) => set('status', e.target.value)}>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="form-label">Notes</label>
          <textarea className="form-input resize-none" rows={2} value={form.notes}
            onChange={(e) => set('notes', e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <div className="spinner w-4 h-4" />}
          Save Client
        </button>
      </div>
    </form>
  );
}

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [payClient, setPayClient] = useState(null);
  const [clientPayForm, setClientPayForm] = useState({ amount: '', payment_date: new Date().toISOString().split('T')[0], method: '', notes: '' });
  const [payingClient, setPayingClient] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (search) params.search = search;
      const { data } = await clientsApi.getAll(params);
      setClients(data);
    } catch {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter, search]);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = [...clients].sort((a, b) => {
    let av = a[sortField], bv = b[sortField];
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editClient) {
        await clientsApi.update(editClient.id, form);
        toast.success('Client updated');
      } else {
        await clientsApi.create(form);
        toast.success('Client added');
      }
      setShowModal(false);
      setEditClient(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await clientsApi.delete(deleteId);
      toast.success('Client deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
    setDeleteId(null);
  };

  const handleQuickClientPay = async (e) => {
    e.preventDefault();
    if (!clientPayForm.amount || parseFloat(clientPayForm.amount) <= 0) { toast.error('Amount required'); return; }
    setPayingClient(true);
    try {
      await clientsApi.addPayment(payClient.id, clientPayForm);
      toast.success(`Payment recorded for ${payClient.name}`);
      setPayClient(null);
      load();
    } catch { toast.error('Payment failed'); }
    finally { setPayingClient(false); }
  };

  const openEdit = (client) => {
    setEditClient({
      ...client,
      start_date: client.start_date ? client.start_date.split('T')[0] : '',
      end_date: client.end_date ? client.end_date.split('T')[0] : '',
      monthly_amount: client.monthly_amount || '',
      project_amount: client.project_amount || '',
    });
    setShowModal(true);
  };

  const SortIcon = ({ field }) => (
    <span className="ml-1 opacity-40">
      {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{clients.length} total clients</p>
        </div>
        <button
          onClick={() => { setEditClient(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <span>+</span> Add Client
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-2">
          {['all', 'active', 'overdue', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize
                ${filter === f
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-500 hover:text-zinc-900'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by name or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input sm:w-64"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner fullPage />
        ) : sorted.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No clients found"
            message="Add your first client to get started."
            action={
              <button onClick={() => setShowModal(true)} className="btn-primary">
                Add Client
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  {[
                    ['name', 'Name'],
                    ['service_type', 'Service'],
                    ['contract_type', 'Type'],
                    ['start_date', 'Start'],
                    ['end_date', 'End/Delivery'],
                    ['total_amount', 'Total'],
                    ['total_paid', 'Paid'],
                    ['remaining', 'Remaining'],
                    ['status', 'Status'],
                  ].map(([field, label]) => (
                    <th
                      key={field}
                      onClick={() => handleSort(field)}
                      className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider cursor-pointer hover:text-zinc-900 transition-colors"
                    >
                      {label}<SortIcon field={field} />
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {sorted.map((client) => (
                  <tr key={client.id} className="table-row-hover">
                    <td className="px-4 py-3">
                      <div
                        className="font-medium text-zinc-900 hover:text-blue-600 cursor-pointer transition-colors"
                        onClick={() => navigate(`/clients/${client.id}`)}
                      >
                        {client.name}
                      </div>
                      {client.company && <div className="text-xs text-zinc-400">{client.company}</div>}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{client.service_type || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${client.contract_type === 'monthly' ? 'badge-blue' : 'badge-gray'}`}>
                        {client.contract_type === 'monthly' ? 'Retainer' : 'Project'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{formatDate(client.start_date)}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {client.is_ongoing ? <span className="badge badge-blue">Ongoing</span> : formatDate(client.end_date)}
                    </td>
                    <td className="px-4 py-3 text-zinc-900 font-medium">{formatCurrency(client.total_amount)}</td>
                    <td className="px-4 py-3 text-emerald-600">{formatCurrency(client.total_paid)}</td>
                    <td className="px-4 py-3">
                      <span className={client.remaining > 0 ? 'text-amber-500 font-medium' : 'text-emerald-600'}>
                        {formatCurrency(client.remaining)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className={`badge ${STATUS_COLORS[client.status] || 'badge-gray'} capitalize`}>
                          {client.status?.replace('_', ' ')}
                        </span>
                        {client.alert && (
                          <span className={`badge ${ALERT_COLORS[client.alert]}`}>
                            {ALERT_LABELS[client.alert]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setPayClient(client); setClientPayForm({ amount: '', payment_date: new Date().toISOString().split('T')[0], method: '', notes: '' }); }}
                          className="px-2 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded transition-colors font-medium"
                          title="Add Payment">
                          💰 Pay
                        </button>
                        <button
                          onClick={() => navigate(`/clients/${client.id}`)}
                          className="p-1.5 hover:bg-blue-50 text-zinc-400 hover:text-blue-600 rounded transition-colors"
                          title="View History">👁️</button>
                        <button
                          onClick={() => openEdit(client)}
                          className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 rounded transition-colors"
                          title="Edit">✏️</button>
                        <button
                          onClick={() => setDeleteId(client.id)}
                          className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded transition-colors"
                          title="Delete">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditClient(null); }}
        title={editClient ? 'Edit Client' : 'Add New Client'}
        size="lg"
      >
        <ClientForm
          initial={editClient}
          onSubmit={handleSave}
          loading={saving}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Client"
        message="Are you sure you want to delete this client? All payment records will be permanently deleted."
      />

      <Modal isOpen={!!payClient} onClose={() => setPayClient(null)} title={`Add Payment — ${payClient?.name}`} size="sm">
        <form onSubmit={handleQuickClientPay} className="space-y-4">
          <div className="bg-zinc-50 rounded-lg p-3 text-sm grid grid-cols-3 gap-2 border border-zinc-200">
            <div><p className="text-zinc-500 text-xs">Total</p><p className="text-zinc-900 font-semibold">{formatCurrency(payClient?.total_amount || 0)}</p></div>
            <div><p className="text-zinc-500 text-xs">Paid</p><p className="text-emerald-600 font-semibold">{formatCurrency(payClient?.total_paid || 0)}</p></div>
            <div><p className="text-zinc-500 text-xs">Remaining</p><p className="text-amber-500 font-semibold">{formatCurrency(payClient?.remaining || 0)}</p></div>
          </div>
          <div>
            <label className="form-label">Amount Received (Rs) *</label>
            <input type="number" step="0.01" min="0.01" required className="form-input"
              value={clientPayForm.amount} onChange={(e) => setClientPayForm(f => ({ ...f, amount: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Payment Date *</label>
            <input type="date" required className="form-input"
              value={clientPayForm.payment_date} onChange={(e) => setClientPayForm(f => ({ ...f, payment_date: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Payment Method</label>
            <input className="form-input" placeholder="e.g. Bank Transfer, Cash"
              value={clientPayForm.method} onChange={(e) => setClientPayForm(f => ({ ...f, method: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Notes</label>
            <input className="form-input" value={clientPayForm.notes} onChange={(e) => setClientPayForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={() => setPayClient(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={payingClient} className="btn-primary flex items-center gap-2">
              {payingClient && <div className="spinner w-4 h-4" />} Record Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

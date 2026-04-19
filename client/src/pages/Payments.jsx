import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { paymentsApi } from '../api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/format';
import toast from 'react-hot-toast';

const CATEGORIES = ['Software', 'Tools', 'Marketing', 'Office', 'Other'];
const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

const initialExpenseForm = { category: 'Software', amount: '', expense_date: new Date().toISOString().split('T')[0], description: '' };

export default function Payments() {
  const [tab, setTab] = useState('ledger');
  const [ledger, setLedger] = useState([]);
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '', type: 'all', category: 'all' });
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expenseForm, setExpenseForm] = useState(initialExpenseForm);

  const loadLedger = async () => {
    try {
      const params = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.category !== 'all') params.category = filters.category;
      const { data } = await paymentsApi.getLedger(params);
      setLedger(data);
    } catch {
      toast.error('Failed to load ledger');
    }
  };

  const loadSummary = async () => {
    try {
      const [s, e] = await Promise.all([paymentsApi.getSummary(), paymentsApi.getExpenses()]);
      setSummary(s.data);
      setExpenses(e.data);
    } catch {
      toast.error('Failed to load summary');
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([loadLedger(), loadSummary()]);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => { if (!loading) loadLedger(); }, [filters]);

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Description', 'Category', 'Amount', 'Running Balance'];
    const rows = ledger.map((t) => [
      formatDate(t.date), t.type, `"${t.description || ''}"`,
      t.category, t.amount, t.running_balance,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vybrex-ledger.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    setSaving(true);
    try {
      if (editExpense) {
        await paymentsApi.updateExpense(editExpense.id, expenseForm);
        toast.success('Expense updated');
      } else {
        await paymentsApi.createExpense(expenseForm);
        toast.success('Expense added');
      }
      setShowExpenseModal(false);
      setEditExpense(null);
      setExpenseForm(initialExpenseForm);
      await Promise.all([loadLedger(), loadSummary()]);
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async () => {
    try {
      await paymentsApi.deleteExpense(deleteId);
      toast.success('Expense deleted');
      await Promise.all([loadLedger(), loadSummary()]);
    } catch {
      toast.error('Delete failed');
    }
    setDeleteId(null);
  };

  const openEditExpense = (exp) => {
    setEditExpense(exp);
    setExpenseForm({
      category: exp.category, amount: exp.amount,
      expense_date: exp.expense_date.split('T')[0], description: exp.description || '',
    });
    setShowExpenseModal(true);
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Payments & Expenses</h1>
        <button onClick={() => { setEditExpense(null); setExpenseForm(initialExpenseForm); setShowExpenseModal(true); }}
          className="btn-primary flex items-center gap-2">
          <span>+</span> Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="stat-card">
          <p className="text-xs text-zinc-500 uppercase mb-1">Monthly Income</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary?.monthly_income)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-zinc-500 uppercase mb-1">Monthly Expenses</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(summary?.monthly_expenses)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-zinc-500 uppercase mb-1">Monthly P&L</p>
          <p className={`text-2xl font-bold ${(summary?.monthly_profit || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(summary?.monthly_profit)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-5">
        {['ledger', 'expenses', 'analytics'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize
              ${tab === t ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500 hover:text-zinc-900'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* LEDGER TAB */}
      {tab === 'ledger' && (
        <div className="card">
          {/* Ledger Filters */}
          <div className="p-4 border-b border-zinc-200 flex flex-wrap gap-3">
            <input type="date" className="form-input w-auto" value={filters.from}
              onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
            <input type="date" className="form-input w-auto" value={filters.to}
              onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
            <select className="form-input w-auto" value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select className="form-input w-auto" value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button onClick={exportCSV} className="btn-secondary ml-auto flex items-center gap-2 text-sm">
              📥 Export CSV
            </button>
          </div>

          {ledger.length === 0 ? (
            <EmptyState icon="📒" title="No transactions" message="Transactions will appear here as you add clients and expenses." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs text-zinc-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-right text-xs text-zinc-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-right text-xs text-zinc-500 uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {ledger.map((t) => (
                    <tr key={t.id} className="table-row-hover">
                      <td className="px-4 py-3 text-zinc-500">{formatDate(t.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${t.type === 'income' ? 'badge-green' : 'badge-red'} capitalize`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-900">{t.description}</td>
                      <td className="px-4 py-3 text-zinc-500">{t.category}</td>
                      <td className={`px-4 py-3 text-right font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${t.running_balance >= 0 ? 'text-zinc-900' : 'text-red-600'}`}>
                        {formatCurrency(t.running_balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* EXPENSES TAB */}
      {tab === 'expenses' && (
        <div className="card overflow-hidden">
          {expenses.length === 0 ? (
            <EmptyState icon="💸" title="No expenses recorded"
              action={<button onClick={() => setShowExpenseModal(true)} className="btn-primary">Add Expense</button>} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200">
                    {['Date', 'Category', 'Description', 'Amount', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs text-zinc-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {expenses.map((e) => (
                    <tr key={e.id} className="table-row-hover">
                      <td className="px-4 py-3 text-zinc-500">{formatDate(e.expense_date)}</td>
                      <td className="px-4 py-3"><span className="badge badge-blue">{e.category}</span></td>
                      <td className="px-4 py-3 text-zinc-900">{e.description || '—'}</td>
                      <td className="px-4 py-3 text-red-600 font-medium">{formatCurrency(e.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditExpense(e)}
                            className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 rounded transition-colors">✏️</button>
                          <button onClick={() => setDeleteId(e.id)}
                            className="p-1.5 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded transition-colors">🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {tab === 'analytics' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Expenses by Category</h3>
            {!summary?.expenses_by_category?.length ? (
              <div className="text-center py-12 text-zinc-400">No expense data</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={summary.expenses_by_category} cx="50%" cy="50%" outerRadius={100}
                    dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {summary.expenses_by_category.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', color: '#18181B' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Top 5 Paying Clients</h3>
            {!summary?.top_clients?.length ? (
              <div className="text-center py-12 text-zinc-400">No client data</div>
            ) : (
              <div className="space-y-3">
                {summary.top_clients.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold text-white">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-zinc-900 font-medium truncate">{c.name}</span>
                        <span className="text-sm text-emerald-600 font-semibold ml-2">{formatCurrency(c.amount)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 rounded-full"
                          style={{ width: `${(c.amount / summary.top_clients[0].amount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expense Modal */}
      <Modal isOpen={showExpenseModal} onClose={() => { setShowExpenseModal(false); setEditExpense(null); }}
        title={editExpense ? 'Edit Expense' : 'Add Expense'} size="sm">
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div>
            <label className="form-label">Category</label>
            <select className="form-input" value={expenseForm.category}
              onChange={(e) => setExpenseForm((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Amount (Rs) *</label>
            <input type="number" step="0.01" min="0.01" required className="form-input"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm((f) => ({ ...f, amount: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Date *</label>
            <input type="date" required className="form-input" value={expenseForm.expense_date}
              onChange={(e) => setExpenseForm((f) => ({ ...f, expense_date: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Description</label>
            <input className="form-input" value={expenseForm.description}
              onChange={(e) => setExpenseForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={() => setShowExpenseModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              {saving && <div className="spinner w-4 h-4" />}
              Save
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDeleteExpense}
        title="Delete Expense" message="Delete this expense record?" />
    </div>
  );
}

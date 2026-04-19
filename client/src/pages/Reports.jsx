import { useState, useEffect } from 'react';
import { clientsApi, employeesApi, paymentsApi, settingsApi } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  generateMonthlyRevenueReport,
  generateClientPaymentReport,
  generateEmployeeSalaryReport,
  generateOutstandingReport,
} from '../utils/pdfGenerator';
import { formatCurrency } from '../utils/format';
import toast from 'react-hot-toast';

export default function Reports() {
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState('');

  const [selectedClient, setSelectedClient] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [c, e, l, s] = await Promise.all([
          clientsApi.getAll(),
          employeesApi.getAll({ status: 'all' }),
          paymentsApi.getLedger(),
          settingsApi.get(),
        ]);
        setClients(c.data);
        setEmployees(e.data);
        setLedger(l.data);
        setCompany(s.data);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleMonthlyRevenue = async () => {
    setGenerating('monthly');
    try {
      const [y, m] = month.split('-');
      const from = new Date(parseInt(y), parseInt(m) - 1, 1);
      const to = new Date(parseInt(y), parseInt(m), 0, 23, 59, 59);
      const { data } = await paymentsApi.getLedger({
        from: from.toISOString(), to: to.toISOString(), type: 'income',
      });
      const rows = data.map((t) => ({ ...t, client_name: t.description.replace('Payment from ', '') }));
      generateMonthlyRevenueReport(rows, month, company);
      toast.success('Monthly revenue report downloaded');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGenerating('');
    }
  };

  const handleClientReport = async () => {
    if (!selectedClient) { toast.error('Please select a client'); return; }
    setGenerating('client');
    try {
      const { data: client } = await clientsApi.getOne(selectedClient);
      let payments = client.payments;
      if (dateFrom) payments = payments.filter((p) => new Date(p.payment_date) >= new Date(dateFrom));
      if (dateTo) payments = payments.filter((p) => new Date(p.payment_date) <= new Date(dateTo));
      const dr = dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : 'All Time';
      generateClientPaymentReport(client, payments, dr, company);
      toast.success('Client payment report downloaded');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGenerating('');
    }
  };

  const handleEmployeeReport = async () => {
    if (!selectedEmployee) { toast.error('Please select an employee'); return; }
    setGenerating('employee');
    try {
      const { data: employee } = await employeesApi.getOne(selectedEmployee);
      let payments = employee.salary_payments;
      if (dateFrom) payments = payments.filter((p) => new Date(p.payment_date) >= new Date(dateFrom));
      if (dateTo) payments = payments.filter((p) => new Date(p.payment_date) <= new Date(dateTo));
      const dr = dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : 'All Time';
      generateEmployeeSalaryReport(employee, payments, dr, company);
      toast.success('Employee salary report downloaded');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGenerating('');
    }
  };

  const handleOutstandingReport = async () => {
    setGenerating('outstanding');
    try {
      const { data } = await clientsApi.getAll({ status: 'active' });
      generateOutstandingReport(data, company);
      toast.success('Outstanding payments report downloaded');
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setGenerating('');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const reportCards = [
    {
      id: 'monthly',
      title: 'Monthly Revenue Report',
      description: 'All income for a specific month with totals',
      icon: '📈',
      color: 'emerald',
      fields: (
        <div>
          <label className="form-label">Select Month</label>
          <input type="month" className="form-input" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      ),
      action: handleMonthlyRevenue,
    },
    {
      id: 'client',
      title: 'Client Payment Report',
      description: 'Payment history for a specific client',
      icon: '👥',
      color: 'blue',
      fields: (
        <div className="space-y-3">
          <div>
            <label className="form-label">Select Client *</label>
            <select className="form-input" value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
              <option value="">Choose a client...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ''}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">From</label>
              <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="form-label">To</label>
              <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        </div>
      ),
      action: handleClientReport,
    },
    {
      id: 'employee',
      title: 'Employee Salary Report',
      description: 'Salary payment history for an employee',
      icon: '👤',
      color: 'purple',
      fields: (
        <div className="space-y-3">
          <div>
            <label className="form-label">Select Employee *</label>
            <select className="form-input" value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}>
              <option value="">Choose an employee...</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name} — {e.role || '—'}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">From</label>
              <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="form-label">To</label>
              <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        </div>
      ),
      action: handleEmployeeReport,
    },
    {
      id: 'outstanding',
      title: 'Outstanding Payments Report',
      description: 'All clients with unpaid balances',
      icon: '⏰',
      color: 'red',
      fields: (
        <div className="p-4 bg-zinc-50 rounded-lg border border-zinc-200">
          <p className="text-sm text-zinc-600">
            This report includes all active clients with outstanding balances as of today.
          </p>
          <p className="text-xs text-zinc-400 mt-2">
            Outstanding clients: {clients.filter((c) => c.remaining > 0 && c.status === 'active').length}
            {' · '}Total: {formatCurrency(clients.filter((c) => c.status === 'active').reduce((s, c) => s + (c.remaining || 0), 0))}
          </p>
        </div>
      ),
      action: handleOutstandingReport,
    },
  ];

  const colorMap = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    red: 'bg-red-50 border-red-200 text-red-600',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Generate PDF reports for your business</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {reportCards.map((card) => (
          <div key={card.id} className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border ${colorMap[card.color]}`}>
                {card.icon}
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">{card.title}</h3>
                <p className="text-xs text-zinc-500">{card.description}</p>
              </div>
            </div>

            <div className="mb-5">{card.fields}</div>

            <button
              onClick={card.action}
              disabled={generating === card.id}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {generating === card.id ? (
                <><div className="spinner w-4 h-4" /> Generating...</>
              ) : (
                <><span>📥</span> Download PDF</>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

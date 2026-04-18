import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardApi } from '../api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, formatDate } from '../utils/format';
import toast from 'react-hot-toast';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0F172A] border border-slate-700 rounded-lg p-3">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      <p className="text-white font-bold">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

const AlertBadge = ({ type }) => {
  if (type === 'overdue') return <span className="badge badge-red">Overdue</span>;
  if (type === 'due_soon') return <span className="badge badge-yellow">Due Soon</span>;
  if (type === 'retainer_ending') return <span className="badge badge-orange">Ending Soon</span>;
  return null;
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [s, c, a, act] = await Promise.all([
          dashboardApi.getSummary(),
          dashboardApi.getRevenueChart(),
          dashboardApi.getAlerts(),
          dashboardApi.getActivity(),
        ]);
        setSummary(s.data);
        setChartData(c.data);
        setAlerts(a.data);
        setActivity(act.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          title="Revenue This Month"
          value={formatCurrency(summary?.revenue_this_month)}
          icon="💰"
          color="green"
        />
        <StatCard
          title="Total Outstanding"
          value={formatCurrency(summary?.total_outstanding)}
          icon="⏳"
          color="yellow"
        />
        <StatCard
          title="Active Clients"
          value={summary?.active_clients ?? 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Total Employees"
          value={summary?.active_employees ?? 0}
          icon="👤"
          color="purple"
        />
        <StatCard
          title="Overdue Payments"
          value={summary?.overdue_count ?? 0}
          sub={summary?.overdue_count > 0 ? formatCurrency(summary.overdue_amount) + ' at risk' : 'All clear'}
          icon="🚨"
          color="red"
          alert={summary?.overdue_count > 0}
        />
      </div>

      {/* Charts + Alerts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
            Revenue — Last 6 Months
          </h2>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-600">No revenue data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="month"
                  stroke="#64748B"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                />
                <YAxis
                  stroke="#64748B"
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Alerts Panel */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
            Alerts
          </h2>
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-slate-500 text-sm">No alerts right now</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {alerts.map((alert, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border text-sm ${
                    alert.type === 'overdue'
                      ? 'bg-red-500/10 border-red-500/30'
                      : alert.type === 'due_soon'
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-orange-500/10 border-orange-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-white">{alert.client}</span>
                    <AlertBadge type={alert.type} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {alert.type === 'overdue' && `${alert.days} days overdue · ${formatCurrency(alert.amount)}`}
                    {alert.type === 'due_soon' && `Due in ${alert.days} days · ${formatCurrency(alert.amount)}`}
                    {alert.type === 'retainer_ending' && `Retainer ends in ${alert.days} days`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
          Recent Activity
        </h2>
        {activity.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No activity yet</div>
        ) : (
          <div className="space-y-2">
            {activity.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 text-xs font-bold">
                    {log.user?.name?.[0] || 'S'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{log.action}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {log.user?.name || 'System'} · {formatDate(log.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

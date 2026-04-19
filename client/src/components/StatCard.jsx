export default function StatCard({ title, value, sub, icon, color = 'blue', alert = false }) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    purple: 'text-purple-600 bg-purple-50',
  };

  return (
    <div className={`stat-card ${alert ? 'border-red-400 bg-red-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">{title}</p>
          <p className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-zinc-900'}`}>{value}</p>
          {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 ${colors[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

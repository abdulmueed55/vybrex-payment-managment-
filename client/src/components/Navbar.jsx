import { useLocation } from 'react-router-dom';

const titles = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clients',
  '/employees': 'Employees',
  '/payments': 'Payments & Expenses',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export default function Navbar({ collapsed, setCollapsed }) {
  const { pathname } = useLocation();
  const base = '/' + pathname.split('/')[1];
  const title = titles[base] || 'Vybrex CRM';

  return (
    <header className="h-16 bg-[#1E293B] border-b border-slate-700/50 flex items-center px-4 gap-4">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-lg font-semibold text-white">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-xs text-slate-500">Live</span>
      </div>
    </header>
  );
}

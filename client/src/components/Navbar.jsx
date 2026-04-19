import { useLocation } from 'react-router-dom';

const titles = {
  '/dashboard': 'Dashboard',
  '/clients':   'Clients',
  '/employees': 'Employees',
  '/payments':  'Payments & Expenses',
  '/reports':   'Reports',
  '/settings':  'Settings',
};

export default function Navbar({ collapsed, setCollapsed }) {
  const { pathname } = useLocation();
  const base  = '/' + pathname.split('/')[1];
  const title = titles[base] || 'Vybrex CRM';

  return (
    <header className="h-16 bg-white border-b border-zinc-200 flex items-center px-5 gap-4 sticky top-0 z-10">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-sm font-semibold text-zinc-900">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
        <span className="text-xs text-zinc-400">Online</span>
      </div>
    </header>
  );
}

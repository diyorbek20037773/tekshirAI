import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, MessageSquare, Building2 } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/map', icon: Map, label: 'Xarita' },
  { to: '/feed', icon: MessageSquare, label: 'Signallar' },
  { to: '/facilities', icon: Building2, label: 'Muassasalar' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-slate-900 text-white flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-slate-700/50">
        <h1 className="text-lg font-bold tracking-tight">Real Holat</h1>
        <p className="text-[11px] text-slate-400 mt-0.5">Admin Panel</p>
      </div>
      <nav className="flex-1 py-3 px-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-slate-700/50">
        <p className="text-[10px] text-slate-500">v1.0 — Fuqarolar nazoratchisi</p>
      </div>
    </aside>
  );
}

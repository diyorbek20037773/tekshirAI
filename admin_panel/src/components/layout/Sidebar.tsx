import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, User, LogOut, Shield, BarChart3, Building2, Upload } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/maktab-yuklash', icon: Upload, label: 'Maktab yuklash' },
  { to: '/foydalanuvchilar', icon: Users, label: 'Foydalanuvchilar' },
  { to: '/tekshiruvlar', icon: BarChart3, label: 'Tekshiruvlar' },
  { to: '/direktorlar', icon: Building2, label: 'Direktorlar' },
  { to: '/profil', icon: User, label: 'Profil' },
];

interface Props {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: Props) {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 h-full">
      <div className="px-6 py-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/30 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">TekshirAI</h1>
            <p className="text-[11px] text-slate-400">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700/50">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors w-full"
        >
          <LogOut size={20} />
          Chiqish
        </button>
      </div>
    </aside>
  );
}

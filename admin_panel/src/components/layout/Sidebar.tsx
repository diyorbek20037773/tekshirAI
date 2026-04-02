import { NavLink } from 'react-router-dom';
import { Map, Trophy, BookOpen, AlertTriangle, School, Users, GraduationCap, Clock, Activity, Sparkles, BarChart3, Zap, X } from 'lucide-react';
import { getKPI } from '../../data';
import { formatNumber } from '../../utils/format';

const links = [
  { to: '/', icon: Map, label: 'Xarita' },
  { to: '/reyting', icon: Trophy, label: 'Reyting' },
  { to: '/mavzular', icon: BookOpen, label: 'Mavzular' },
  { to: '/muammolar', icon: AlertTriangle, label: 'Muammolar' },
  { to: '/profil', icon: Users, label: 'Profil' },
];

const kpi = getKPI();

const kpiItems = [
  { icon: School, label: 'Maktablar', value: formatNumber(kpi.jami_maktablar), color: '#3b82f6' },
  { icon: Users, label: "O'quvchilar", value: formatNumber(kpi.jami_oquvchilar), color: '#8b5cf6' },
  { icon: GraduationCap, label: "O'qituvchilar", value: formatNumber(kpi.jami_oqituvchilar), color: '#06b6d4' },
  { icon: Activity, label: 'Davomat', value: kpi.ortacha_davomat + '%', color: '#22c55e' },
  { icon: BarChart3, label: "O'rt. ball", value: kpi.ortacha_ball + '%', color: '#f59e0b' },
  { icon: Zap, label: 'AI tekshiruv', value: formatNumber(kpi.ai_tekshiruvlar), color: '#ec4899' },
  { icon: Sparkles, label: 'Premium', value: formatNumber(kpi.premium_users), color: '#f97316' },
  { icon: Clock, label: 'Tejangan', value: formatNumber(kpi.tejangan_vaqt) + ' soat', color: '#14b8a6' },
];

interface Props {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: Props) {
  return (
    <aside className="w-60 bg-slate-900 text-white flex flex-col shrink-0 h-full">
      <div className="px-5 py-5 border-b border-slate-700/50 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">TekshirAI</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">Xalq ta'limi vazirligi</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-white cursor-pointer">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="py-3 px-3 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
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

      {/* KPI Summary */}
      <div className="flex-1 px-3 py-3 border-t border-slate-700/50 overflow-y-auto">
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Asosiy ko'rsatkichlar</p>
        <div className="space-y-0.5">
          {kpiItems.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-800/50 transition-colors">
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: color + '20' }}>
                <Icon size={12} style={{ color }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-500 leading-tight">{label}</p>
                <p className="text-xs font-bold text-slate-200 leading-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-700/50">
        <p className="text-[10px] text-slate-500">v1.0 — Xalq ta'limi monitoringi</p>
      </div>
    </aside>
  );
}

import { School, Users, GraduationCap, Clock, Activity, Sparkles, BarChart3, Zap } from 'lucide-react';
import { getKPI } from '../../data';
import { formatNumber } from '../../utils/format';
import { useCountUp } from '../../hooks/useCountUp';

const kpi = getKPI();

const items = [
  { icon: School, label: 'Maktablar', raw: kpi.jami_maktablar, suffix: '', color: '#3b82f6' },
  { icon: Users, label: "O'quvchilar", raw: kpi.jami_oquvchilar, suffix: '', color: '#8b5cf6' },
  { icon: GraduationCap, label: "O'qituvchilar", raw: kpi.jami_oqituvchilar, suffix: '', color: '#06b6d4' },
  { icon: Activity, label: 'Davomat', raw: kpi.ortacha_davomat * 10, suffix: '%', color: '#22c55e', divider: 10 },
  { icon: BarChart3, label: "O'rt. ball", raw: kpi.ortacha_ball * 10, suffix: '%', color: '#f59e0b', divider: 10 },
  { icon: Zap, label: 'AI tekshiruv', raw: kpi.ai_tekshiruvlar, suffix: '', color: '#ec4899' },
  { icon: Sparkles, label: 'Premium', raw: kpi.premium_users, suffix: '', color: '#f97316' },
  { icon: Clock, label: 'Tejangan', raw: kpi.tejangan_vaqt, suffix: ' soat', color: '#14b8a6' },
];

function KPIItem({ icon: Icon, label, raw, suffix, color, divider }: typeof items[0] & { divider?: number }) {
  const animated = useCountUp(raw);
  const display = divider ? (animated / divider).toFixed(1) : formatNumber(animated);
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 bg-white rounded-lg sm:rounded-xl border border-slate-100 hover:shadow-sm transition-shadow">
      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + '15' }}>
        <Icon size={12} className="sm:hidden" style={{ color }} />
        <Icon size={14} className="hidden sm:block" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] sm:text-[10px] text-slate-400 leading-tight truncate">{label}</p>
        <p className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">{display}{suffix}</p>
      </div>
    </div>
  );
}

export default function KPIBar() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-1.5 sm:gap-2 p-2 sm:p-4 bg-slate-50 border-b border-slate-200">
      {items.map(item => (
        <KPIItem key={item.label} {...item} />
      ))}
    </div>
  );
}

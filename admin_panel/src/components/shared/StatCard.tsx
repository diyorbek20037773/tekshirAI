import type { LucideIcon } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: string;
  gradient?: boolean;
}

export default function StatCard({ label, value, icon: Icon, color, trend, gradient }: Props) {
  const isNumber = typeof value === 'number';
  const numericValue = isNumber ? value : parseInt(String(value)) || 0;
  const suffix = isNumber ? '' : String(value).replace(/[\d,]/g, '');
  const animated = useCountUp(numericValue);

  if (gradient) {
    return (
      <div
        className="rounded-xl p-5 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
      >
        <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full opacity-15" style={{ backgroundColor: '#fff' }} />
        <div className="absolute -right-1 -bottom-4 w-14 h-14 rounded-full opacity-10" style={{ backgroundColor: '#fff' }} />
        <Icon size={20} className="opacity-80 mb-3" />
        <p className="text-2xl font-bold">{animated.toLocaleString()}{suffix}</p>
        <p className="text-xs opacity-80 mt-1 font-medium">{label}</p>
        {trend && <p className="text-[11px] opacity-70 mt-1">{trend}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 hover:shadow-md transition-shadow duration-300">
      <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + '15' }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{animated.toLocaleString()}{suffix}</p>
        {trend && <p className="text-[11px] text-emerald-600 mt-1">{trend}</p>}
      </div>
    </div>
  );
}

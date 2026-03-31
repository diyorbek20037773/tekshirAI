import type { MetricType } from '../../types';
import { METRIC_LABELS } from '../../types';
import { Info } from 'lucide-react';
import { useState } from 'react';

interface Props {
  metric: MetricType;
}

const LEGENDS: Record<MetricType, {
  colors: string[];
  labels: [string, string];
  description: string;
  items: { color: string; label: string; desc: string }[];
}> = {
  satisfaction: {
    colors: ['#dc2626', '#ef4444', '#f59e0b', '#84cc16', '#22c55e', '#15803d'],
    labels: ['0%', '100%'],
    description: "Fuqarolar tekshiruvlari bo'yicha mamnuniyat darajasi",
    items: [
      { color: '#15803d', label: 'A\'lo', desc: '70% dan yuqori — barcha va\'dalar bajarilgan' },
      { color: '#22c55e', label: 'Yaxshi', desc: '60-70% — aksariyat va\'dalar bajarilgan' },
      { color: '#f59e0b', label: "E'tiborga muhtoj", desc: '40-60% — muammolar mavjud' },
      { color: '#ef4444', label: 'Nosoz', desc: '40% dan past — jiddiy muammolar' },
      { color: '#94a3b8', label: 'Tekshirilmagan', desc: 'Hali fuqarolar tekshirmagan' },
    ],
  },
  problems: {
    colors: ['#fee2e2', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#991b1b'],
    labels: ['Kam', "Ko'p"],
    description: "Aniqlangan muammolar soni — qanchalik to'q bo'lsa, shunchalik ko'p",
    items: [
      { color: '#fee2e2', label: 'Kam', desc: 'Muammolar deyarli yo\'q' },
      { color: '#ef4444', label: "O'rtacha", desc: 'Bir nechta muammo aniqlangan' },
      { color: '#991b1b', label: "Ko'p", desc: 'Jiddiy e\'tibor talab etadi' },
    ],
  },
  inspections: {
    colors: ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1e3a8a'],
    labels: ['Kam', "Ko'p"],
    description: "Fuqarolar tekshiruvlari soni — faollik darajasi",
    items: [
      { color: '#dbeafe', label: 'Kam faollik', desc: 'Fuqarolar kam tekshirgan' },
      { color: '#3b82f6', label: "O'rtacha", desc: 'Faollik mavjud' },
      { color: '#1e3a8a', label: 'Yuqori faollik', desc: 'Eng ko\'p tekshirilgan' },
    ],
  },
  signals: {
    colors: ['#fef3c7', '#fde68a', '#fbbf24', '#f59e0b', '#d97706', '#92400e'],
    labels: ['Kam', "Ko'p"],
    description: "Fuqarolar signallari soni",
    items: [
      { color: '#fef3c7', label: 'Kam', desc: 'Signal deyarli yo\'q' },
      { color: '#f59e0b', label: "O'rtacha", desc: 'Signallar mavjud' },
      { color: '#92400e', label: "Ko'p", desc: 'Eng ko\'p signal' },
    ],
  },
};

export default function MapLegend({ metric }: Props) {
  const legend = LEGENDS[metric];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="absolute bottom-20 right-4 z-[1000]">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden"
        style={{ width: expanded ? 260 : 160 }}>

        {/* Header */}
        <button onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ backgroundColor: legend.colors[3] + '20' }}>
            <Info size={11} style={{ color: legend.colors[3] }} />
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-1 text-left">
            {METRIC_LABELS[metric]}
          </span>
          <svg className={`w-3 h-3 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Gradient bar */}
        <div className="px-3.5 pb-2">
          <div className="flex rounded-lg overflow-hidden h-3 shadow-inner">
            {legend.colors.map((c, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex justify-between mt-1 px-0.5">
            <span className="text-[9px] font-semibold text-slate-400">{legend.labels[0]}</span>
            <span className="text-[9px] font-semibold text-slate-400">{legend.labels[1]}</span>
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="px-3.5 pb-3 border-t border-slate-100 pt-2.5">
            <p className="text-[10px] text-slate-400 leading-relaxed mb-2.5">{legend.description}</p>
            <div className="space-y-1.5">
              {legend.items.map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-sm shrink-0 mt-0.5 shadow-sm"
                    style={{ backgroundColor: item.color }} />
                  <div>
                    <span className="text-[10px] font-bold text-slate-600">{item.label}</span>
                    <span className="text-[10px] text-slate-400 ml-1">— {item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

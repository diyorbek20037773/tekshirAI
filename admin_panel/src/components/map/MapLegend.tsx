import { useState } from 'react';
import type { MapMetricType } from '../../types';
import { MAP_METRIC_LABELS } from '../../types';
import { Info } from 'lucide-react';

interface Props {
  metric: MapMetricType;
}

const LEGENDS: Record<MapMetricType, {
  colors: string[];
  labels: [string, string];
  description: string;
  items: { color: string; label: string; desc: string }[];
}> = {
  ortacha_ball: {
    colors: ['#dc2626', '#ef4444', '#f59e0b', '#84cc16', '#22c55e', '#15803d'],
    labels: ['0%', '100%'],
    description: "O'quvchilarning o'rtacha ball ko'rsatkichi",
    items: [
      { color: '#15803d', label: "A'lo", desc: "75% dan yuqori — a'lo natija" },
      { color: '#22c55e', label: 'Yaxshi', desc: '65-75% — yaxshi daraja' },
      { color: '#f59e0b', label: "O'rtacha", desc: "55-65% — o'rtacha, e'tiborga muhtoj" },
      { color: '#ef4444', label: 'Past', desc: "55% dan past — jiddiy muammo" },
    ],
  },
  davomat: {
    colors: ['#dc2626', '#ef4444', '#f59e0b', '#84cc16', '#22c55e', '#15803d'],
    labels: ['0%', '100%'],
    description: "O'quvchilar davomatining foiz ko'rsatkichi",
    items: [
      { color: '#15803d', label: 'Yuqori', desc: '93%+ — ajoyib davomat' },
      { color: '#22c55e', label: 'Yaxshi', desc: '88-93% — yaxshi' },
      { color: '#f59e0b', label: "O'rtacha", desc: "83-88% — e'tiborga muhtoj" },
      { color: '#ef4444', label: 'Past', desc: '83% dan past — muammoli' },
    ],
  },
  ai_tekshiruvlar: {
    colors: ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1e3a8a'],
    labels: ['Kam', "Ko'p"],
    description: "TekshirAI orqali tekshirilgan vazifalar soni",
    items: [
      { color: '#dbeafe', label: 'Kam', desc: 'Platforma kam ishlatilmoqda' },
      { color: '#3b82f6', label: "O'rtacha", desc: 'Faollik mavjud' },
      { color: '#1e3a8a', label: "Ko'p", desc: 'Eng faol hudud' },
    ],
  },
  sifat: {
    colors: ['#dc2626', '#ef4444', '#f59e0b', '#84cc16', '#22c55e', '#15803d'],
    labels: ['Past', "A'lo"],
    description: "Umumiy ta'lim sifati darajasi",
    items: [
      { color: '#15803d', label: "A'lo", desc: "Barcha ko'rsatkichlar yuqori" },
      { color: '#22c55e', label: 'Yaxshi', desc: "Ko'rsatkichlar yaxshi" },
      { color: '#f59e0b', label: "O'rtacha", desc: "Yaxshilash imkoniyati bor" },
      { color: '#ef4444', label: 'Past', desc: 'Jiddiy chora-tadbirlar kerak' },
    ],
  },
};

export default function MapLegend({ metric }: Props) {
  const legend = LEGENDS[metric];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="absolute bottom-16 right-2 sm:bottom-20 sm:right-4 z-[1000]">
      <div className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden transition-all duration-200 ${
        expanded ? 'w-[200px] sm:w-[260px]' : 'w-[140px] sm:w-[170px]'
      }`}>

        <button onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: legend.colors[3] + '20' }}>
            <Info size={11} style={{ color: legend.colors[3] }} />
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-1 text-left truncate">
            {MAP_METRIC_LABELS[metric]}
          </span>
          <svg className={`w-3 h-3 text-slate-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="px-3 pb-2 sm:px-3.5">
          <div className="flex rounded-lg overflow-hidden h-2.5 sm:h-3 shadow-inner">
            {legend.colors.map((c, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex justify-between mt-1 px-0.5">
            <span className="text-[8px] sm:text-[9px] font-semibold text-slate-400">{legend.labels[0]}</span>
            <span className="text-[8px] sm:text-[9px] font-semibold text-slate-400">{legend.labels[1]}</span>
          </div>
        </div>

        {expanded && (
          <div className="px-3 pb-3 sm:px-3.5 border-t border-slate-100 pt-2.5">
            <p className="text-[10px] text-slate-400 leading-relaxed mb-2.5">{legend.description}</p>
            <div className="space-y-1.5">
              {legend.items.map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <span className="w-3 h-3 rounded-sm shrink-0 mt-0.5 shadow-sm" style={{ backgroundColor: item.color }} />
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

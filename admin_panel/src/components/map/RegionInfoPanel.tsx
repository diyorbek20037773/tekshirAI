import type { MapLevel, MaktabData, MetricType } from '../../types';
import { getHealthColor, getHealthLabel, interpolateColor } from '../../utils/colors';
import { VILOYAT_KOD_TO_NAME } from '../../types';
import { Building2, AlertTriangle, CheckCircle, TrendingUp, MapPin, School, Activity } from 'lucide-react';

type VMetrics = Map<string, { satisfaction: number; problems: number; inspections: number; total: number; checked: number; bajarildi: number; muammo: number }>;
type TMetrics = Map<string, { satisfaction: number; problems: number; inspections: number; total: number; checked: number; bajarildi: number; muammo: number }>;

interface Props {
  level: MapLevel;
  viloyatName: string | null;
  tumanName: string | null;
  maktablar: MaktabData[];
  viloyatMetrics: VMetrics;
  tumanMetrics: TMetrics;
  selectedViloyatKod: string | null;
  metric: MetricType;
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: pct + '%', backgroundColor: color }} />
    </div>
  );
}

export default function RegionInfoPanel({ level, viloyatName, tumanName, maktablar, viloyatMetrics, tumanMetrics, selectedViloyatKod, metric }: Props) {

  // ─── COUNTRY LEVEL: Show all viloyats ranked ───
  if (level === 'country') {
    const ranked = [...viloyatMetrics.entries()]
      .map(([kod, data]) => ({ kod, name: VILOYAT_KOD_TO_NAME[kod] || kod, ...data }))
      .sort((a, b) => {
        if (metric === 'satisfaction') return b.satisfaction - a.satisfaction;
        if (metric === 'problems') return b.problems - a.problems;
        return b.inspections - a.inspections;
      });

    const maxVal = Math.max(1, ...ranked.map(r => metric === 'satisfaction' ? 100 : metric === 'problems' ? r.problems : r.inspections));

    return (
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="flex items-center gap-2 mb-1">
          <Activity size={14} className="text-blue-500" />
          <h3 className="text-xs font-bold text-slate-700">Viloyatlar reytingi</h3>
        </div>
        <p className="text-[10px] text-slate-400 -mt-2">
          {metric === 'satisfaction' ? 'Mamnuniyat foizi bo\'yicha' :
           metric === 'problems' ? 'Muammolar soni bo\'yicha' :
           metric === 'inspections' ? 'Tekshiruvlar bo\'yicha' : 'Signallar bo\'yicha'}
        </p>

        {ranked.map((r, i) => {
          const val = metric === 'satisfaction' ? r.satisfaction : metric === 'problems' ? r.problems : r.inspections;
          const color = metric === 'satisfaction' ? interpolateColor(val, 100) : metric === 'problems' ? '#ef4444' : '#3b82f6';
          return (
            <div key={r.kod} className="group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-slate-300 w-4 text-right">{i + 1}</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-medium text-slate-600 flex-1 truncate">
                  {r.name.replace(' viloyati', '').replace(' shahar', ' sh.').replace(' Respublikasi', '')}
                </span>
                <span className="text-xs font-bold" style={{ color }}>
                  {metric === 'satisfaction' ? val + '%' : val.toLocaleString()}
                </span>
              </div>
              <div className="ml-6">
                <MiniBar value={val} max={maxVal} color={color} />
              </div>
              <div className="ml-6 flex gap-3 mt-0.5">
                <span className="text-[9px] text-slate-400">{r.total} ob'yekt</span>
                <span className="text-[9px] text-emerald-500">{r.bajarildi} bajarildi</span>
                <span className="text-[9px] text-red-400">{r.muammo} muammo</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ─── VILOYAT LEVEL: Show tumans ranked ───
  if (level === 'viloyat') {
    const ranked = [...tumanMetrics.entries()]
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => {
        if (metric === 'satisfaction') return b.satisfaction - a.satisfaction;
        if (metric === 'problems') return b.problems - a.problems;
        return b.inspections - a.inspections;
      });

    const maxVal = Math.max(1, ...ranked.map(r => metric === 'satisfaction' ? 100 : metric === 'problems' ? r.problems : r.inspections));
    const viloyatData = selectedViloyatKod ? viloyatMetrics.get(selectedViloyatKod) : null;

    return (
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {/* Viloyat summary */}
        {viloyatData && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3.5 border border-blue-100/50">
            <h3 className="text-sm font-bold text-slate-700 mb-2">
              {viloyatName?.replace(' viloyati', '').replace(' shahar', '')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/70 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <Building2 size={10} className="text-blue-500" />
                  <span className="text-[9px] text-slate-400">Ob'yektlar</span>
                </div>
                <p className="text-sm font-bold text-slate-700">{viloyatData.total}</p>
              </div>
              <div className="bg-white/70 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <TrendingUp size={10} className="text-emerald-500" />
                  <span className="text-[9px] text-slate-400">Mamnuniyat</span>
                </div>
                <p className="text-sm font-bold" style={{ color: interpolateColor(viloyatData.satisfaction, 100) }}>
                  {viloyatData.satisfaction}%
                </p>
              </div>
              <div className="bg-white/70 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <CheckCircle size={10} className="text-emerald-500" />
                  <span className="text-[9px] text-slate-400">Bajarildi</span>
                </div>
                <p className="text-sm font-bold text-emerald-600">{viloyatData.bajarildi}</p>
              </div>
              <div className="bg-white/70 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <AlertTriangle size={10} className="text-red-500" />
                  <span className="text-[9px] text-slate-400">Muammo</span>
                </div>
                <p className="text-sm font-bold text-red-500">{viloyatData.muammo}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-slate-400" />
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tumanlar ({ranked.length})</h4>
        </div>

        {ranked.map((r, i) => {
          const val = metric === 'satisfaction' ? r.satisfaction : metric === 'problems' ? r.problems : r.inspections;
          const color = metric === 'satisfaction' ? interpolateColor(val, 100) : metric === 'problems' ? '#ef4444' : '#3b82f6';
          return (
            <div key={r.name}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-slate-300 w-4 text-right">{i + 1}</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[11px] font-medium text-slate-600 flex-1 truncate">{r.name.replace(/ [Tt]umani/g, '')}</span>
                <span className="text-[11px] font-bold" style={{ color }}>
                  {metric === 'satisfaction' ? val + '%' : val}
                </span>
              </div>
              <div className="ml-6"><MiniBar value={val} max={maxVal} color={color} /></div>
            </div>
          );
        })}
      </div>
    );
  }

  // ─── TUMAN LEVEL: Show maktablar ───
  const sorted = [...maktablar].sort((a, b) => (a.mamnuniyat_foizi ?? -1) - (b.mamnuniyat_foizi ?? -1));
  const checked = maktablar.filter(m => m.mamnuniyat_foizi !== null);
  const avgSat = checked.length > 0 ? Math.round(checked.reduce((s, m) => s + (m.mamnuniyat_foizi || 0), 0) / checked.length) : null;
  const good = checked.filter(m => (m.mamnuniyat_foizi || 0) >= 70).length;
  const warning = checked.filter(m => (m.mamnuniyat_foizi || 0) >= 40 && (m.mamnuniyat_foizi || 0) < 70).length;
  const bad = checked.filter(m => (m.mamnuniyat_foizi || 0) < 40).length;

  return (
    <div className="flex-1 p-4 space-y-3 overflow-y-auto">
      {/* Tuman summary */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-3.5 border border-slate-200/50">
        <h3 className="text-sm font-bold text-slate-700 mb-0.5">{tumanName?.replace(/ [Tt]umani/g, '')}</h3>
        <p className="text-[10px] text-slate-400 mb-2">{viloyatName}</p>

        <div className="flex items-center gap-4">
          {/* Donut */}
          <div className="relative w-16 h-16 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              {avgSat !== null && (
                <circle cx="20" cy="20" r="16" fill="none"
                  stroke={interpolateColor(avgSat, 100)} strokeWidth="4"
                  strokeDasharray={`${avgSat * 1.005} 100`} strokeLinecap="round" />
              )}
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-700">
              {avgSat !== null ? avgSat + '%' : '—'}
            </span>
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span className="text-[11px] text-slate-500 flex-1">Yaxshi (70%+)</span>
              <span className="text-[11px] font-bold text-slate-700">{good}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span className="text-[11px] text-slate-500 flex-1">E'tiborga muhtoj</span>
              <span className="text-[11px] font-bold text-slate-700">{warning}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500" />
              <span className="text-[11px] text-slate-500 flex-1">Nosoz (&lt;40%)</span>
              <span className="text-[11px] font-bold text-slate-700">{bad}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
              <span className="text-[11px] text-slate-500 flex-1">Tekshirilmagan</span>
              <span className="text-[11px] font-bold text-slate-700">{maktablar.length - checked.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* School list */}
      <div className="flex items-center gap-2">
        <School size={12} className="text-slate-400" />
        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Muassasalar ({maktablar.length})</h4>
      </div>

      <div className="space-y-1">
        {sorted.map(m => (
          <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: getHealthColor(m.mamnuniyat_foizi) + '20' }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getHealthColor(m.mamnuniyat_foizi) }} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-slate-700 truncate">{m.nom}</p>
              <p className="text-[9px] text-slate-400">{getHealthLabel(m.mamnuniyat_foizi)} | {m.jami_tekshiruv} tekshiruv</p>
            </div>
            <span className="text-[11px] font-bold shrink-0" style={{ color: getHealthColor(m.mamnuniyat_foizi) }}>
              {m.mamnuniyat_foizi !== null ? m.mamnuniyat_foizi + '%' : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

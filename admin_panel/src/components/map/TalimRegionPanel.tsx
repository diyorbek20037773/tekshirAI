import type { MapLevel, ViloyatTalimStats, TumanTalimStats, MapMetricType } from '../../types';
import { interpolateColor, getScoreColor } from '../../utils/colors';
import { Activity, MapPin, School, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { formatNumber } from '../../utils/format';

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: pct + '%', backgroundColor: color }} />
    </div>
  );
}

interface Props {
  level: MapLevel;
  viloyatName: string | null;
  viloyatKod: string | null;
  tumanName: string | null;
  viloyatStats: ViloyatTalimStats[];
  tumanStats: TumanTalimStats[];
  metric: MapMetricType;
}

export default function TalimRegionPanel({ level, viloyatKod, tumanName, viloyatStats, tumanStats, metric }: Props) {
  // COUNTRY: Show viloyats ranked
  if (level === 'country') {
    const ranked = [...viloyatStats].sort((a, b) => {
      if (metric === 'ortacha_ball' || metric === 'sifat') return b.ortacha_ball - a.ortacha_ball;
      if (metric === 'davomat') return b.davomat_foizi - a.davomat_foizi;
      return b.ai_tekshiruvlar - a.ai_tekshiruvlar;
    });

    return (
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="flex items-center gap-2 mb-1">
          <Activity size={14} className="text-blue-500" />
          <h3 className="text-xs font-bold text-slate-700">Viloyatlar reytingi</h3>
        </div>
        <p className="text-[10px] text-slate-400 -mt-2">
          {metric === 'ortacha_ball' || metric === 'sifat' ? "O'rtacha ball bo'yicha" :
           metric === 'davomat' ? "Davomat foizi bo'yicha" : "AI tekshiruvlar bo'yicha"}
        </p>

        {ranked.map((r, i) => {
          const val = metric === 'ortacha_ball' || metric === 'sifat' ? r.ortacha_ball :
                      metric === 'davomat' ? r.davomat_foizi : r.ai_tekshiruvlar;
          const maxVal = metric === 'ai_tekshiruvlar' ? Math.max(1, ...viloyatStats.map(v => v.ai_tekshiruvlar)) : 100;
          const color = metric === 'ai_tekshiruvlar' ? '#3b82f6' : interpolateColor(val, 100);
          const displayVal = metric === 'ai_tekshiruvlar' ? formatNumber(val) : val + '%';

          return (
            <div key={r.kod} className="group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-slate-300 w-4 text-right">{i + 1}</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-medium text-slate-600 flex-1 truncate">
                  {r.nom.replace(' viloyati', '').replace(' shahar', ' sh.').replace(' Respublikasi', '')}
                </span>
                <span className="text-xs font-bold" style={{ color }}>{displayVal}</span>
              </div>
              <div className="ml-6">
                <MiniBar value={val} max={maxVal} color={color} />
              </div>
              <div className="ml-6 flex gap-3 mt-0.5">
                <span className="text-[9px] text-slate-400">{formatNumber(r.maktablar_soni)} maktab</span>
                <span className="text-[9px] text-blue-500">{formatNumber(r.oquvchilar_soni)} o'quvchi</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // VILOYAT: Show tuman breakdown
  if (level === 'viloyat' || level === 'tuman') {
    const viloyat = viloyatStats.find(v => v.kod === viloyatKod);

    const ranked = [...tumanStats].sort((a, b) => {
      if (metric === 'ortacha_ball' || metric === 'sifat') return b.ortacha_ball - a.ortacha_ball;
      if (metric === 'davomat') return b.davomat_foizi - a.davomat_foizi;
      return b.ai_tekshiruvlar - a.ai_tekshiruvlar;
    });

    return (
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {/* Viloyat summary */}
        {viloyat && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3.5 border border-blue-100/50">
            <h3 className="text-sm font-bold text-slate-700 mb-2">
              {viloyat.nom.replace(' viloyati', '').replace(' shahar', '')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/70 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <School size={10} className="text-blue-500" />
                  <span className="text-[9px] text-slate-400">Maktablar</span>
                </div>
                <p className="text-sm font-bold text-slate-700">{formatNumber(viloyat.maktablar_soni)}</p>
              </div>
              <div className="bg-white/70 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <TrendingUp size={10} className="text-emerald-500" />
                  <span className="text-[9px] text-slate-400">O'rt. ball</span>
                </div>
                <p className="text-sm font-bold" style={{ color: getScoreColor(viloyat.ortacha_ball) }}>
                  {viloyat.ortacha_ball}%
                </p>
              </div>
              <div className="bg-white/70 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <Users size={10} className="text-violet-500" />
                  <span className="text-[9px] text-slate-400">O'quvchilar</span>
                </div>
                <p className="text-sm font-bold text-slate-700">{formatNumber(viloyat.oquvchilar_soni)}</p>
              </div>
              <div className="bg-white/70 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <BarChart3 size={10} className="text-amber-500" />
                  <span className="text-[9px] text-slate-400">Davomat</span>
                </div>
                <p className="text-sm font-bold text-amber-600">{viloyat.davomat_foizi}%</p>
              </div>
            </div>

            {/* Zaif mavzular */}
            {viloyat.eng_zaif_mavzular.length > 0 && (
              <div className="mt-2 pt-2 border-t border-blue-100/50">
                <p className="text-[9px] text-slate-400 font-medium mb-1">Eng zaif mavzular ({viloyat.eng_zaif_fan}):</p>
                <div className="flex flex-wrap gap-1">
                  {viloyat.eng_zaif_mavzular.map(m => (
                    <span key={m} className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-medium rounded">{m}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tuman selected detail */}
        {level === 'tuman' && tumanName && (() => {
          const tuman = tumanStats.find(t => t.nom === tumanName);
          if (!tuman) return null;
          return (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3.5 border border-emerald-100/50">
              <h3 className="text-sm font-bold text-slate-700 mb-1">{tumanName.replace(/ [Tt]umani/g, '')}</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-slate-700">{tuman.maktablar_soni}</p>
                  <p className="text-[8px] text-slate-400">Maktab</p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold" style={{ color: getScoreColor(tuman.ortacha_ball) }}>{tuman.ortacha_ball}%</p>
                  <p className="text-[8px] text-slate-400">Ball</p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-sm font-bold text-amber-600">{tuman.davomat_foizi}%</p>
                  <p className="text-[8px] text-slate-400">Davomat</p>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-slate-400" />
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tumanlar ({ranked.length})</h4>
        </div>

        {ranked.map((r, i) => {
          const val = metric === 'ortacha_ball' || metric === 'sifat' ? r.ortacha_ball :
                      metric === 'davomat' ? r.davomat_foizi : r.ai_tekshiruvlar;
          const maxVal = metric === 'ai_tekshiruvlar' ? Math.max(1, ...tumanStats.map(t => t.ai_tekshiruvlar)) : 100;
          const color = metric === 'ai_tekshiruvlar' ? '#3b82f6' : interpolateColor(val, 100);
          const isActive = tumanName === r.nom;

          return (
            <div key={r.nom} className={`rounded-lg transition-colors ${isActive ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-slate-300 w-4 text-right">{i + 1}</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[11px] font-medium text-slate-600 flex-1 truncate">{r.nom.replace(/ [Tt]umani/g, '')}</span>
                <span className="text-[11px] font-bold" style={{ color }}>
                  {metric === 'ai_tekshiruvlar' ? formatNumber(val) : val + '%'}
                </span>
              </div>
              <div className="ml-6"><MiniBar value={val} max={maxVal} color={color} /></div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

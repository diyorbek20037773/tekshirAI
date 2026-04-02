import { useState } from 'react';
import type { MapLevel, ViloyatTalimStats, TumanTalimStats, MapMetricType, MaktabData, SinfData } from '../../types';
import { interpolateColor, getScoreColor } from '../../utils/colors';
import { generateSinflar, generateOquvchilar } from '../../data';
import { Activity, MapPin, School, TrendingUp, Users, BarChart3, ChevronLeft, GraduationCap, Sparkles, Flame } from 'lucide-react';
import { formatNumber } from '../../utils/format';

const CAREER_MAP: Record<string, { emoji: string; label: string }> = {
  Matematika: { emoji: '💻', label: 'IT/Muhandislik' },
  Fizika: { emoji: '⚙️', label: 'Muhandis' },
  Kimyo: { emoji: '🔬', label: 'Farmatsevt/Olim' },
  Biologiya: { emoji: '🏥', label: 'Shifokor/Olim' },
  Informatika: { emoji: '💻', label: 'Dasturchi/IT' },
  'Ingliz tili': { emoji: '🌍', label: 'Tarjimon/Diplomat' },
  'Ona tili': { emoji: '✍️', label: 'Jurnalist/Yozuvchi' },
  Tarix: { emoji: '⚖️', label: 'Huquqshunos' },
};

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
  maktablar: MaktabData[];
  selectedMaktab: MaktabData | null;
  metric: MapMetricType;
  onSelectMaktab: (m: MaktabData) => void;
}

export default function TalimRegionPanel({ level, viloyatKod, tumanName, viloyatStats, tumanStats, maktablar, selectedMaktab, metric, onSelectMaktab }: Props) {
  const [selectedSinf, setSelectedSinf] = useState<SinfData | null>(null);

  // ─── MAKTAB LEVEL: sinflar va o'quvchilar ───
  if (level === 'maktab' && selectedMaktab) {
    const sinflar = generateSinflar(selectedMaktab.id, selectedMaktab.ortacha_ball);

    // O'quvchilar ko'rinishi
    if (selectedSinf) {
      const oquvchilar = generateOquvchilar(selectedSinf.id, selectedSinf.ortacha_ball, selectedSinf.oquvchilar_soni);
      return (
        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          <button onClick={() => setSelectedSinf(null)}
            className="flex items-center gap-1.5 text-xs text-blue-600 font-medium hover:text-blue-800 cursor-pointer mb-1">
            <ChevronLeft size={14} /> Sinflarga qaytish
          </button>

          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-3.5 border border-violet-100/50">
            <h3 className="text-sm font-bold text-slate-700">{selectedSinf.nom} sinf</h3>
            <p className="text-[10px] text-slate-400">{selectedMaktab.nom}</p>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <div className="bg-white/70 rounded-lg p-2 text-center">
                <p className="text-sm font-bold" style={{ color: getScoreColor(selectedSinf.ortacha_ball) }}>{selectedSinf.ortacha_ball}%</p>
                <p className="text-[8px] text-slate-400">Ball</p>
              </div>
              <div className="bg-white/70 rounded-lg p-2 text-center">
                <p className="text-sm font-bold text-slate-700">{selectedSinf.oquvchilar_soni}</p>
                <p className="text-[8px] text-slate-400">O'quvchi</p>
              </div>
              <div className="bg-white/70 rounded-lg p-2 text-center">
                <p className="text-sm font-bold text-amber-600">{selectedSinf.davomat_foizi}%</p>
                <p className="text-[8px] text-slate-400">Davomat</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Sinf rahbari: <span className="font-medium text-slate-600">{selectedSinf.sinf_rahbari}</span></p>
          </div>

          <div className="flex items-center gap-2">
            <GraduationCap size={12} className="text-slate-400" />
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">O'quvchilar ({oquvchilar.length})</h4>
          </div>

          <div className="space-y-0.5">
            {oquvchilar.map((o, i) => {
              const career = CAREER_MAP[o.eng_kuchli_fan] || { emoji: '📚', label: 'Turli yo\'nalishlar' };
              return (
                <div key={o.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="text-[10px] font-bold text-slate-300 w-4 text-right">{i + 1}</span>
                  <img src={o.isMale ? '/avatars/boy.jpg' : '/avatars/girl.jpg'}
                    alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-slate-700 truncate">{o.familiya} {o.ism}</p>
                    <div className="flex gap-2 items-center">
                      <span className="text-[9px] text-slate-400">Kuchli: {o.eng_kuchli_fan}</span>
                      <span className="text-[8px] text-purple-500 bg-purple-50 px-1 py-0.5 rounded">{career.emoji} {career.label}</span>
                      {o.is_premium && <Sparkles size={9} className="text-amber-500" />}
                      {o.streak_days > 5 && <span className="flex items-center gap-0.5 text-[9px] text-orange-500"><Flame size={9} />{o.streak_days}k</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-bold" style={{ color: getScoreColor(o.ortacha_ball) }}>{o.ortacha_ball}%</p>
                    <p className="text-[9px] text-slate-400">Dav: {o.davomat_foizi}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Sinflar jadvali
    const sinflarByGrade = new Map<number, SinfData[]>();
    for (const s of sinflar) {
      const arr = sinflarByGrade.get(s.sinf_raqami) || [];
      arr.push(s);
      sinflarByGrade.set(s.sinf_raqami, arr);
    }

    return (
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3.5 border border-blue-100/50">
          <h3 className="text-sm font-bold text-slate-700">{selectedMaktab.nom}</h3>
          <p className="text-[10px] text-slate-400 mb-2">{selectedMaktab.tuman}, {selectedMaktab.viloyat}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/70 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5"><TrendingUp size={10} className="text-emerald-500" /><span className="text-[9px] text-slate-400">O'rt. ball</span></div>
              <p className="text-sm font-bold" style={{ color: getScoreColor(selectedMaktab.ortacha_ball) }}>{selectedMaktab.ortacha_ball}%</p>
            </div>
            <div className="bg-white/70 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5"><Users size={10} className="text-violet-500" /><span className="text-[9px] text-slate-400">O'quvchilar</span></div>
              <p className="text-sm font-bold text-slate-700">{selectedMaktab.oquvchilar_soni}</p>
            </div>
            <div className="bg-white/70 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5"><School size={10} className="text-blue-500" /><span className="text-[9px] text-slate-400">Sinflar</span></div>
              <p className="text-sm font-bold text-slate-700">{sinflar.length}</p>
            </div>
            <div className="bg-white/70 rounded-lg p-2">
              <div className="flex items-center gap-1 mb-0.5"><BarChart3 size={10} className="text-amber-500" /><span className="text-[9px] text-slate-400">Davomat</span></div>
              <p className="text-sm font-bold text-amber-600">{selectedMaktab.davomat_foizi}%</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <School size={12} className="text-slate-400" />
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sinflar ({sinflar.length})</h4>
        </div>

        {/* Sinf jadvali */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500">Sinf</th>
                <th className="px-2 py-2 text-center text-[10px] font-semibold text-slate-500">O'quv.</th>
                <th className="px-2 py-2 text-center text-[10px] font-semibold text-slate-500">Ball</th>
                <th className="px-2 py-2 text-center text-[10px] font-semibold text-slate-500">Dav.</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(sinflarByGrade.entries()).sort((a, b) => a[0] - b[0]).map(([grade, items]) => (
                items.map((s, idx) => (
                  <tr key={s.id}
                    onClick={() => setSelectedSinf(s)}
                    className={`border-t border-slate-50 hover:bg-blue-50/50 transition-colors cursor-pointer ${idx === 0 && grade > 1 ? 'border-t-slate-200' : ''}`}>
                    <td className="px-3 py-2">
                      <span className="text-xs font-semibold text-slate-700">{s.nom}</span>
                    </td>
                    <td className="px-2 py-2 text-center text-[11px] text-slate-600">{s.oquvchilar_soni}</td>
                    <td className="px-2 py-2 text-center">
                      <span className="text-[11px] font-bold" style={{ color: getScoreColor(s.ortacha_ball) }}>{s.ortacha_ball}%</span>
                    </td>
                    <td className="px-2 py-2 text-center text-[11px] text-slate-600">{s.davomat_foizi}%</td>
                  </tr>
                ))
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ─── TUMAN LEVEL: maktablar ro'yxati ───
  if (level === 'tuman' && tumanName) {
    const viloyat = viloyatStats.find(v => v.kod === viloyatKod);
    const tuman = tumanStats.find(t => t.nom === tumanName);

    const sortedMaktablar = [...maktablar].sort((a, b) => b.ortacha_ball - a.ortacha_ball);

    return (
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {tuman && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3.5 border border-emerald-100/50">
            <h3 className="text-sm font-bold text-slate-700 mb-1">{tumanName.replace(/ [Tt]umani/g, '')}</h3>
            <p className="text-[10px] text-slate-400 mb-2">{viloyat?.nom}</p>
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
        )}

        <div className="flex items-center gap-2">
          <School size={12} className="text-slate-400" />
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Maktablar ({maktablar.length})</h4>
        </div>

        <div className="space-y-1">
          {sortedMaktablar.map((m, i) => (
            <div key={m.id} onClick={() => onSelectMaktab(m)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group">
              <span className="text-[10px] font-bold text-slate-300 w-4 text-right">{i + 1}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: getScoreColor(m.ortacha_ball) + '20' }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getScoreColor(m.ortacha_ball) }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate-700 truncate">{m.nom}</p>
                <p className="text-[9px] text-slate-400">{m.oquvchilar_soni} o'quvchi | {m.sinflar_soni} sinf</p>
              </div>
              <span className="text-[11px] font-bold shrink-0" style={{ color: getScoreColor(m.ortacha_ball) }}>{m.ortacha_ball}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── COUNTRY LEVEL ───
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
              <div className="ml-6"><MiniBar value={val} max={maxVal} color={color} /></div>
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

  // ─── VILOYAT LEVEL ───
  if (level === 'viloyat') {
    const viloyat = viloyatStats.find(v => v.kod === viloyatKod);
    const ranked = [...tumanStats].sort((a, b) => {
      if (metric === 'ortacha_ball' || metric === 'sifat') return b.ortacha_ball - a.ortacha_ball;
      if (metric === 'davomat') return b.davomat_foizi - a.davomat_foizi;
      return b.ai_tekshiruvlar - a.ai_tekshiruvlar;
    });

    return (
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {viloyat && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3.5 border border-blue-100/50">
            <h3 className="text-sm font-bold text-slate-700 mb-2">
              {viloyat.nom.replace(' viloyati', '').replace(' shahar', '')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/70 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-0.5"><School size={10} className="text-blue-500" /><span className="text-[9px] text-slate-400">Maktablar</span></div>
                <p className="text-sm font-bold text-slate-700">{formatNumber(viloyat.maktablar_soni)}</p>
              </div>
              <div className="bg-white/70 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-0.5"><TrendingUp size={10} className="text-emerald-500" /><span className="text-[9px] text-slate-400">O'rt. ball</span></div>
                <p className="text-sm font-bold" style={{ color: getScoreColor(viloyat.ortacha_ball) }}>{viloyat.ortacha_ball}%</p>
              </div>
              <div className="bg-white/70 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-0.5"><Users size={10} className="text-violet-500" /><span className="text-[9px] text-slate-400">O'quvchilar</span></div>
                <p className="text-sm font-bold text-slate-700">{formatNumber(viloyat.oquvchilar_soni)}</p>
              </div>
              <div className="bg-white/70 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-0.5"><BarChart3 size={10} className="text-amber-500" /><span className="text-[9px] text-slate-400">Davomat</span></div>
                <p className="text-sm font-bold text-amber-600">{viloyat.davomat_foizi}%</p>
              </div>
            </div>
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

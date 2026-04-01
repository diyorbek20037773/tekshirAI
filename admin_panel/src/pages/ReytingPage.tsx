import { useState, useMemo } from 'react';
import TopBar from '../components/layout/TopBar';
import KPIBar from '../components/shared/KPIBar';
import QualityBadge from '../components/shared/QualityBadge';
import { generateViloyatStats } from '../data';
import { interpolateColor } from '../utils/colors';
import { formatNumber } from '../utils/format';
import { Trophy, AlertTriangle, ArrowUpDown } from 'lucide-react';

type SortKey = 'ortacha_ball' | 'davomat_foizi' | 'maktablar_soni' | 'oquvchilar_soni' | 'ai_tekshiruvlar';

const MEDAL = ['text-yellow-500', 'text-slate-400', 'text-amber-600'];

export default function ReytingPage() {
  const viloyatlar = useMemo(() => generateViloyatStats(), []);
  const [sortKey, setSortKey] = useState<SortKey>('ortacha_ball');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...viloyatlar].sort((a, b) => {
      const diff = (a[sortKey] as number) - (b[sortKey] as number);
      return sortAsc ? diff : -diff;
    });
  }, [viloyatlar, sortKey, sortAsc]);

  const top5 = useMemo(() => [...viloyatlar].sort((a, b) => b.ortacha_ball - a.ortacha_ball).slice(0, 5), [viloyatlar]);
  const worst = useMemo(() => [...viloyatlar].sort((a, b) => a.ortacha_ball - b.ortacha_ball).slice(0, 3), [viloyatlar]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-blue-600 select-none"
        onClick={() => handleSort(field)}>
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={10} className={sortKey === field ? 'text-blue-600' : 'text-slate-300'} />
      </span>
    </th>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Reyting" subtitle="Viloyatlar bo'yicha ta'lim sifati" />
      <KPIBar />

      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Top 5 & Worst */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* TOP 5 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={18} className="text-yellow-500" />
              <h3 className="text-sm font-bold text-slate-700">TOP 5 eng yaxshi viloyatlar</h3>
            </div>
            <div className="space-y-3">
              {top5.map((v, i) => (
                <div key={v.kod} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className={`text-2xl font-black w-8 text-center ${i < 3 ? MEDAL[i] : 'text-slate-300'}`}>
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">
                      {v.nom.replace(' viloyati', '').replace(' shahar', '').replace(' Respublikasi', '')}
                    </p>
                    <div className="flex gap-3 mt-0.5">
                      <span className="text-[10px] text-slate-400">{formatNumber(v.maktablar_soni)} maktab</span>
                      <span className="text-[10px] text-blue-500">Davomat: {v.davomat_foizi}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black" style={{ color: interpolateColor(v.ortacha_ball, 100) }}>
                      {v.ortacha_ball}%
                    </p>
                    <QualityBadge sifat={v.sifat_darajasi} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WORST */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-red-500" />
              <h3 className="text-sm font-bold text-slate-700">E'tiborga muhtoj viloyatlar</h3>
            </div>
            <div className="space-y-3">
              {worst.map((v) => (
                <div key={v.kod} className="p-3 bg-red-50/50 rounded-xl border border-red-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-slate-700">
                      {v.nom.replace(' viloyati', '').replace(' shahar', '').replace(' Respublikasi', '')}
                    </p>
                    <p className="text-lg font-black text-red-500">{v.ortacha_ball}%</p>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full" style={{ width: v.ortacha_ball + '%', backgroundColor: interpolateColor(v.ortacha_ball, 100) }} />
                  </div>
                  <div className="flex gap-3 text-[10px]">
                    <span className="text-slate-400">Davomat: {v.davomat_foizi}%</span>
                    <span className="text-slate-400">Maktablar: {formatNumber(v.maktablar_soni)}</span>
                    <span className="text-red-400">Zaif fan: {v.eng_zaif_fan}</span>
                  </div>
                  {v.eng_zaif_mavzular.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {v.eng_zaif_mavzular.map(m => (
                        <span key={m} className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[9px] font-medium rounded">{m}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Full Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">Barcha viloyatlar</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase w-8">#</th>
                  <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">Viloyat</th>
                  <SortHeader label="Maktablar" field="maktablar_soni" />
                  <SortHeader label="O'quvchilar" field="oquvchilar_soni" />
                  <SortHeader label="O'rt. ball" field="ortacha_ball" />
                  <SortHeader label="Davomat" field="davomat_foizi" />
                  <SortHeader label="AI tekshiruv" field="ai_tekshiruvlar" />
                  <th className="px-3 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase">Sifat</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((v, i) => (
                  <tr key={v.kod} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-3 text-xs font-bold text-slate-300">{i + 1}</td>
                    <td className="px-3 py-3">
                      <p className="text-sm font-medium text-slate-700">
                        {v.nom.replace(' viloyati', '').replace(' shahar', '').replace(' Respublikasi', '')}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-600">{formatNumber(v.maktablar_soni)}</td>
                    <td className="px-3 py-3 text-sm text-slate-600">{formatNumber(v.oquvchilar_soni)}</td>
                    <td className="px-3 py-3">
                      <span className="text-sm font-bold" style={{ color: interpolateColor(v.ortacha_ball, 100) }}>
                        {v.ortacha_ball}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-600">{v.davomat_foizi}%</td>
                    <td className="px-3 py-3 text-sm text-slate-600">{formatNumber(v.ai_tekshiruvlar)}</td>
                    <td className="px-3 py-3"><QualityBadge sifat={v.sifat_darajasi} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { MaktabData } from '../../types';
import { getHealthColor } from '../../utils/colors';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  best: MaktabData[];
  worst: MaktabData[];
}

function FacilityRow({ m, rank }: { m: MaktabData; rank: number }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span className="text-[11px] font-bold text-slate-300 w-4 text-right">{rank}</span>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getHealthColor(m.mamnuniyat_foizi) }} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-700 truncate">{m.nom}</p>
      </div>
      <span className="text-xs font-bold shrink-0" style={{ color: getHealthColor(m.mamnuniyat_foizi) }}>
        {m.mamnuniyat_foizi ?? '—'}%
      </span>
    </div>
  );
}

export default function TopFacilities({ best, worst }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-emerald-500" />
          <h3 className="text-sm font-semibold text-slate-700">Eng yaxshi 5 ta</h3>
        </div>
        <div className="space-y-0.5">
          {best.map((m, i) => <FacilityRow key={m.id} m={m} rank={i + 1} />)}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown size={14} className="text-red-500" />
          <h3 className="text-sm font-semibold text-slate-700">Eng yomon 5 ta</h3>
        </div>
        <div className="space-y-0.5">
          {worst.map((m, i) => <FacilityRow key={m.id} m={m} rank={i + 1} />)}
        </div>
      </div>
    </div>
  );
}

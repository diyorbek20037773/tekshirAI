import type { MaktabData } from '../../types';
import { getHealthColor, getHealthLabel } from '../../utils/colors';

interface Props {
  data: MaktabData[];
  onSelect: (id: number) => void;
  selectedId: number | null;
}

export default function FacilitiesTable({ data, onSelect, selectedId }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="text-left px-4 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Nom</th>
            <th className="text-left px-4 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Viloyat</th>
            <th className="text-left px-4 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Tuman</th>
            <th className="text-center px-4 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Mamnuniyat</th>
            <th className="text-center px-4 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Tekshiruvlar</th>
            <th className="text-center px-4 py-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide">Holat</th>
          </tr>
        </thead>
        <tbody>
          {data.map(m => (
            <tr
              key={m.id}
              onClick={() => onSelect(m.id)}
              className={`border-b border-slate-100 cursor-pointer transition-colors ${
                selectedId === m.id ? 'bg-blue-50' : 'hover:bg-slate-50'
              }`}
            >
              <td className="px-4 py-2.5">
                <p className="font-medium text-slate-700 truncate max-w-[200px]">{m.nom}</p>
              </td>
              <td className="px-4 py-2.5 text-slate-500 text-xs">{m.viloyat}</td>
              <td className="px-4 py-2.5 text-slate-500 text-xs">{m.tuman}</td>
              <td className="px-4 py-2.5 text-center">
                {m.mamnuniyat_foizi !== null ? (
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: m.mamnuniyat_foizi + '%', backgroundColor: getHealthColor(m.mamnuniyat_foizi) }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: getHealthColor(m.mamnuniyat_foizi) }}>{m.mamnuniyat_foizi}%</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-300">—</span>
                )}
              </td>
              <td className="px-4 py-2.5 text-center text-xs text-slate-600">{m.jami_tekshiruv}</td>
              <td className="px-4 py-2.5 text-center">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: getHealthColor(m.mamnuniyat_foizi) }}>
                  {getHealthLabel(m.mamnuniyat_foizi)}
                </span>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-sm">Ma'lumot topilmadi</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

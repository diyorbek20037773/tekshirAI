import { useState, useEffect } from 'react';
import { fetchMaktabDetail } from '../../api/maktablar';
import { getHealthColor } from '../../utils/colors';
import { X } from 'lucide-react';

interface Props {
  maktabId: number;
  onClose: () => void;
}

interface VaadaItem {
  id: number;
  nom: string;
  icon: string;
  foiz: number;
  jami_tekshiruv: number;
  bajarildi_soni: number;
  muammo_soni: number;
}

export default function FacilityDetail({ maktabId, onClose }: Props) {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchMaktabDetail(maktabId).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [maktabId]);

  if (loading) return (
    <div className="w-80 bg-white border-l border-slate-200 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return null;

  const vaadalar = (data.vaadalar as VaadaItem[]) || [];
  const foiz = data.mamnuniyat_foizi as number | null;

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 border-b border-slate-200 flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-700 truncate">{data.nom as string}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{data.viloyat as string}, {data.tuman as string}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 cursor-pointer">
          <X size={16} className="text-slate-400" />
        </button>
      </div>

      {/* Satisfaction */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">Mamnuniyat</span>
          <span className="text-lg font-bold" style={{ color: foiz !== null ? getHealthColor(foiz) : '#94a3b8' }}>
            {foiz !== null ? foiz + '%' : '—'}
          </span>
        </div>
        {foiz !== null && (
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: foiz + '%', backgroundColor: getHealthColor(foiz) }} />
          </div>
        )}
      </div>

      {/* Promises */}
      <div className="p-4 flex-1">
        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">Va'dalar</h4>
        <div className="space-y-2">
          {vaadalar.map(v => (
            <div key={v.id} className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-700">{v.nom}</span>
                <span className="text-[11px] font-bold" style={{ color: getHealthColor(v.foiz) }}>
                  {v.foiz}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: v.foiz + '%', backgroundColor: getHealthColor(v.foiz) }} />
              </div>
              <div className="flex gap-3 mt-1.5 text-[10px] text-slate-400">
                <span>Jami: {v.jami_tekshiruv}</span>
                <span className="text-emerald-500">Bajarildi: {v.bajarildi_soni}</span>
                <span className="text-red-400">Muammo: {v.muammo_soni}</span>
              </div>
            </div>
          ))}
          {vaadalar.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">Va'dalar topilmadi</p>
          )}
        </div>
      </div>
    </div>
  );
}

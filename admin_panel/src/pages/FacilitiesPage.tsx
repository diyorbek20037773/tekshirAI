import { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import FacilitiesTable from '../components/facilities/FacilitiesTable';
import FacilityDetail from '../components/facilities/FacilityDetail';
import CategoryFilter from '../components/shared/CategoryFilter';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { fetchMaktablar } from '../api/maktablar';
import type { MaktabData, CategoryType } from '../types';
import { VILOYAT_KOD_TO_NAME } from '../types';

export default function FacilitiesPage() {
  const [data, setData] = useState<MaktabData[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryType>('');
  const [viloyat, setViloyat] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchMaktablar(viloyat, '', category)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [category, viloyat]);

  return (
    <>
      <TopBar title="Muassasalar" subtitle="Barcha ob'yektlar ro'yxati" />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filters */}
          <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center gap-3">
            <CategoryFilter value={category} onChange={setCategory} />
            <select
              value={viloyat}
              onChange={e => setViloyat(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">Barcha viloyatlar</option>
              {Object.entries(VILOYAT_KOD_TO_NAME).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <span className="ml-auto text-xs text-slate-400">{data.length} ta natija</span>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? <LoadingSpinner /> : (
              <FacilitiesTable data={data} onSelect={setSelectedId} selectedId={selectedId} />
            )}
          </div>
        </div>

        {/* Detail panel */}
        {selectedId && (
          <FacilityDetail maktabId={selectedId} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </>
  );
}

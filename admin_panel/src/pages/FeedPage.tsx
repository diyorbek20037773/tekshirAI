import { useState, useEffect, useMemo } from 'react';
import TopBar from '../components/layout/TopBar';
import FeedCard from '../components/feed/FeedCard';
import CategoryFilter from '../components/shared/CategoryFilter';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { fetchFeed } from '../api/feed';
import { sortByEngagement } from '../utils/scoring';
import type { FeedItem, CategoryType } from '../types';
import { HOLAT_LABELS } from '../types';
import { ArrowUpDown } from 'lucide-react';

type SortMode = 'engagement' | 'newest' | 'likes' | 'comments';

const SORT_LABELS: Record<SortMode, string> = {
  engagement: 'Eng muhim',
  newest: 'Eng yangi',
  likes: "Eng ko'p like",
  comments: "Eng ko'p izoh",
};

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CategoryType>('');
  const [sortMode, setSortMode] = useState<SortMode>('engagement');
  const [holatFilter, setHolatFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchFeed(100, 0, category)
      .then(res => { setItems(res.results); setLoading(false); })
      .catch(() => { setItems([]); setLoading(false); });
  }, [category]);

  const sorted = useMemo(() => {
    let filtered = holatFilter ? items.filter(i => i.holat_kod === holatFilter) : items;

    switch (sortMode) {
      case 'engagement': return sortByEngagement(filtered);
      case 'newest': return [...filtered];
      case 'likes': return [...filtered].sort((a, b) => b.likes_soni - a.likes_soni);
      case 'comments': return [...filtered].sort((a, b) => b.comments_soni - a.comments_soni);
    }
  }, [items, sortMode, holatFilter]);

  return (
    <>
      <TopBar title="Signallar" subtitle="Fuqarolar murojaatlari" />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Filters bar */}
        <div className="px-6 py-3 bg-white border-b border-slate-200 flex items-center gap-3 flex-wrap">
          <CategoryFilter value={category} onChange={setCategory} />

          <select
            value={holatFilter}
            onChange={e => setHolatFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Barcha holat</option>
            {Object.entries(HOLAT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 ml-auto">
            <ArrowUpDown size={14} className="text-slate-400" />
            {(Object.keys(SORT_LABELS) as SortMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  sortMode === mode ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {SORT_LABELS[mode]}
              </button>
            ))}
          </div>
        </div>

        {/* Feed list */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? <LoadingSpinner /> : (
            <div className="max-w-3xl mx-auto space-y-3">
              {sorted.length === 0 && (
                <p className="text-center text-slate-400 text-sm py-8">Signallar topilmadi</p>
              )}
              {sorted.map(item => (
                <FeedCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

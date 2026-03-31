import type { MetricType, CategoryType, TileLayerType } from '../../types';
import { CATEGORY_LABELS, METRIC_LABELS } from '../../types';
import { Filter } from 'lucide-react';

interface Props {
  metric: MetricType;
  category: CategoryType;
  tileLayer: TileLayerType;
  onMetricChange: (m: MetricType) => void;
  onCategoryChange: (c: CategoryType) => void;
  onTileLayerChange: (t: TileLayerType) => void;
}

export default function MapFilters({ metric, category, onMetricChange, onCategoryChange }: Props) {
  return (
    <div className="p-4 border-b border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <Filter size={14} className="text-slate-400" />
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Filtrlar</h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[11px] text-slate-400 font-medium block mb-1">Kategoriya</label>
          <select
            value={category}
            onChange={e => onCategoryChange(e.target.value as CategoryType)}
            className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 font-medium block mb-1">Ko'rsatkich</label>
          <select
            value={metric}
            onChange={e => onMetricChange(e.target.value as MetricType)}
            className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            {(Object.keys(METRIC_LABELS) as MetricType[]).map(k => (
              <option key={k} value={k}>{METRIC_LABELS[k]}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

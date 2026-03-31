import { CATEGORY_LABELS } from '../../types';
import type { CategoryType } from '../../types';

interface Props {
  value: CategoryType;
  onChange: (v: CategoryType) => void;
  className?: string;
}

export default function CategoryFilter({ value, onChange, className = '' }: Props) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as CategoryType)}
      className={`text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 ${className}`}
    >
      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
        <option key={k} value={k}>{v}</option>
      ))}
    </select>
  );
}

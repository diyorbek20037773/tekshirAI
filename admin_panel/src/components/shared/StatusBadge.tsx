import { HOLAT_COLORS } from '../../utils/colors';
import { HOLAT_LABELS } from '../../types';

interface Props {
  holat: string;
}

export default function StatusBadge({ holat }: Props) {
  const color = HOLAT_COLORS[holat] || '#94a3b8';
  const label = HOLAT_LABELS[holat] || holat;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ backgroundColor: color + '18', color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

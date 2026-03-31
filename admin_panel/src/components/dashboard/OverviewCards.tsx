import { AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import StatCard from '../shared/StatCard';
import type { Statistika } from '../../types';

interface Props {
  stats: Statistika | null;
}

export default function OverviewCards({ stats }: Props) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        label="Jami murojaatlar"
        value={stats.murojaatlar_soni}
        icon={AlertTriangle}
        color="#ef4444"
      />
      <StatCard
        label="Hal qilingan"
        value={stats.hal_qilingan}
        icon={CheckCircle}
        color="#22c55e"
      />
      <StatCard
        label="Kutilmoqda"
        value={stats.murojaatlar_soni - stats.hal_qilingan}
        icon={Clock}
        color="#f59e0b"
      />
      <StatCard
        label="Mamnuniyat"
        value={stats.mamnuniyat_foizi + '%'}
        icon={TrendingUp}
        color="#3b82f6"
      />
    </div>
  );
}

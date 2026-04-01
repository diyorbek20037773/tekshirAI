import type { SifatDarajasi } from '../../types';

const STYLES: Record<SifatDarajasi, { bg: string; text: string; label: string }> = {
  alo: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: "A'lo" },
  yaxshi: { bg: 'bg-green-100', text: 'text-green-700', label: 'Yaxshi' },
  ortacha: { bg: 'bg-amber-100', text: 'text-amber-700', label: "O'rtacha" },
  past: { bg: 'bg-red-100', text: 'text-red-700', label: 'Past' },
};

export default function QualityBadge({ sifat }: { sifat: SifatDarajasi }) {
  const s = STYLES[sifat];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.text.replace('text-', 'bg-')}`} />
      {s.label}
    </span>
  );
}

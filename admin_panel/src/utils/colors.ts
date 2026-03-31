import type { MetricType } from '../types';

export function getHealthColor(foiz: number | null): string {
  if (foiz === null) return '#94a3b8';
  if (foiz >= 70) return '#22c55e';
  if (foiz >= 40) return '#f59e0b';
  return '#ef4444';
}

export function getHealthLabel(foiz: number | null): string {
  if (foiz === null) return 'Tekshirilmagan';
  if (foiz >= 70) return 'Yaxshi';
  if (foiz >= 40) return "E'tiborga muhtoj";
  return 'Nosoz';
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
}

const GRADIENT_STOPS = [
  { pos: 0, color: '#dc2626' },
  { pos: 0.25, color: '#ef4444' },
  { pos: 0.5, color: '#f59e0b' },
  { pos: 0.75, color: '#22c55e' },
  { pos: 1, color: '#15803d' },
];

export function interpolateColor(value: number, max: number = 100): string {
  if (max === 0) return '#94a3b8';
  const t = Math.max(0, Math.min(1, value / max));

  let i = 0;
  for (; i < GRADIENT_STOPS.length - 1; i++) {
    if (t <= GRADIENT_STOPS[i + 1].pos) break;
  }

  const s0 = GRADIENT_STOPS[i];
  const s1 = GRADIENT_STOPS[Math.min(i + 1, GRADIENT_STOPS.length - 1)];
  const localT = s1.pos === s0.pos ? 0 : (t - s0.pos) / (s1.pos - s0.pos);

  const [r0, g0, b0] = hexToRgb(s0.color);
  const [r1, g1, b1] = hexToRgb(s1.color);

  return rgbToHex(lerp(r0, r1, localT), lerp(g0, g1, localT), lerp(b0, b1, localT));
}

export function getMetricColor(value: number, max: number, metric: MetricType): string {
  if (metric === 'satisfaction') {
    return interpolateColor(value, max);
  }
  if (metric === 'problems') {
    const t = max === 0 ? 0 : Math.min(1, value / max);
    const [r0, g0, b0] = hexToRgb('#fecaca');
    const [r1, g1, b1] = hexToRgb('#991b1b');
    return rgbToHex(lerp(r0, r1, t), lerp(g0, g1, t), lerp(b0, b1, t));
  }
  if (metric === 'inspections') {
    const t = max === 0 ? 0 : Math.min(1, value / max);
    const [r0, g0, b0] = hexToRgb('#dbeafe');
    const [r1, g1, b1] = hexToRgb('#1e3a8a');
    return rgbToHex(lerp(r0, r1, t), lerp(g0, g1, t), lerp(b0, b1, t));
  }
  // signals
  const t = max === 0 ? 0 : Math.min(1, value / max);
  const [r0, g0, b0] = hexToRgb('#fef3c7');
  const [r1, g1, b1] = hexToRgb('#92400e');
  return rgbToHex(lerp(r0, r1, t), lerp(g0, g1, t), lerp(b0, b1, t));
}

export const HOLAT_COLORS: Record<string, string> = {
  kutilmoqda: '#f59e0b',
  korib_chiqilmoqda: '#3b82f6',
  hal_qilindi: '#22c55e',
};

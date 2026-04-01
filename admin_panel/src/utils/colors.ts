import type { MapMetricType } from '../types';

export function getScoreColor(ball: number | null): string {
  if (ball === null) return '#94a3b8';
  if (ball >= 75) return '#15803d';
  if (ball >= 65) return '#22c55e';
  if (ball >= 55) return '#f59e0b';
  return '#ef4444';
}

export function getScoreLabel(ball: number | null): string {
  if (ball === null) return "Ma'lumot yo'q";
  if (ball >= 75) return "A'lo";
  if (ball >= 65) return 'Yaxshi';
  if (ball >= 55) return "O'rtacha";
  return 'Past';
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

export function getMetricColor(value: number, max: number, metric: MapMetricType): string {
  if (metric === 'ortacha_ball' || metric === 'sifat') {
    return interpolateColor(value, max);
  }
  if (metric === 'davomat') {
    return interpolateColor(value, max);
  }
  // ai_tekshiruvlar — ko'k gradient
  const t = max === 0 ? 0 : Math.min(1, value / max);
  const [r0, g0, b0] = hexToRgb('#dbeafe');
  const [r1, g1, b1] = hexToRgb('#1e3a8a');
  return rgbToHex(lerp(r0, r1, t), lerp(g0, g1, t), lerp(b0, b1, t));
}

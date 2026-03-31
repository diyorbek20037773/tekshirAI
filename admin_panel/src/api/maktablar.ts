import { apiFetch } from './client';
import type { MaktabData } from '../types';

export async function fetchMaktablar(viloyat = '', tuman = '', tur = ''): Promise<MaktabData[]> {
  const params = new URLSearchParams();
  if (viloyat) params.set('viloyat', viloyat);
  if (tuman) params.set('tuman', tuman);
  if (tur) params.set('tur', tur);
  const q = params.toString();
  const res = await apiFetch<{ maktablar: MaktabData[] } | MaktabData[]>(`/maktablar/${q ? '?' + q : ''}`);
  return Array.isArray(res) ? res : res.maktablar;
}

export function fetchMaktabDetail(id: number): Promise<Record<string, unknown>> {
  return apiFetch(`/maktablar/${id}/`);
}

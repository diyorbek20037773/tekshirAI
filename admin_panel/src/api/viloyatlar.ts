import { apiFetch } from './client';
import type { ViloyatStats, TumanStats, ViloyatCollection, TumanCollection } from '../types';

export function fetchViloyatStats(): Promise<ViloyatStats[]> {
  return apiFetch<ViloyatStats[]>('/viloyatlar/');
}

export function fetchTumanStats(viloyatKod: string): Promise<TumanStats[]> {
  return apiFetch<TumanStats[]>(`/tumanlari/?viloyat=${viloyatKod}`);
}

export async function fetchViloyatlarGeoJSON(): Promise<ViloyatCollection> {
  const res = await fetch('/uz-viloyatlar.geojson');
  return res.json();
}

export async function fetchTumanlarGeoJSON(): Promise<TumanCollection> {
  const res = await fetch('/uz-tumanlar.geojson');
  return res.json();
}

import type { ViloyatCollection, TumanCollection } from '../types';

export async function fetchViloyatlarGeoJSON(): Promise<ViloyatCollection> {
  const res = await fetch('/uz-viloyatlar.geojson');
  return res.json();
}

export async function fetchTumanlarGeoJSON(): Promise<TumanCollection> {
  const res = await fetch('/uz-tumanlar.geojson');
  return res.json();
}

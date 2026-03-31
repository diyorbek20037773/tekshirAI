import type { Feature, Geometry, Position } from 'geojson';

export function normalizeTumanName(name: string): string {
  let s = name.toLowerCase().trim();
  s = s.replace(/[ʻʼ''`\u02BB\u02BC]/g, "'");
  s = s.replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/á/g, 'a').replace(/ń/g, 'n').replace(/ı/g, 'i').replace(/w/g, 'v');
  s = s.replace(/\s*(tumani|tuman|rayoni|shahri|shahar|qalasi|district)\s*/gi, '').trim();
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

const TUMAN_ALIASES: Record<string, string> = {
  'past dargom': 'pastdargom',
  "pastdarg'om": 'pastdargom',
  nokis: 'nukus',
  "no'kis": 'nukus',
};

export function matchTumanName(name1: string, name2: string): boolean {
  let n1 = normalizeTumanName(name1);
  let n2 = normalizeTumanName(name2);
  n1 = TUMAN_ALIASES[n1] || n1;
  n2 = TUMAN_ALIASES[n2] || n2;
  return n1 === n2;
}

function getAllCoordinates(geometry: Geometry): Position[] {
  const coords: Position[] = [];
  function extract(arr: unknown): void {
    if (!Array.isArray(arr)) return;
    if (typeof arr[0] === 'number' && typeof arr[1] === 'number') {
      coords.push(arr as Position);
      return;
    }
    for (const item of arr) extract(item);
  }
  if ('coordinates' in geometry) extract(geometry.coordinates);
  else if (geometry.type === 'GeometryCollection') {
    for (const geom of geometry.geometries) coords.push(...getAllCoordinates(geom));
  }
  return coords;
}

export function getCentroid(feature: Feature<Geometry>): [number, number] {
  const coords = getAllCoordinates(feature.geometry);
  if (coords.length === 0) return [41.3, 64.5];
  let sumLat = 0, sumLng = 0;
  for (const [lng, lat] of coords) { sumLat += lat; sumLng += lng; }
  return [sumLat / coords.length, sumLng / coords.length];
}

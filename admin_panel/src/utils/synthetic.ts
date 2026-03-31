import type { ViloyatCollection, TumanCollection, TumanFeature, MaktabData, ViloyatStats, TumanStats } from '../types';
import { VILOYAT_NAME_TO_KOD } from '../types';

/* ── Seeded PRNG ── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/* ── Point-in-polygon ── */
function pointInPolygon(lat: number, lng: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const yi = ring[i][0], xi = ring[i][1];
    const yj = ring[j][0], xj = ring[j][1];
    if ((yi > lng) !== (yj > lng) && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function ringArea(ring: number[][]): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  }
  return Math.abs(a / 2);
}

function outerRings(feature: TumanFeature): number[][][] {
  const g = feature.geometry as any;
  if (g.type === 'Polygon') return [g.coordinates[0]];
  if (g.type === 'MultiPolygon') return g.coordinates.map((p: number[][][]) => p[0]);
  return [];
}

function targetCount(feature: TumanFeature): number {
  const rings = outerRings(feature);
  if (!rings.length) return 10;
  const area = Math.max(...rings.map(ringArea));
  return Math.max(8, Math.min(18, Math.round(8 + area * 5)));
}

const SCHOOL_NAMES = [
  "umumta'lim maktabi", "bog'cha", "oilaviy poliklinika", "tibbiyot markazi",
  "sport maktabi", "sanʼat maktabi", "musiqa maktabi", "bolalar kutubxonasi",
  "shifoxona", "bolalar sport maydoni",
];

const VAADA_NAMES = [
  "Ichimlik suvi", "Internet ta'minoti", "Sport zal", "Oshxona", "Hojatxona", "Sovun ta'minoti",
  "O'quv qurollari", "Isitish tizimi", "Elektr ta'minoti", "Kutubxona",
];

/* ── Generate synthetic schools for a tuman ── */
export function generateSyntheticSchools(
  feature: TumanFeature,
  viloyatName: string,
  existing: MaktabData[],
): MaktabData[] {
  const rings = outerRings(feature);
  if (!rings.length) return existing;

  const ring = rings.reduce((a, b) => (ringArea(a) > ringArea(b) ? a : b));
  const target = targetCount(feature);
  if (existing.length >= target) return existing;

  const tumanName = feature.properties.name;
  const rand = seededRandom(hashStr(tumanName + viloyatName));

  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  for (const c of ring) {
    if (c[0] < minLng) minLng = c[0];
    if (c[0] > maxLng) maxLng = c[0];
    if (c[1] < minLat) minLat = c[1];
    if (c[1] > maxLat) maxLat = c[1];
  }
  const padLat = (maxLat - minLat) * 0.12;
  const padLng = (maxLng - minLng) * 0.12;
  minLat += padLat; maxLat -= padLat;
  minLng += padLng; maxLng -= padLng;

  const needed = target - existing.length;
  const synth: MaktabData[] = [];
  let tries = 0;

  while (synth.length < needed && tries < needed * 80) {
    tries++;
    const lat = minLat + rand() * (maxLat - minLat);
    const lng = minLng + rand() * (maxLng - minLng);
    if (!pointInPolygon(lat, lng, ring)) continue;

    const idx = synth.length + existing.length + 1;
    const id = -(idx + hashStr(tumanName) % 100000);
    const r = rand();
    const foiz = r < 0.1 ? null : Math.round(15 + rand() * 85);
    const jami = Math.round(2 + rand() * 10);
    const done = foiz !== null ? Math.round(jami * (foiz / 100)) : 0;
    const prob = jami - done;
    const nameIdx = Math.floor(rand() * SCHOOL_NAMES.length);

    synth.push({
      id,
      nom: `${idx}-sonli ${SCHOOL_NAMES[nameIdx]}`,
      viloyat: viloyatName,
      tuman: tumanName,
      manzil: `${tumanName}, ${viloyatName}`,
      rasm_url: '',
      lat, lng,
      jami_tekshiruv: jami,
      bajarildi: done,
      muammo: prob,
      mamnuniyat_foizi: foiz,
      holat: foiz === null ? 'tekshirilmagan' : foiz >= 70 ? 'yaxshi' : foiz >= 40 ? 'etiborga_muhtoj' : 'nosoz',
      holat_rangi: foiz === null ? '#94a3b8' : foiz >= 70 ? '#22c55e' : foiz >= 40 ? '#f59e0b' : '#ef4444',
      vaadalar_soni: Math.round(2 + rand() * 4),
    });
  }

  return [...existing, ...synth];
}

/* ── Enrich viloyat stats with synthetic data ── */
export function enrichViloyatStats(
  viloyatlarGeo: ViloyatCollection,
  tumanlarGeo: TumanCollection,
  apiStats: ViloyatStats[],
): ViloyatStats[] {
  const statsMap = new Map(apiStats.map(s => [s.kod, s]));

  return viloyatlarGeo.features.map(f => {
    const name = f.properties.name;
    const kod = VILOYAT_NAME_TO_KOD[name] || '';
    const existing = statsMap.get(kod);

    // Count tumans in this viloyat
    const tumanCount = tumanlarGeo.features.filter(t => t.properties.viloyat === name).length;
    const synthSchools = Math.max(tumanCount * 10, 80 + Math.round(hashStr(name) % 200));

    const g = f.geometry as any;
    let lat = 41.3, lng = 64.5;
    if (g.type === 'Polygon' || g.type === 'MultiPolygon') {
      const coords = g.type === 'Polygon' ? g.coordinates[0] : g.coordinates[0][0];
      let sLat = 0, sLng = 0;
      for (const c of coords) { sLng += c[0]; sLat += c[1]; }
      lat = sLat / coords.length;
      lng = sLng / coords.length;
    }

    if (existing && existing.maktablar_soni > 0) {
      return {
        ...existing,
        maktablar_soni: Math.max(existing.maktablar_soni, synthSchools),
        vaadalar_soni: Math.max(existing.vaadalar_soni, synthSchools * 3),
      };
    }

    return {
      kod,
      nom: name,
      lat, lng,
      maktablar_soni: synthSchools,
      vaadalar_soni: synthSchools * 3,
    };
  });
}

/* ── Enrich tuman stats ── */
export function enrichTumanStats(
  tumanlarGeo: TumanCollection,
  viloyatName: string,
  apiStats: TumanStats[],
): TumanStats[] {
  const tumans = tumanlarGeo.features.filter(f => f.properties.viloyat === viloyatName);
  const statsMap = new Map(apiStats.map(s => [s.nom.toLowerCase().trim(), s]));

  return tumans.map(f => {
    const name = f.properties.name;
    const key = name.toLowerCase().trim();
    const existing = statsMap.get(key);
    if (existing && existing.maktablar_soni > 0) return existing;

    const count = targetCount(f);
    return {
      nom: name,
      maktablar_soni: existing ? existing.maktablar_soni || count : count,
      vaadalar_soni: existing ? existing.vaadalar_soni : count * 3,
    };
  });
}

/* ── Generate per-viloyat synthetic metrics ── */
export function generateViloyatMetrics(viloyatlarGeo: ViloyatCollection, apiMaktablar: MaktabData[]) {
  const apiMap = new Map<string, MaktabData[]>();
  for (const m of apiMaktablar) {
    const arr = apiMap.get(m.viloyat) || [];
    arr.push(m);
    apiMap.set(m.viloyat, arr);
  }

  const result = new Map<string, {
    satisfaction: number; problems: number; inspections: number;
    total: number; checked: number; bajarildi: number; muammo: number;
  }>();

  for (const f of viloyatlarGeo.features) {
    const name = f.properties.name;
    const kod = VILOYAT_NAME_TO_KOD[name] || '';
    const rand = seededRandom(hashStr(name + 'metrics'));

    const apiData = apiMap.get(kod) || [];
    const synthCount = 80 + Math.round(rand() * 150);
    const total = Math.max(apiData.length, synthCount);

    let bajarildi = 0, muammo = 0;
    for (const m of apiData) {
      bajarildi += m.bajarildi;
      muammo += m.muammo;
    }

    // Add synthetic
    const synthBajarildi = Math.round(synthCount * (0.3 + rand() * 0.5));
    const synthMuammo = Math.round(synthCount * (0.1 + rand() * 0.3));
    bajarildi += synthBajarildi;
    muammo += synthMuammo;

    const jami = bajarildi + muammo;
    const satisfaction = jami > 0 ? Math.round((bajarildi / jami) * 100) : Math.round(30 + rand() * 60);
    const checked = Math.round(total * (0.4 + rand() * 0.4));

    result.set(kod, { satisfaction, problems: muammo, inspections: checked, total, checked, bajarildi, muammo });
  }

  return result;
}

/* ── Generate per-tuman synthetic metrics ── */
export function generateTumanMetrics(
  tumanlarGeo: TumanCollection,
  viloyatName: string,
  apiMaktablar: MaktabData[],
) {
  const tumans = tumanlarGeo.features.filter(f => f.properties.viloyat === viloyatName);

  const result = new Map<string, {
    satisfaction: number; problems: number; inspections: number;
    total: number; checked: number; bajarildi: number; muammo: number;
  }>();

  for (const f of tumans) {
    const name = f.properties.name;
    const rand = seededRandom(hashStr(name + viloyatName + 'tmetrics'));

    const apiData = apiMaktablar.filter(m => m.tuman === name);
    const synthCount = targetCount(f);
    const total = Math.max(apiData.length, synthCount);

    let bajarildi = 0, muammo = 0;
    for (const m of apiData) {
      bajarildi += m.bajarildi;
      muammo += m.muammo;
    }

    const synthB = Math.round(synthCount * (0.2 + rand() * 0.6));
    const synthM = Math.round(synthCount * (0.05 + rand() * 0.35));
    bajarildi += synthB;
    muammo += synthM;

    const jami = bajarildi + muammo;
    const satisfaction = jami > 0 ? Math.round((bajarildi / jami) * 100) : Math.round(25 + rand() * 65);
    const checked = Math.round(total * (0.3 + rand() * 0.5));

    result.set(name, { satisfaction, problems: muammo, inspections: checked, total, checked, bajarildi, muammo });
  }

  return result;
}

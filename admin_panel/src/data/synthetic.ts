import type {
  ViloyatTalimStats, TumanTalimStats, FanStatistika,
  ZaifMavzu, ViloyatMuammo, UmumiyKPI, SifatDarajasi,
  TumanCollection, TumanFeature, MaktabData, SinfData, OquvchiData,
} from '../types';
import { VILOYAT_KOD_TO_NAME } from '../types';
import { VILOYAT_DATA, FANLAR, FAN_MAVZULARI, MUAMMO_SHABLONLARI,
  ERKAK_ISMLAR, AYOL_ISMLAR, FAMILIYALAR, SINF_HARFLAR } from './constants';

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

function getSifat(ball: number): SifatDarajasi {
  if (ball >= 75) return 'alo';
  if (ball >= 65) return 'yaxshi';
  if (ball >= 55) return 'ortacha';
  return 'past';
}

/* ── Viloyat statistikalari ── */
let _viloyatCache: ViloyatTalimStats[] | null = null;

export function generateViloyatStats(): ViloyatTalimStats[] {
  if (_viloyatCache) return _viloyatCache;

  const stats: ViloyatTalimStats[] = [];

  for (const [kod, data] of Object.entries(VILOYAT_DATA)) {
    const rand = seededRandom(hashStr(kod + 'talim2024'));
    const nom = VILOYAT_KOD_TO_NAME[kod] || kod;

    // O'rtacha ball: 55-82 orasida, viloyatga qarab
    const baseBall = kod === 'toshkent_sh' ? 78 :
                     kod === 'toshkent_v' ? 74 :
                     kod === 'samarqand' ? 72 :
                     kod === 'fargona' ? 70 :
                     kod === 'andijon' ? 69 :
                     kod === 'namangan' ? 67 :
                     kod === 'buxoro' ? 71 :
                     kod === 'xorazm' ? 68 :
                     kod === 'navoiy' ? 73 :
                     kod === 'jizzax' ? 63 :
                     kod === 'sirdaryo' ? 65 :
                     kod === 'qashqadaryo' ? 58 :
                     kod === 'surxondaryo' ? 56 :
                     kod === 'qoraqalpogiston' ? 55 : 65;

    const ortacha_ball = Math.round(baseBall + (rand() - 0.5) * 6);

    // Davomat: 85-96%
    const baseDavomat = kod === 'qoraqalpogiston' ? 84 :
                        kod === 'surxondaryo' ? 86 :
                        kod === 'qashqadaryo' ? 87 :
                        kod === 'toshkent_sh' ? 95 : 89;
    const davomat_foizi = Math.round(baseDavomat + rand() * 5);

    // AI tekshiruvlar
    const aiBase = Math.round(data.oquvchilar * (0.2 + rand() * 0.15));

    // Premium
    const premBase = Math.round(data.oquvchilar * (0.0012 + rand() * 0.001));

    // Tejangan vaqt (soat) - har bir AI tekshiruv ~20 daqiqa tejaydi
    const tejangan = Math.round(aiBase * (18 + rand() * 8) / 60);

    // Eng zaif fan va mavzular
    const fanIdx = Math.floor(rand() * FANLAR.length);
    const fan = FANLAR[fanIdx];
    const mavzular = FAN_MAVZULARI[fan];
    const zaifMavzular = [
      mavzular[Math.floor(rand() * mavzular.length)],
      mavzular[Math.floor(rand() * mavzular.length)],
      mavzular[Math.floor(rand() * mavzular.length)],
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);

    stats.push({
      kod,
      nom,
      maktablar_soni: data.maktablar,
      oquvchilar_soni: data.oquvchilar,
      oqituvchilar_soni: data.oqituvchilar,
      ortacha_ball,
      davomat_foizi: Math.min(davomat_foizi, 98),
      ai_tekshiruvlar: aiBase,
      premium_users: premBase,
      tejangan_vaqt_soat: tejangan,
      sifat_darajasi: getSifat(ortacha_ball),
      eng_zaif_fan: fan,
      eng_zaif_mavzular: zaifMavzular,
    });
  }

  _viloyatCache = stats;
  return stats;
}

/* ── Tuman statistikalari ── */
const _tumanCache = new Map<string, TumanTalimStats[]>();

export function generateTumanStats(viloyatKod: string, tumanlarGeo?: TumanCollection): TumanTalimStats[] {
  const cached = _tumanCache.get(viloyatKod);
  if (cached) return cached;

  const viloyatNom = VILOYAT_KOD_TO_NAME[viloyatKod] || '';
  const viloyatData = VILOYAT_DATA[viloyatKod];
  if (!viloyatData) return [];

  // Get viloyat stats for base values
  const viloyatStats = generateViloyatStats().find(v => v.kod === viloyatKod);
  if (!viloyatStats) return [];

  // Find tumans from GeoJSON
  let tumanNames: string[] = [];
  if (tumanlarGeo) {
    tumanNames = tumanlarGeo.features
      .filter(f => f.properties.viloyat === viloyatNom)
      .map(f => f.properties.name);
  }

  if (tumanNames.length === 0) {
    // Fallback: generate 8-15 synthetic tuman names
    const rand = seededRandom(hashStr(viloyatKod + 'tumans'));
    const count = 8 + Math.floor(rand() * 8);
    for (let i = 1; i <= count; i++) {
      tumanNames.push(`${i}-tuman`);
    }
  }

  const tumanCount = tumanNames.length;
  const stats: TumanTalimStats[] = [];

  for (const tumanName of tumanNames) {
    const rand = seededRandom(hashStr(tumanName + viloyatKod + 'tstats'));

    // Distribute schools proportionally with some randomness
    const baseMaktab = Math.round(viloyatData.maktablar / tumanCount);
    const maktablar = Math.max(3, Math.round(baseMaktab * (0.5 + rand() * 1.0)));

    const baseOquv = Math.round(viloyatData.oquvchilar / tumanCount);
    const oquvchilar = Math.round(baseOquv * (0.5 + rand() * 1.0));

    const baseOqit = Math.round(viloyatData.oqituvchilar / tumanCount);
    const oqituvchilar = Math.round(baseOqit * (0.5 + rand() * 1.0));

    // Ball varies around viloyat average +-10
    const ball = Math.max(35, Math.min(95, Math.round(viloyatStats.ortacha_ball + (rand() - 0.5) * 20)));

    const davomat = Math.max(75, Math.min(99, Math.round(viloyatStats.davomat_foizi + (rand() - 0.5) * 10)));

    const ai = Math.round(oquvchilar * (0.15 + rand() * 0.2));

    stats.push({
      nom: tumanName,
      maktablar_soni: maktablar,
      oquvchilar_soni: oquvchilar,
      oqituvchilar_soni: oqituvchilar,
      ortacha_ball: ball,
      davomat_foizi: davomat,
      ai_tekshiruvlar: ai,
    });
  }

  _tumanCache.set(viloyatKod, stats);
  return stats;
}

/* ── Fan statistikalari ── */
let _fanCache: FanStatistika[] | null = null;

export function generateFanStats(): FanStatistika[] {
  if (_fanCache) return _fanCache;

  const fanBalls: Record<string, number> = {
    Matematika: 62,
    Fizika: 58,
    Kimyo: 64,
    Biologiya: 70,
    'Ona tili': 74,
    'Ingliz tili': 55,
    Tarix: 72,
    Informatika: 68,
  };

  const stats: FanStatistika[] = FANLAR.map(fan => {
    const rand = seededRandom(hashStr(fan + 'fstats'));
    const ball = Math.round((fanBalls[fan] || 65) + (rand() - 0.5) * 6);
    const mavzular = FAN_MAVZULARI[fan] || [];

    // Pick 3 weakest topics
    const shuffled = [...mavzular].sort(() => rand() - 0.5);
    const zaif = shuffled.slice(0, 3);

    const tekshiruvlar = Math.round(200000 + rand() * 400000);

    return {
      fan_nomi: fan,
      ortacha_ball: ball,
      tekshiruvlar_soni: tekshiruvlar,
      eng_zaif_mavzular: zaif,
      progress: ball,
    };
  });

  _fanCache = stats;
  return stats;
}

/* ── Eng zaif 3 mavzu (butun O'zbekiston) ── */
let _zaifCache: ZaifMavzu[] | null = null;

export function generateZaifMavzular(): ZaifMavzu[] {
  if (_zaifCache) return _zaifCache;

  const viloyatlar = generateViloyatStats();
  const rand = seededRandom(hashStr('zaifmavzular2024'));

  const result: ZaifMavzu[] = [
    {
      mavzu: 'Kvadrat tenglamalar',
      fan: 'Matematika',
      ortacha_ball: Math.round(42 + rand() * 8),
      oquvchilar_soni: Math.round(1200000 + rand() * 300000),
      viloyatlar: viloyatlar
        .sort((a, b) => a.ortacha_ball - b.ortacha_ball)
        .slice(0, 4)
        .map(v => v.nom.replace(' viloyati', '').replace(' shahar', '').replace(' Respublikasi', '')),
    },
    {
      mavzu: 'Passive Voice',
      fan: 'Ingliz tili',
      ortacha_ball: Math.round(38 + rand() * 10),
      oquvchilar_soni: Math.round(1500000 + rand() * 400000),
      viloyatlar: viloyatlar
        .sort(() => rand() - 0.5)
        .slice(0, 3)
        .map(v => v.nom.replace(' viloyati', '').replace(' shahar', '').replace(' Respublikasi', '')),
    },
    {
      mavzu: 'Elektr zanjirlar',
      fan: 'Fizika',
      ortacha_ball: Math.round(40 + rand() * 8),
      oquvchilar_soni: Math.round(900000 + rand() * 200000),
      viloyatlar: viloyatlar
        .sort((a, b) => a.ortacha_ball - b.ortacha_ball)
        .slice(0, 5)
        .map(v => v.nom.replace(' viloyati', '').replace(' shahar', '').replace(' Respublikasi', '')),
    },
  ];

  _zaifCache = result;
  return result;
}

/* ── Viloyat muammolari ── */
let _muammoCache: ViloyatMuammo[] | null = null;

export function generateMuammolar(): ViloyatMuammo[] {
  if (_muammoCache) return _muammoCache;

  const viloyatlar = generateViloyatStats();
  const muammolar: ViloyatMuammo[] = [];

  // Eng past viloyatlarga muammolar biriktirish
  const sorted = [...viloyatlar].sort((a, b) => a.ortacha_ball - b.ortacha_ball);

  for (let i = 0; i < sorted.length; i++) {
    const v = sorted[i];
    const rand = seededRandom(hashStr(v.kod + 'muammo'));

    if (i < 5) {
      // Eng past 5 ta viloyatga jiddiy muammolar
      const shablon = MUAMMO_SHABLONLARI[i % MUAMMO_SHABLONLARI.length];
      const miqdor = v.kod === 'qashqadaryo' ? 99 :
                     v.kod === 'surxondaryo' ? 78 :
                     v.kod === 'qoraqalpogiston' ? 85 :
                     Math.round(40 + rand() * 60);

      muammolar.push({
        viloyat_kod: v.kod,
        viloyat_nom: v.nom,
        muammo_turi: shablon.turi,
        tafsilot: shablon.tafsilot_shablon.replace('{miqdor}', String(miqdor)),
        miqdor,
        tavsiya: shablon.tavsiya,
        jiddiylik: i < 3 ? 'yuqori' : 'ortacha',
      });
    } else if (i < 9) {
      // O'rtacha viloyatlar — yengilroq muammolar
      const shablon = MUAMMO_SHABLONLARI[3 + (i % 2)];
      const miqdor = Math.round(15 + rand() * 30);

      muammolar.push({
        viloyat_kod: v.kod,
        viloyat_nom: v.nom,
        muammo_turi: shablon.turi,
        tafsilot: shablon.tafsilot_shablon.replace('{miqdor}', String(miqdor)),
        miqdor,
        tavsiya: shablon.tavsiya,
        jiddiylik: 'ortacha',
      });
    }
    // Eng yaxshi viloyatlar muammosiz
  }

  _muammoCache = muammolar;
  return muammolar;
}

/* ── Point-in-polygon (geo) ── */
function pointInPolygon(lat: number, lng: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const yi = ring[i][0], xi = ring[i][1];
    const yj = ring[j][0], xj = ring[j][1];
    if ((yi > lng) !== (yj > lng) && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function outerRings(feature: TumanFeature): number[][][] {
  const g = feature.geometry as any;
  if (g.type === 'Polygon') return [g.coordinates[0]];
  if (g.type === 'MultiPolygon') return g.coordinates.map((p: number[][][]) => p[0]);
  return [];
}

/* ── Maktab generatori ── */
const _maktabCache = new Map<string, MaktabData[]>();

export function generateMaktablar(
  tumanName: string,
  viloyatName: string,
  viloyatKod: string,
  tumanlarGeo?: TumanCollection,
): MaktabData[] {
  const key = viloyatKod + '/' + tumanName;
  const cached = _maktabCache.get(key);
  if (cached) return cached;

  const rand = seededRandom(hashStr(key + 'maktablar'));
  const count = 35 + Math.floor(rand() * 30); // 35-65 maktab

  // Get tuman stats for base values
  const tStats = generateTumanStats(viloyatKod, tumanlarGeo);
  const tumanStat = tStats.find(t => t.nom === tumanName);
  const baseBall = tumanStat?.ortacha_ball ?? 65;
  const baseDavomat = tumanStat?.davomat_foizi ?? 90;

  // Find geographic bounds from GeoJSON
  let ring: number[][] | null = null;
  let minLat = 40, maxLat = 42, minLng = 63, maxLng = 66;

  if (tumanlarGeo) {
    const feature = tumanlarGeo.features.find(
      f => f.properties.name === tumanName && f.properties.viloyat === viloyatName
    );
    if (feature) {
      const rings = outerRings(feature);
      if (rings.length > 0) {
        ring = rings.reduce((a, b) => {
          const areaA = Math.abs(a.reduce((s, c, i) => {
            const j = (i + 1) % a.length;
            return s + (a[j][0] + c[0]) * (a[j][1] - c[1]);
          }, 0) / 2);
          const areaB = Math.abs(b.reduce((s, c, i) => {
            const j = (i + 1) % b.length;
            return s + (b[j][0] + c[0]) * (b[j][1] - c[1]);
          }, 0) / 2);
          return areaA > areaB ? a : b;
        });
        minLat = Infinity; maxLat = -Infinity; minLng = Infinity; maxLng = -Infinity;
        for (const c of ring) {
          if (c[0] < minLng) minLng = c[0];
          if (c[0] > maxLng) maxLng = c[0];
          if (c[1] < minLat) minLat = c[1];
          if (c[1] > maxLat) maxLat = c[1];
        }
        const padLat = (maxLat - minLat) * 0.1;
        const padLng = (maxLng - minLng) * 0.1;
        minLat += padLat; maxLat -= padLat;
        minLng += padLng; maxLng -= padLng;
      }
    }
  }

  const maktablar: MaktabData[] = [];
  let tries = 0;

  while (maktablar.length < count && tries < count * 100) {
    tries++;
    const lat = minLat + rand() * (maxLat - minLat);
    const lng = minLng + rand() * (maxLng - minLng);

    if (ring && !pointInPolygon(lat, lng, ring)) continue;

    const idx = maktablar.length + 1;
    const ball = Math.max(30, Math.min(98, Math.round(baseBall + (rand() - 0.5) * 25)));
    const davomat = Math.max(70, Math.min(99, Math.round(baseDavomat + (rand() - 0.5) * 15)));
    const oquvchilar = Math.round(200 + rand() * 800);
    const oqituvchilar = Math.round(oquvchilar / (12 + rand() * 8));
    const sinflar = Math.round(11 + rand() * 20); // 11-31 sinf
    const ai = Math.round(oquvchilar * (0.1 + rand() * 0.3));

    maktablar.push({
      id: hashStr(key + idx) % 1000000,
      nom: `${idx}-sonli umumta'lim maktabi`,
      raqam: idx,
      lat, lng,
      viloyat: viloyatName,
      tuman: tumanName,
      oquvchilar_soni: oquvchilar,
      oqituvchilar_soni: oqituvchilar,
      sinflar_soni: sinflar,
      ortacha_ball: ball,
      davomat_foizi: davomat,
      ai_tekshiruvlar: ai,
      sifat_darajasi: getSifat(ball),
    });
  }

  _maktabCache.set(key, maktablar);
  return maktablar;
}

/* ── Sinf generatori ── */
const _sinfCache = new Map<string, SinfData[]>();

export function generateSinflar(maktabId: number, maktabBall: number): SinfData[] {
  const key = 'sinf_' + maktabId;
  const cached = _sinfCache.get(key);
  if (cached) return cached;

  const rand = seededRandom(hashStr(key));
  const sinflar: SinfData[] = [];
  let id = 0;

  for (let sinf = 1; sinf <= 11; sinf++) {
    const harfCount = sinf <= 4 ? 3 + Math.floor(rand() * 2) : 2 + Math.floor(rand() * 2); // 1-4 sinf: 3-4, 5-11: 2-3
    for (let h = 0; h < harfCount && h < SINF_HARFLAR.length; h++) {
      id++;
      const harf = SINF_HARFLAR[h];
      const oquvchilar = Math.round(25 + rand() * 15); // 25-40
      const ball = Math.max(25, Math.min(100, Math.round(maktabBall + (rand() - 0.5) * 20)));
      const davomat = Math.max(70, Math.min(99, Math.round(88 + (rand() - 0.5) * 16)));
      const ai = Math.round(oquvchilar * (0.1 + rand() * 0.4));

      // Sinf rahbari
      const isMale = rand() > 0.65;
      const ismlar = isMale ? ERKAK_ISMLAR : AYOL_ISMLAR;
      const ism = ismlar[Math.floor(rand() * ismlar.length)];
      const fam = FAMILIYALAR[Math.floor(rand() * FAMILIYALAR.length)];
      const rahbar = isMale ? `${ism} ${fam}` : `${ism} ${fam}a`;

      sinflar.push({
        id: maktabId * 1000 + id,
        nom: `${sinf}-${harf}`,
        sinf_raqami: sinf,
        harf,
        oquvchilar_soni: oquvchilar,
        ortacha_ball: ball,
        davomat_foizi: davomat,
        ai_tekshiruvlar: ai,
        sinf_rahbari: rahbar,
      });
    }
  }

  _sinfCache.set(key, sinflar);
  return sinflar;
}

/* ── O'quvchi generatori ── */
const _oquvchiCache = new Map<string, OquvchiData[]>();

export function generateOquvchilar(sinfId: number, sinfBall: number, count: number): OquvchiData[] {
  const key = 'oquv_' + sinfId;
  const cached = _oquvchiCache.get(key);
  if (cached) return cached;

  const rand = seededRandom(hashStr(key));
  const oquvchilar: OquvchiData[] = [];

  for (let i = 0; i < count; i++) {
    const isMale = rand() > 0.48;
    const ismlar = isMale ? ERKAK_ISMLAR : AYOL_ISMLAR;
    const ism = ismlar[Math.floor(rand() * ismlar.length)];
    const fam = FAMILIYALAR[Math.floor(rand() * FAMILIYALAR.length)];
    const familiya = isMale ? fam : fam + 'a';

    const ball = Math.max(15, Math.min(100, Math.round(sinfBall + (rand() - 0.5) * 35)));
    const davomat = Math.max(60, Math.min(100, Math.round(90 + (rand() - 0.5) * 25)));
    const ai = Math.round(rand() * 50);

    const kuchli = FANLAR[Math.floor(rand() * FANLAR.length)];
    let zaif = FANLAR[Math.floor(rand() * FANLAR.length)];
    if (zaif === kuchli) zaif = FANLAR[(FANLAR.indexOf(zaif) + 1) % FANLAR.length];

    oquvchilar.push({
      id: sinfId * 100 + i,
      ism,
      familiya,
      ortacha_ball: ball,
      davomat_foizi: davomat,
      ai_tekshiruvlar: ai,
      eng_kuchli_fan: kuchli,
      eng_zaif_fan: zaif,
      is_premium: rand() < 0.08,
      streak_days: Math.floor(rand() * 30),
      level: Math.min(7, 1 + Math.floor(ball / 15)),
    });
  }

  // Sort by familiya
  oquvchilar.sort((a, b) => a.familiya.localeCompare(b.familiya));

  _oquvchiCache.set(key, oquvchilar);
  return oquvchilar;
}

/* ── KPI ── */
export function getKPI(): UmumiyKPI {
  const viloyatlar = generateViloyatStats();

  return {
    jami_maktablar: viloyatlar.reduce((s, v) => s + v.maktablar_soni, 0),
    jami_oquvchilar: viloyatlar.reduce((s, v) => s + v.oquvchilar_soni, 0),
    jami_oqituvchilar: viloyatlar.reduce((s, v) => s + v.oqituvchilar_soni, 0),
    ortacha_davomat: Math.round(viloyatlar.reduce((s, v) => s + v.davomat_foizi, 0) / viloyatlar.length * 10) / 10,
    ortacha_ball: Math.round(viloyatlar.reduce((s, v) => s + v.ortacha_ball, 0) / viloyatlar.length * 10) / 10,
    ai_tekshiruvlar: viloyatlar.reduce((s, v) => s + v.ai_tekshiruvlar, 0),
    premium_users: viloyatlar.reduce((s, v) => s + v.premium_users, 0),
    tejangan_vaqt: viloyatlar.reduce((s, v) => s + v.tejangan_vaqt_soat, 0),
  };
}

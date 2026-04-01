import type {
  ViloyatTalimStats, TumanTalimStats, FanStatistika,
  ZaifMavzu, ViloyatMuammo, UmumiyKPI, SifatDarajasi,
  TumanCollection,
} from '../types';
import { VILOYAT_KOD_TO_NAME } from '../types';
import { VILOYAT_DATA, FANLAR, FAN_MAVZULARI, MUAMMO_SHABLONLARI } from './constants';

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

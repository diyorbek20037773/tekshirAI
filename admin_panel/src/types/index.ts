import type { FeatureCollection, Feature, Geometry } from 'geojson';

/* ── GeoJSON types (saqlanadi) ── */
export interface ViloyatProperties {
  name: string;
  name_en: string;
}

export interface TumanProperties {
  name: string;
  name_en: string;
  name_uz: string;
  viloyat: string;
}

export type ViloyatFeature = Feature<Geometry, ViloyatProperties>;
export type TumanFeature = Feature<Geometry, TumanProperties>;
export type ViloyatCollection = FeatureCollection<Geometry, ViloyatProperties>;
export type TumanCollection = FeatureCollection<Geometry, TumanProperties>;

/* ── Map types ── */
export type MapLevel = 'country' | 'viloyat' | 'tuman';
export type TileLayerType = 'map' | 'satellite' | 'hybrid';
export type MapMetricType = 'ortacha_ball' | 'davomat' | 'ai_tekshiruvlar' | 'sifat';

/* ── Viloyat kodlari ── */
export const VILOYAT_KOD_TO_NAME: Record<string, string> = {
  toshkent_sh: 'Toshkent shahar',
  toshkent_v: 'Toshkent viloyati',
  samarqand: 'Samarqand viloyati',
  fargona: "Farg'ona viloyati",
  andijon: 'Andijon viloyati',
  namangan: 'Namangan viloyati',
  buxoro: 'Buxoro viloyati',
  xorazm: 'Xorazm viloyati',
  qashqadaryo: 'Qashqadaryo viloyati',
  surxondaryo: 'Surxondaryo viloyati',
  jizzax: 'Jizzax viloyati',
  sirdaryo: 'Sirdaryo viloyati',
  navoiy: 'Navoiy viloyati',
  qoraqalpogiston: "Qoraqolpog'iston Respublikasi",
};

export const VILOYAT_NAME_TO_KOD: Record<string, string> = Object.fromEntries(
  Object.entries(VILOYAT_KOD_TO_NAME).map(([k, v]) => [v, k])
);

/* ── Ta'lim statistika tiplari ── */

export type SifatDarajasi = 'alo' | 'yaxshi' | 'ortacha' | 'past';

export interface ViloyatTalimStats {
  kod: string;
  nom: string;
  maktablar_soni: number;
  oquvchilar_soni: number;
  oqituvchilar_soni: number;
  ortacha_ball: number;        // 0-100
  davomat_foizi: number;       // 0-100
  ai_tekshiruvlar: number;
  premium_users: number;
  tejangan_vaqt_soat: number;
  sifat_darajasi: SifatDarajasi;
  eng_zaif_fan: string;
  eng_zaif_mavzular: string[];
}

export interface TumanTalimStats {
  nom: string;
  maktablar_soni: number;
  oquvchilar_soni: number;
  oqituvchilar_soni: number;
  ortacha_ball: number;
  davomat_foizi: number;
  ai_tekshiruvlar: number;
}

export interface FanStatistika {
  fan_nomi: string;
  ortacha_ball: number;
  tekshiruvlar_soni: number;
  eng_zaif_mavzular: string[];
  progress: number;              // 0-100 overall mastery
}

export interface ZaifMavzu {
  mavzu: string;
  fan: string;
  ortacha_ball: number;
  oquvchilar_soni: number;
  viloyatlar: string[];
}

export interface ViloyatMuammo {
  viloyat_kod: string;
  viloyat_nom: string;
  muammo_turi: string;
  tafsilot: string;
  miqdor: number;
  tavsiya: string;
  jiddiylik: 'yuqori' | 'ortacha' | 'past';
}

export interface UmumiyKPI {
  jami_maktablar: number;
  jami_oquvchilar: number;
  jami_oqituvchilar: number;
  ortacha_davomat: number;
  ortacha_ball: number;
  ai_tekshiruvlar: number;
  premium_users: number;
  tejangan_vaqt: number;
}

/* ── Metric labels ── */
export const MAP_METRIC_LABELS: Record<MapMetricType, string> = {
  ortacha_ball: "O'rtacha ball",
  davomat: 'Davomat %',
  ai_tekshiruvlar: 'AI tekshiruvlar',
  sifat: 'Sifat darajasi',
};

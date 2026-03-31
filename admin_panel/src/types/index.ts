import type { FeatureCollection, Feature, Geometry } from 'geojson';

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

export interface MaktabData {
  id: number;
  nom: string;
  viloyat: string;
  tuman: string;
  manzil: string;
  rasm_url: string;
  lat: number;
  lng: number;
  jami_tekshiruv: number;
  bajarildi: number;
  muammo: number;
  mamnuniyat_foizi: number | null;
  holat: string;
  holat_rangi: string;
  vaadalar_soni: number;
}

export interface ViloyatStats {
  kod: string;
  nom: string;
  lat: number;
  lng: number;
  maktablar_soni: number;
  vaadalar_soni: number;
}

export interface TumanStats {
  nom: string;
  maktablar_soni: number;
  vaadalar_soni: number;
}

export type MapLevel = 'country' | 'viloyat' | 'tuman';
export type TileLayerType = 'map' | 'satellite' | 'hybrid';

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

export interface Statistika {
  maktablar_soni: number;
  bogchalar_soni: number;
  tibbiyot_soni: number;
  sport_soni: number;
  murojaatlar_soni: number;
  hal_qilingan: number;
  jami_tekshiruv: number;
  bajarildi: number;
  muammo: number;
  mamnuniyat_foizi: number;
  tekshirilgan_maktablar: number;
}

export interface FeedItem {
  id: number;
  user: string;
  is_anonim: boolean;
  izoh: string;
  viloyat: string;
  tuman: string;
  infratuzilma: string;
  infratuzilma_kod: string;
  holat: string;
  holat_kod: string;
  rasmlar: string[];
  likes_soni: number;
  comments_soni: number;
  is_liked: boolean;
  vaqt: string;
}

export interface FeedResponse {
  results: FeedItem[];
  jami: number;
  has_more: boolean;
}

export interface TahlilViloyat {
  viloyat: string;
  maktablar_soni: number;
  jami_tekshiruv: number;
  bajarildi: number;
  muammo: number;
  mamnuniyat_foizi: number;
}

export interface TahlilResponse {
  viloyatlar: TahlilViloyat[];
  muammo_turlari: { nom: string; soni: number }[];
  eng_yaxshi_maktablar: MaktabData[];
  eng_yomon_maktablar: MaktabData[];
  umumiy: {
    jami_tekshiruv: number;
    bajarildi: number;
    muammo: number;
    mamnuniyat_foizi: number;
    tekshirilgan_maktablar: number;
  };
}

export type MetricType = 'satisfaction' | 'problems' | 'inspections' | 'signals';
export type CategoryType = '' | 'maktab' | 'bogcha' | 'shifoxona' | 'yol' | 'sport' | 'boshqa';

export const CATEGORY_LABELS: Record<string, string> = {
  '': 'Hammasi',
  maktab: 'Maktab',
  bogcha: "Bog'cha",
  shifoxona: 'Shifoxona',
  yol: "Yo'l infratuzilmasi",
  sport: 'Sport inshootlari',
  boshqa: 'Boshqa',
};

export const METRIC_LABELS: Record<MetricType, string> = {
  satisfaction: 'Mamnuniyat %',
  problems: 'Muammolar soni',
  inspections: 'Tekshiruvlar soni',
  signals: 'Signallar soni',
};

export const HOLAT_LABELS: Record<string, string> = {
  kutilmoqda: 'Kutilmoqda',
  korib_chiqilmoqda: "Ko'rib chiqilmoqda",
  hal_qilindi: 'Hal qilindi',
};

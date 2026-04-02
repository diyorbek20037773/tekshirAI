import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapLevel, TileLayerType, ViloyatCollection, TumanCollection, MapMetricType, MaktabData } from '../../types';
import { VILOYAT_NAME_TO_KOD, MAP_METRIC_LABELS } from '../../types';
import { fetchViloyatlarGeoJSON, fetchTumanlarGeoJSON } from '../../api/viloyatlar';
import { generateViloyatStats, generateTumanStats, generateMaktablar } from '../../data';
import ChoroplethViloyatLayer from './ChoroplethViloyatLayer';
import ChoroplethTumanLayer from './ChoroplethTumanLayer';
import MaktablarLayer from './MaktablarLayer';
import TalimRegionPanel from './TalimRegionPanel';
import MapLegend from './MapLegend';
import { Search, ChevronLeft, Navigation, Map as MapIcon, Globe, Satellite } from 'lucide-react';
import { interpolateColor } from '../../utils/colors';
import { formatNumber } from '../../utils/format';

const UZ_CENTER: [number, number] = [41.3, 64.5];
const UZ_ZOOM = 6;
const UZ_BOUNDS: L.LatLngBoundsExpression = [[37.0, 55.9], [45.6, 73.2]];

const TILE_URLS: Record<TileLayerType, { url: string; attribution: string }> = {
  map: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OSM' },
  satellite: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri' },
  hybrid: { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri' },
};

function MapController({ target }: { target: { center: [number, number]; zoom: number; bounds?: L.LatLngBounds } | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    if (target.bounds) map.flyToBounds(target.bounds, { padding: [30, 30], maxZoom: target.zoom, duration: 0.8 });
    else map.flyTo(target.center, target.zoom, { duration: 0.8 });
  }, [target, map]);
  return null;
}

export default function TalimMap() {
  const [viloyatlarGeo, setViloyatlarGeo] = useState<ViloyatCollection | null>(null);
  const [tumanlarGeo, setTumanlarGeo] = useState<TumanCollection | null>(null);

  const [level, setLevel] = useState<MapLevel>('country');
  const [selectedViloyat, setSelectedViloyat] = useState<string | null>(null);
  const [selectedViloyatKod, setSelectedViloyatKod] = useState<string | null>(null);
  const [selectedTuman, setSelectedTuman] = useState<string | null>(null);
  const [selectedMaktab, setSelectedMaktab] = useState<MaktabData | null>(null);

  const [tileLayer, setTileLayer] = useState<TileLayerType>('map');
  const [mapTarget, setMapTarget] = useState<{ center: [number, number]; zoom: number; bounds?: L.LatLngBounds } | null>(null);
  const [loading, setLoading] = useState(true);

  const [metric, setMetric] = useState<MapMetricType>('ortacha_ball');
  const [showPanel, setShowPanel] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    Promise.all([fetchViloyatlarGeoJSON(), fetchTumanlarGeoJSON()])
      .then(([vGeo, tGeo]) => {
        setViloyatlarGeo(vGeo);
        setTumanlarGeo(tGeo);
        setLoading(false);
      });
  }, []);

  const viloyatStats = useMemo(() => generateViloyatStats(), []);

  const tumanStats = useMemo(() => {
    if (!selectedViloyatKod || !tumanlarGeo) return [];
    return generateTumanStats(selectedViloyatKod, tumanlarGeo);
  }, [selectedViloyatKod, tumanlarGeo]);

  // Maktablar for selected tuman
  const maktablar = useMemo(() => {
    if (!selectedTuman || !selectedViloyat || !selectedViloyatKod) return [];
    return generateMaktablar(selectedTuman, selectedViloyat, selectedViloyatKod, tumanlarGeo || undefined);
  }, [selectedTuman, selectedViloyat, selectedViloyatKod, tumanlarGeo]);

  const statsSummary = useMemo(() => {
    if (level === 'maktab' && selectedMaktab) {
      return { maktablar: 1, oquvchilar: selectedMaktab.oquvchilar_soni, ball: selectedMaktab.ortacha_ball };
    }
    if ((level === 'tuman') && selectedTuman) {
      const t = tumanStats.find(s => s.nom === selectedTuman);
      if (t) return { maktablar: t.maktablar_soni, oquvchilar: t.oquvchilar_soni, ball: t.ortacha_ball };
    }
    if (level === 'viloyat' && selectedViloyatKod) {
      const v = viloyatStats.find(s => s.kod === selectedViloyatKod);
      if (v) return { maktablar: v.maktablar_soni, oquvchilar: v.oquvchilar_soni, ball: v.ortacha_ball };
    }
    return {
      maktablar: viloyatStats.reduce((s, v) => s + v.maktablar_soni, 0),
      oquvchilar: viloyatStats.reduce((s, v) => s + v.oquvchilar_soni, 0),
      ball: Math.round(viloyatStats.reduce((s, v) => s + v.ortacha_ball, 0) / viloyatStats.length),
    };
  }, [level, viloyatStats, selectedViloyatKod, selectedTuman, tumanStats, selectedMaktab]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !viloyatlarGeo || !tumanlarGeo) return [];
    const q = searchQuery.toLowerCase();
    const results: { type: 'viloyat' | 'tuman'; name: string; parent?: string; kod?: string }[] = [];
    for (const f of viloyatlarGeo.features) {
      if (f.properties.name.toLowerCase().includes(q))
        results.push({ type: 'viloyat', name: f.properties.name, kod: VILOYAT_NAME_TO_KOD[f.properties.name] });
    }
    for (const f of tumanlarGeo.features) {
      if (f.properties.name.toLowerCase().includes(q))
        results.push({ type: 'tuman', name: f.properties.name, parent: f.properties.viloyat });
    }
    return results.slice(0, 8);
  }, [searchQuery, viloyatlarGeo, tumanlarGeo]);

  const handleViloyatSelect = useCallback((viloyatName: string, viloyatKod: string) => {
    setSelectedViloyat(viloyatName);
    setSelectedViloyatKod(viloyatKod);
    setSelectedTuman(null);
    setSelectedMaktab(null);
    setLevel('viloyat');
    if (viloyatlarGeo) {
      const feature = viloyatlarGeo.features.find(f => f.properties.name === viloyatName);
      if (feature) {
        const geoLayer = L.geoJSON(feature);
        setMapTarget({ center: geoLayer.getBounds().getCenter() as unknown as [number, number], zoom: 9, bounds: geoLayer.getBounds() });
      }
    }
  }, [viloyatlarGeo]);

  const handleTumanSelect = useCallback((tumanName: string) => {
    setSelectedTuman(tumanName);
    setSelectedMaktab(null);
    setLevel('tuman');
    const feature = tumanlarGeo?.features.find(f => f.properties.name === tumanName && f.properties.viloyat === selectedViloyat);
    if (feature) {
      const geoLayer = L.geoJSON(feature);
      setMapTarget({ center: geoLayer.getBounds().getCenter() as unknown as [number, number], zoom: 12, bounds: geoLayer.getBounds() });
    }
  }, [tumanlarGeo, selectedViloyat]);

  const handleMaktabSelect = useCallback((maktab: MaktabData) => {
    setSelectedMaktab(maktab);
    setLevel('maktab');
    setMapTarget({ center: [maktab.lat, maktab.lng], zoom: 15 });
  }, []);

  const handleBack = useCallback(() => {
    if (level === 'maktab') {
      setSelectedMaktab(null);
      setLevel('tuman');
      if (tumanlarGeo && selectedTuman && selectedViloyat) {
        const feature = tumanlarGeo.features.find(f => f.properties.name === selectedTuman && f.properties.viloyat === selectedViloyat);
        if (feature) {
          const geoLayer = L.geoJSON(feature);
          setMapTarget({ center: geoLayer.getBounds().getCenter() as unknown as [number, number], zoom: 12, bounds: geoLayer.getBounds() });
        }
      }
    } else if (level === 'tuman') {
      setSelectedTuman(null);
      setSelectedMaktab(null);
      setLevel('viloyat');
      if (viloyatlarGeo && selectedViloyat) {
        const feature = viloyatlarGeo.features.find(f => f.properties.name === selectedViloyat);
        if (feature) {
          const geoLayer = L.geoJSON(feature);
          setMapTarget({ center: geoLayer.getBounds().getCenter() as unknown as [number, number], zoom: 9, bounds: geoLayer.getBounds() });
        }
      }
    } else if (level === 'viloyat') {
      setSelectedViloyat(null);
      setSelectedViloyatKod(null);
      setSelectedTuman(null);
      setSelectedMaktab(null);
      setLevel('country');
      setMapTarget({ center: UZ_CENTER, zoom: UZ_ZOOM });
    }
  }, [level, viloyatlarGeo, tumanlarGeo, selectedViloyat, selectedTuman]);

  const handleGoHome = useCallback(() => {
    setSelectedViloyat(null);
    setSelectedViloyatKod(null);
    setSelectedTuman(null);
    setSelectedMaktab(null);
    setLevel('country');
    setMapTarget({ center: UZ_CENTER, zoom: UZ_ZOOM });
  }, []);

  const handleSearchSelect = useCallback((item: { type: string; name: string; parent?: string; kod?: string }) => {
    setShowSearch(false);
    setSearchQuery('');
    if (item.type === 'viloyat' && item.kod) {
      handleViloyatSelect(item.name, item.kod);
    } else if (item.type === 'tuman' && item.parent) {
      const parentKod = VILOYAT_NAME_TO_KOD[item.parent] || '';
      if (level !== 'viloyat' || selectedViloyat !== item.parent) {
        handleViloyatSelect(item.parent, parentKod);
      }
      setTimeout(() => handleTumanSelect(item.name), 300);
    }
  }, [handleViloyatSelect, handleTumanSelect, level, selectedViloyat]);

  const tile = TILE_URLS[tileLayer];
  const LEVELS: MapLevel[] = ['country', 'viloyat', 'tuman', 'maktab'];
  const LEVEL_LABELS: Record<MapLevel, string> = { country: 'Mamlakat', viloyat: 'Viloyat', tuman: 'Tuman', maktab: 'Maktab' };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Xarita yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const regionLabel = level === 'maktab' && selectedMaktab ? selectedMaktab.nom :
    level === 'tuman' ? selectedTuman?.replace(/ [Tt]umani/g, '') :
    level === 'viloyat' ? selectedViloyat?.replace(' viloyati', '').replace(' shahar', '') : "O'zbekiston";

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 relative">
        <MapContainer
          center={UZ_CENTER} zoom={UZ_ZOOM} maxBounds={UZ_BOUNDS}
          maxBoundsViscosity={1.0} minZoom={5} maxZoom={18} zoomControl={false}
          className="w-full h-full"
        >
          <TileLayer url={tile.url} attribution={tile.attribution} />
          {tileLayer === 'hybrid' && <TileLayer url="https://stamen-tiles.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png" attribution="" opacity={0.7} />}
          <MapController target={mapTarget} />

          {level === 'country' && viloyatlarGeo && (
            <ChoroplethViloyatLayer geojson={viloyatlarGeo} viloyatStats={viloyatStats} metric={metric} onSelect={handleViloyatSelect} />
          )}
          {(level === 'viloyat') && viloyatlarGeo && tumanlarGeo && selectedViloyat && selectedViloyatKod && (
            <ChoroplethTumanLayer
              viloyatGeo={viloyatlarGeo} tumanlarGeo={tumanlarGeo} viloyatName={selectedViloyat}
              tumanStats={tumanStats} metric={metric} onSelect={handleTumanSelect} selectedTuman={selectedTuman}
            />
          )}
          {(level === 'tuman' || level === 'maktab') && tumanlarGeo && selectedTuman && selectedViloyat && (
            <MaktablarLayer
              tumanlarGeo={tumanlarGeo} tumanName={selectedTuman} viloyatName={selectedViloyat}
              maktablar={maktablar} onSelectMaktab={handleMaktabSelect}
            />
          )}
        </MapContainer>

        {/* NAVIGATION BAR */}
        <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-4 z-[1000] flex items-center gap-2 sm:gap-3 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 px-1.5 py-1.5 flex items-center gap-1 pointer-events-auto breadcrumb-enter max-w-[calc(100vw-80px)] overflow-x-auto">
            <button onClick={handleGoHome} title="Bosh sahifa"
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                level === 'country' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-100 hover:text-blue-600'
              }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
              </svg>
            </button>

            {level !== 'country' && selectedViloyat && (
              <>
                <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <button onClick={level !== 'viloyat' ? () => { setSelectedTuman(null); setSelectedMaktab(null); setLevel('viloyat'); if (viloyatlarGeo) { const f = viloyatlarGeo.features.find(x => x.properties.name === selectedViloyat); if (f) { const gl = L.geoJSON(f); setMapTarget({ center: gl.getBounds().getCenter() as unknown as [number, number], zoom: 9, bounds: gl.getBounds() }); } } } : undefined}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${level === 'viloyat' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600 cursor-pointer'}`}>
                  {selectedViloyat.replace(' viloyati', '').replace(' shahar', '').replace(' Respublikasi', '')}
                </button>
              </>
            )}

            {(level === 'tuman' || level === 'maktab') && selectedTuman && (
              <>
                <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <button onClick={level === 'maktab' ? () => { setSelectedMaktab(null); setLevel('tuman'); } : undefined}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${level === 'tuman' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600 cursor-pointer'}`}>
                  {selectedTuman.replace(/ [Tt]umani/g, '')}
                </button>
              </>
            )}

            {level === 'maktab' && selectedMaktab && (
              <>
                <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white shadow-sm">
                  {selectedMaktab.raqam}-maktab
                </span>
              </>
            )}

            {level !== 'country' && (
              <>
                <div className="w-px h-5 bg-slate-200 mx-0.5" />
                <button onClick={handleBack} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer" title="Orqaga">
                  <ChevronLeft size={16} />
                </button>
              </>
            )}
          </div>

          {/* Level indicator */}
          <div className="hidden sm:flex bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 px-3 py-2 pointer-events-auto items-center gap-2">
            {LEVELS.map((l, i) => (
              <div key={l} className="flex items-center gap-2">
                {i > 0 && <div className={`w-4 h-0.5 rounded-full ${i <= LEVELS.indexOf(level) ? 'bg-blue-400' : 'bg-slate-200'}`} />}
                <div className={`flex items-center gap-1.5 ${l === level ? '' : 'opacity-40'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                    l === level ? 'bg-blue-600 border-blue-600 level-active' :
                    LEVELS.indexOf(l) < LEVELS.indexOf(level) ? 'bg-blue-400 border-blue-400' :
                    'bg-transparent border-slate-300'
                  }`} />
                  <span className={`text-[10px] font-semibold hidden sm:inline ${l === level ? 'text-slate-700' : 'text-slate-400'}`}>
                    {LEVEL_LABELS[l]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="pointer-events-auto">
            {showSearch ? (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 w-64 sm:w-72 overflow-hidden">
                <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-slate-100">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Viloyat yoki tuman qidirish..."
                    className="flex-1 text-sm outline-none bg-transparent text-slate-700 placeholder:text-slate-300"
                    onKeyDown={e => e.key === 'Escape' && (setShowSearch(false), setSearchQuery(''))} />
                  <button onClick={() => (setShowSearch(false), setSearchQuery(''))}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 hover:bg-slate-200 cursor-pointer font-mono">esc</button>
                </div>
                {searchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto">
                    {searchResults.map((r, i) => (
                      <button key={i} onClick={() => handleSearchSelect(r)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50 transition-colors flex items-center gap-2.5 cursor-pointer border-b border-slate-50 last:border-0">
                        <span className={`text-[10px] w-5 h-5 rounded-md flex items-center justify-center font-bold ${r.type === 'viloyat' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {r.type === 'viloyat' ? 'V' : 'T'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{r.name}</p>
                          {r.parent && <p className="text-[10px] text-slate-400">{r.parent}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setShowSearch(true)}
                className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-2 sm:px-3.5 sm:py-2 flex items-center gap-2 hover:bg-white transition-colors cursor-pointer">
                <Search size={14} className="text-slate-400" />
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">Qidirish</span>
              </button>
            )}
          </div>
        </div>

        {/* RIGHT CONTROLS */}
        <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-[1000] flex flex-col gap-2">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-1.5 flex flex-col gap-1">
            {([
              { key: 'map' as TileLayerType, icon: MapIcon, label: 'Xarita' },
              { key: 'satellite' as TileLayerType, icon: Globe, label: 'Sputnik' },
              { key: 'hybrid' as TileLayerType, icon: Satellite, label: 'Gibrid' },
            ]).map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => setTileLayer(key)} title={label}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  tileLayer === key ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-100 hover:text-blue-600'
                }`}>
                <Icon size={15} />
              </button>
            ))}
          </div>
          <button onClick={() => {
            navigator.geolocation.getCurrentPosition(
              pos => setMapTarget({ center: [pos.coords.latitude, pos.coords.longitude], zoom: 13 }),
              () => {}, { enableHighAccuracy: true, timeout: 10000 }
            );
          }} className="w-9 h-9 sm:w-[45px] sm:h-[45px] bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 flex items-center justify-center hover:bg-white transition-colors cursor-pointer">
            <Navigation size={16} className="text-blue-600" />
          </button>
        </div>

        {/* STATS BOX — hidden on mobile, visible on sm+ */}
        <div className="hidden sm:block absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 stats-glow overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-4">
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                <circle cx="22" cy="22" r="18" fill="none"
                  stroke={interpolateColor(statsSummary.ball, 100)}
                  strokeWidth="4" strokeDasharray={`${statsSummary.ball * 1.131} 113.1`} strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.8s ease' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-slate-800 leading-none">{statsSummary.ball}%</span>
                <span className="text-[7px] text-slate-400 font-medium">o'rt. ball</span>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-200/70" />
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{regionLabel}</p>
              <div className="flex gap-3">
                <div>
                  <p className="text-base font-black text-slate-800 leading-tight">{formatNumber(statsSummary.maktablar)}</p>
                  <p className="text-[8px] text-slate-400 font-medium">maktab</p>
                </div>
                <div>
                  <p className="text-base font-black text-blue-600 leading-tight">{formatNumber(statsSummary.oquvchilar)}</p>
                  <p className="text-[8px] text-blue-400 font-medium">o'quvchi</p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-1 bg-slate-100 flex">
            <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: statsSummary.ball + '%' }} />
            <div className="h-full bg-red-400 transition-all duration-700" style={{ width: (100 - statsSummary.ball) + '%' }} />
          </div>
        </div>
        {/* Mobile mini stats */}
        <div className="sm:hidden absolute bottom-2 left-2 z-[1000] bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-white/50 px-2.5 py-1.5 flex items-center gap-2">
          <span className="text-xs font-black" style={{ color: interpolateColor(statsSummary.ball, 100) }}>{statsSummary.ball}%</span>
          <span className="text-[9px] text-slate-400">{formatNumber(statsSummary.maktablar)} maktab</span>
        </div>

        <MapLegend metric={metric} />

        <button onClick={() => setShowPanel(!showPanel)}
          className="hidden lg:block absolute top-1/2 -translate-y-1/2 z-[999] bg-white/90 backdrop-blur-md rounded-l-2xl shadow-lg border border-r-0 border-white/50 p-2 hover:bg-white transition-all cursor-pointer group"
          style={{ right: showPanel ? '320px' : '0px', transition: 'right 0.3s ease' }}>
          <ChevronLeft size={14} className={`text-slate-400 group-hover:text-blue-600 transition-all ${showPanel ? '' : 'rotate-180'}`} />
        </button>
        {/* Mobile panel toggle */}
        {!showPanel && (
          <button onClick={() => setShowPanel(true)}
            className="lg:hidden absolute bottom-2 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 px-4 py-2 cursor-pointer">
            <span className="text-xs font-medium text-slate-600">Ma'lumotlar ↑</span>
          </button>
        )}
      </div>

      {/* SIDEBAR PANEL — desktop: right side, mobile: bottom sheet */}
      {showPanel && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setShowPanel(false)} />}
      <div className={`
        fixed bottom-0 left-0 right-0 z-50 lg:static lg:z-auto
        bg-white border-t lg:border-t-0 lg:border-l border-slate-200
        flex flex-col overflow-hidden transition-all duration-300
        ${showPanel ? 'max-h-[55vh] lg:max-h-none lg:w-80' : 'max-h-0 lg:max-h-none lg:w-0'}
        rounded-t-2xl lg:rounded-none
      `}>
        <div className="flex flex-col overflow-y-auto lg:min-w-[320px]">
          {/* Mobile drag handle */}
          <div className="lg:hidden flex justify-center py-2 shrink-0">
            <div className="w-10 h-1 bg-slate-300 rounded-full" />
          </div>
          {level !== 'maktab' && (
            <div className="p-4 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Ko'rsatkich</h3>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(MAP_METRIC_LABELS) as MapMetricType[]).map(k => (
                  <button key={k} onClick={() => setMetric(k)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                      metric === k ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}>
                    {MAP_METRIC_LABELS[k]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <TalimRegionPanel
            level={level}
            viloyatName={selectedViloyat}
            viloyatKod={selectedViloyatKod}
            tumanName={selectedTuman}
            viloyatStats={viloyatStats}
            tumanStats={tumanStats}
            maktablar={maktablar}
            selectedMaktab={selectedMaktab}
            metric={metric}
            onSelectMaktab={handleMaktabSelect}
          />
        </div>
      </div>
    </div>
  );
}

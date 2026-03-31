import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { MapLevel, TileLayerType, ViloyatCollection, TumanCollection, ViloyatStats, TumanStats, MaktabData, MetricType, CategoryType } from '../../types';
import { VILOYAT_NAME_TO_KOD, VILOYAT_KOD_TO_NAME, METRIC_LABELS, CATEGORY_LABELS } from '../../types';
import { fetchViloyatlarGeoJSON, fetchTumanlarGeoJSON, fetchViloyatStats, fetchTumanStats } from '../../api/viloyatlar';
import { fetchMaktablar } from '../../api/maktablar';
import { enrichViloyatStats, enrichTumanStats, generateViloyatMetrics, generateTumanMetrics, generateSyntheticSchools } from '../../utils/synthetic';
import ChoroplethViloyatLayer from './ChoroplethViloyatLayer';
import ChoroplethTumanLayer from './ChoroplethTumanLayer';
import AdminMaktablarLayer from './AdminMaktablarLayer';
import MapLegend from './MapLegend';
import RegionInfoPanel from './RegionInfoPanel';
import { Layers, Search, ChevronLeft, Navigation, Map as MapIcon, Globe, Satellite } from 'lucide-react';

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
  const applied = useRef<string | null>(null);
  useEffect(() => {
    if (!target) return;
    const key = JSON.stringify(target);
    if (applied.current === key) return;
    applied.current = key;
    if (target.bounds) map.flyToBounds(target.bounds, { padding: [30, 30], maxZoom: target.zoom, duration: 0.8 });
    else map.flyTo(target.center, target.zoom, { duration: 0.8 });
  }, [target, map]);
  return null;
}

export default function AdminMap() {
  const [viloyatlarGeo, setViloyatlarGeo] = useState<ViloyatCollection | null>(null);
  const [tumanlarGeo, setTumanlarGeo] = useState<TumanCollection | null>(null);
  const [viloyatStats, setViloyatStats] = useState<ViloyatStats[]>([]);
  const [tumanStats, setTumanStats] = useState<TumanStats[]>([]);
  const [maktablar, setMaktablar] = useState<MaktabData[]>([]);
  const [allMaktablar, setAllMaktablar] = useState<MaktabData[]>([]);

  const [level, setLevel] = useState<MapLevel>('country');
  const [selectedViloyat, setSelectedViloyat] = useState<string | null>(null);
  const [selectedViloyatKod, setSelectedViloyatKod] = useState<string | null>(null);
  const [selectedTuman, setSelectedTuman] = useState<string | null>(null);

  const [tileLayer, setTileLayer] = useState<TileLayerType>('map');
  const [mapTarget, setMapTarget] = useState<{ center: [number, number]; zoom: number; bounds?: L.LatLngBounds } | null>(null);
  const [loading, setLoading] = useState(true);

  const [metric, setMetric] = useState<MetricType>('satisfaction');
  const [category, setCategory] = useState<CategoryType>('');
  const [showPanel, setShowPanel] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Load all data
  useEffect(() => {
    Promise.all([
      fetchViloyatlarGeoJSON(),
      fetchTumanlarGeoJSON(),
      fetchViloyatStats().catch(() => []),
      fetchMaktablar().catch(() => []),
    ]).then(([vGeo, tGeo, vStats, allM]) => {
      setViloyatlarGeo(vGeo);
      setTumanlarGeo(tGeo);
      setViloyatStats(enrichViloyatStats(vGeo, tGeo, vStats));
      setAllMaktablar(allM);
      setLoading(false);
    });
  }, []);

  // Viloyat metrics
  const viloyatMetrics = useMemo(() => {
    if (!viloyatlarGeo) return new Map();
    return generateViloyatMetrics(viloyatlarGeo, allMaktablar);
  }, [viloyatlarGeo, allMaktablar]);

  // Tuman metrics
  const tumanMetrics = useMemo(() => {
    if (!tumanlarGeo || !selectedViloyat) return new Map();
    const filtered = selectedViloyatKod ? allMaktablar.filter(m => m.viloyat === selectedViloyatKod) : [];
    return generateTumanMetrics(tumanlarGeo, selectedViloyat, filtered);
  }, [tumanlarGeo, selectedViloyat, selectedViloyatKod, allMaktablar]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !viloyatlarGeo || !tumanlarGeo) return [];
    const q = searchQuery.toLowerCase();
    const results: { type: 'viloyat' | 'tuman'; name: string; parent?: string; kod?: string }[] = [];

    for (const f of viloyatlarGeo.features) {
      if (f.properties.name.toLowerCase().includes(q)) {
        results.push({ type: 'viloyat', name: f.properties.name, kod: VILOYAT_NAME_TO_KOD[f.properties.name] });
      }
    }
    for (const f of tumanlarGeo.features) {
      if (f.properties.name.toLowerCase().includes(q)) {
        results.push({ type: 'tuman', name: f.properties.name, parent: f.properties.viloyat });
      }
    }
    return results.slice(0, 8);
  }, [searchQuery, viloyatlarGeo, tumanlarGeo]);

  // Stats summary
  const statsSummary = useMemo(() => {
    if (level === 'tuman') {
      const checked = maktablar.filter(m => m.mamnuniyat_foizi !== null);
      const avgSat = checked.length > 0 ? Math.round(checked.reduce((s, m) => s + (m.mamnuniyat_foizi || 0), 0) / checked.length) : 0;
      return { total: maktablar.length, checked: checked.length, satisfaction: avgSat, problems: maktablar.reduce((s, m) => s + m.muammo, 0) };
    }
    if (level === 'viloyat' && selectedViloyatKod) {
      const vm = viloyatMetrics.get(selectedViloyatKod);
      if (vm) return { total: vm.total, checked: vm.checked, satisfaction: vm.satisfaction, problems: vm.problems };
    }
    let total = 0, checked = 0, sat = 0, probs = 0, cnt = 0;
    for (const [, vm] of viloyatMetrics) {
      total += vm.total; checked += vm.checked; sat += vm.satisfaction; probs += vm.problems; cnt++;
    }
    return { total, checked, satisfaction: cnt > 0 ? Math.round(sat / cnt) : 0, problems: probs };
  }, [level, viloyatMetrics, selectedViloyatKod, maktablar]);

  const handleViloyatSelect = useCallback((viloyatName: string, viloyatKod: string) => {
    setSelectedViloyat(viloyatName);
    setSelectedViloyatKod(viloyatKod);
    setSelectedTuman(null);
    setLevel('viloyat');
    if (viloyatlarGeo) {
      const feature = viloyatlarGeo.features.find(f => f.properties.name === viloyatName);
      if (feature) {
        const geoLayer = L.geoJSON(feature);
        const bounds = geoLayer.getBounds();
        setMapTarget({ center: bounds.getCenter() as unknown as [number, number], zoom: 9, bounds });
      }
    }
    if (tumanlarGeo) {
      fetchTumanStats(viloyatKod).catch(() => []).then(api => {
        setTumanStats(enrichTumanStats(tumanlarGeo!, viloyatName, api));
      });
    }
  }, [viloyatlarGeo, tumanlarGeo]);

  const handleTumanSelect = useCallback((tumanName: string) => {
    setSelectedTuman(tumanName);
    setLevel('tuman');
    const feature = tumanlarGeo?.features.find(f => f.properties.name === tumanName && f.properties.viloyat === selectedViloyat);
    if (feature) {
      const geoLayer = L.geoJSON(feature);
      const bounds = geoLayer.getBounds();
      setMapTarget({ center: bounds.getCenter() as unknown as [number, number], zoom: 13, bounds });
    }
    if (selectedViloyatKod) {
      fetchMaktablar(selectedViloyatKod, tumanName, category).catch(() => []).then(apiSchools => {
        if (feature && tumanlarGeo) {
          setMaktablar(generateSyntheticSchools(feature, selectedViloyat || '', apiSchools));
        } else {
          setMaktablar(apiSchools);
        }
      });
    }
  }, [tumanlarGeo, selectedViloyat, selectedViloyatKod, category]);

  const handleBack = useCallback(() => {
    if (level === 'tuman') {
      setSelectedTuman(null);
      setMaktablar([]);
      setLevel('viloyat');
      if (viloyatlarGeo && selectedViloyat) {
        const feature = viloyatlarGeo.features.find(f => f.properties.name === selectedViloyat);
        if (feature) {
          const geoLayer = L.geoJSON(feature);
          const bounds = geoLayer.getBounds();
          setMapTarget({ center: bounds.getCenter() as unknown as [number, number], zoom: 9, bounds });
        }
      }
    } else if (level === 'viloyat') {
      setSelectedViloyat(null);
      setSelectedViloyatKod(null);
      setSelectedTuman(null);
      setTumanStats([]);
      setMaktablar([]);
      setLevel('country');
      setMapTarget({ center: UZ_CENTER, zoom: UZ_ZOOM });
    }
  }, [level, viloyatlarGeo, selectedViloyat]);

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

  const handleGoHome = useCallback(() => {
    setSelectedViloyat(null);
    setSelectedViloyatKod(null);
    setSelectedTuman(null);
    setTumanStats([]);
    setMaktablar([]);
    setLevel('country');
    setMapTarget({ center: UZ_CENTER, zoom: UZ_ZOOM });
  }, []);

  const tile = TILE_URLS[tileLayer];

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

  const regionLabel = level === 'tuman' ? selectedTuman?.replace(/ [Tt]umani/g, '') :
    level === 'viloyat' ? selectedViloyat?.replace(' viloyati', '').replace(' shahar', '') : "O'zbekiston";

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* ───── MAP ───── */}
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
            <ChoroplethViloyatLayer geojson={viloyatlarGeo} stats={viloyatStats} metric={metric} viloyatMetrics={viloyatMetrics} allMaktablar={allMaktablar} onSelect={handleViloyatSelect} />
          )}
          {level === 'viloyat' && viloyatlarGeo && tumanlarGeo && selectedViloyat && (
            <ChoroplethTumanLayer viloyatGeo={viloyatlarGeo} tumanlarGeo={tumanlarGeo} viloyatName={selectedViloyat} stats={tumanStats} metric={metric} tumanMetrics={tumanMetrics} onSelect={handleTumanSelect} />
          )}
          {level === 'tuman' && tumanlarGeo && selectedTuman && selectedViloyat && (
            <AdminMaktablarLayer tumanlarGeo={tumanlarGeo} tumanName={selectedTuman} viloyatName={selectedViloyat} maktablar={maktablar} />
          )}
        </MapContainer>

        {/* ── NAVIGATION BAR (top) ── */}
        <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center gap-3 pointer-events-none">
          {/* Breadcrumb */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 px-1.5 py-1.5 flex items-center gap-1 pointer-events-auto breadcrumb-enter">
            {/* Home button */}
            <button onClick={handleGoHome} title="Bosh sahifa"
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                level === 'country' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-100 hover:text-blue-600'
              }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" />
              </svg>
            </button>

            {level !== 'country' && (
              <>
                <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>

                <button onClick={level === 'tuman' ? handleBack : undefined} title={selectedViloyat || ''}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    level === 'viloyat'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600 cursor-pointer'
                  }`}>
                  {selectedViloyat?.replace(' viloyati', '').replace(' shahar', '').replace(' Respublikasi', '') || ''}
                </button>
              </>
            )}

            {level === 'tuman' && selectedTuman && (
              <>
                <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white shadow-sm">
                  {selectedTuman.replace(/ [Tt]umani/g, '')}
                </span>
              </>
            )}

            {/* Back button */}
            {level !== 'country' && (
              <>
                <div className="w-px h-5 bg-slate-200 mx-0.5" />
                <button onClick={handleBack}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                  title="Orqaga">
                  <ChevronLeft size={16} />
                </button>
              </>
            )}
          </div>

          {/* Level indicator */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 px-3 py-2 pointer-events-auto flex items-center gap-2">
            {(['country', 'viloyat', 'tuman'] as MapLevel[]).map((l, i) => (
              <div key={l} className="flex items-center gap-2">
                {i > 0 && <div className={`w-4 h-0.5 rounded-full ${i <= ['country', 'viloyat', 'tuman'].indexOf(level) ? 'bg-blue-400' : 'bg-slate-200'}`} />}
                <div className={`flex items-center gap-1.5 ${l === level ? '' : 'opacity-40'}`}>
                  <div className={`w-2.5 h-2.5 rounded-full border-2 ${
                    l === level ? 'bg-blue-600 border-blue-600 level-active' :
                    ['country', 'viloyat', 'tuman'].indexOf(l) < ['country', 'viloyat', 'tuman'].indexOf(level) ? 'bg-blue-400 border-blue-400' :
                    'bg-transparent border-slate-300'
                  }`} />
                  <span className={`text-[10px] font-semibold hidden sm:inline ${l === level ? 'text-slate-700' : 'text-slate-400'}`}>
                    {l === 'country' ? 'Mamlakat' : l === 'viloyat' ? 'Viloyat' : 'Tuman'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <div className="pointer-events-auto">
            {showSearch ? (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 w-72 overflow-hidden">
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
                        <span className={`text-[10px] w-5 h-5 rounded-md flex items-center justify-center font-bold ${
                          r.type === 'viloyat' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
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
                className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 px-3.5 py-2 flex items-center gap-2 hover:bg-white transition-colors cursor-pointer">
                <Search size={14} className="text-slate-400" />
                <span className="text-xs text-slate-400 font-medium">Qidirish</span>
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT CONTROLS ── */}
        <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
          {/* Tile layer */}
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

          {/* GPS */}
          <button onClick={() => {
            navigator.geolocation.getCurrentPosition(
              pos => setMapTarget({ center: [pos.coords.latitude, pos.coords.longitude], zoom: 13 }),
              () => {}, { enableHighAccuracy: true, timeout: 10000 }
            );
          }} className="w-[45px] h-[45px] bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 flex items-center justify-center hover:bg-white transition-colors cursor-pointer">
            <Navigation size={16} className="text-blue-600" />
          </button>
        </div>

        {/* ── STATS BOX ── */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 stats-glow overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-4">
            {/* Satisfaction donut */}
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" fill="none" stroke="#f1f5f9" strokeWidth="4" />
                <circle cx="22" cy="22" r="18" fill="none"
                  stroke={statsSummary.satisfaction >= 70 ? '#22c55e' : statsSummary.satisfaction >= 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="4" strokeDasharray={`${statsSummary.satisfaction * 1.131} 113.1`} strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.8s ease' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-black text-slate-800 leading-none">{statsSummary.satisfaction}%</span>
                <span className="text-[7px] text-slate-400 font-medium">mamnuniyat</span>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-200/70" />

            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{regionLabel}</p>
              <div className="flex gap-3">
                <div>
                  <p className="text-base font-black text-slate-800 leading-tight">{statsSummary.total.toLocaleString()}</p>
                  <p className="text-[8px] text-slate-400 font-medium">ob'yekt</p>
                </div>
                <div>
                  <p className="text-base font-black text-emerald-600 leading-tight">{statsSummary.checked.toLocaleString()}</p>
                  <p className="text-[8px] text-emerald-400 font-medium">tekshirilgan</p>
                </div>
                <div>
                  <p className="text-base font-black text-red-500 leading-tight">{statsSummary.problems.toLocaleString()}</p>
                  <p className="text-[8px] text-red-400 font-medium">muammo</p>
                </div>
              </div>
            </div>
          </div>
          {/* Micro progress bar at bottom */}
          <div className="h-1 bg-slate-100 flex">
            <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: statsSummary.satisfaction + '%' }} />
            <div className="h-full bg-red-400 transition-all duration-700" style={{ width: (100 - statsSummary.satisfaction) + '%' }} />
          </div>
        </div>

        {/* ── LEGEND ── */}
        <MapLegend metric={metric} />

        {/* ── Toggle panel ── */}
        <button onClick={() => setShowPanel(!showPanel)}
          className="absolute top-1/2 -translate-y-1/2 z-[999] bg-white/90 backdrop-blur-md rounded-l-2xl shadow-lg border border-r-0 border-white/50 p-2 hover:bg-white transition-all cursor-pointer group"
          style={{ right: showPanel ? '320px' : '0px', transition: 'right 0.3s ease' }}>
          <ChevronLeft size={14} className={`text-slate-400 group-hover:text-blue-600 transition-all ${showPanel ? '' : 'rotate-180'}`} />
        </button>
      </div>

      {/* ───── SIDEBAR PANEL ───── */}
      <div className={`bg-white border-l border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${showPanel ? 'w-80' : 'w-0'}`}>
        <div className="flex flex-col overflow-y-auto min-w-[320px]">
          {/* Filters */}
          <div className="p-4 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers size={12} />
              Filtrlar
            </h3>
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] text-slate-400 font-medium mb-1 block">Kategoriya</label>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <button key={k} onClick={() => setCategory(k as CategoryType)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                        category === k ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-medium mb-1 block">Ko'rsatkich</label>
                <div className="flex flex-wrap gap-1">
                  {(Object.keys(METRIC_LABELS) as MetricType[]).map(k => (
                    <button key={k} onClick={() => setMetric(k)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                        metric === k ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}>
                      {METRIC_LABELS[k]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Region info */}
          <RegionInfoPanel
            level={level}
            viloyatName={selectedViloyat}
            tumanName={selectedTuman}
            maktablar={level === 'tuman' ? maktablar : []}
            viloyatMetrics={viloyatMetrics}
            tumanMetrics={tumanMetrics}
            selectedViloyatKod={selectedViloyatKod}
            metric={metric}
          />
        </div>
      </div>
    </div>
  );
}

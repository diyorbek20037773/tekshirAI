import { useEffect } from 'react';
import { GeoJSON, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { TumanCollection, MaktabData } from '../../types';
import { getHealthColor, getHealthLabel } from '../../utils/colors';

interface Props {
  tumanlarGeo: TumanCollection;
  tumanName: string;
  viloyatName: string;
  maktablar: MaktabData[];
}

// Pulsing ring overlay for problem markers
function PulsingRings({ maktablar }: { maktablar: MaktabData[] }) {
  const map = useMap();

  useEffect(() => {
    const markers: L.CircleMarker[] = [];

    for (const m of maktablar) {
      if (m.mamnuniyat_foizi !== null && m.mamnuniyat_foizi < 40) {
        // Outer pulsing ring
        const ring = L.circleMarker([m.lat, m.lng], {
          radius: 18,
          fillColor: '#ef4444',
          fillOpacity: 0.15,
          color: '#ef4444',
          weight: 1.5,
          opacity: 0.4,
          className: 'pulse-ring-marker',
        }).addTo(map);
        markers.push(ring);

        // Second ring
        const ring2 = L.circleMarker([m.lat, m.lng], {
          radius: 25,
          fillColor: 'transparent',
          fillOpacity: 0,
          color: '#ef4444',
          weight: 1,
          opacity: 0.2,
          dashArray: '3 3',
        }).addTo(map);
        markers.push(ring2);
      }
    }

    return () => {
      for (const m of markers) map.removeLayer(m);
    };
  }, [map, maktablar]);

  return null;
}

export default function AdminMaktablarLayer({ tumanlarGeo, tumanName, viloyatName, maktablar }: Props) {
  const tumanFeature = tumanlarGeo.features.find(
    f => f.properties.name === tumanName && f.properties.viloyat === viloyatName
  );

  // Sort so problem markers render on top
  const sorted = [...maktablar].sort((a, b) => (b.mamnuniyat_foizi ?? 101) - (a.mamnuniyat_foizi ?? 101));

  return (
    <>
      {tumanFeature && (
        <GeoJSON
          key={`border-${tumanName}`}
          data={tumanFeature}
          style={{
            fillColor: '#3b82f6',
            fillOpacity: 0.04,
            color: '#3b82f6',
            weight: 2.5,
            dashArray: '8 4',
            opacity: 0.4,
          }}
        />
      )}

      <PulsingRings maktablar={maktablar} />

      {sorted.map(m => {
        const color = getHealthColor(m.mamnuniyat_foizi);
        const label = getHealthLabel(m.mamnuniyat_foizi);
        const isProblem = m.mamnuniyat_foizi !== null && m.mamnuniyat_foizi < 40;
        const isGood = m.mamnuniyat_foizi !== null && m.mamnuniyat_foizi >= 70;
        const radius = isProblem ? 12 : isGood ? 9 : 10;

        return (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lng]}
            radius={radius}
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.9,
              color: isProblem ? '#fecaca' : '#ffffff',
              weight: isProblem ? 3 : 2,
              opacity: 1,
            }}
          >
            <Popup>
              <div className="p-0">
                {/* Header with gradient */}
                <div className="px-4 py-3 text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                  <h3 className="font-bold text-sm leading-tight">{m.nom}</h3>
                  <p className="text-white/70 text-[10px] mt-0.5">{m.tuman}, {m.viloyat}</p>
                </div>

                {/* Body */}
                <div className="px-4 py-3">
                  {/* Status + satisfaction */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold"
                      style={{ backgroundColor: color + '15', color }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      {label}
                    </span>
                    <span className="text-xl font-black text-slate-800">
                      {m.mamnuniyat_foizi !== null ? m.mamnuniyat_foizi + '%' : '—'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  {m.mamnuniyat_foizi !== null && (
                    <div className="mb-3">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: m.mamnuniyat_foizi + '%', backgroundColor: color }} />
                      </div>
                    </div>
                  )}

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <p className="text-xs font-bold text-slate-700">{m.jami_tekshiruv}</p>
                      <p className="text-[8px] text-slate-400 uppercase tracking-wider">Tekshiruv</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2 text-center">
                      <p className="text-xs font-bold text-emerald-600">{m.bajarildi}</p>
                      <p className="text-[8px] text-emerald-400 uppercase tracking-wider">Bajarildi</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2 text-center">
                      <p className="text-xs font-bold text-red-500">{m.muammo}</p>
                      <p className="text-[8px] text-red-400 uppercase tracking-wider">Muammo</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>{m.vaadalar_soni} ta va'da</span>
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

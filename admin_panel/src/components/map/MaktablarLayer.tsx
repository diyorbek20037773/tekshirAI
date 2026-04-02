import { useMemo } from 'react';
import { GeoJSON, CircleMarker, Popup } from 'react-leaflet';
import type { TumanCollection, MaktabData } from '../../types';
import { getScoreColor, getScoreLabel } from '../../utils/colors';

interface Props {
  tumanlarGeo: TumanCollection;
  tumanName: string;
  viloyatName: string;
  maktablar: MaktabData[];
  onSelectMaktab: (maktab: MaktabData) => void;
}

export default function MaktablarLayer({ tumanlarGeo, tumanName, viloyatName, maktablar, onSelectMaktab }: Props) {
  const tumanFeature = tumanlarGeo.features.find(
    f => f.properties.name === tumanName && f.properties.viloyat === viloyatName
  );

  const sorted = useMemo(() =>
    [...maktablar].sort((a, b) => b.ortacha_ball - a.ortacha_ball),
  [maktablar]);

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

      {sorted.map(m => {
        const color = getScoreColor(m.ortacha_ball);
        const label = getScoreLabel(m.ortacha_ball);
        const isPast = m.ortacha_ball < 55;
        const isAlo = m.ortacha_ball >= 75;
        const radius = isPast ? 12 : isAlo ? 9 : 10;

        return (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lng]}
            radius={radius}
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.9,
              color: isPast ? '#fecaca' : '#ffffff',
              weight: isPast ? 3 : 2,
              opacity: 1,
            }}
            eventHandlers={{
              click: () => onSelectMaktab(m),
            }}
          >
            <Popup>
              <div className="p-0">
                <div className="px-3 py-2 text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                  <h3 className="font-bold text-xs leading-tight">{m.nom}</h3>
                  <p className="text-white/70 text-[9px] mt-0.5">{m.tuman}</p>
                </div>
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
                      style={{ backgroundColor: color + '15', color }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                      {label}
                    </span>
                    <span className="text-lg font-black text-slate-800">{m.ortacha_ball}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full" style={{ width: m.ortacha_ball + '%', backgroundColor: color }} />
                  </div>
                  <div className="flex gap-3 text-[10px] mb-2">
                    <span className="text-slate-600"><b>{m.oquvchilar_soni}</b> o'quv.</span>
                    <span className="text-blue-600"><b>{m.sinflar_soni}</b> sinf</span>
                    <span className="text-emerald-600"><b>{m.davomat_foizi}%</b> dav.</span>
                  </div>
                  <button
                    onClick={() => onSelectMaktab(m)}
                    className="w-full px-2 py-1 bg-blue-600 text-white text-[10px] font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Batafsil →
                  </button>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

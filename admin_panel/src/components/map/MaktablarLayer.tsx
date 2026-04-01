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
                <div className="px-4 py-3 text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                  <h3 className="font-bold text-sm leading-tight">{m.nom}</h3>
                  <p className="text-white/70 text-[10px] mt-0.5">{m.tuman}, {m.viloyat}</p>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold"
                      style={{ backgroundColor: color + '15', color }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      {label}
                    </span>
                    <span className="text-xl font-black text-slate-800">{m.ortacha_ball}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full rounded-full" style={{ width: m.ortacha_ball + '%', backgroundColor: color }} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <p className="text-xs font-bold text-slate-700">{m.oquvchilar_soni}</p>
                      <p className="text-[8px] text-slate-400 uppercase">O'quvchi</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-2 text-center">
                      <p className="text-xs font-bold text-blue-600">{m.sinflar_soni}</p>
                      <p className="text-[8px] text-blue-400 uppercase">Sinf</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2 text-center">
                      <p className="text-xs font-bold text-emerald-600">{m.davomat_foizi}%</p>
                      <p className="text-[8px] text-emerald-400 uppercase">Davomat</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectMaktab(m)}
                    className="w-full mt-1 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Batafsil ko'rish →
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

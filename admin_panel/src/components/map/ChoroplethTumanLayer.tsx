import { useMemo } from 'react';
import { GeoJSON, Tooltip } from 'react-leaflet';
import type { ViloyatCollection, TumanCollection, TumanTalimStats, MapMetricType } from '../../types';
import { interpolateColor, getMetricColor } from '../../utils/colors';

interface Props {
  viloyatGeo: ViloyatCollection;
  tumanlarGeo: TumanCollection;
  viloyatName: string;
  tumanStats: TumanTalimStats[];
  metric: MapMetricType;
  onSelect: (tumanName: string) => void;
  selectedTuman: string | null;
}

export default function ChoroplethTumanLayer({ viloyatGeo, tumanlarGeo, viloyatName, tumanStats, metric, onSelect, selectedTuman }: Props) {
  const viloyatFeature = viloyatGeo.features.find(f => f.properties.name === viloyatName);
  const tumanlar = useMemo(() => tumanlarGeo.features.filter(f => f.properties.viloyat === viloyatName), [tumanlarGeo, viloyatName]);

  const statsMap = useMemo(() => {
    const m = new Map<string, TumanTalimStats>();
    for (const s of tumanStats) m.set(s.nom, s);
    return m;
  }, [tumanStats]);

  const globalMax = useMemo(() => {
    if (metric === 'ortacha_ball' || metric === 'sifat' || metric === 'davomat') return 100;
    return Math.max(1, ...tumanStats.map(t => t.ai_tekshiruvlar));
  }, [tumanStats, metric]);

  return (
    <>
      {viloyatFeature && (
        <GeoJSON
          key={`border-${viloyatName}`}
          data={viloyatFeature}
          style={{ fillColor: 'transparent', fillOpacity: 0, color: '#475569', weight: 3, dashArray: '8 4', opacity: 0.5 }}
        />
      )}

      {tumanlar.map((feature, idx) => {
        const name = feature.properties.name;
        const tm = statsMap.get(name);
        const isSelected = selectedTuman === name;

        let value = 0;
        let label = '';
        if (tm) {
          if (metric === 'ortacha_ball' || metric === 'sifat') {
            value = tm.ortacha_ball;
            label = value + '%';
          } else if (metric === 'davomat') {
            value = tm.davomat_foizi;
            label = value + '%';
          } else {
            value = tm.ai_tekshiruvlar;
            label = value >= 1000 ? Math.round(value / 1000) + 'K' : String(value);
          }
        }

        const fillColor = tm
          ? (metric === 'ai_tekshiruvlar' ? getMetricColor(value, globalMax, metric) : interpolateColor(value, 100))
          : '#e2e8f0';

        const shortName = name.replace(/ [Tt]umani/g, '').replace(/ shahri/g, '');

        return (
          <GeoJSON
            key={`tuman-${name}-${idx}-${metric}`}
            data={feature}
            style={{
              fillColor: isSelected ? '#3b82f6' : fillColor,
              fillOpacity: isSelected ? 0.6 : tm ? 0.5 : 0.15,
              color: isSelected ? '#1d4ed8' : '#ffffff',
              weight: isSelected ? 3 : 1.5,
              opacity: 0.8,
            }}
            eventHandlers={{
              click: () => onSelect(name),
              mouseover: (e) => {
                e.target.setStyle({ fillOpacity: 0.7, weight: 2.5 });
                e.target.bringToFront();
              },
              mouseout: (e) => {
                e.target.setStyle({
                  fillOpacity: isSelected ? 0.6 : tm ? 0.5 : 0.15,
                  weight: isSelected ? 3 : 1.5,
                });
              },
            }}
          >
            <Tooltip permanent direction="center" className="tuman-label">
              <div className="text-center">
                <div className="text-[9px]">{shortName}</div>
                {tm && (
                  <span className="inline-block mt-0.5 px-1 py-0 rounded-full text-white text-[8px] font-bold"
                    style={{ backgroundColor: fillColor }}>
                    {label}
                  </span>
                )}
              </div>
            </Tooltip>
          </GeoJSON>
        );
      })}
    </>
  );
}

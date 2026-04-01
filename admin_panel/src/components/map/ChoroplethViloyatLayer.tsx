import { useMemo } from 'react';
import { GeoJSON, Tooltip } from 'react-leaflet';
import type { ViloyatCollection, ViloyatTalimStats, MapMetricType } from '../../types';
import { VILOYAT_NAME_TO_KOD } from '../../types';
import { interpolateColor, getMetricColor } from '../../utils/colors';

interface Props {
  geojson: ViloyatCollection;
  viloyatStats: ViloyatTalimStats[];
  metric: MapMetricType;
  onSelect: (viloyatName: string, viloyatKod: string) => void;
}

export default function ChoroplethViloyatLayer({ geojson, viloyatStats, metric, onSelect }: Props) {
  const statsMap = useMemo(() => {
    const m = new Map<string, ViloyatTalimStats>();
    for (const s of viloyatStats) m.set(s.kod, s);
    return m;
  }, [viloyatStats]);

  const globalMax = useMemo(() => {
    if (metric === 'ortacha_ball' || metric === 'sifat' || metric === 'davomat') return 100;
    return Math.max(1, ...viloyatStats.map(v => v.ai_tekshiruvlar));
  }, [viloyatStats, metric]);

  return (
    <>
      {geojson.features.map((feature) => {
        const name = feature.properties.name;
        const kod = VILOYAT_NAME_TO_KOD[name] || '';
        const stat = statsMap.get(kod);

        let value = 0;
        let label = '';
        if (stat) {
          if (metric === 'ortacha_ball' || metric === 'sifat') {
            value = stat.ortacha_ball;
            label = value + '%';
          } else if (metric === 'davomat') {
            value = stat.davomat_foizi;
            label = value + '%';
          } else {
            value = stat.ai_tekshiruvlar;
            label = value >= 1000 ? Math.round(value / 1000) + 'K' : String(value);
          }
        }

        const fillColor = stat
          ? (metric === 'ai_tekshiruvlar' ? getMetricColor(value, globalMax, metric) : interpolateColor(value, 100))
          : '#94a3b8';

        const shortName = name.replace(' viloyati', '').replace(' shahar', ' sh.').replace(' Respublikasi', '');

        return (
          <GeoJSON
            key={`${name}-${metric}`}
            data={feature}
            style={{
              fillColor,
              fillOpacity: 0.5,
              color: '#ffffff',
              weight: 2,
              opacity: 0.9,
            }}
            eventHandlers={{
              click: () => onSelect(name, kod),
              mouseover: (e) => {
                e.target.setStyle({ fillOpacity: 0.7, weight: 3, color: '#ffffff' });
                e.target.bringToFront();
              },
              mouseout: (e) => {
                e.target.setStyle({ fillOpacity: 0.5, weight: 2, color: '#ffffff' });
              },
            }}
          >
            <Tooltip permanent direction="center" className="choropleth-label">
              <div className="text-center">
                <div className="text-[10px]">{shortName}</div>
                <span
                  className="inline-block mt-0.5 px-1.5 py-0 rounded-full text-white text-[9px] font-bold"
                  style={{ backgroundColor: fillColor }}
                >
                  {label || ''}
                </span>
              </div>
            </Tooltip>
          </GeoJSON>
        );
      })}
    </>
  );
}

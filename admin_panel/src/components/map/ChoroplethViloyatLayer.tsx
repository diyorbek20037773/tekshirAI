import { useMemo } from 'react';
import { GeoJSON, Tooltip } from 'react-leaflet';
import type { ViloyatCollection, ViloyatStats, MaktabData, MetricType } from '../../types';
import { VILOYAT_NAME_TO_KOD } from '../../types';
import { interpolateColor, getMetricColor } from '../../utils/colors';

type VMetrics = Map<string, { satisfaction: number; problems: number; inspections: number; total: number; checked: number; bajarildi: number; muammo: number }>;

interface Props {
  geojson: ViloyatCollection;
  stats: ViloyatStats[];
  metric: MetricType;
  viloyatMetrics: VMetrics;
  allMaktablar: MaktabData[];
  onSelect: (viloyatName: string, viloyatKod: string) => void;
}

export default function ChoroplethViloyatLayer({ geojson, stats, metric, viloyatMetrics, onSelect }: Props) {
  const statsMap = useMemo(() => {
    const m = new Map<string, ViloyatStats>();
    for (const s of stats) m.set(s.kod, s);
    return m;
  }, [stats]);

  const globalMax = useMemo(() => {
    let max = 1;
    for (const [, data] of viloyatMetrics) {
      if (metric === 'problems') max = Math.max(max, data.problems);
      else if (metric === 'inspections') max = Math.max(max, data.inspections);
      else if (metric === 'signals') max = Math.max(max, data.bajarildi + data.muammo);
    }
    return max;
  }, [viloyatMetrics, metric]);

  return (
    <>
      {geojson.features.map((feature) => {
        const name = feature.properties.name;
        const kod = VILOYAT_NAME_TO_KOD[name] || '';
        const stat = statsMap.get(kod);
        const vm = viloyatMetrics.get(kod);

        let value = 0;
        let label = '';
        if (vm) {
          if (metric === 'satisfaction') { value = vm.satisfaction; label = value + '%'; }
          else if (metric === 'problems') { value = vm.problems; label = value + ' muammo'; }
          else if (metric === 'inspections') { value = vm.inspections; label = value + ' tekshiruv'; }
          else { value = vm.bajarildi + vm.muammo; label = value + ' signal'; }
        }

        const fillColor = vm
          ? (metric === 'satisfaction' ? interpolateColor(value, 100) : getMetricColor(value, globalMax, metric))
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
                  {label || (stat ? stat.maktablar_soni : '')}
                </span>
              </div>
            </Tooltip>
          </GeoJSON>
        );
      })}
    </>
  );
}

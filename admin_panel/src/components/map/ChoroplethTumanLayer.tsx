import { useMemo } from 'react';
import { GeoJSON, Tooltip } from 'react-leaflet';
import type { ViloyatCollection, TumanCollection, TumanStats, MetricType } from '../../types';
import { normalizeTumanName } from '../../utils/geo';
import { interpolateColor, getMetricColor } from '../../utils/colors';

type TMetrics = Map<string, { satisfaction: number; problems: number; inspections: number; total: number; checked: number; bajarildi: number; muammo: number }>;

interface Props {
  viloyatGeo: ViloyatCollection;
  tumanlarGeo: TumanCollection;
  viloyatName: string;
  stats: TumanStats[];
  metric: MetricType;
  tumanMetrics: TMetrics;
  onSelect: (tumanName: string) => void;
}

export default function ChoroplethTumanLayer({ viloyatGeo, tumanlarGeo, viloyatName, stats, metric, tumanMetrics, onSelect }: Props) {
  const viloyatFeature = viloyatGeo.features.find(f => f.properties.name === viloyatName);
  const tumanlar = useMemo(() => tumanlarGeo.features.filter(f => f.properties.viloyat === viloyatName), [tumanlarGeo, viloyatName]);

  const globalMax = useMemo(() => {
    let max = 1;
    for (const [, data] of tumanMetrics) {
      if (metric === 'problems') max = Math.max(max, data.problems);
      else if (metric === 'inspections') max = Math.max(max, data.inspections);
      else if (metric === 'signals') max = Math.max(max, data.bajarildi + data.muammo);
    }
    return max;
  }, [tumanMetrics, metric]);

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
        const tm = tumanMetrics.get(name);

        let value = 0;
        let label = '';
        if (tm) {
          if (metric === 'satisfaction') { value = tm.satisfaction; label = value + '%'; }
          else if (metric === 'problems') { value = tm.problems; label = value + ''; }
          else if (metric === 'inspections') { value = tm.inspections; label = value + ''; }
          else { value = tm.bajarildi + tm.muammo; label = value + ''; }
        }

        const fillColor = tm
          ? (metric === 'satisfaction' ? interpolateColor(value, 100) : getMetricColor(value, globalMax, metric))
          : '#e2e8f0';

        const shortName = name.replace(/ [Tt]umani/g, '').replace(/ shahri/g, '');

        return (
          <GeoJSON
            key={`tuman-${name}-${idx}-${metric}`}
            data={feature}
            style={{
              fillColor,
              fillOpacity: tm ? 0.5 : 0.15,
              color: '#ffffff',
              weight: 1.5,
              opacity: 0.8,
            }}
            eventHandlers={{
              click: () => onSelect(name),
              mouseover: (e) => {
                e.target.setStyle({ fillOpacity: 0.7, weight: 2.5 });
                e.target.bringToFront();
              },
              mouseout: (e) => {
                e.target.setStyle({ fillOpacity: tm ? 0.5 : 0.15, weight: 1.5 });
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

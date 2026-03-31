import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { TahlilViloyat } from '../../types';
import { interpolateColor } from '../../utils/colors';

interface Props {
  viloyatlar: TahlilViloyat[];
}

export default function RegionalChart({ viloyatlar }: Props) {
  const data = [...viloyatlar]
    .sort((a, b) => b.mamnuniyat_foizi - a.mamnuniyat_foizi)
    .map(v => ({
      name: v.viloyat.replace(' viloyati', '').replace(' shahar', ' sh.'),
      foiz: v.mamnuniyat_foizi,
    }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Viloyatlar bo'yicha mamnuniyat</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => v + '%'} />
          <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v: number) => [v + '%', 'Mamnuniyat']} />
          <Bar dataKey="foiz" radius={[0, 4, 4, 0]} barSize={16}>
            {data.map((entry, i) => (
              <Cell key={i} fill={interpolateColor(entry.foiz, 100)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

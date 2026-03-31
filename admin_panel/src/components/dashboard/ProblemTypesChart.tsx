import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  data: { nom: string; soni: number }[];
}

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function ProblemTypesChart({ data }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Muammo turlari</h3>
      <div className="flex items-center gap-6">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie data={data} dataKey="soni" nameKey="nom" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => [v, 'Soni']} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2 flex-1">
          {data.map((item, i) => (
            <div key={item.nom} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="text-xs text-slate-600 flex-1 truncate">{item.nom}</span>
              <span className="text-xs font-bold text-slate-700">{item.soni}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

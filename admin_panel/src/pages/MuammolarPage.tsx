import { useMemo } from 'react';
import TopBar from '../components/layout/TopBar';
import KPIBar from '../components/shared/KPIBar';
import { generateViloyatStats, generateMuammolar } from '../data';
import { interpolateColor } from '../utils/colors';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle, CheckCircle, AlertCircle, XCircle, Lightbulb } from 'lucide-react';

export default function MuammolarPage() {
  const viloyatlar = useMemo(() => generateViloyatStats(), []);
  const muammolar = useMemo(() => generateMuammolar(), []);

  const distribution = useMemo(() => {
    const alo = viloyatlar.filter(v => v.sifat_darajasi === 'alo').length;
    const yaxshi = viloyatlar.filter(v => v.sifat_darajasi === 'yaxshi').length;
    const ortacha = viloyatlar.filter(v => v.sifat_darajasi === 'ortacha').length;
    const past = viloyatlar.filter(v => v.sifat_darajasi === 'past').length;
    return { alo, yaxshi, ortacha, past };
  }, [viloyatlar]);

  const pieData = [
    { name: "A'lo", value: distribution.alo, color: '#15803d' },
    { name: 'Yaxshi', value: distribution.yaxshi, color: '#22c55e' },
    { name: "O'rtacha", value: distribution.ortacha, color: '#f59e0b' },
    { name: 'Past', value: distribution.past, color: '#ef4444' },
  ];

  const JIDDIYLIK_STYLE = {
    yuqori: { bg: 'bg-red-50', border: 'border-red-200', icon: XCircle, iconColor: 'text-red-500' },
    ortacha: { bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertCircle, iconColor: 'text-amber-500' },
    past: { bg: 'bg-blue-50', border: 'border-blue-200', icon: AlertCircle, iconColor: 'text-blue-500' },
  };

  // Aggregate recommendations
  const tavsiyalar = useMemo(() => {
    const unique = new Set<string>();
    return muammolar
      .filter(m => { if (unique.has(m.tavsiya)) return false; unique.add(m.tavsiya); return true; })
      .map(m => m.tavsiya);
  }, [muammolar]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Muammolar" subtitle="Viloyat muammolari va tavsiyalar" />
      <KPIBar />

      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* 4 cards */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "A'lo sifat", count: distribution.alo, color: '#15803d', bg: 'from-emerald-50 to-green-50', icon: CheckCircle },
              { label: 'Yaxshi', count: distribution.yaxshi, color: '#22c55e', bg: 'from-green-50 to-lime-50', icon: CheckCircle },
              { label: "O'rtacha", count: distribution.ortacha, color: '#f59e0b', bg: 'from-amber-50 to-yellow-50', icon: AlertCircle },
              { label: 'Past', count: distribution.past, color: '#ef4444', bg: 'from-red-50 to-orange-50', icon: XCircle },
            ].map(item => (
              <div key={item.label} className={`bg-gradient-to-br ${item.bg} rounded-xl border border-slate-200/50 p-4 text-center`}>
                <item.icon size={24} style={{ color: item.color }} className="mx-auto mb-2" />
                <p className="text-3xl font-black" style={{ color: item.color }}>{item.count}</p>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">{item.label}</p>
                <p className="text-[10px] text-slate-400">viloyat</p>
              </div>
            ))}
          </div>

          {/* Donut */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
            <div className="w-32 h-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value + ' viloyat', name]}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 mb-2">Sifat taqsimoti</p>
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-[11px] text-slate-500 flex-1">{d.name}</span>
                  <span className="text-[11px] font-bold text-slate-700">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Problem cards */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="text-sm font-bold text-slate-700">Viloyat muammolari</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {muammolar.map(m => {
              const style = JIDDIYLIK_STYLE[m.jiddiylik];
              const viloyat = viloyatlar.find(v => v.kod === m.viloyat_kod);
              const Icon = style.icon;
              return (
                <div key={m.viloyat_kod + m.muammo_turi}
                  className={`${style.bg} border ${style.border} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={16} className={style.iconColor} />
                    <p className="text-sm font-bold text-slate-700">
                      {m.viloyat_nom.replace(' viloyati', '').replace(' shahar', '').replace(' Respublikasi', '')}
                    </p>
                    {viloyat && (
                      <span className="ml-auto text-sm font-black" style={{ color: interpolateColor(viloyat.ortacha_ball, 100) }}>
                        {viloyat.ortacha_ball}%
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">{m.muammo_turi}</p>
                  <p className="text-[11px] text-slate-500 mb-2">{m.tafsilot}</p>
                  <div className="flex items-start gap-1.5 bg-white/50 rounded-lg p-2">
                    <Lightbulb size={12} className="text-blue-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-blue-700 leading-relaxed">{m.tavsiya}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aggregated recommendations */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={18} className="text-blue-600" />
            <h3 className="text-sm font-bold text-blue-800">Umumiy tavsiyalar</h3>
          </div>
          <div className="space-y-2.5">
            {tavsiyalar.map((t, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-[12px] text-blue-800 leading-relaxed">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

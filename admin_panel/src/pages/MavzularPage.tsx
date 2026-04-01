import { useMemo } from 'react';
import TopBar from '../components/layout/TopBar';
import KPIBar from '../components/shared/KPIBar';
import { generateFanStats, generateZaifMavzular } from '../data';
import { interpolateColor } from '../utils/colors';
import { formatNumber } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BookOpen, AlertTriangle, Lightbulb, TrendingDown } from 'lucide-react';

const FAN_ICONS: Record<string, string> = {
  Matematika: '📐',
  Fizika: '⚛️',
  Kimyo: '🧪',
  Biologiya: '🧬',
  'Ona tili': '📝',
  'Ingliz tili': '🌍',
  Tarix: '📜',
  Informatika: '💻',
};

export default function MavzularPage() {
  const fanlar = useMemo(() => generateFanStats(), []);
  const zaifMavzular = useMemo(() => generateZaifMavzular(), []);

  const chartData = useMemo(() =>
    [...fanlar].sort((a, b) => b.ortacha_ball - a.ortacha_ball).map(f => ({
      name: f.fan_nomi,
      ball: f.ortacha_ball,
    })),
  [fanlar]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Mavzular" subtitle="Fan va mavzu tahlili" />
      <KPIBar />

      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Fan cards — 2/3 */}
          <div className="xl:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-blue-500" />
              <h3 className="text-sm font-bold text-slate-700">Fanlar bo'yicha natijalar</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fanlar.map(fan => (
                <div key={fan.fan_nomi} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{FAN_ICONS[fan.fan_nomi] || '📚'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700">{fan.fan_nomi}</p>
                      <p className="text-[10px] text-slate-400">{formatNumber(fan.tekshiruvlar_soni)} tekshiruv</p>
                    </div>
                    <span className="text-xl font-black" style={{ color: interpolateColor(fan.ortacha_ball, 100) }}>
                      {fan.ortacha_ball}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: fan.progress + '%', backgroundColor: interpolateColor(fan.progress, 100) }} />
                  </div>

                  {/* Zaif mavzular */}
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium mb-1">Eng zaif mavzular:</p>
                    <div className="flex flex-wrap gap-1">
                      {fan.eng_zaif_mavzular.map(m => (
                        <span key={m} className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-medium rounded">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel — 1/3 */}
          <div className="space-y-4">
            {/* Eng zaif 3 mavzu */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown size={16} className="text-red-500" />
                <h3 className="text-sm font-bold text-slate-700">Eng zaif 3 mavzu</h3>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">Butun O'zbekiston bo'yicha</p>

              <div className="space-y-3">
                {zaifMavzular.map((zm, i) => (
                  <div key={zm.mavzu} className="p-3 bg-red-50/50 rounded-xl border border-red-100/30">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-black flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-sm font-bold text-slate-700">{zm.mavzu}</p>
                    </div>
                    <div className="ml-7 space-y-1">
                      <p className="text-[11px] text-slate-500">
                        Fan: <span className="font-semibold text-slate-700">{zm.fan}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        O'rtacha ball: <span className="font-bold text-red-500">{zm.ortacha_ball}%</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Ta'sirlangan: <span className="font-semibold">{formatNumber(zm.oquvchilar_soni)}</span> o'quvchi
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {zm.viloyatlar.map(v => (
                          <span key={v} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded">{v}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tavsiya */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-blue-600" />
                <h3 className="text-sm font-bold text-blue-800">Tavsiya</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Yuqoridagi 3 ta mavzu bo'yicha <strong>respublika miqyosida mashq dasturi</strong> tayyorlash tavsiya etiladi.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    TekshirAI platformasida <strong>maxsus mashqlar</strong> moduli ishga tushirilsin.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    Eng zaif viloyatlarda <strong>qo'shimcha dars soatlari</strong> ajratilsin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">Fanlar bo'yicha o'rtacha ball (taqqoslash)</h3>
          <div className="h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 30 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip
                  formatter={(value) => [value + '%', "O'rtacha ball"]}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="ball" radius={[0, 6, 6, 0]} barSize={24}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={interpolateColor(entry.ball, 100)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

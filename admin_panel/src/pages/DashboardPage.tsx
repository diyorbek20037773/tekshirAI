import { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import RegionalChart from '../components/dashboard/RegionalChart';
import ProblemTypesChart from '../components/dashboard/ProblemTypesChart';
import TopFacilities from '../components/dashboard/TopFacilities';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import StatCard from '../components/shared/StatCard';
import StatusBadge from '../components/shared/StatusBadge';
import { fetchStatistika } from '../api/statistika';
import { fetchTahlil } from '../api/tahlil';
import { fetchFeed } from '../api/feed';
import type { Statistika, TahlilResponse, FeedItem } from '../types';
import {
  AlertTriangle, CheckCircle, Clock, TrendingUp,
  Heart, MessageCircle,
  School, Baby, Stethoscope, Dumbbell,
} from 'lucide-react';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Assalomu alaykum';
  if (h < 12) return 'Xayrli tong';
  if (h < 18) return 'Xayrli kun';
  return 'Xayrli kech';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Statistika | null>(null);
  const [tahlil, setTahlil] = useState<TahlilResponse | null>(null);
  const [recentFeed, setRecentFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchStatistika().catch(() => null),
      fetchTahlil().catch(() => null),
      fetchFeed(5).catch(() => ({ results: [], jami: 0, has_more: false })),
    ]).then(([s, t, f]) => {
      setStats(s);
      setTahlil(t);
      setRecentFeed(f.results);
      setLoading(false);
    });
  }, []);

  if (loading) return <><TopBar title="Dashboard" /><LoadingSpinner /></>;

  const u = tahlil?.umumiy;
  const kutilmoqda = stats ? stats.murojaatlar_soni - stats.hal_qilingan : 0;
  const halQilinganFoiz = stats && stats.murojaatlar_soni > 0
    ? Math.round((stats.hal_qilingan / stats.murojaatlar_soni) * 100)
    : 0;

  return (
    <>
      <TopBar title="Dashboard" subtitle={getGreeting() + ', Admin'} />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Hero stat cards - gradient */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Jami murojaatlar" value={stats?.murojaatlar_soni ?? 0} icon={AlertTriangle} color="#ef4444" gradient />
          <StatCard label="Hal qilingan" value={stats?.hal_qilingan ?? 0} icon={CheckCircle} color="#22c55e" gradient />
          <StatCard label="Kutilmoqda" value={kutilmoqda} icon={Clock} color="#f59e0b" gradient />
          <StatCard label="Mamnuniyat" value={(stats?.mamnuniyat_foizi ?? 0) + '%'} icon={TrendingUp} color="#3b82f6" gradient />
        </div>

        {/* Infratuzilma tarkibi + tekshiruv stats */}
        <div className="grid grid-cols-6 gap-4">
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Infratuzilma tarkibi</h3>
            <div className="space-y-3">
              {[
                { icon: School, label: 'Maktablar', value: stats?.maktablar_soni ?? 0, color: '#3b82f6' },
                { icon: Baby, label: "Bog'chalar", value: stats?.bogchalar_soni ?? 0, color: '#8b5cf6' },
                { icon: Stethoscope, label: 'Tibbiyot', value: stats?.tibbiyot_soni ?? 0, color: '#ef4444' },
                { icon: Dumbbell, label: 'Sport', value: stats?.sport_soni ?? 0, color: '#22c55e' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: item.color + '15' }}>
                    <item.icon size={16} style={{ color: item.color }} />
                  </div>
                  <span className="text-sm text-slate-600 flex-1">{item.label}</span>
                  <span className="text-sm font-bold text-slate-800">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tekshiruvlar summary */}
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Tekshiruvlar</h3>
            {u ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-800">{u.jami_tekshiruv.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-1">Jami tekshiruvlar</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-emerald-600">{u.bajarildi.toLocaleString()}</p>
                    <p className="text-[11px] text-emerald-500">Bajarildi</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-red-500">{u.muammo.toLocaleString()}</p>
                    <p className="text-[11px] text-red-400">Muammo</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                  <p className="text-xs text-slate-400">Tekshirilgan muassasalar</p>
                  <p className="text-sm font-bold text-slate-700">{u.tekshirilgan_maktablar.toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Ma'lumot yo'q</p>
            )}
          </div>

          {/* Murojaatlar progress */}
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">Murojaatlar holati</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3"
                    strokeDasharray={`${halQilinganFoiz} ${100 - halQilinganFoiz}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-bold text-slate-800">{halQilinganFoiz}%</p>
                    <p className="text-[9px] text-slate-400">hal qilindi</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-emerald-50 rounded-lg p-2">
                <p className="text-sm font-bold text-emerald-600">{stats?.hal_qilingan ?? 0}</p>
                <p className="text-[10px] text-emerald-500">Hal qilindi</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-2">
                <p className="text-sm font-bold text-amber-600">{kutilmoqda}</p>
                <p className="text-[10px] text-amber-500">Kutilmoqda</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          {tahlil && <RegionalChart viloyatlar={tahlil.viloyatlar} />}
          {tahlil && <ProblemTypesChart data={tahlil.muammo_turlari} />}
        </div>

        {/* Top facilities */}
        {tahlil && (
          <TopFacilities best={tahlil.eng_yaxshi_maktablar} worst={tahlil.eng_yomon_maktablar} />
        )}

        {/* Recent signals */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Oxirgi signallar</h3>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] text-slate-400">Real vaqtda</span>
          </div>
          <div className="space-y-2">
            {recentFeed.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 text-xs font-bold text-slate-400">
                  {item.is_anonim ? 'A' : (item.user?.[0] || '?')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-700 line-clamp-1">{item.izoh}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {item.is_anonim ? 'Anonim' : item.user} — {item.viloyat}, {item.tuman}
                  </p>
                </div>
                <StatusBadge holat={item.holat_kod} />
                <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
                  <span className="flex items-center gap-0.5"><Heart size={10} />{item.likes_soni}</span>
                  <span className="flex items-center gap-0.5"><MessageCircle size={10} />{item.comments_soni}</span>
                  <span>{item.vaqt}</span>
                </div>
              </div>
            ))}
            {recentFeed.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">Hali signallar yo'q</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

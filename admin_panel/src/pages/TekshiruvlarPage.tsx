import { useState, useEffect } from 'react';
import {
  BarChart3, BookOpen, TrendingUp, RefreshCw, Award
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface SubStats {
  by_subject: { subject: string; count: number; avg_score: number }[];
  by_grade: { grade: number; count: number; avg_score: number }[];
  daily_trend: { date: string; count: number; avg_score: number }[];
  recent: {
    id: string; student_name: string; username: string; grade: number;
    maktab: string; subject: string; score: number; total_problems: number;
    correct_count: number; created_at: string;
  }[];
  overall_avg_score: number;
}

interface ActiveUser {
  full_name: string; username: string; role: string; grade: number;
  maktab: string; viloyat: string; submission_count: number; avg_score: number;
}

interface Props {
  adminId: string;
}

export default function TekshiruvlarPage({ adminId }: Props) {
  const [stats, setStats] = useState<SubStats | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const headers = { 'X-Admin-Token': adminId };
      const [statsRes, activeRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/submissions-stats`, { headers }),
        fetch(`${API_BASE}/api/admin/active-users`, { headers }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (activeRes.ok) setActiveUsers(await activeRes.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [adminId]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600" />
    </div>
  );

  if (!stats) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-slate-500">Ma'lumotlarni yuklashda xatolik</p>
    </div>
  );

  const maxDailyCount = Math.max(...stats.daily_trend.map(d => d.count), 1);
  const maxSubjectCount = Math.max(...stats.by_subject.map(s => s.count), 1);
  const totalSubs = stats.by_subject.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Tekshiruvlar</h1>
            <p className="text-slate-500 text-sm mt-1">Uy vazifalari tekshiruvi tahlili</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
            <RefreshCw className="w-4 h-4" /> Yangilash
          </button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* KPI */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 text-white">
            <BarChart3 className="w-6 h-6 opacity-80 mb-2" />
            <p className="text-3xl font-bold">{totalSubs}</p>
            <p className="text-blue-100 text-xs mt-1">Jami tekshiruvlar</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-5 text-white">
            <TrendingUp className="w-6 h-6 opacity-80 mb-2" />
            <p className="text-3xl font-bold">{stats.overall_avg_score}%</p>
            <p className="text-emerald-100 text-xs mt-1">O'rtacha ball</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-5 text-white">
            <BookOpen className="w-6 h-6 opacity-80 mb-2" />
            <p className="text-3xl font-bold">{stats.by_subject.length}</p>
            <p className="text-purple-100 text-xs mt-1">Fan turlari</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-5 text-white">
            <Award className="w-6 h-6 opacity-80 mb-2" />
            <p className="text-3xl font-bold">{activeUsers.length}</p>
            <p className="text-amber-100 text-xs mt-1">Faol o'quvchilar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Kunlik trend */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Kunlik tekshiruvlar (14 kun)</h3>
            <div className="flex items-end gap-1.5 h-48">
              {stats.daily_trend.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-bold text-slate-600">{d.count}</span>
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all"
                    style={{ height: `${(d.count / maxDailyCount) * 140}px`, minHeight: d.count > 0 ? '6px' : '2px' }}
                  />
                  <span className="text-[9px] text-slate-400">
                    {new Date(d.date).getDate()}/{new Date(d.date).getMonth() + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fan bo'yicha */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Fan bo'yicha tekshiruvlar</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.by_subject.sort((a, b) => b.count - a.count).map(s => (
                <div key={s.subject} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-28 shrink-0 truncate">{s.subject}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3">
                    <div
                      className="h-3 bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(s.count / maxSubjectCount) * 100}%` }}
                    />
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-slate-700">{s.count}</span>
                    <span className="text-xs text-slate-400 ml-1">({s.avg_score}%)</span>
                  </div>
                </div>
              ))}
              {stats.by_subject.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">Hali ma'lumot yo'q</p>
              )}
            </div>
          </div>
        </div>

        {/* Sinf bo'yicha */}
        {stats.by_grade.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Sinf bo'yicha natijalar</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {stats.by_grade.map(g => (
                <div key={g.grade} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                  <p className="text-lg font-bold text-slate-700">{g.grade}-sinf</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">{g.avg_score}%</p>
                  <p className="text-xs text-slate-400 mt-1">{g.count} ta</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Faol o'quvchilar */}
        {activeUsers.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Eng faol o'quvchilar</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Ism</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Sinf</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Maktab</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Viloyat</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Tekshiruvlar</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">O'rtacha</th>
                  </tr>
                </thead>
                <tbody>
                  {activeUsers.map((u, i) => (
                    <tr key={i} className="border-t border-slate-50 hover:bg-blue-50/30 transition">
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${i < 3 ? 'text-yellow-500' : 'text-slate-400'}`}>
                          {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-800">{u.full_name}</p>
                        {u.username && <p className="text-xs text-slate-400">@{u.username}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{u.grade ? `${u.grade}-sinf` : '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{u.maktab || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {u.viloyat ? u.viloyat.replace(' viloyati', '').replace(' shahar', '') : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-blue-600">{u.submission_count}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-sm font-bold ${
                          u.avg_score >= 80 ? 'text-emerald-600' : u.avg_score >= 60 ? 'text-amber-600' : 'text-red-500'
                        }`}>{u.avg_score}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Oxirgi tekshiruvlar */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">
              Oxirgi tekshiruvlar
              <span className="text-sm font-normal text-slate-400 ml-2">({stats.recent.length} ta)</span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">O'quvchi</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Fan</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Sinf</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Ball</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500">Natija</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Vaqt</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((sub) => (
                  <tr key={sub.id} className="border-t border-slate-50 hover:bg-blue-50/30 transition">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-800">{sub.student_name}</p>
                      <p className="text-xs text-slate-400">{sub.maktab || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{sub.subject}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{sub.grade ? `${sub.grade}-sinf` : '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${
                        sub.score >= 80 ? 'text-emerald-600' : sub.score >= 60 ? 'text-amber-600' : 'text-red-500'
                      }`}>{sub.score}%</span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-slate-600">
                      {sub.correct_count}/{sub.total_problems}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {sub.created_at ? new Date(sub.created_at).toLocaleString('uz') : '—'}
                    </td>
                  </tr>
                ))}
                {stats.recent.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      Hali tekshiruv yo'q
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

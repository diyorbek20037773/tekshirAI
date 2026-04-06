import { useState, useEffect } from 'react';
import {
  Users, GraduationCap, UserCheck, Building2, TrendingUp,
  BarChart3, Calendar, RefreshCw, BookOpen
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface AdminStats {
  students: number;
  teachers: number;
  parents: number;
  directors: number;
  total_users: number;
  today_registrations: number;
  today_by_role: Record<string, number>;
  total_submissions: number;
  today_submissions: number;
  by_viloyat: { viloyat: string; count: number }[];
  weekly_registrations: { date: string; count: number }[];
}

interface Props {
  adminId: string;
}

export default function DashboardPage({ adminId }: Props) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/stats`, {
        headers: { 'X-Admin-Token': adminId },
      });
      if (res.ok) setStats(await res.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
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

  const maxViloyat = Math.max(...stats.by_viloyat.map(v => v.count), 1);
  const maxWeekly = Math.max(...stats.weekly_registrations.map(w => w.count), 1);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Real vaqtda statistika</p>
          </div>
          <button onClick={fetchStats} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
            <RefreshCw className="w-4 h-4" /> Yangilash
          </button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* KPI kartlar */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard icon={Users} label="Jami foydalanuvchilar" value={stats.total_users} color="blue" />
          <KPICard icon={BookOpen} label="O'quvchilar" value={stats.students} color="green" />
          <KPICard icon={GraduationCap} label="O'qituvchilar" value={stats.teachers} color="purple" />
          <KPICard icon={UserCheck} label="Ota-onalar" value={stats.parents} color="orange" />
          <KPICard icon={Building2} label="Direktorlar" value={stats.directors} color="indigo" />
        </div>

        {/* Bugungi ko'rsatkichlar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 opacity-80" />
              <p className="text-blue-100 text-sm">Bugungi ro'yxatdan o'tganlar</p>
            </div>
            <p className="text-4xl font-bold">{stats.today_registrations}</p>
            {stats.today_by_role && (
              <div className="mt-3 flex gap-3 text-xs text-blue-100">
                {Object.entries(stats.today_by_role).map(([role, count]) => (
                  count > 0 && <span key={role}>{roleLabel(role)}: {count}</span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 opacity-80" />
              <p className="text-emerald-100 text-sm">Jami tekshiruvlar</p>
            </div>
            <p className="text-4xl font-bold">{stats.total_submissions}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 opacity-80" />
              <p className="text-amber-100 text-sm">Bugungi tekshiruvlar</p>
            </div>
            <p className="text-4xl font-bold">{stats.today_submissions}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Haftalik dinamika */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Haftalik ro'yxatdan o'tish</h3>
            <div className="flex items-end gap-2 h-48">
              {stats.weekly_registrations.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold text-slate-700">{w.count}</span>
                  <div
                    className="w-full bg-blue-500 rounded-t-lg transition-all"
                    style={{ height: `${(w.count / maxWeekly) * 160}px`, minHeight: w.count > 0 ? '8px' : '2px' }}
                  />
                  <span className="text-[10px] text-slate-400">
                    {new Date(w.date).toLocaleDateString('uz', { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Viloyat bo'yicha */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Viloyat bo'yicha foydalanuvchilar</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.by_viloyat.sort((a, b) => b.count - a.count).map(v => (
                <div key={v.viloyat} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-48 shrink-0 truncate">
                    {v.viloyat?.replace(' viloyati', '').replace(' shahar', '').replace(' Respublikasi', '') || '—'}
                  </span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3">
                    <div
                      className="h-3 bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(v.count / maxViloyat) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-700 w-10 text-right">{v.count}</span>
                </div>
              ))}
              {stats.by_viloyat.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">Hali ma'lumot yo'q</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    student: "O'quvchi",
    teacher: "O'qituvchi",
    parent: 'Ota-ona',
    director: 'Direktor',
  };
  return labels[role] || role;
}

function KPICard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };
  return (
    <div className={`rounded-2xl p-5 border ${colors[color] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      <Icon className="w-6 h-6 mb-2 opacity-70" />
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs opacity-60 mt-1">{label}</p>
    </div>
  );
}

import { useState, useEffect } from 'react';
import TopBar from '../components/layout/TopBar';
import KPIBar from '../components/shared/KPIBar';
import { Users, GraduationCap, UserCheck, Star, TrendingUp } from 'lucide-react';

interface UserData {
  id: string;
  full_name: string;
  role: string;
  gender: string | null;
  grade: number | null;
  subject: string | null;
  viloyat: string | null;
  tuman: string | null;
  maktab: string | null;
  created_at: string | null;
}

interface AdminStats {
  students: number;
  teachers: number;
  parents: number;
  total_users: number;
  today_registrations: number;
  total_submissions: number;
  today_submissions: number;
  by_viloyat: { viloyat: string; count: number }[];
}

interface RatingData {
  average: number;
  total: number;
  ratings: { stars: number; comment: string; created_at: string }[];
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function FoydalanuvchilarPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [ratings, setRatings] = useState<RatingData | null>(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    const roleParam = roleFilter ? `?role=${roleFilter}` : '';
    Promise.all([
      fetch(`${API_BASE}/api/admin/stats`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/admin/users${roleParam}&limit=50`.replace('users?', 'users?').replace('users&', 'users?')).then(r => r.json()).catch(() => []),
      fetch(`${API_BASE}/api/admin/ratings`).then(r => r.json()).catch(() => null),
    ]).then(([s, u, r]) => {
      if (s) setStats(s);
      setUsers(u || []);
      if (r) setRatings(r);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [roleFilter]);

  const roleColor = (role: string) => {
    if (role === 'student') return 'bg-blue-100 text-blue-700';
    if (role === 'teacher') return 'bg-green-100 text-green-700';
    return 'bg-orange-100 text-orange-700';
  };

  const roleLabel = (role: string) => {
    if (role === 'student') return "O'quvchi";
    if (role === 'teacher') return "O'qituvchi";
    return 'Ota-ona';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Foydalanuvchilar" subtitle="Real ro'yxatdan o'tish statistikasi" />
      <KPIBar />

      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Statistika kartlar */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBox icon={Users} label="Jami foydalanuvchilar" value={stats.students + stats.teachers + stats.parents} color="blue" />
                <StatBox icon={GraduationCap} label="O'quvchilar" value={stats.students} color="purple" />
                <StatBox icon={UserCheck} label="O'qituvchilar" value={stats.teachers} color="green" />
                <StatBox icon={Users} label="Ota-onalar" value={stats.parents} color="orange" />
              </div>
            )}

            {/* Bugungi + tekshiruvlar */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] text-slate-400">Bugungi ro'yxatdan o'tganlar</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.today_registrations}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] text-slate-400">Jami tekshiruvlar</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.total_submissions}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-[10px] text-slate-400">Bugungi tekshiruvlar</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.today_submissions}</p>
                </div>
              </div>
            )}

            {/* Reyting */}
            {ratings && ratings.total > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <h3 className="text-sm font-bold text-slate-700">Mini App baholari</h3>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-3xl font-black text-yellow-500">{ratings.average}</p>
                    <div className="flex gap-0.5 justify-center mt-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`w-4 h-4 ${i <= Math.round(ratings.average) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{ratings.total} ta baho</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {ratings.ratings.slice(0, 3).map((r, i) => (
                      <div key={i} className="bg-slate-50 rounded-lg p-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-3 h-3 ${s <= r.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        {r.comment && <p className="text-[10px] text-slate-600">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Foydalanuvchilar jadvali */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-700">Oxirgi ro'yxatdan o'tganlar</h3>
                <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white">
                  <option value="">Barchasi</option>
                  <option value="student">O'quvchilar</option>
                  <option value="teacher">O'qituvchilar</option>
                  <option value="parent">Ota-onalar</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500">#</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500">Ism</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500">Rol</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500">Viloyat</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500">Maktab</th>
                      <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500">Sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id} className="border-t border-slate-50 hover:bg-blue-50/30">
                        <td className="px-3 py-2 text-[11px] text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2">
                          <p className="text-xs font-medium text-slate-700">{u.full_name}</p>
                          {u.grade && <p className="text-[9px] text-slate-400">{u.grade}-sinf | {u.subject}</p>}
                        </td>
                        <td className="px-3 py-2">
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${roleColor(u.role)}`}>
                            {roleLabel(u.role)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[10px] text-slate-600">
                          {u.viloyat ? u.viloyat.replace(' viloyati', '').replace(' shahar', '') : '—'}
                        </td>
                        <td className="px-3 py-2 text-[10px] text-slate-600">{u.maktab || '—'}</td>
                        <td className="px-3 py-2 text-[10px] text-slate-400">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('uz') : '—'}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-400">Hali foydalanuvchi yo'q</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Viloyat bo'yicha */}
            {stats && stats.by_viloyat.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-bold text-slate-700 mb-3">Viloyat bo'yicha ro'yxatdan o'tganlar</h3>
                <div className="space-y-2">
                  {stats.by_viloyat.sort((a, b) => b.count - a.count).map(v => (
                    <div key={v.viloyat} className="flex items-center justify-between">
                      <p className="text-xs text-slate-600">{v.viloyat}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(v.count / Math.max(...stats.by_viloyat.map(x => x.count))) * 100}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-6 text-right">{v.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className={`rounded-xl p-4 ${colors[color] || 'bg-slate-50 text-slate-600'}`}>
      <Icon className="w-5 h-5 mb-1" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[10px] opacity-70">{label}</p>
    </div>
  );
}

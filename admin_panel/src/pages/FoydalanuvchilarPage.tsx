import { useState, useEffect } from 'react';
import { Users, GraduationCap, UserCheck, Star, Building2, RefreshCw, Search } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface UserData {
  id: string;
  telegram_id: number;
  full_name: string;
  username: string | null;
  role: string;
  gender: string | null;
  grade: number | null;
  subject: string | null;
  viloyat: string | null;
  tuman: string | null;
  maktab: string | null;
  created_at: string | null;
}

interface RatingData {
  average: number;
  total: number;
  ratings: { stars: number; comment: string; created_at: string }[];
}

interface Props {
  adminId: string;
}

export default function FoydalanuvchilarPage({ adminId }: Props) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [ratings, setRatings] = useState<RatingData | null>(null);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const roleParam = roleFilter ? `&role=${roleFilter}` : '';
      const [usersRes, ratingsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users?telegram_id=${adminId}${roleParam}&limit=100`),
        fetch(`${API_BASE}/api/admin/ratings?telegram_id=${adminId}`),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (ratingsRes.ok) setRatings(await ratingsRes.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [roleFilter, adminId]);

  const roleColor = (role: string) => {
    const colors: Record<string, string> = {
      student: 'bg-blue-100 text-blue-700',
      teacher: 'bg-green-100 text-green-700',
      parent: 'bg-orange-100 text-orange-700',
      director: 'bg-purple-100 text-purple-700',
      admin: 'bg-red-100 text-red-700',
    };
    return colors[role] || 'bg-slate-100 text-slate-700';
  };

  const roleLabel = (role: string) => {
    const labels: Record<string, string> = {
      student: "O'quvchi",
      teacher: "O'qituvchi",
      parent: 'Ota-ona',
      director: 'Direktor',
      admin: 'Admin',
    };
    return labels[role] || role;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Foydalanuvchilar</h1>
            <p className="text-slate-500 text-sm mt-1">Barcha ro'yxatdan o'tganlar</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
            <RefreshCw className="w-4 h-4" /> Yangilash
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Mini App baholari */}
        {ratings && ratings.total > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-bold text-slate-800">Mini App baholari</h3>
            </div>
            <div className="flex items-start gap-8">
              <div className="text-center">
                <p className="text-5xl font-black text-yellow-500">{ratings.average}</p>
                <div className="flex gap-1 justify-center mt-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`w-5 h-5 ${i <= Math.round(ratings.average) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-slate-400 mt-1">{ratings.total} ta baho</p>
              </div>
              <div className="flex-1 space-y-2">
                {ratings.ratings.slice(0, 5).map((r, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3 flex items-start gap-3">
                    <div className="flex gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= r.stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                    {r.comment && <p className="text-sm text-slate-600">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Foydalanuvchilar jadvali */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">
              Foydalanuvchilar ro'yxati
              <span className="text-sm font-normal text-slate-400 ml-2">({users.length} ta)</span>
            </h3>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Barcha rollar</option>
              <option value="student">O'quvchilar</option>
              <option value="teacher">O'qituvchilar</option>
              <option value="parent">Ota-onalar</option>
              <option value="director">Direktorlar</option>
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Ism</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Telegram</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Sinf / Fan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Viloyat</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Tuman</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Maktab</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className="border-t border-slate-50 hover:bg-blue-50/30 transition">
                      <td className="px-4 py-3 text-sm text-slate-400">{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-slate-800">{u.full_name}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {u.username ? `@${u.username}` : u.telegram_id}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColor(u.role)}`}>
                          {roleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {u.grade ? `${u.grade}-sinf` : '—'} {u.subject ? `/ ${u.subject}` : ''}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {u.viloyat ? u.viloyat.replace(' viloyati', '').replace(' shahar', '').replace(' Respublikasi', '') : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{u.tuman || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{u.maktab || '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {u.created_at ? new Date(u.created_at).toLocaleString('uz') : '—'}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                        Hali foydalanuvchi yo'q
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

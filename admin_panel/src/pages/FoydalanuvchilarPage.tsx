import { useState, useEffect } from 'react';
import { Star, RefreshCw, Pencil, Trash2, X, Check, Image } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface UserData {
  id: string;
  telegram_id: number;
  full_name: string;
  username: string | null;
  role: string;
  gender: string | null;
  grade: number | null;
  class_letter: string | null;
  subject: string | null;
  viloyat: string | null;
  tuman: string | null;
  maktab: string | null;
  phone_number: string | null;
  submission_count: number;
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
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState<Partial<UserData>>({});
  const [saving, setSaving] = useState(false);

  const headers = { 'X-Admin-Token': adminId };

  const fetchData = async () => {
    try {
      const roleParam = roleFilter ? `?role=${roleFilter}` : '';
      const [usersRes, ratingsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/users${roleParam}`, { headers }),
        fetch(`${API_BASE}/api/admin/ratings`, { headers }),
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

  const startEdit = (user: UserData) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name,
      username: user.username || '',
      role: user.role,
      gender: user.gender || '',
      grade: user.grade,
      class_letter: user.class_letter || '',
      subject: user.subject || '',
      viloyat: user.viloyat || '',
      tuman: user.tuman || '',
      maktab: user.maktab || '',
      phone_number: user.phone_number || '',
    });
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setEditingUser(null);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const deleteUser = async (user: UserData) => {
    if (!confirm(`${user.full_name} ni o'chirishni xohlaysizmi?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

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
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">#</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">Ism</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">Telegram</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">Telefon</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">Rol</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">Sinf</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">Fan</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">Maktab</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 text-center">
                      <Image className="w-4 h-4 inline" />
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">Sana</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className="border-t border-slate-50 hover:bg-blue-50/30 transition">
                      <td className="px-3 py-3 text-sm text-slate-400">{i + 1}</td>
                      <td className="px-3 py-3">
                        <p className="text-sm font-medium text-slate-800">{u.full_name}</p>
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-500">
                        {u.username ? `@${u.username}` : u.telegram_id}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-500">
                        {u.phone_number || '—'}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${roleColor(u.role)}`}>
                          {roleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-600">
                        {u.grade ? `${u.grade}${u.class_letter ? '-' + u.class_letter : ''}-sinf` : '—'}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-600">{u.subject || '—'}</td>
                      <td className="px-3 py-3 text-sm text-slate-600">{u.maktab || '—'}</td>
                      <td className="px-3 py-3 text-sm text-center font-bold text-slate-700">
                        {u.submission_count > 0 ? u.submission_count : '—'}
                      </td>
                      <td className="px-3 py-3 text-sm text-slate-400 whitespace-nowrap">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('uz') : '—'}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(u)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition" title="Tahrirlash">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteUser(u)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition" title="O'chirish">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center text-slate-400">
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

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Foydalanuvchini tahrirlash</h3>
              <button onClick={() => setEditingUser(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Ism</label>
                  <input type="text" value={editForm.full_name || ''} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Username</label>
                  <input type="text" value={editForm.username || ''} onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Rol</label>
                  <select value={editForm.role || ''} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="student">O'quvchi</option>
                    <option value="teacher">O'qituvchi</option>
                    <option value="parent">Ota-ona</option>
                    <option value="director">Direktor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Sinf</label>
                  <input type="number" min={1} max={11} value={editForm.grade || ''} onChange={e => setEditForm({ ...editForm, grade: parseInt(e.target.value) || null })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Harf</label>
                  <select value={editForm.class_letter || ''} onChange={e => setEditForm({ ...editForm, class_letter: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">—</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Fan</label>
                  <input type="text" value={editForm.subject || ''} onChange={e => setEditForm({ ...editForm, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Telefon</label>
                  <input type="text" value={editForm.phone_number || ''} onChange={e => setEditForm({ ...editForm, phone_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Maktab</label>
                <input type="text" value={editForm.maktab || ''} onChange={e => setEditForm({ ...editForm, maktab: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Viloyat</label>
                  <input type="text" value={editForm.viloyat || ''} onChange={e => setEditForm({ ...editForm, viloyat: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Tuman</label>
                  <input type="text" value={editForm.tuman || ''} onChange={e => setEditForm({ ...editForm, tuman: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
                Bekor qilish
              </button>
              <button onClick={saveEdit} disabled={saving} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center gap-2">
                {saving ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : <Check className="w-4 h-4" />}
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

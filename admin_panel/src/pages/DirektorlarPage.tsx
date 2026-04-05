import { useState, useEffect } from 'react';
import { Building2, CheckCircle, XCircle, RefreshCw, Clock } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface PendingDirector {
  id: string;
  telegram_id: number;
  full_name: string;
  username: string | null;
  viloyat: string | null;
  tuman: string | null;
  maktab: string | null;
  created_at: string | null;
}

interface Props {
  adminId: string;
}

export default function DirektorlarPage({ adminId }: Props) {
  const [pending, setPending] = useState<PendingDirector[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPending = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/pending-directors?telegram_id=${adminId}`);
      if (res.ok) setPending(await res.json());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 15000);
    return () => clearInterval(interval);
  }, [adminId]);

  const handleAction = async (directorId: string, approve: boolean) => {
    setActionLoading(directorId);
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/approve-director?telegram_id=${adminId}&director_id=${directorId}&approve=${approve}`,
        { method: 'POST' }
      );
      if (res.ok) {
        setPending(prev => prev.filter(d => d.id !== directorId));
      }
    } catch (err) {
      console.error(err);
    }
    setActionLoading(null);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Direktorlar</h1>
            <p className="text-slate-500 text-sm mt-1">Maktab direktorlarini tasdiqlash</p>
          </div>
          <button onClick={fetchPending} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
            <RefreshCw className="w-4 h-4" /> Yangilash
          </button>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Kutilayotgan direktorlar */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-800">
              Kutilayotgan so'rovlar
              <span className="text-sm font-normal text-slate-400 ml-2">({pending.length} ta)</span>
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600" />
            </div>
          ) : pending.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Hozircha kutilayotgan so'rov yo'q</p>
              <p className="text-sm text-slate-400 mt-1">Yangi direktor ro'yxatdan o'tganda shu yerda paydo bo'ladi</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pending.map(d => (
                <div key={d.id} className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-base font-semibold text-slate-800">{d.full_name}</p>
                      {d.username && (
                        <span className="text-xs text-slate-400">@{d.username}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      {d.maktab && (
                        <span className="bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-medium">
                          {d.maktab}
                        </span>
                      )}
                      {d.viloyat && <span>{d.viloyat}</span>}
                      {d.tuman && <span>/ {d.tuman}</span>}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {d.created_at ? new Date(d.created_at).toLocaleString('uz') : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button
                      onClick={() => handleAction(d.id, true)}
                      disabled={actionLoading === d.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" /> Tasdiqlash
                    </button>
                    <button
                      onClick={() => handleAction(d.id, false)}
                      disabled={actionLoading === d.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Rad etish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Izoh */}
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
          <p className="text-sm text-amber-800 font-medium mb-1">Qanday ishlaydi?</p>
          <ul className="text-xs text-amber-700 space-y-1">
            <li>1. Direktor Telegram Mini App dan ro'yxatdan o'tadi</li>
            <li>2. So'rov shu yerda paydo bo'ladi (maktab nomi bilan)</li>
            <li>3. Admin to'g'ri maktab direktori ekanini tekshirib tasdiqlaydi</li>
            <li>4. Tasdiqlangandan so'ng direktor dashboardga kira oladi</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

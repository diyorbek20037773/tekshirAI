import { useState, useEffect } from 'react';
import { Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Trash2, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Props {
  adminId: string;
}

type UploadType = 'maktablar' | 'sinflar' | 'oqituvchilar' | 'oquvchilar';

const TABS: { key: UploadType; label: string; emoji: string }[] = [
  { key: 'maktablar', label: 'Maktablar', emoji: '🏫' },
  { key: 'sinflar', label: 'Sinflar', emoji: '📚' },
  { key: 'oqituvchilar', label: "O'qituvchilar", emoji: '👨‍🏫' },
  { key: 'oquvchilar', label: "O'quvchilar", emoji: '🎓' },
];

interface PreviewResponse {
  type: string;
  total_rows: number;
  valid_count: number;
  error_count: number;
  errors: { row: number; error: string }[];
  preview: any[];
  valid_data: any[];
}

interface Stats {
  schools: number;
  classes: number;
  teachers: number;
  students: number;
}

export default function MaktabYuklashPage({ adminId }: Props) {
  const [activeTab, setActiveTab] = useState<UploadType>('maktablar');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);

  const headers = { 'X-Admin-Token': adminId };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/upload/stats`, { headers });
      if (res.ok) setStats(await res.json());
    } catch {}
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const downloadTemplate = () => {
    window.open(`${API_BASE}/api/admin/upload/template/${activeTab}`, '_blank');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(null);
      setMessage(null);
    }
  };

  const handlePreview = async () => {
    if (!file) return;
    setLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_BASE}/api/admin/upload/${activeTab}/preview`, {
        method: 'POST',
        headers,
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setPreview(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: err.detail || 'Yuklashda xatolik' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: 'Server bilan aloqa yo\'q' });
    }
    setLoading(false);
  };

  const handleConfirm = async (replace: boolean = false) => {
    if (!preview) return;
    setConfirming(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/upload/${activeTab}/confirm`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ valid_data: preview.valid_data, replace }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessage({
          type: 'success',
          text: `Saqlandi: ${data.inserted} ta yangi, ${data.skipped} ta o'tkazib yuborildi.${data.errors?.length ? ' Xatolar: ' + data.errors.length : ''}`,
        });
        setFile(null);
        setPreview(null);
        fetchStats();
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: err.detail || 'Saqlashda xato' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Server bilan aloqa yo\'q' });
    }
    setConfirming(false);
  };

  const handleDeleteAll = async () => {
    if (!confirm(`Barcha ${activeTab} ma'lumotlarini o'chirasizmi? Bu amal qaytarilmaydi!`)) return;
    setConfirming(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/upload/${activeTab}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setMessage({ type: 'success', text: `${data.deleted} ta yozuv o'chirildi` });
        fetchStats();
      }
    } catch {}
    setConfirming(false);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Maktab ma'lumotlari</h1>
            <p className="text-slate-500 text-sm mt-1">Excel orqali maktab/sinf/o'qituvchi/o'quvchi yuklash</p>
          </div>
        </div>
      </div>

      {/* Statistika */}
      {stats && (
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500">🏫 Maktablar</p>
              <p className="text-2xl font-bold text-blue-600">{stats.schools}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500">📚 Sinflar</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.classes}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500">👨‍🏫 O'qituvchilar</p>
              <p className="text-2xl font-bold text-purple-600">{stats.teachers}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-500">🎓 O'quvchilar</p>
              <p className="text-2xl font-bold text-amber-600">{stats.students}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setFile(null); setPreview(null); setMessage(null); }}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            {TABS.find(t => t.key === activeTab)?.label} yuklash
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            1) Shablonni yuklab oling → 2) To'ldiring → 3) Yuklang → 4) Tekshiring → 5) Tasdiqlang
          </p>

          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition"
            >
              <Download className="w-4 h-4" /> Shablon yuklab olish
            </button>

            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition cursor-pointer">
              <Upload className="w-4 h-4" /> Excel tanlash
              <input type="file" accept=".xlsx" onChange={handleFileChange} className="hidden" />
            </label>

            {file && (
              <button
                onClick={handlePreview}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                {loading ? 'Tekshirilmoqda...' : 'Tekshirish'}
              </button>
            )}

            <button
              onClick={handleDeleteAll}
              disabled={confirming}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-sm font-medium transition disabled:opacity-50 ml-auto"
            >
              <Trash2 className="w-4 h-4" /> Hammasini o'chirish
            </button>
          </div>

          {file && (
            <p className="text-xs text-slate-500 mb-2">📎 Tanlangan: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(1)} KB)</p>
          )}

          {message && (
            <div className={`mt-3 p-3 rounded-xl border flex items-start gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <p className="text-sm">{message.text}</p>
            </div>
          )}
        </div>

        {/* Preview */}
        {preview && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Tekshirish natijasi</h3>
                <p className="text-sm text-slate-500">Hammasi: {preview.total_rows} qator</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                  ✓ {preview.valid_count} to'g'ri
                </span>
                {preview.error_count > 0 && (
                  <span className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                    ✗ {preview.error_count} xato
                  </span>
                )}
              </div>
            </div>

            {/* Xatolar */}
            {preview.errors.length > 0 && (
              <div className="mb-4 max-h-48 overflow-y-auto bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm font-medium text-red-800 mb-2">Xatoli qatorlar:</p>
                {preview.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-700">
                    Qator {e.row}: {e.error}
                  </p>
                ))}
              </div>
            )}

            {/* Preview ma'lumot */}
            {preview.preview.length > 0 && (
              <div className="overflow-x-auto mb-4">
                <p className="text-sm font-medium text-slate-600 mb-2">Birinchi {preview.preview.length} ta yozuv:</p>
                <table className="w-full text-xs border border-slate-200 rounded-lg">
                  <thead className="bg-slate-50">
                    <tr>
                      {Object.keys(preview.preview[0]).map(k => (
                        <th key={k} className="px-3 py-2 text-left font-semibold text-slate-600">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.preview.map((row, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        {Object.values(row).map((v, j) => (
                          <td key={j} className="px-3 py-2 text-slate-700">{String(v ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {preview.valid_count > 0 && (
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleConfirm(false)}
                  disabled={confirming}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
                >
                  {confirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {confirming ? 'Saqlanmoqda...' : `${preview.valid_count} ta yozuvni saqlash`}
                </button>
                <button
                  onClick={() => handleConfirm(true)}
                  disabled={confirming}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
                  title="Eskilarni o'chirib, yangilarini saqlash"
                >
                  <Trash2 className="w-4 h-4" /> Almashtirish (o'chirib + saqlash)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

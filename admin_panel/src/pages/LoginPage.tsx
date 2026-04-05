import { useState } from 'react';
import { Shield, ArrowRight } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

interface Props {
  onLogin: (telegramId: string) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [telegramId, setTelegramId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramId.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/admin/verify?telegram_id=${telegramId.trim()}`);
      if (res.ok) {
        onLogin(telegramId.trim());
      } else {
        setError('Admin huquqi yo\'q. Faqat ruxsat etilgan foydalanuvchilar kirishi mumkin.');
      }
    } catch {
      setError('Server bilan bog\'lanib bo\'lmadi');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">TekshirAI Admin</h1>
          <p className="text-slate-400 mt-2">Admin paneliga kirish</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">Telegram ID</label>
            <input
              type="text"
              value={telegramId}
              onChange={e => setTelegramId(e.target.value)}
              placeholder="Telegram ID raqamingizni kiriting"
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !telegramId.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition disabled:opacity-40"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>Kirish <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        <p className="text-center text-slate-500 text-xs mt-6">
          Faqat 3 ta admin ruxsat etilgan
        </p>
      </div>
    </div>
  );
}

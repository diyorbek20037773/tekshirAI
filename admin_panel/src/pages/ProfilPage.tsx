import { Shield, LogOut } from 'lucide-react';

interface Props {
  adminId: string;
  onLogout: () => void;
}

export default function ProfilPage({ adminId, onLogout }: Props) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-800">Profil</h1>
        <p className="text-slate-500 text-sm mt-1">Admin ma'lumotlari</p>
      </div>

      <div className="p-8 max-w-2xl space-y-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-600/30 rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Admin</h2>
              <p className="text-slate-400 text-sm">Telegram ID: {adminId}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Tizim ma'lumotlari</h3>
          <div className="space-y-3">
            <InfoRow label="Platforma" value="TekshirAI v2.0" />
            <InfoRow label="AI Model" value="Gemini 2.5 Flash" />
            <InfoRow label="Admin soni" value="3 ta" />
            <InfoRow label="Rollar" value="O'quvchi, O'qituvchi, Ota-ona, Direktor, Admin" />
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition border border-red-200"
        >
          <LogOut className="w-5 h-5" /> Chiqish
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-700">{value}</span>
    </div>
  );
}

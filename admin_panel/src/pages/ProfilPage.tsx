import TopBar from '../components/layout/TopBar';
import KPIBar from '../components/shared/KPIBar';
import { getKPI } from '../data';
import { formatNumber } from '../utils/format';
import { User, Shield, School, Users, GraduationCap, BarChart3, Zap, Activity, Clock, Settings, Bell } from 'lucide-react';

export default function ProfilPage() {
  const kpi = getKPI();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Profil" subtitle="Tizim ma'lumotlari" />
      <KPIBar />

      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Profil kartasi */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <img src="/avatars/teacher.jpg" alt="Admin" className="w-16 h-16 rounded-full object-cover border-2 border-blue-400/30" />
              <div>
                <h2 className="text-xl font-bold">Xalq ta'limi vazirligi</h2>
                <p className="text-sm text-slate-400">Monitoring tizimi administratori</p>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-slate-300">
                <User className="w-4 h-4" />
                <span className="text-sm">Admin panel v1.0</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Activity className="w-4 h-4" />
                <span className="text-sm">TekshirAI platformasi</span>
              </div>
            </div>
          </div>

          {/* Tizim statistikasi */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Tizim ko'rsatkichlari
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox icon={School} label="Maktablar" value={formatNumber(kpi.jami_maktablar)} color="blue" />
              <StatBox icon={Users} label="O'quvchilar" value={formatNumber(kpi.jami_oquvchilar)} color="purple" />
              <StatBox icon={GraduationCap} label="O'qituvchilar" value={formatNumber(kpi.jami_oqituvchilar)} color="cyan" />
              <StatBox icon={Zap} label="AI tekshiruvlar" value={formatNumber(kpi.ai_tekshiruvlar)} color="pink" />
              <StatBox icon={BarChart3} label="O'rt. ball" value={kpi.ortacha_ball + '%'} color="amber" />
              <StatBox icon={Activity} label="Davomat" value={kpi.ortacha_davomat + '%'} color="green" />
              <StatBox icon={Clock} label="Tejangan vaqt" value={formatNumber(kpi.tejangan_vaqt) + ' soat'} color="teal" />
              <StatBox icon={User} label="Premium" value={formatNumber(kpi.premium_users)} color="orange" />
            </div>
          </div>
        </div>

        {/* Vakolat va sozlamalar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Vakolatlar
            </h3>
            <div className="space-y-2">
              {[
                { text: "Viloyatlar bo'yicha xarita monitoring", active: true },
                { text: "O'quvchilar reyting tahlili", active: true },
                { text: "Fan va mavzular statistikasi", active: true },
                { text: "Muammoli hududlar aniqlash", active: true },
                { text: "Kasb moyilliklari tahlili", active: true },
                { text: "AI tekshiruv natijalarini ko'rish", active: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                  <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <p className="text-xs text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-500" />
              Tizim sozlamalari
            </h3>
            <div className="space-y-3">
              <SettingRow icon={Bell} label="Bildirishnomalar" value="Yoqilgan" />
              <SettingRow icon={Clock} label="Ma'lumot yangilanishi" value="Real vaqtda" />
              <SettingRow icon={Shield} label="Xavfsizlik" value="JWT autentifikatsiya" />
              <SettingRow icon={Zap} label="AI model" value="Gemini 2.5 Flash" />
              <SettingRow icon={Activity} label="API holati" value="Ishlayapti" color="green" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    cyan: 'bg-cyan-50 text-cyan-600',
    pink: 'bg-pink-50 text-pink-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    teal: 'bg-teal-50 text-teal-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className={`p-3 rounded-xl ${colors[color] || 'bg-slate-50 text-slate-600'}`}>
      <Icon className="w-4 h-4 mb-1" />
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] opacity-70">{label}</p>
    </div>
  );
}

function SettingRow({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-400" />
        <p className="text-xs text-slate-600">{label}</p>
      </div>
      <span className={`text-xs font-medium ${color === 'green' ? 'text-green-600' : 'text-slate-700'}`}>{value}</span>
    </div>
  );
}

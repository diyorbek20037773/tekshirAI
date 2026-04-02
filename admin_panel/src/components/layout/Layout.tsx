import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="lg:hidden flex items-center gap-2 px-3 py-2.5 bg-slate-900 text-white shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 cursor-pointer rounded-lg hover:bg-slate-800">
            <Menu size={18} />
          </button>
          <h1 className="text-xs font-bold">TekshirAI</h1>
          <span className="text-[9px] text-slate-400 hidden xs:inline">Xalq ta'limi vazirligi</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

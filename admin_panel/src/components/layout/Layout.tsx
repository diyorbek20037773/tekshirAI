import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — desktop: always visible, mobile: slide-in overlay */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar with hamburger */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 text-white shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-1 cursor-pointer">
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-bold">TekshirAI</h1>
          <span className="text-[10px] text-slate-400">Xalq ta'limi vazirligi</span>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

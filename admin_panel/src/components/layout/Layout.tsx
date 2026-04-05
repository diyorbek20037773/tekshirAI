import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

interface Props {
  adminId: string;
  onLogout: () => void;
}

export default function Layout({ adminId, onLogout }: Props) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar onLogout={onLogout} />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

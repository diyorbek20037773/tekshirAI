import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import FoydalanuvchilarPage from './pages/FoydalanuvchilarPage';
import TekshiruvlarPage from './pages/TekshiruvlarPage';
import DirektorlarPage from './pages/DirektorlarPage';
import ProfilPage from './pages/ProfilPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  const [adminToken, setAdminToken] = useState<string | null>(
    localStorage.getItem('adminToken')
  );

  const handleLogin = (token: string) => {
    localStorage.setItem('adminToken', token);
    setAdminToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
  };

  if (!adminToken) {
    return (
      <BrowserRouter>
        <LoginPage onLogin={handleLogin} />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout adminId={adminToken} onLogout={handleLogout} />}>
          <Route index element={<DashboardPage adminId={adminToken} />} />
          <Route path="foydalanuvchilar" element={<FoydalanuvchilarPage adminId={adminToken} />} />
          <Route path="tekshiruvlar" element={<TekshiruvlarPage adminId={adminToken} />} />
          <Route path="direktorlar" element={<DirektorlarPage adminId={adminToken} />} />
          <Route path="profil" element={<ProfilPage adminId={adminToken} onLogout={handleLogout} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

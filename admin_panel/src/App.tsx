import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import FoydalanuvchilarPage from './pages/FoydalanuvchilarPage';
import TekshiruvlarPage from './pages/TekshiruvlarPage';
import ProfilPage from './pages/ProfilPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  const [adminId, setAdminId] = useState<string | null>(
    localStorage.getItem('adminTelegramId')
  );

  const handleLogin = (telegramId: string) => {
    localStorage.setItem('adminTelegramId', telegramId);
    setAdminId(telegramId);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminTelegramId');
    setAdminId(null);
  };

  if (!adminId) {
    return (
      <BrowserRouter>
        <LoginPage onLogin={handleLogin} />
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout adminId={adminId} onLogout={handleLogout} />}>
          <Route index element={<DashboardPage adminId={adminId} />} />
          <Route path="foydalanuvchilar" element={<FoydalanuvchilarPage adminId={adminId} />} />
          <Route path="tekshiruvlar" element={<TekshiruvlarPage adminId={adminId} />} />
          <Route path="profil" element={<ProfilPage adminId={adminId} onLogout={handleLogout} />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import XaritaPage from './pages/XaritaPage';
import ReytingPage from './pages/ReytingPage';
import MavzularPage from './pages/MavzularPage';
import MuammolarPage from './pages/MuammolarPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<XaritaPage />} />
          <Route path="reyting" element={<ReytingPage />} />
          <Route path="mavzular" element={<MavzularPage />} />
          <Route path="muammolar" element={<MuammolarPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

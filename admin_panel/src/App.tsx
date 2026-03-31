import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import FeedPage from './pages/FeedPage';
import FacilitiesPage from './pages/FacilitiesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="feed" element={<FeedPage />} />
          <Route path="facilities" element={<FacilitiesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

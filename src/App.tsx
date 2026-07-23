import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminProvider } from './contexts/AdminContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const SquadPage = lazy(() => import('./pages/SquadPage'));
const MatchsPage = lazy(() => import('./pages/MatchsPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const NewsArticlePage = lazy(() => import('./pages/NewsArticlePage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const StandingsPage = lazy(() => import('./pages/StandingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminPlayers = lazy(() => import('./pages/admin/Players'));
const AdminMatches = lazy(() => import('./pages/admin/Matches'));
const AdminNews = lazy(() => import('./pages/admin/News'));
const AdminStaff = lazy(() => import('./pages/admin/Staff'));
const AdminSendPush = lazy(() => import('./pages/admin/SendPushPage'));
const AdminGallery = lazy(() => import('./pages/admin/Gallery'));
const AdminStandings = lazy(() => import('./pages/admin/Standings'));

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/effectif" element={<SquadPage />} />
              <Route path="/matchs" element={<MatchsPage />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:slug" element={<NewsArticlePage />} />
              <Route path="/galerie" element={<GalleryPage />} />
              <Route path="/classement" element={<StandingsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<Navigate to="/login" replace />} />
              <Route
                path="/admin"
                element={
                  <PrivateRoute>
                    <AdminProvider>
                      <AdminLayout />
                    </AdminProvider>
                  </PrivateRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="players" element={<AdminPlayers />} />
                <Route path="matches" element={<AdminMatches />} />
                <Route path="news" element={<AdminNews />} />
                <Route path="staff" element={<AdminStaff />} />
                <Route path="send-push" element={<AdminSendPush />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="standings" element={<AdminStandings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold text-gray-300 dark:text-gray-600">404</h1>
        <p className="text-gray-500 mt-2">Page non trouvée</p>
      </div>
    </div>
  );
}

export default App;

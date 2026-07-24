import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/SplashScreen';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminProvider } from './contexts/AdminContext';
import { AdminThemeProvider } from './contexts/AdminThemeContext';
import { RealtimeProvider } from './contexts/RealtimeContext';

const HomePage = lazy(() => import('./pages/HomePage'));
const SquadPage = lazy(() => import('./pages/SquadPage'));
const MatchsPage = lazy(() => import('./pages/MatchsPage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const NewsArticlePage = lazy(() => import('./pages/NewsArticlePage'));
const Gallery = lazy(() => import('./pages/Gallery'));
const StandingsPage = lazy(() => import('./pages/StandingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const MaintenancePage = lazy(() => import('./pages/MaintenancePage'));

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard/Dashboard'));
const AdminPlayers = lazy(() => import('./pages/admin/Entities/Players/Players'));
const AdminMatches = lazy(() => import('./pages/admin/Entities/Matches/Matches'));
const AdminNews = lazy(() => import('./pages/admin/Entities/News/News'));
const AdminStaff = lazy(() => import('./pages/admin/Entities/Staff/Staff'));
const AdminSendPush = lazy(() => import('./pages/admin/SendPushPage'));
const AdminGallery = lazy(() => import('./pages/admin/Entities/Gallery/Gallery'));
const AdminStandings = lazy(() => import('./pages/admin/Entities/Standings/Standings'));
const AdminActivity = lazy(() => import('./pages/admin/Activity/ActivityLog'));
const AdminSiteConfig = lazy(() => import('./pages/admin/SiteConfig/SiteConfig'));
const AdminContactMessages = lazy(() => import('./pages/admin/Contact/ContactMessages'));
const AdminTopScorers = lazy(() => import('./pages/admin/Entities/TopScorers/TopScorers'));
const AdminPlayersOfMonth = lazy(() => import('./pages/admin/Entities/PlayersOfMonth/PlayersOfMonth'));

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
      <SplashScreen />
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/*" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="effectif" element={<SquadPage />} />
              <Route path="matchs" element={<MatchsPage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="news/:slug" element={<NewsArticlePage />} />
              <Route path="galerie" element={<Gallery />} />
              <Route path="classement" element={<StandingsPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="maintenance" element={<MaintenancePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminProvider>
                    <AdminThemeProvider>
                      <RealtimeProvider>
                        <AdminLayout />
                      </RealtimeProvider>
                    </AdminThemeProvider>
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
              <Route path="activity" element={<AdminActivity />} />
              <Route path="site-config" element={<AdminSiteConfig />} />
              <Route path="contact" element={<AdminContactMessages />} />
              <Route path="top-scorers" element={<AdminTopScorers />} />
              <Route path="players-of-month" element={<AdminPlayersOfMonth />} />
            </Route>
          </Routes>
        </Suspense>
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

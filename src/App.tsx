import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { GameToaster } from './components/common/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/common/Navbar';
import BrowserConsole from './components/BrowserConsole';

// Pages
import GurugammonLanding from './pages/GurugammonLanding';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';
import Tournaments from './pages/Tournaments';
import Leaderboard from './pages/Leaderboard';
import StubPage from './pages/StubPage';
import Profile from './pages/Profile';

function LayoutWithNavbar() {
  const location = useLocation();
  const showNavbar = !['/login', '/'].includes(location.pathname) && !location.pathname.startsWith('/game/');

  return (
    <>
      {showNavbar && <Navbar />}
      <Outlet />
    </>
  );
}

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FFD700]"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<GurugammonLanding />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Routes avec Navbar - Lobby et GameRoom accessibles en guest */}
          <Route element={<LayoutWithNavbar />}>
            <Route path="/lobby" element={
              <ProtectedRoute allowGuest={true}>
                <Lobby />
              </ProtectedRoute>
            } />
            <Route path="/game/:roomId" element={
              <ProtectedRoute allowGuest={true}>
                <GameRoom />
              </ProtectedRoute>
            } />
          </Route>

          {/* Routes protégées nécessitant authentification */}
          <Route element={
            <ProtectedRoute requireAuth={true}>
              <LayoutWithNavbar />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<StubPage />} />
            <Route path="/support" element={<StubPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Toaster */}
        <GameToaster />
        
        {/* Console JavaScript visible partout */}
        <BrowserConsole />
      </div>
    </Router>
  );
}

export default App;

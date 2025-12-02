import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { GameToaster } from './components/common/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/common/Navbar';

// Pages
import GurugammonLanding from './pages/GurugammonLanding';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';
import Tournaments from './pages/Tournaments';
import Leaderboard from './pages/Leaderboard';
import StubPage from './pages/StubPage';
import Profile from './pages/Profile';
import ComingSoon from './pages/ComingSoon';

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

          {/* Protected Routes with Navbar */}
          <Route element={
            <ProtectedRoute>
              <LayoutWithNavbar />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/game/:roomId" element={<GameRoom />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/leaderboard" element={<Leaderboard />} />

            {/* New Routes */}
            <Route path="/analyses" element={<StubPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/settings" element={<StubPage />} />
            <Route path="/support" element={<StubPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Toaster */}
        <GameToaster />
      </div>
    </Router>
  );
}

export default App;

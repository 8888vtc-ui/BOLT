import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { GameToaster } from './components/common/Toast';

// Pages
import GurugammonLanding from './pages/GurugammonLanding';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Lobby from './pages/Lobby';
import GameRoom from './pages/GameRoom';
import Tournaments from './pages/Tournaments';
import Leaderboard from './pages/Leaderboard';

// Components
import ProtectedRoute from './components/ProtectedRoute';

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

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lobby"
            element={
              <ProtectedRoute>
                <Lobby />
              </ProtectedRoute>
            }
          />

          <Route
            path="/game/:roomId"
            element={
              <ProtectedRoute>
                <GameRoom />
              </ProtectedRoute>
            }
          />

          {/* Legacy / Other Routes */}
          <Route
            path="/tournaments"
            element={
              <ProtectedRoute>
                <Tournaments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />

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

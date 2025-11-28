import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Gamepad2, Trophy, User, Dices } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [creatingGame, setCreatingGame] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNewGame = async () => {
    try {
      setCreatingGame(true);
      const game = await api.createGame(undefined, 'pvp');
      navigate(`/game/${game.id}`);
    } catch (error) {
      console.error('Failed to create game:', error);
    } finally {
      setCreatingGame(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Dices className="w-16 h-16 text-[#FFD700] animate-spin" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-black backgammon-pattern">
      <nav className="border-b border-gray-900 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Dices className="w-8 h-8 text-[#FFD700]" />
              <span className="text-2xl font-bold text-[#FFD700]">GuruGammon</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 border border-gray-800 hover:border-[#FFD700] text-gray-400 hover:text-[#FFD700] rounded-lg transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-6 mb-8">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-24 h-24 rounded-full border-4 border-[#FFD700] shadow-[0_0_40px_rgba(255,215,0,0.3)]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFC700] flex items-center justify-center shadow-[0_0_40px_rgba(255,215,0,0.3)]">
                <User className="w-12 h-12 text-black" />
              </div>
            )}

            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                <span className="text-gray-400">Welcome,</span>{' '}
                <span className="text-[#FFD700]">{user.username}</span>
              </h1>
              <p className="text-gray-500 text-lg capitalize">{user.role} Player</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={handleNewGame}
            disabled={creatingGame}
            className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-[#FFD700] rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-[0_0_40px_rgba(255,215,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700] opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity"></div>

            <div className="relative">
              <div className="mb-4 inline-block p-4 bg-[#FFD700]/10 rounded-xl group-hover:bg-[#FFD700]/20 transition-colors">
                <Gamepad2 className="w-10 h-10 text-[#FFD700]" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">New Game</h3>
              <p className="text-gray-400">Start a new backgammon match</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/tournaments')}
            className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-[#FFD700] rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-[0_0_40px_rgba(255,215,0,0.2)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700] opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity"></div>

            <div className="relative">
              <div className="mb-4 inline-block p-4 bg-[#FFD700]/10 rounded-xl group-hover:bg-[#FFD700]/20 transition-colors">
                <Trophy className="w-10 h-10 text-[#FFD700]" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Tournaments</h3>
              <p className="text-gray-400">Compete in live tournaments</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/leaderboard')}
            className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-[#FFD700] rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-[0_0_40px_rgba(255,215,0,0.2)]"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700] opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity"></div>

            <div className="relative">
              <div className="mb-4 inline-block p-4 bg-[#FFD700]/10 rounded-xl group-hover:bg-[#FFD700]/20 transition-colors">
                <User className="w-10 h-10 text-[#FFD700]" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Leaderboard</h3>
              <p className="text-gray-400">View global rankings</p>
            </div>
          </button>
        </div>

        <div className="mt-12 p-8 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl">
          <h2 className="text-3xl font-bold text-[#FFD700] mb-4">Getting Started</h2>
          <div className="space-y-4 text-gray-400">
            <p className="text-lg">Welcome to GuruGammon! Here's what you can do:</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Play instant matches against AI or other players</li>
              <li>Join tournaments and climb the leaderboard</li>
              <li>Track your progress and improve your skills</li>
              <li>Connect with the backgammon community</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Dice5, Users, Trophy, Zap } from 'lucide-react';
import Button from '../components/common/Button';
import LoginModal from '../components/auth/LoginModal';
import RegisterModal from '../components/auth/RegisterModal';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/lobby');
    } else {
      setShowLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <Dice5 className="w-24 h-24 text-primary-400 animate-pulse" />
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-gradient">
            Gurugammon Antigravity
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Experience backgammon like never before. Play in real-time, challenge friends,
            and compete in tournaments with our revolutionary antigravity physics engine.
          </p>

          <div className="flex justify-center gap-4 pt-8">
            <Button
              onClick={handleGetStarted}
              variant="primary"
              size="lg"
              className="shadow-glow-lg"
            >
              Get Started
            </Button>
            <Button
              onClick={() => setShowRegister(true)}
              variant="outline"
              size="lg"
            >
              Create Account
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 hover:border-primary-500 transition-colors">
            <Users className="w-12 h-12 text-primary-400 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Multiplayer</h3>
            <p className="text-gray-400">
              Play against opponents from around the world in real-time matches with
              seamless websocket connections.
            </p>
          </div>

          <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 hover:border-primary-500 transition-colors">
            <Trophy className="w-12 h-12 text-primary-400 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Tournaments</h3>
            <p className="text-gray-400">
              Join competitive tournaments, climb the leaderboard, and prove you're
              the ultimate backgammon champion.
            </p>
          </div>

          <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 hover:border-primary-500 transition-colors">
            <Zap className="w-12 h-12 text-primary-400 mb-4" />
            <h3 className="text-2xl font-bold mb-3">Antigravity Physics</h3>
            <p className="text-gray-400">
              Our unique antigravity engine adds a new dimension to classic backgammon
              gameplay with stunning visual effects.
            </p>
          </div>
        </div>

        <div className="mt-24 text-center">
          <h2 className="text-4xl font-bold mb-8">How to Play</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
              <div className="text-4xl font-bold text-primary-400 mb-2">1</div>
              <h4 className="font-semibold mb-2">Create Account</h4>
              <p className="text-sm text-gray-400">Sign up in seconds</p>
            </div>
            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
              <div className="text-4xl font-bold text-primary-400 mb-2">2</div>
              <h4 className="font-semibold mb-2">Join Lobby</h4>
              <p className="text-sm text-gray-400">Find or create games</p>
            </div>
            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
              <div className="text-4xl font-bold text-primary-400 mb-2">3</div>
              <h4 className="font-semibold mb-2">Play Match</h4>
              <p className="text-sm text-gray-400">Roll dice and make moves</p>
            </div>
            <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
              <div className="text-4xl font-bold text-primary-400 mb-2">4</div>
              <h4 className="font-semibold mb-2">Win & Rank Up</h4>
              <p className="text-sm text-gray-400">Climb the leaderboard</p>
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />
    </div>
  );
}

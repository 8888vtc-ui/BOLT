import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dices, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithGoogle, loginAsGuest } = useAuth();
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    const { error } = await loginWithGoogle();
    if (error) setError(error.message);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('Email login not implemented yet. Please use Google Login.');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 backgammon-pattern relative overflow-hidden">
      <div className="absolute inset-0 dice-pattern opacity-20"></div>

      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-24 h-24 border-2 border-[#FFD700] opacity-10 rotate-45"></div>
        <div className="absolute bottom-32 right-16 w-32 h-32 border-2 border-[#FFD700] opacity-10 rotate-12"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 border-2 border-[#FFD700] opacity-10 -rotate-45"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFD700] blur-3xl opacity-50 rounded-full"></div>
              <Dices className="relative w-24 h-24 text-[#FFD700] drop-shadow-2xl" />
            </div>
          </div>

          <h1 className="text-7xl md:text-8xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-[#FFD700] via-[#FFC700] to-[#FFD700] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,215,0,0.5)]">
              GuruGammon
            </span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl font-light">
            Master the ancient game of backgammon
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full group relative overflow-hidden bg-black border-2 border-gray-800 hover:border-[#FFD700] text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg shadow-[0_0_20px_rgba(255,215,0,0.1)] hover:shadow-[0_0_40px_rgba(255,215,0,0.3)] transform hover:scale-[1.02]"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            onClick={() => {
              loginAsGuest();
              navigate('/lobby');
            }}
            className="w-full group relative overflow-hidden bg-[#1a1a1a] border-2 border-gray-700 hover:border-white text-gray-300 hover:text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg shadow-lg"
          >
            <UserIcon className="w-6 h-6" />
            <span>Play as Guest</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-gray-500">or</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4 opacity-50 pointer-events-none">
            <div className="text-center text-gray-500 text-sm">
              Email login coming soon
            </div>
          </form>
        </div>

        <div className="mt-12 text-center text-gray-600 text-sm">
          <p>Join thousands of players worldwide</p>
        </div>
      </div>
    </div>
  );
}

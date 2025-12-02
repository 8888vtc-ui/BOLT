import { motion } from 'framer-motion';
import { Dices, Zap, Users, Award, TrendingUp, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function GurugammonLanding() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirection automatique si déjà connecté
  useEffect(() => {
    if (!loading && user) {
      navigate('/lobby');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 via-transparent to-[#8B0000]/10" />

      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-[#FFD700] opacity-20 rotate-45 animate-pulse" />
        <div className="absolute bottom-32 right-16 w-40 h-40 border-2 border-[#FFD700] opacity-20 rotate-12 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 border-2 border-[#FFD700] opacity-20 -rotate-45 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <motion.div
            className="flex justify-center mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.8 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-[#FFD700] blur-3xl opacity-50 rounded-full" />
              <Dices className="relative w-32 h-32 text-[#FFD700] drop-shadow-2xl" />
            </div>
          </motion.div>

          <motion.h1
            className="text-8xl md:text-9xl font-black mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-[#FFD700] via-[#FFC700] to-[#FFD700] bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(255,215,0,0.6)]">
              GuruGammon
            </span>
          </motion.h1>

          <motion.p
            className="text-gray-400 text-2xl md:text-3xl font-light mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Master Backgammon with AI-Powered Coaching
          </motion.p>

          <motion.div
            className="flex flex-col md:flex-row gap-6 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {/* Un seul bouton : Accéder au jeu (redirige vers login qui gère l'accès) */}
            <motion.button
              className="px-12 py-5 bg-gradient-to-r from-[#FFD700] to-[#FFC700] text-black text-xl font-black rounded-xl shadow-[0_0_40px_rgba(255,215,0,0.4)] hover:shadow-[0_0_60px_rgba(255,215,0,0.6)] transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login?redirect=/lobby')}
            >
              <div className="flex items-center gap-3">
                <Zap className="w-7 h-7" />
                COMMENCER À JOUER
              </div>
            </motion.button>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <motion.div
            className="bg-[#1a1a1a] border-2 border-[#333] rounded-2xl p-8 hover:border-[#FFD700] transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ y: -5 }}
          >
            <div className="w-16 h-16 bg-[#FFD700]/20 rounded-full flex items-center justify-center mb-6">
              <Award className="w-8 h-8 text-[#FFD700]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">GNUBg Analysis</h3>
            <p className="text-gray-400 leading-relaxed">
              Get world-class move analysis powered by GNUBg, the strongest backgammon engine.
            </p>
          </motion.div>

          <motion.div
            className="bg-[#1a1a1a] border-2 border-[#333] rounded-2xl p-8 hover:border-[#FFD700] transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            whileHover={{ y: -5 }}
          >
            <div className="w-16 h-16 bg-[#FFD700]/20 rounded-full flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-[#FFD700]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Real-time Coaching</h3>
            <p className="text-gray-400 leading-relaxed">
              Receive instant feedback and learn from your mistakes with AI-powered explanations.
            </p>
          </motion.div>

          <motion.div
            className="bg-[#1a1a1a] border-2 border-[#333] rounded-2xl p-8 hover:border-[#FFD700] transition-all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ y: -5 }}
          >
            <div className="w-16 h-16 bg-[#FFD700]/20 rounded-full flex items-center justify-center mb-6">
              <Globe className="w-8 h-8 text-[#FFD700]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Global Tournaments</h3>
            <p className="text-gray-400 leading-relaxed">
              Compete against players worldwide in tournaments and climb the leaderboard.
            </p>
          </motion.div>
        </div>

        <div className="text-center">
          <motion.div
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1a1a] border border-[#333] rounded-full text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>1,247 players online</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

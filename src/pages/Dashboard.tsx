import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Trophy, TrendingUp, Target, Clock, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const stats = [
    { label: 'Parties jouées', value: '47', icon: Play, color: '#FFD700' },
    { label: 'Victoires', value: '32', icon: Trophy, color: '#00FF00' },
    { label: 'Taux de victoire', value: '68%', icon: TrendingUp, color: '#FF00FF' },
    { label: 'Classement', value: '#142', icon: Award, color: '#00FFFF' },
  ];

  const recentGames = [
    { opponent: 'Magnus', result: 'Victoire', score: '7-3', date: 'Il y a 2h' },
    { opponent: 'Kasparov', result: 'Défaite', score: '4-7', date: 'Il y a 5h' },
    { opponent: 'Alice', result: 'Victoire', score: '7-1', date: 'Hier' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FDB931] mb-2">
            Bienvenue, {user?.username} !
          </h1>
          <p className="text-gray-400 text-lg">Prêt à dominer le plateau ?</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#111] rounded-2xl p-6 border border-white/10 hover:border-[#FFD700]/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-8 h-8" style={{ color: stat.color }} />
                <div className="text-3xl font-black" style={{ color: stat.color }}>
                  {stat.value}
                </div>
              </div>
              <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          <button
            onClick={() => navigate('/lobby')}
            className="bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black p-8 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,215,0,0.3)]"
          >
            <Play className="w-12 h-12 mb-4 mx-auto" />
            Jouer Maintenant
          </button>

          <button
            onClick={() => navigate('/tournaments')}
            className="bg-[#111] border-2 border-[#FFD700] text-[#FFD700] p-8 rounded-2xl font-black text-xl hover:bg-[#FFD700]/10 transition-all"
          >
            <Trophy className="w-12 h-12 mb-4 mx-auto" />
            Tournois
          </button>

          <button
            onClick={() => navigate('/leaderboard')}
            className="bg-[#111] border-2 border-white/20 text-white p-8 rounded-2xl font-black text-xl hover:border-white/40 transition-all"
          >
            <TrendingUp className="w-12 h-12 mb-4 mx-auto" />
            Classement
          </button>
        </motion.div>

        {/* Recent Games */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#111] rounded-2xl p-8 border border-white/10"
        >
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <Clock className="w-6 h-6 text-[#FFD700]" />
            Parties Récentes
          </h2>

          <div className="space-y-4">
            {recentGames.map((game, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-white font-bold">
                    {game.opponent[0]}
                  </div>
                  <div>
                    <div className="font-bold text-white">vs {game.opponent}</div>
                    <div className="text-sm text-gray-400">{game.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-lg font-mono font-bold text-gray-300">{game.score}</div>
                  <div
                    className={`px-4 py-2 rounded-lg font-bold ${game.result === 'Victoire'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                      }`}
                  >
                    {game.result}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

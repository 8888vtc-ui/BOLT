import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Trophy, TrendingUp, Target, Clock, Award } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGameSocket } from '../hooks/useGameSocket';
import TrophyCase from '../components/profile/TrophyCase';
import { getUserStats, getRecentGames, type UserStats, type RecentGame } from '../lib/statsService';
import { showError } from '../lib/notifications';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playVsBot } = useGameSocket();
  
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [userStats, games] = await Promise.all([
          getUserStats(user.id),
          getRecentGames(user.id, 10)
        ]);
        setStats(userStats);
        setRecentGames(games);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Stats formatées pour l'affichage
  const displayStats = stats ? [
    { label: 'Parties jouées', value: stats.gamesPlayed.toString(), icon: Play, color: '#FFD700' },
    { label: 'Victoires', value: stats.wins.toString(), icon: Trophy, color: '#00FF00' },
    { label: 'Taux de victoire', value: `${stats.winRate}%`, icon: TrendingUp, color: '#FF00FF' },
    { label: 'Classement', value: stats.rank ? `#${stats.rank}` : 'N/A', icon: Award, color: '#00FFFF' },
  ] : [];

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
          {loading ? (
            // Skeleton loading
            Array.from({ length: 4 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#111] rounded-2xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 bg-white/10 rounded animate-pulse" />
                  <div className="w-16 h-8 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="w-24 h-4 bg-white/10 rounded animate-pulse" />
              </motion.div>
            ))
          ) : (
            displayStats.map((stat, index) => (
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
            ))
          )}
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
            Jouer en Ligne
          </button>

          <button
            onClick={async () => {
              const roomId = await playVsBot();
              if (roomId) {
                navigate(`/game/${roomId}`);
              } else {
                // Fallback vers le mode offline
                navigate('/game/offline-bot?mode=match&length=5');
              }
            }}
            className="bg-[#111] border-2 border-[#FFD700] text-[#FFD700] p-8 rounded-2xl font-black text-xl hover:bg-[#FFD700]/10 transition-all"
          >
            <Target className="w-12 h-12 mb-4 mx-auto" />
            Jouer contre l'IA
          </button>

          <button
            onClick={() => navigate('/tournaments')}
            className="bg-[#111] border-2 border-white/20 text-white p-8 rounded-2xl font-black text-xl hover:border-white/40 transition-all"
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

        {/* Trophy Case */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-[#FFD700]" />
            Mes Trophées
          </h2>
          <TrophyCase
            tournamentsWon={stats?.tournamentsWon || 0}
            tournamentsPlayed={stats?.tournamentsPlayed || 0}
            tournamentPoints={stats?.tournamentPoints || 0}
            bestFinish={stats?.bestTournamentFinish || 0}
            badges={[]}
          />
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

          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
                    <div className="space-y-2">
                      <div className="w-32 h-4 bg-white/10 rounded animate-pulse" />
                      <div className="w-24 h-3 bg-white/10 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="w-20 h-6 bg-white/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : recentGames.length > 0 ? (
            <div className="space-y-4">
              {recentGames.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => navigate(`/game/${game.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-white font-bold">
                      {game.opponent[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-white">vs {game.opponent}</div>
                      <div className="text-sm text-gray-400">{game.date}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-lg font-mono font-bold text-gray-300">{game.score}</div>
                    <div
                      className={`px-4 py-2 rounded-lg font-bold ${
                        game.result === 'win'
                          ? 'bg-green-500/20 text-green-400'
                          : game.result === 'loss'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {game.result === 'win' ? 'Victoire' : game.result === 'loss' ? 'Défaite' : 'Égalité'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Aucune partie récente</p>
              <p className="text-sm mt-2">Commencez à jouer pour voir vos statistiques !</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

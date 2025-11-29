import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Award } from 'lucide-react';

export default function Leaderboard() {
  const leaderboard = [
    { rank: 1, username: 'Magnus_Pro', rating: 2847, wins: 342, losses: 45, winRate: 88, trend: 'up', change: 15 },
    { rank: 2, username: 'Kasparov_GM', rating: 2791, wins: 298, losses: 52, winRate: 85, trend: 'up', change: 8 },
    { rank: 3, username: 'Bobby_Fischer', rating: 2756, wins: 276, losses: 61, winRate: 82, trend: 'down', change: -3 },
    { rank: 4, username: 'Garry_K', rating: 2698, wins: 245, losses: 68, winRate: 78, trend: 'up', change: 12 },
    { rank: 5, username: 'Anatoly_C', rating: 2654, wins: 231, losses: 74, winRate: 76, trend: 'same', change: 0 },
    { rank: 6, username: 'Vishy_A', rating: 2612, wins: 218, losses: 79, winRate: 73, trend: 'up', change: 5 },
    { rank: 7, username: 'Hikaru_N', rating: 2587, wins: 203, losses: 85, winRate: 71, trend: 'down', change: -7 },
    { rank: 8, username: 'Fabiano_C', rating: 2543, wins: 189, losses: 92, winRate: 67, trend: 'up', change: 3 },
    { rank: 9, username: 'Levon_A', rating: 2512, wins: 176, losses: 98, winRate: 64, trend: 'same', change: 0 },
    { rank: 10, username: 'Wesley_S', rating: 2489, wins: 164, losses: 103, winRate: 61, trend: 'down', change: -4 },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-[#FFD700]" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-[#C0C0C0]" />;
    if (rank === 3) return <Award className="w-6 h-6 text-[#CD7F32]" />;
    return <span className="text-gray-400 font-bold">#{rank}</span>;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

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
            Classement Mondial
          </h1>
          <p className="text-gray-400 text-lg">Les meilleurs joueurs de GuruGammon</p>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-6 mb-12"
        >
          {/* 2nd Place */}
          <div className="flex flex-col items-center pt-12">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C0C0C0] to-gray-600 flex items-center justify-center mb-4 border-4 border-[#C0C0C0]">
              <span className="text-3xl font-black text-white">2</span>
            </div>
            <div className="text-center">
              <div className="font-black text-xl text-white mb-1">{leaderboard[1].username}</div>
              <div className="text-2xl font-black text-[#C0C0C0]">{leaderboard[1].rating}</div>
              <div className="text-sm text-gray-400 mt-2">{leaderboard[1].wins} victoires</div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FDB931] flex items-center justify-center mb-4 border-4 border-[#FFD700] shadow-[0_0_40px_rgba(255,215,0,0.5)]">
              <Crown className="w-16 h-16 text-black" />
            </div>
            <div className="text-center">
              <div className="font-black text-2xl text-white mb-1">{leaderboard[0].username}</div>
              <div className="text-3xl font-black text-[#FFD700]">{leaderboard[0].rating}</div>
              <div className="text-sm text-gray-400 mt-2">{leaderboard[0].wins} victoires</div>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center pt-12">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#CD7F32] to-[#8B4513] flex items-center justify-center mb-4 border-4 border-[#CD7F32]">
              <span className="text-3xl font-black text-white">3</span>
            </div>
            <div className="text-center">
              <div className="font-black text-xl text-white mb-1">{leaderboard[2].username}</div>
              <div className="text-2xl font-black text-[#CD7F32]">{leaderboard[2].rating}</div>
              <div className="text-sm text-gray-400 mt-2">{leaderboard[2].wins} victoires</div>
            </div>
          </div>
        </motion.div>

        {/* Full Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Rang
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Joueur
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Victoires
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Défaites
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Taux
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-400 uppercase tracking-wider">
                    Tendance
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, index) => (
                  <motion.tr
                    key={player.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className={`border-b border-white/5 hover:bg-white/5 transition-colors ${player.rank <= 3 ? 'bg-white/[0.02]' : ''
                      }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">{getRankIcon(player.rank)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-white font-bold">
                          {player.username[0]}
                        </div>
                        <span className="font-bold text-white">{player.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xl font-black text-[#FFD700]">{player.rating}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-400 font-bold">{player.wins}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-red-400 font-bold">{player.losses}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white">{player.winRate}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(player.trend)}
                        <span
                          className={`text-sm font-bold ${player.change > 0
                              ? 'text-green-400'
                              : player.change < 0
                                ? 'text-red-400'
                                : 'text-gray-400'
                            }`}
                        >
                          {player.change > 0 ? '+' : ''}
                          {player.change}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

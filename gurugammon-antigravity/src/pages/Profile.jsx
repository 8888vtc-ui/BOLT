import { useAuth } from '../hooks/useAuth';
import { User, Trophy, Target, TrendingUp } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  const stats = {
    gamesPlayed: 42,
    wins: 28,
    losses: 14,
    winRate: 66.7,
    currentRank: 'Diamond',
    elo: 1845,
    tournaments: 5,
    achievements: 12
  };

  return (
    <div className="min-h-screen bg-gradient-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
          <div className="bg-gradient-primary p-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-dark-900 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">{user?.username}</h1>
                <p className="text-white/80 mt-1">{user?.email}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                    {stats.currentRank}
                  </span>
                  <span className="text-white/80">
                    ELO: {stats.elo}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Statistics</h2>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-dark-700 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-6 h-6 text-primary-400" />
                  <span className="text-gray-400">Games Played</span>
                </div>
                <p className="text-3xl font-bold">{stats.gamesPlayed}</p>
              </div>

              <div className="bg-dark-700 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-6 h-6 text-green-400" />
                  <span className="text-gray-400">Wins</span>
                </div>
                <p className="text-3xl font-bold text-green-400">{stats.wins}</p>
              </div>

              <div className="bg-dark-700 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                  <span className="text-gray-400">Win Rate</span>
                </div>
                <p className="text-3xl font-bold text-blue-400">{stats.winRate}%</p>
              </div>

              <div className="bg-dark-700 p-6 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <span className="text-gray-400">Tournaments</span>
                </div>
                <p className="text-3xl font-bold text-yellow-400">{stats.tournaments}</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Recent Matches</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-dark-700 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${i % 2 === 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                    <div>
                      <p className="font-semibold">vs Player{i}</p>
                      <p className="text-sm text-gray-400">2 hours ago</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${i % 2 === 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {i % 2 === 0 ? 'Won' : 'Lost'}
                    </p>
                    <p className="text-sm text-gray-400">7-5</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

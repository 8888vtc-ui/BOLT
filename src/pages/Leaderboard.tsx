import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, Crown, Medal, Award } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { api, User } from '../lib/api'

export default function Leaderboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [leaderboard, setLeaderboard] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const data = await api.getLeaderboard()
      setLeaderboard(data)
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-[#FFD700]" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Award className="w-6 h-6 text-[#CD7F32]" />
    return null
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/20 to-yellow-600/20 border-[#FFD700]'
    if (rank === 2) return 'from-gray-400/20 to-gray-500/20 border-gray-400'
    if (rank === 3) return 'from-orange-600/20 to-orange-700/20 border-[#CD7F32]'
    return 'from-gray-900 to-black border-gray-800'
  }

  if (!user) {
    navigate('/')
    return null
  }

  return (
    <div className="min-h-screen bg-black backgammon-pattern">
      <nav className="border-b border-gray-900 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-[#FFD700] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-[#FFD700]" />
              <span className="text-xl font-bold text-[#FFD700]">Leaderboard</span>
            </div>

            <div className="w-24"></div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-[#FFD700] mb-4">Global Rankings</h1>
          <p className="text-gray-400 text-lg">
            Top {leaderboard.length} players competing worldwide
          </p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 text-xl">Loading leaderboard...</div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((player, index) => {
              const rank = index + 1
              const isCurrentUser = player.id === user.id

              return (
                <div
                  key={player.id}
                  className={`group bg-gradient-to-br ${getRankColor(
                    rank
                  )} border-2 rounded-2xl p-6 transition-all hover:scale-[1.02] ${
                    isCurrentUser ? 'ring-2 ring-[#FFD700]' : ''
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-black/50 font-bold text-2xl text-white">
                      {getRankIcon(rank) || `#${rank}`}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3
                          className={`text-xl font-bold ${
                            isCurrentUser ? 'text-[#FFD700]' : 'text-white'
                          }`}
                        >
                          {player.username}
                        </h3>
                        {player.premium && (
                          <span className="px-2 py-1 bg-[#FFD700] text-black text-xs font-bold rounded">
                            PRO
                          </span>
                        )}
                        {isCurrentUser && (
                          <span className="px-2 py-1 bg-[#FFD700]/20 text-[#FFD700] text-xs font-bold rounded border border-[#FFD700]">
                            YOU
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-gray-400 text-sm">
                        {player.country && (
                          <span className="flex items-center gap-1">
                            <span className="text-lg">🌍</span>
                            {player.country}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-black text-[#FFD700] mb-1">
                        {player.rating}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Rating</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && leaderboard.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-24 h-24 text-gray-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">No players yet</h2>
            <p className="text-gray-500">Be the first to join the competition!</p>
          </div>
        )}

        <div className="mt-12 p-6 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl">
          <h3 className="text-xl font-bold text-[#FFD700] mb-4">How Rankings Work</h3>
          <ul className="space-y-2 text-gray-400">
            <li>• Win games to increase your rating</li>
            <li>• Rating changes based on opponent strength</li>
            <li>• Tournament victories provide bonus points</li>
            <li>• Inactive players gradually lose ranking</li>
            <li>• Premium members get exclusive tournaments</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

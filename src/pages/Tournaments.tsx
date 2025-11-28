import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, Users, Calendar, Play, Plus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { api, Tournament } from '../lib/api'

export default function Tournaments() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTournament, setNewTournament] = useState({
    name: '',
    description: '',
    maxParticipants: 16
  })

  useEffect(() => {
    loadTournaments()
  }, [])

  const loadTournaments = async () => {
    try {
      setLoading(true)
      const data = await api.getTournaments()
      setTournaments(data)
    } catch (err) {
      console.error('Failed to load tournaments:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTournament = async () => {
    try {
      await api.createTournament(
        newTournament.name,
        newTournament.description,
        newTournament.maxParticipants
      )
      setShowCreateModal(false)
      setNewTournament({ name: '', description: '', maxParticipants: 16 })
      loadTournaments()
    } catch (err) {
      console.error('Failed to create tournament:', err)
    }
  }

  const handleJoinTournament = async (tournamentId: string) => {
    try {
      await api.joinTournament(tournamentId)
      loadTournaments()
    } catch (err) {
      console.error('Failed to join tournament:', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-green-500 bg-green-500/20'
      case 'in_progress':
        return 'text-yellow-500 bg-yellow-500/20'
      case 'finished':
        return 'text-gray-500 bg-gray-500/20'
      default:
        return 'text-gray-500 bg-gray-500/20'
    }
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
              <span className="text-xl font-bold text-[#FFD700]">Tournaments</span>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Tournament
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center text-gray-400 text-xl">Loading tournaments...</div>
        ) : tournaments.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-24 h-24 text-gray-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-400 mb-2">No tournaments yet</h2>
            <p className="text-gray-500 mb-6">Be the first to create one!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-[#FFD700] text-black font-bold rounded-xl"
            >
              Create Tournament
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="group bg-gradient-to-br from-gray-900 to-black border border-gray-800 hover:border-[#FFD700] rounded-2xl p-6 transition-all hover:scale-105 shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-[#FFD700] transition-colors">
                    {tournament.name}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                      tournament.status
                    )}`}
                  >
                    {tournament.status}
                  </span>
                </div>

                {tournament.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {tournament.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Users className="w-4 h-4" />
                    <span>Max: {tournament.max_participants} players</span>
                  </div>

                  {tournament.start_time && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(tournament.start_time).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {tournament.status === 'open' && (
                  <button
                    onClick={() => handleJoinTournament(tournament.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold rounded-xl transition-all"
                  >
                    <Play className="w-4 h-4" />
                    Join Tournament
                  </button>
                )}

                {tournament.status === 'in_progress' && (
                  <button
                    className="w-full py-3 bg-gray-800 text-gray-400 font-bold rounded-xl cursor-not-allowed"
                    disabled
                  >
                    In Progress
                  </button>
                )}

                {tournament.status === 'finished' && (
                  <button
                    className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold rounded-xl transition-all"
                  >
                    View Results
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-[#FFD700] rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-3xl font-bold text-[#FFD700] mb-6">Create Tournament</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-bold mb-2">Tournament Name</label>
                <input
                  type="text"
                  value={newTournament.name}
                  onChange={(e) =>
                    setNewTournament({ ...newTournament, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:border-[#FFD700] focus:outline-none"
                  placeholder="Enter tournament name"
                />
              </div>

              <div>
                <label className="block text-white font-bold mb-2">Description</label>
                <textarea
                  value={newTournament.description}
                  onChange={(e) =>
                    setNewTournament({ ...newTournament, description: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:border-[#FFD700] focus:outline-none resize-none"
                  rows={3}
                  placeholder="Describe your tournament"
                />
              </div>

              <div>
                <label className="block text-white font-bold mb-2">Max Participants</label>
                <select
                  value={newTournament.maxParticipants}
                  onChange={(e) =>
                    setNewTournament({
                      ...newTournament,
                      maxParticipants: parseInt(e.target.value)
                    })
                  }
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:border-[#FFD700] focus:outline-none"
                >
                  <option value={8}>8 players</option>
                  <option value={16}>16 players</option>
                  <option value={32}>32 players</option>
                  <option value={64}>64 players</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 border border-gray-800 text-gray-400 hover:border-gray-700 font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTournament}
                disabled={!newTournament.name}
                className="flex-1 py-3 bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { motion } from 'framer-motion';
import { Trophy, Users, Clock, Calendar, Award, ChevronRight } from 'lucide-react';

export default function Tournaments() {
  const tournaments = [
    {
      id: 1,
      name: 'Championship Hebdomadaire',
      status: 'En cours',
      players: 128,
      maxPlayers: 128,
      prize: '🏆 500 Points',
      startDate: 'Aujourd\'hui 20:00',
      format: 'Élimination directe',
      entryFee: 'Gratuit',
    },
    {
      id: 2,
      name: 'Masters Mensuel',
      status: 'Inscription ouverte',
      players: 45,
      maxPlayers: 256,
      prize: '🏆 2000 Points',
      startDate: 'Dans 3 jours',
      format: 'Swiss System',
      entryFee: 'Gratuit',
    },
    {
      id: 3,
      name: 'Tournoi des Débutants',
      status: 'Inscription ouverte',
      players: 67,
      maxPlayers: 64,
      prize: '🏆 200 Points',
      startDate: 'Demain 18:00',
      format: 'Round Robin',
      entryFee: 'Gratuit',
    },
  ];

  const myTournaments = [
    { name: 'Championship Hebdomadaire', round: 'Quart de finale', nextMatch: 'Dans 15 min' },
    { name: 'Masters Mensuel', round: 'Inscrit', nextMatch: 'Début dans 3 jours' },
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
            Tournois
          </h1>
          <p className="text-gray-400 text-lg">Affrontez les meilleurs joueurs du monde</p>
        </motion.div>

        {/* My Tournaments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <Award className="w-6 h-6 text-[#FFD700]" />
            Mes Tournois
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myTournaments.map((tournament, index) => (
              <div
                key={index}
                className="bg-[#111] rounded-2xl p-6 border-2 border-[#FFD700] hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
                    <div className="text-sm text-gray-400">{tournament.round}</div>
                  </div>
                  <Trophy className="w-8 h-8 text-[#FFD700]" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-sm text-gray-400">Prochain match</div>
                  <div className="text-sm font-bold text-[#FFD700]">{tournament.nextMatch}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Available Tournaments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-black text-white mb-6">Tournois Disponibles</h2>

          <div className="space-y-6">
            {tournaments.map((tournament, index) => (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-[#111] rounded-2xl p-8 border border-white/10 hover:border-[#FFD700]/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">{tournament.name}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full font-bold ${tournament.status === 'En cours'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                          }`}
                      >
                        {tournament.status}
                      </span>
                      <span className="text-gray-400">{tournament.format}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-black text-[#FFD700] mb-1">{tournament.prize}</div>
                    <div className="text-sm text-gray-400">Récompense</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-400">Joueurs</div>
                      <div className="font-bold text-white">
                        {tournament.players}/{tournament.maxPlayers}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-400">Début</div>
                      <div className="font-bold text-white">{tournament.startDate}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-400">Entrée</div>
                      <div className="font-bold text-white">{tournament.entryFee}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-400">Format</div>
                      <div className="font-bold text-white text-sm">{tournament.format}</div>
                    </div>
                  </div>
                </div>

                <button
                  className={`w-full py-4 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${tournament.status === 'En cours'
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                    }`}
                  disabled={tournament.status === 'En cours'}
                >
                  {tournament.status === 'En cours' ? 'En cours' : "S'inscrire"}
                  {tournament.status !== 'En cours' && <ChevronRight className="w-5 h-5" />}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

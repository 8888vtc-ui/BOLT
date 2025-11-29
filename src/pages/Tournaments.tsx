import { motion } from 'framer-motion';
import { Trophy, Users, Clock, Calendar, Award, ChevronRight, Plus, Filter } from 'lucide-react';
import { useState } from 'react';
import CreateTournamentModal, { TournamentConfig } from '../components/tournaments/CreateTournamentModal';

export default function Tournaments() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 3 | 5 | 7 | 11>('all');

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
      matchLength: 5,
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
      matchLength: 11,
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
      matchLength: 3,
    },
    {
      id: 4,
      name: 'Blitz Express',
      status: 'Inscription ouverte',
      players: 32,
      maxPlayers: 64,
      prize: '🏆 300 Points',
      startDate: 'Ce soir 21:00',
      format: 'Élimination directe',
      entryFee: 'Gratuit',
      matchLength: 3,
    },
    {
      id: 5,
      name: 'Marathon des Champions',
      status: 'Inscription ouverte',
      players: 12,
      maxPlayers: 32,
      prize: '🏆 1500 Points',
      startDate: 'Samedi 14:00',
      format: 'Double Élimination',
      entryFee: 'Gratuit',
      matchLength: 7,
    },
  ];

  const myTournaments = [
    { name: 'Championship Hebdomadaire', round: 'Quart de finale', nextMatch: 'Dans 15 min', matchLength: 5 },
    { name: 'Masters Mensuel', round: 'Inscrit', nextMatch: 'Début dans 3 jours', matchLength: 11 },
  ];

  const categories = [
    { value: 'all' as const, label: 'Tous', count: tournaments.length },
    { value: 3 as const, label: '3 Points', count: tournaments.filter(t => t.matchLength === 3).length },
    { value: 5 as const, label: '5 Points', count: tournaments.filter(t => t.matchLength === 5).length },
    { value: 7 as const, label: '7 Points', count: tournaments.filter(t => t.matchLength === 7).length },
    { value: 11 as const, label: '11 Points', count: tournaments.filter(t => t.matchLength === 11).length },
  ];

  const filteredTournaments = selectedCategory === 'all'
    ? tournaments
    : tournaments.filter(t => t.matchLength === selectedCategory);

  const handleCreateTournament = (config: TournamentConfig) => {
    console.log('Creating tournament:', config);
    // TODO: Implement tournament creation logic
    alert(`Tournoi "${config.name}" créé avec succès !`);
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
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FDB931]">
              Tournois
            </h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black font-black rounded-xl hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.3)]"
            >
              <Plus className="w-5 h-5" />
              Créer un Tournoi
            </button>
          </div>
          <p className="text-gray-400 text-lg">Affrontez les meilleurs joueurs du monde</p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-bold text-gray-400 uppercase">Filtrer par longueur</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${selectedCategory === category.value
                    ? 'bg-[#FFD700] text-black'
                    : 'bg-[#111] text-gray-400 border border-white/10 hover:border-[#FFD700]/50'
                  }`}
              >
                {category.label}
                <span className="ml-2 text-xs opacity-70">({category.count})</span>
              </button>
            ))}
          </div>
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
            {filteredTournaments.map((tournament, index) => (
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
                      <span className="px-3 py-1 rounded-full bg-[#FFD700]/20 text-[#FFD700] font-bold text-xs">
                        {tournament.matchLength} Points
                      </span>
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

        {/* Create Tournament Modal */}
        <CreateTournamentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateTournament={handleCreateTournament}
        />
      </div>
    </div>
  );
}

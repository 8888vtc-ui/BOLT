import { motion } from 'framer-motion';
import { Trophy, Users, Clock, Calendar, Award, ChevronRight, Plus, Filter, Loader2, Play } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTournamentModal, { TournamentConfig } from '../components/tournaments/CreateTournamentModal';
import { useTournaments } from '../hooks/useTournaments';
import { useAuth } from '../hooks/useAuth';

export default function Tournaments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    tournaments,
    myTournaments,
    loading,
    error,
    createTournament,
    registerForTournament,
    fetchMyCurrentMatch,
    startTournament
  } = useTournaments();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 3 | 5 | 7 | 11>('all');
  const [registering, setRegistering] = useState<string | null>(null);
  const [joiningMatch, setJoiningMatch] = useState<string | null>(null);

  // Helper functions
  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      'registration': 'Inscription ouverte',
      'in_progress': 'En cours',
      'completed': 'Terminé',
      'cancelled': 'Annulé'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (days > 1) return `Dans ${days} jours`;
    if (days === 1) return 'Demain';
    if (hours > 0) return `Dans ${hours}h`;
    if (hours === 0) return "Aujourd'hui";
    return 'Bientôt';
  };

  const formatFormat = (format: string) => {
    const formatMap: Record<string, string> = {
      'single_elimination': 'Élimination directe',
      'double_elimination': 'Double Élimination',
      'swiss': 'Swiss System',
      'round_robin': 'Round Robin'
    };
    return formatMap[format] || format;
  };

  const categories = [
    { value: 'all' as const, label: 'Tous', count: tournaments.length },
    { value: 3 as const, label: '3 Points', count: tournaments.filter(t => t.match_length === 3).length },
    { value: 5 as const, label: '5 Points', count: tournaments.filter(t => t.match_length === 5).length },
    { value: 7 as const, label: '7 Points', count: tournaments.filter(t => t.match_length === 7).length },
    { value: 11 as const, label: '11 Points', count: tournaments.filter(t => t.match_length === 11).length },
  ];

  const filteredTournaments = selectedCategory === 'all'
    ? tournaments
    : tournaments.filter(t => t.match_length === selectedCategory);

  const handleCreateTournament = async (config: TournamentConfig) => {
    try {
      await createTournament({
        name: config.name,
        description: '', // Default
        format: config.format as any,
        match_length: config.matchLength as any,
        max_players: config.maxPlayers as any,
        start_date: config.startDate,
        registration_deadline: config.startDate, // Default to start date
        prize_pool: 0, // Default
        entry_fee: 0, // Default
        crawford_rule: true, // Default
        jacoby_rule: false, // Default
        allow_late_registration: false // Default
      });

      setShowCreateModal(false);
      alert(`Tournoi "${config.name}" créé avec succès !`);
    } catch (err: any) {
      alert(`Erreur lors de la création : ${err.message}`);
    }
  };

  const handleRegister = async (tournamentId: string) => {
    if (!user) {
      alert('Vous devez être connecté pour vous inscrire');
      return;
    }

    setRegistering(tournamentId);
    try {
      await registerForTournament(tournamentId);
      alert('Inscription réussie !');
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setRegistering(null);
    }
  };

  const handleJoinMatch = async (tournamentId: string) => {
    if (!user) return;
    setJoiningMatch(tournamentId);
    try {
      const match = await fetchMyCurrentMatch(tournamentId);
      if (match && match.game_room_id) {
        navigate(`/game/${match.game_room_id}`);
      } else {
        alert('Aucun match en cours trouvé pour ce tournoi.');
      }
    } catch (err: any) {
      console.error('Error joining match:', err);
      alert('Erreur lors de la récupération du match.');
    } finally {
      setJoiningMatch(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#FFD700] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement des tournois...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Erreur : {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#FFD700] text-black font-bold rounded-xl hover:scale-105 transition-transform"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

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
        {myTournaments.length > 0 && (
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
              {myTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="bg-[#111] rounded-2xl p-6 border-2 border-[#FFD700] hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{tournament.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${tournament.my_status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-300'
                          }`}>
                          {tournament.my_status === 'active' ? 'En cours' : 'Inscrit'}
                        </span>
                        <span className="text-sm text-gray-400">
                          {formatFormat(tournament.format)}
                        </span>
                      </div>
                    </div>
                    <Trophy className="w-8 h-8 text-[#FFD700]" />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="text-sm text-gray-400">Début: {formatDate(tournament.start_date)}</div>

                    <div className="flex gap-2">
                      {/* Bouton Démarrer (Créateur seulement) */}
                      {user && tournament.created_by === user.id && tournament.status === 'registration' && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm('Voulez-vous vraiment démarrer ce tournoi ? Les inscriptions seront closes.')) {
                              try {
                                await startTournament(tournament.id);
                                alert('Tournoi démarré avec succès !');
                              } catch (err: any) {
                                alert('Erreur : ' + err.message);
                              }
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors text-sm"
                        >
                          Démarrer
                        </button>
                      )}

                      {tournament.status === 'in_progress' && (
                        <button
                          onClick={() => handleJoinMatch(tournament.id)}
                          disabled={joiningMatch === tournament.id}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 transition-colors"
                        >
                          {joiningMatch === tournament.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          Jouer le Match
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Available Tournaments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-black text-white mb-6">Tournois Disponibles</h2>

          <div className="space-y-6">
            {filteredTournaments.length === 0 ? (
              <div className="text-center py-12 bg-[#111] rounded-2xl border border-white/10">
                <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aucun tournoi disponible dans cette catégorie.</p>
              </div>
            ) : (
              filteredTournaments.map((tournament, index) => (
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
                          className={`px-3 py-1 rounded-full font-bold ${tournament.status === 'in_progress'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-blue-500/20 text-blue-400'
                            }`}
                        >
                          {formatStatus(tournament.status)}
                        </span>
                        <span className="text-gray-400">{formatFormat(tournament.format)}</span>
                        <span className="px-3 py-1 rounded-full bg-[#FFD700]/20 text-[#FFD700] font-bold text-xs">
                          {tournament.match_length} Points
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-3xl font-black text-[#FFD700] mb-1">🏆 {tournament.prize_pool}</div>
                      <div className="text-sm text-gray-400">Points</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-400">Joueurs</div>
                        <div className="font-bold text-white">
                          {tournament.participants_count || 0}/{tournament.max_players}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-400">Début</div>
                        <div className="font-bold text-white">{formatDate(tournament.start_date)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-400">Entrée</div>
                        <div className="font-bold text-white">
                          {tournament.entry_fee === 0 ? 'Gratuit' : `${tournament.entry_fee} Points`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-400">Format</div>
                        <div className="font-bold text-white text-sm">{formatFormat(tournament.format)}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRegister(tournament.id)}
                    disabled={tournament.status !== 'registration' || registering === tournament.id || tournament.is_registered}
                    className={`w-full py-4 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-2 ${tournament.status !== 'registration' || registering === tournament.id
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : tournament.is_registered
                        ? 'bg-green-600 text-white cursor-default'
                        : 'bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black hover:scale-[1.02] shadow-[0_0_20px_rgba(255,215,0,0.3)]'
                      }`}
                  >
                    {registering === tournament.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Inscription...
                      </>
                    ) : tournament.is_registered ? (
                      '✓ Inscrit'
                    ) : tournament.status !== 'registration' ? (
                      'Inscriptions fermées'
                    ) : (
                      <>
                        S'inscrire
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </motion.div>
              ))
            )}
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

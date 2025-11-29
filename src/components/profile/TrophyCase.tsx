import { Trophy, Award, Medal, Star, Crown, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrophyCaseProps {
    tournamentsWon: number;
    tournamentsPlayed: number;
    tournamentPoints: number;
    bestFinish: number;
    badges: string[];
}

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    requirement: number;
    category: 'wins' | 'participation' | 'points' | 'special';
}

export default function TrophyCase({
    tournamentsWon,
    tournamentsPlayed,
    tournamentPoints,
    bestFinish,
    badges,
}: TrophyCaseProps) {

    const allBadges: Badge[] = [
        // Wins
        { id: 'first_win', name: 'Première Victoire', description: 'Gagner votre premier tournoi', icon: <Trophy className="w-6 h-6" />, color: '#FFD700', requirement: 1, category: 'wins' },
        { id: 'veteran', name: 'Vétéran', description: 'Gagner 10 tournois', icon: <Medal className="w-6 h-6" />, color: '#C0C0C0', requirement: 10, category: 'wins' },
        { id: 'champion', name: 'Champion', description: 'Gagner 25 tournois', icon: <Crown className="w-6 h-6" />, color: '#FFD700', requirement: 25, category: 'wins' },
        { id: 'legend', name: 'Légende', description: 'Gagner 50 tournois', icon: <Star className="w-6 h-6" />, color: '#FF6B6B', requirement: 50, category: 'wins' },

        // Participation
        { id: 'participant', name: 'Participant', description: 'Jouer 5 tournois', icon: <Target className="w-6 h-6" />, color: '#4ECDC4', requirement: 5, category: 'participation' },
        { id: 'regular', name: 'Habitué', description: 'Jouer 20 tournois', icon: <Award className="w-6 h-6" />, color: '#95E1D3', requirement: 20, category: 'participation' },
        { id: 'dedicated', name: 'Dévoué', description: 'Jouer 50 tournois', icon: <Trophy className="w-6 h-6" />, color: '#38ADA9', requirement: 50, category: 'participation' },

        // Points
        { id: 'point_collector', name: 'Collectionneur', description: 'Gagner 1000 points', icon: <Star className="w-6 h-6" />, color: '#FFA502', requirement: 1000, category: 'points' },
        { id: 'point_master', name: 'Maître des Points', description: 'Gagner 5000 points', icon: <Crown className="w-6 h-6" />, color: '#FF6348', requirement: 5000, category: 'points' },
    ];

    const earnedBadges = allBadges.filter(badge => {
        if (badge.category === 'wins') return tournamentsWon >= badge.requirement;
        if (badge.category === 'participation') return tournamentsPlayed >= badge.requirement;
        if (badge.category === 'points') return tournamentPoints >= badge.requirement;
        return badges.includes(badge.id);
    });

    const stats = [
        { label: 'Tournois Gagnés', value: tournamentsWon, icon: <Trophy className="w-5 h-5" />, color: '#FFD700' },
        { label: 'Tournois Joués', value: tournamentsPlayed, icon: <Target className="w-5 h-5" />, color: '#4ECDC4' },
        { label: 'Points Totaux', value: tournamentPoints, icon: <Star className="w-5 h-5" />, color: '#FFA502' },
        { label: 'Meilleur Classement', value: bestFinish > 0 ? `#${bestFinish}` : '-', icon: <Medal className="w-5 h-5" />, color: '#C0C0C0' },
    ];

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-[#111] rounded-xl p-4 border border-white/10"
                    >
                        <div className="flex items-center gap-2 mb-2" style={{ color: stat.color }}>
                            {stat.icon}
                            <span className="text-xs text-gray-400 uppercase font-bold">{stat.label}</span>
                        </div>
                        <div className="text-2xl font-black text-white">{stat.value}</div>
                    </motion.div>
                ))}
            </div>

            {/* Trophy Case */}
            <div className="bg-[#111] rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-[#FFD700]" />
                    Vitrine des Trophées
                    <span className="text-sm text-gray-500 font-normal ml-2">
                        ({earnedBadges.length}/{allBadges.length})
                    </span>
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allBadges.map((badge, index) => {
                        const isEarned = earnedBadges.some(b => b.id === badge.id);

                        return (
                            <motion.div
                                key={badge.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className={`relative p-4 rounded-xl border-2 transition-all ${isEarned
                                        ? 'bg-gradient-to-br from-white/5 to-white/10 border-white/20 hover:border-white/40'
                                        : 'bg-black/50 border-white/5 opacity-50'
                                    }`}
                            >
                                {isEarned && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">✓</span>
                                    </div>
                                )}

                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto"
                                    style={{ backgroundColor: isEarned ? `${badge.color}20` : '#1a1a1a', color: isEarned ? badge.color : '#444' }}
                                >
                                    {badge.icon}
                                </div>

                                <div className="text-center">
                                    <div className={`text-sm font-bold mb-1 ${isEarned ? 'text-white' : 'text-gray-600'}`}>
                                        {badge.name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {badge.description}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Progress to Next Badge */}
            {earnedBadges.length < allBadges.length && (
                <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FDB931]/10 rounded-xl p-4 border border-[#FFD700]/20">
                    <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-[#FFD700]" />
                        <div className="flex-1">
                            <div className="text-sm font-bold text-white mb-1">Prochain Trophée</div>
                            <div className="text-xs text-gray-400">
                                {(() => {
                                    const nextBadge = allBadges.find(b => !earnedBadges.some(eb => eb.id === b.id));
                                    if (!nextBadge) return 'Tous les trophées débloqués !';

                                    let progress = 0;
                                    let total = nextBadge.requirement;

                                    if (nextBadge.category === 'wins') progress = tournamentsWon;
                                    if (nextBadge.category === 'participation') progress = tournamentsPlayed;
                                    if (nextBadge.category === 'points') progress = tournamentPoints;

                                    return `${nextBadge.name}: ${progress}/${total}`;
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

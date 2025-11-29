import { useState } from 'react';
import { X, Trophy, Users, Calendar, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateTournamentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateTournament: (tournament: TournamentConfig) => void;
}

export interface TournamentConfig {
    name: string;
    matchLength: 3 | 5 | 7 | 11;
    maxPlayers: number;
    format: 'single-elimination' | 'double-elimination' | 'swiss' | 'round-robin';
    startDate: string;
    isPublic: boolean;
}

export default function CreateTournamentModal({ isOpen, onClose, onCreateTournament }: CreateTournamentModalProps) {
    const [config, setConfig] = useState<TournamentConfig>({
        name: '',
        matchLength: 5,
        maxPlayers: 8,
        format: 'single-elimination',
        startDate: '',
        isPublic: true,
    });

    const matchLengths = [
        { value: 3, label: '3 Points', description: 'Parties rapides' },
        { value: 5, label: '5 Points', description: 'Standard' },
        { value: 7, label: '7 Points', description: 'Intermédiaire' },
        { value: 11, label: '11 Points', description: 'Longue distance' },
    ] as const;

    const formats = [
        { value: 'single-elimination', label: 'Élimination Directe', icon: '🏆' },
        { value: 'double-elimination', label: 'Double Élimination', icon: '🔄' },
        { value: 'swiss', label: 'Swiss System', icon: '♟️' },
        { value: 'round-robin', label: 'Round Robin', icon: '🔁' },
    ] as const;

    const playerCounts = [8, 16, 32, 64, 128];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!config.name || !config.startDate) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }
        onCreateTournament(config);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-[#1a1a1a] border-2 border-[#FFD700] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/10 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-[#FFD700]/20 rounded-full flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-[#FFD700]" />
                                </div>
                                <h2 className="text-2xl font-black text-white">Créer un Tournoi</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Nom du tournoi */}
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">
                                    Nom du Tournoi *
                                </label>
                                <input
                                    type="text"
                                    value={config.name}
                                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                                    placeholder="Ex: Championship du Vendredi"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:border-[#FFD700] focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Longueur des matchs */}
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-3">
                                    Longueur des Matchs *
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {matchLengths.map((length) => (
                                        <button
                                            key={length.value}
                                            type="button"
                                            onClick={() => setConfig({ ...config, matchLength: length.value })}
                                            className={`p-4 rounded-xl border-2 transition-all ${config.matchLength === length.value
                                                    ? 'border-[#FFD700] bg-[#FFD700]/10'
                                                    : 'border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="text-2xl font-black text-white mb-1">{length.value}</div>
                                            <div className="text-xs text-gray-400">{length.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Format */}
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-3">
                                    Format du Tournoi *
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {formats.map((format) => (
                                        <button
                                            key={format.value}
                                            type="button"
                                            onClick={() => setConfig({ ...config, format: format.value })}
                                            className={`p-4 rounded-xl border-2 transition-all text-left ${config.format === format.value
                                                    ? 'border-[#FFD700] bg-[#FFD700]/10'
                                                    : 'border-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{format.icon}</span>
                                                <span className="font-bold text-white">{format.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Nombre de joueurs */}
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-3">
                                    Nombre Maximum de Joueurs *
                                </label>
                                <div className="flex gap-2">
                                    {playerCounts.map((count) => (
                                        <button
                                            key={count}
                                            type="button"
                                            onClick={() => setConfig({ ...config, maxPlayers: count })}
                                            className={`flex-1 py-3 rounded-lg border-2 font-bold transition-all ${config.maxPlayers === count
                                                    ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700]'
                                                    : 'border-white/10 text-gray-400 hover:border-white/20'
                                                }`}
                                        >
                                            {count}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date de début */}
                            <div>
                                <label className="block text-sm font-bold text-gray-400 mb-2">
                                    Date et Heure de Début *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={config.startDate}
                                    onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FFD700] focus:outline-none"
                                    required
                                />
                            </div>

                            {/* Visibilité */}
                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.isPublic}
                                        onChange={(e) => setConfig({ ...config, isPublic: e.target.checked })}
                                        className="w-5 h-5 rounded border-white/10 bg-black/50 text-[#FFD700] focus:ring-[#FFD700]"
                                    />
                                    <span className="text-white font-medium">Tournoi Public (visible par tous)</span>
                                </label>
                            </div>

                            {/* Boutons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-xl border-2 border-white/10 text-white font-bold hover:bg-white/5 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black font-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,215,0,0.3)]"
                                >
                                    Créer le Tournoi
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

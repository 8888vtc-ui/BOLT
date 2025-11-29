import React from 'react';
import { motion } from 'framer-motion';
import { Users, Play, Eye, Clock, Lock, User } from 'lucide-react';
import { Room } from '../../stores/gameStore';

interface RoomCardProps {
    room: Room;
    onJoin: () => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onJoin }) => {
    const isFull = room.players.length >= 2;
    const isPlaying = room.status === 'playing';

    // Mock data pour l'exemple (à remplacer par des vraies données si dispo)
    const creatorName = room.players[0]?.username || 'Inconnu';
    const hasPassword = false; // À implémenter
    const timePerTurn = '30s'; // À implémenter

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative bg-[#111] rounded-2xl overflow-hidden border border-white/10 hover:border-[#FFD700]/50 transition-all duration-300 shadow-lg hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
        >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Top Border Gradient */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="p-6 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-[#FFD700] transition-colors truncate max-w-[180px]">
                            {room.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                            <User className="w-3 h-3" />
                            <span>par <span className="text-gray-300 font-medium">{creatorName}</span></span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isPlaying
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                : 'bg-green-500/10 text-green-500 border border-green-500/20'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
                            {isPlaying ? 'En cours' : 'Ouvert'}
                        </div>
                        {hasPassword && <Lock className="w-3 h-3 text-gray-500" />}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-gray-400">
                            <Users className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold">Joueurs</div>
                            <div className="text-sm font-bold text-white">{room.players.length}/2</div>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-gray-400">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold">Temps/Tour</div>
                            <div className="text-sm font-bold text-white">{timePerTurn}</div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onJoin}
                        disabled={isFull && !isPlaying}
                        className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${isFull
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-[#FFD700] hover:bg-[#FDB931] text-black shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] transform hover:-translate-y-0.5'
                            }`}
                    >
                        {isFull ? (
                            <>Complet</>
                        ) : (
                            <>
                                <Play className="w-4 h-4 fill-current" />
                                Rejoindre
                            </>
                        )}
                    </button>

                    <button className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/5 hover:border-white/20">
                        <Eye className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default RoomCard;

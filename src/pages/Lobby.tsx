import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wifi, WifiOff, Search, Trophy } from 'lucide-react';
import { useGameSocket } from '../hooks/useGameSocket';
import { useGameStore } from '../stores/gameStore';
import RoomCard from '../components/lobby/RoomCard';
import CreateRoomModal from '../components/lobby/CreateRoomModal';

const Lobby = () => {
    const navigate = useNavigate();
    const { isConnected, createRoom, joinRoom } = useGameSocket();
    const { roomsList } = useGameStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Simuler un chargement initial pour l'effet skeleton
    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleCreateRoom = (name: string) => {
        createRoom(name);
        setIsModalOpen(false);
    };

    const handleJoinRoom = (roomId: string) => {
        joinRoom(roomId);
        navigate(`/game/${roomId}`);
    };

    const filteredRooms = roomsList.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden font-sans selection:bg-[#FFD700] selection:text-black">
            {/* Background patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#1a1a1a] via-black to-black opacity-60 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-50" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#FFD700] via-[#FDB931] to-[#B8860B] tracking-tight drop-shadow-sm">
                            Lobby
                        </h1>
                        <p className="text-gray-400 mt-2 text-lg font-light flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#FFD700] animate-pulse" />
                            Parties en cours
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto"
                    >
                        {/* Status Indicator */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md transition-colors ${isConnected
                                ? 'border-green-500/30 bg-green-500/10 text-green-400'
                                : 'border-red-500/30 bg-red-500/10 text-red-400'
                            }`}>
                            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                            <span className="text-sm font-medium uppercase tracking-wider">
                                {isConnected ? 'Online' : 'Offline'}
                            </span>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFD700] to-[#FDB931] hover:from-[#FDB931] hover:to-[#FFD700] text-black px-8 py-3 rounded-xl font-bold text-lg transition-all transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] active:scale-95"
                        >
                            <Plus className="w-6 h-6" />
                            Créer une partie
                        </button>
                    </motion.div>
                </header>

                {/* Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-10 relative max-w-md"
                >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-12 pr-4 py-4 bg-[#111] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-transparent transition-all"
                        placeholder="Rechercher une table..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </motion.div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-[#111] rounded-2xl p-6 border border-white/5 h-64 animate-pulse">
                                    <div className="h-8 bg-white/10 rounded-md w-3/4 mb-4" />
                                    <div className="h-4 bg-white/5 rounded-md w-1/2 mb-8" />
                                    <div className="space-y-3">
                                        <div className="h-10 bg-white/5 rounded-full w-full" />
                                        <div className="h-10 bg-white/5 rounded-full w-full" />
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : filteredRooms.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="text-center py-24 bg-[#111]/50 backdrop-blur-sm rounded-3xl border border-white/10 flex flex-col items-center"
                        >
                            <div className="w-24 h-24 bg-[#FFD700]/10 rounded-full flex items-center justify-center mb-6 border border-[#FFD700]/20 shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                                <Trophy className="w-10 h-10 text-[#FFD700]" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2">Aucune partie en cours</h3>
                            <p className="text-gray-400 max-w-md mx-auto mb-8 text-lg">
                                Le lobby est calme... Soyez le premier à lancer les dés et à défier le monde !
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="text-[#FFD700] hover:text-white font-bold text-lg underline underline-offset-8 decoration-2 decoration-[#FFD700]/50 hover:decoration-[#FFD700] transition-all"
                            >
                                Créer la première table maintenant
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="grid"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            <AnimatePresence>
                                {filteredRooms.map((room, index) => (
                                    <motion.div
                                        key={room.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <RoomCard
                                            room={room}
                                            onJoin={() => handleJoinRoom(room.id)}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <CreateRoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateRoom}
            />
        </div>
    );
};

export default Lobby;

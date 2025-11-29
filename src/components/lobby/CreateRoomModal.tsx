import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dice5, Clock, Lock, Check } from 'lucide-react';

interface CreateRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, options?: any) => void;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [roomName, setRoomName] = useState('');
    const [timer, setTimer] = useState('60');
    const [password, setPassword] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (roomName.trim()) {
            onCreate(roomName, {
                timer: parseInt(timer),
                password: isPrivate ? password : null
            });
            // Reset form
            setRoomName('');
            setPassword('');
            setIsPrivate(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-[#111] border border-[#FFD700]/30 rounded-2xl p-8 w-full max-w-md shadow-[0_0_50px_rgba(255,215,0,0.15)] overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-50" />

                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#FFD700]/20 to-[#B8860B]/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#FFD700]/30 shadow-[0_0_20px_rgba(255,215,0,0.1)]">
                                <Dice5 className="w-8 h-8 text-[#FFD700]" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Créer une Table</h2>
                            <p className="text-gray-400 mt-2 text-sm">Configurez votre partie pour défier le monde</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nom de la table */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                                    Nom de la table
                                </label>
                                <input
                                    type="text"
                                    value={roomName}
                                    onChange={(e) => setRoomName(e.target.value)}
                                    placeholder="Ex: Arena des Champions"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] transition-all"
                                    autoFocus
                                />
                            </div>

                            {/* Timer */}
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1 flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Temps par tour
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: '30s', value: '30' },
                                        { label: '60s', value: '60' },
                                        { label: '2 min', value: '120' },
                                        { label: '5 min', value: '300' },
                                        { label: '∞', value: '0' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setTimer(opt.value)}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${timer === opt.value
                                                    ? 'bg-[#FFD700]/10 border-[#FFD700] text-[#FFD700]'
                                                    : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Password Toggle */}
                            <div>
                                <button
                                    type="button"
                                    onClick={() => setIsPrivate(!isPrivate)}
                                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-2"
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isPrivate ? 'bg-[#FFD700] border-[#FFD700]' : 'border-gray-500'}`}>
                                        {isPrivate && <Check className="w-3 h-3 text-black" />}
                                    </div>
                                    Partie privée (mot de passe)
                                </button>

                                <AnimatePresence>
                                    {isPrivate && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="relative mt-2">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                                <input
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="Mot de passe secret"
                                                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#FFD700] transition-all"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={!roomName.trim()}
                                    className="flex-[2] bg-gradient-to-r from-[#FFD700] to-[#FDB931] hover:from-[#FDB931] hover:to-[#FFD700] disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                                >
                                    Créer la partie
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CreateRoomModal;

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WinModalProps {
    isOpen: boolean;
    winner: 'player' | 'bot' | 'opponent';
    winType: 'simple' | 'gammon' | 'backgammon';
    onClose: () => void;
    onRematch?: () => void;
}

const WinModal = ({ isOpen, winner, winType, onClose, onRematch }: WinModalProps) => {
    const navigate = useNavigate();

    const winMessages = {
        simple: 'Simple Victory',
        gammon: 'Gammon!',
        backgammon: 'Backgammon!'
    };

    const isWin = winner === 'player';

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`relative max-w-md w-full rounded-3xl p-8 shadow-2xl border-2 ${
                            isWin
                                ? 'bg-gradient-to-br from-[#FFD700]/20 to-[#FDB931]/20 border-[#FFD700]'
                                : 'bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500'
                        }`}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                                    isWin ? 'bg-[#FFD700]' : 'bg-gray-600'
                                }`}
                            >
                                <Trophy className={`w-12 h-12 ${isWin ? 'text-black' : 'text-white'}`} />
                            </motion.div>

                            <h2 className={`text-4xl font-black mb-2 ${isWin ? 'text-[#FFD700]' : 'text-red-400'}`}>
                                {isWin ? 'Victory!' : 'Defeat'}
                            </h2>

                            <p className="text-2xl font-bold text-white mb-4">
                                {winMessages[winType]}
                            </p>

                            <p className="text-gray-300 mb-8">
                                {isWin
                                    ? 'Congratulations! You played brilliantly.'
                                    : 'Better luck next time. Keep practicing!'}
                            </p>

                            <div className="flex flex-col gap-3">
                                {onRematch && (
                                    <button
                                        onClick={onRematch}
                                        className="w-full px-6 py-3 bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold rounded-xl transition-all shadow-lg shadow-[#FFD700]/20"
                                    >
                                        Rematch
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        onClose();
                                        navigate('/lobby');
                                    }}
                                    className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <Home className="w-5 h-5" />
                                    Back to Lobby
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WinModal;


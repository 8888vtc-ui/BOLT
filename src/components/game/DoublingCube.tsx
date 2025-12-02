import { motion, AnimatePresence } from 'framer-motion';
import { Dices } from 'lucide-react';

interface DoublingCubeProps {
    cubeValue: number;
    cubeOwner: string | null;
    currentPlayerId: string;
    canDouble: boolean;
    pendingDouble: { offeredBy: string; timestamp: number } | null;
    onOfferDouble: () => void;
    onAcceptDouble: () => void;
    onRejectDouble: () => void;
    opponentName?: string;
}

export default function DoublingCube({
    cubeValue,
    cubeOwner,
    currentPlayerId,
    canDouble,
    pendingDouble,
    onOfferDouble,
    onAcceptDouble,
    onRejectDouble,
    opponentName = 'Adversaire'
}: DoublingCubeProps) {

    const isMyTurn = !pendingDouble || pendingDouble.offeredBy !== currentPlayerId;
    const iOwnCube = cubeOwner === currentPlayerId;
    const opponentOwnsCube = cubeOwner !== null && cubeOwner !== currentPlayerId;

    return (
        <div className="relative">
            {/* Le Cube 3D */}
            <motion.div
                className="relative w-20 h-20 mx-auto mb-4"
                animate={{
                    rotateX: pendingDouble ? 360 : 0,
                    rotateY: pendingDouble ? 360 : 0,
                }}
                transition={{ duration: 1, ease: 'easeInOut' }}
            >
                <div
                    className={`
            w-full h-full rounded-lg flex items-center justify-center text-3xl font-black
            shadow-[0_8px_32px_rgba(0,0,0,0.4)]
            border-2 transition-all duration-300
            ${iOwnCube ? 'bg-gradient-to-br from-[#FFD700] to-[#FDB931] border-[#FFD700] text-black' : ''}
            ${opponentOwnsCube ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-500 text-white' : ''}
            ${cubeOwner === null ? 'bg-gradient-to-br from-gray-700 to-gray-900 border-white/30 text-white' : ''}
          `}
                    style={{
                        transform: 'perspective(1000px) rotateX(10deg) rotateY(-10deg)',
                        boxShadow: iOwnCube
                            ? '0 0 40px rgba(255, 215, 0, 0.6)'
                            : opponentOwnsCube
                                ? '0 0 40px rgba(239, 68, 68, 0.6)'
                                : '0 0 20px rgba(255, 255, 255, 0.2)'
                    }}
                >
                    {cubeValue}
                </div>
            </motion.div>

            {/* Indicateur de propriété */}
            <div className="text-center text-sm font-bold mb-3">
                {cubeOwner === null && (
                    <span className="text-gray-400">🎲 Cube au centre</span>
                )}
                {iOwnCube && (
                    <span className="text-[#FFD700]">✨ Vous possédez le cube</span>
                )}
                {opponentOwnsCube && (
                    <span className="text-red-400">⚠️ {opponentName} possède le cube</span>
                )}
            </div>

            {/* Proposition en attente */}
            <AnimatePresence>
                {pendingDouble && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500 rounded-xl p-4 mb-4"
                    >
                        <div className="text-center">
                            <div className="text-lg font-black text-orange-400 mb-2">
                                🔥 PROPOSITION DE DOUBLE !
                            </div>
                            <div className="text-sm text-gray-300 mb-3">
                                {pendingDouble.offeredBy === currentPlayerId
                                    ? `En attente de la réponse de ${opponentName}...`
                                    : `${opponentName} propose de doubler à ${cubeValue * 2}`
                                }
                            </div>

                            {pendingDouble.offeredBy !== currentPlayerId && (
                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={onAcceptDouble}
                                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all hover:scale-105 shadow-lg"
                                    >
                                        ✓ Accepter
                                    </button>
                                    <button
                                        onClick={onRejectDouble}
                                        className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all hover:scale-105 shadow-lg"
                                    >
                                        ✗ Abandonner
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bouton pour proposer de doubler */}
            {!pendingDouble && canDouble && isMyTurn && (
                <motion.button
                    onClick={onOfferDouble}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black rounded-xl shadow-lg hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-2"
                >
                    <Dices className="w-5 h-5" />
                    DOUBLER ({cubeValue} → {cubeValue * 2})
                </motion.button>
            )}

            {/* Message si on ne peut pas doubler */}
            {!pendingDouble && !canDouble && isMyTurn && (
                <div className="text-center text-xs text-gray-500 italic">
                    {cubeValue >= 64 ? 'Limite du cube atteinte (64)' :
                        opponentOwnsCube ? `${opponentName} possède le cube` :
                            'Lancez les dés pour jouer'}
                </div>
            )}
        </div>
    );
}

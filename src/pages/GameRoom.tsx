import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, WifiOff, Clock, User as UserIcon, LogOut, Flag, RotateCcw, Lightbulb, X } from 'lucide-react';

import { useGameSocket } from '../hooks/useGameSocket';
import { useGameStore } from '../stores/gameStore';
import { useAuth } from '../hooks/useAuth';
import { analyzeMove, AIAnalysis } from '../lib/aiService';
import { useDebugStore } from '../stores/debugStore';

import Point from '../components/Point';
import Checker from '../components/Checker';
import Dice from '../components/Dice';
import DoublingCube from '../components/DoublingCube';
import ChatBox from '../components/game/ChatBox';
import DebugOverlay from '../components/DebugOverlay';

// Détection mobile pour Drag & Drop
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const backend = isTouchDevice ? TouchBackend : HTML5Backend;

const GameRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        isConnected,
        joinRoom,
        leaveRoom,
        sendGameAction,
        handleCheckerClick,
        undoMove,
        canUndo
    } = useGameSocket();

    const { currentRoom, gameState, players } = useGameStore();
    const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

    // AI Coach State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);

    // Rejoindre la room au montage
    useEffect(() => {
        if (roomId && isConnected && !currentRoom) {
            joinRoom(roomId);
        }
    }, [roomId, isConnected, currentRoom, joinRoom]);

    // Loading State Logs
    useEffect(() => {
        const addLog = useDebugStore.getState().addLog;
        if (!currentRoom || !gameState) {
            addLog('Chargement de la partie...', 'info', {
                hasRoom: !!currentRoom,
                hasGameState: !!gameState,
                roomId,
                isConnected
            });
        } else {
            addLog('Partie chargée avec succès !', 'success', {
                roomName: currentRoom.name,
                turn: gameState.turn
            });
        }
    }, [currentRoom, gameState, roomId, isConnected]);

    if (!currentRoom || !gameState) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
                <DebugOverlay />
                <div className="w-16 h-16 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin mb-6" />
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#B8860B]">
                    Chargement de la partie...
                </h2>
                <p className="text-gray-500 mt-2">Synchronisation avec le serveur</p>
                <p className="text-xs text-gray-700 mt-4 font-mono">
                    {isConnected ? 'Connecté au socket' : 'Connexion socket en cours...'}
                </p>
            </div>
        );
    }

    // Offline State
    if (!isConnected) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <DebugOverlay />
                <div className="text-center p-8 bg-[#111] rounded-2xl border border-red-500/20">
                    <WifiOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Connexion perdue</h2>
                    <button onClick={() => navigate('/lobby')} className="text-[#FFD700] underline hover:text-white transition-colors">
                        Retour au Lobby
                    </button>
                </div>
            </div>
        );
    }

    // --- Game Logic ---
    const { board, dice, turn, score, cubeValue } = gameState;
    const isMyTurn = turn === user?.id || (turn === 'guest-1' && user?.id === 'guest-1'); // Hack for demo
    const playerColor = players[0]?.id === user?.id ? 1 : 2; // 1 = Blanc, 2 = Rouge

    // Handlers
    const handleRollDice = () => {
        if (isMyTurn && dice.length === 0) {
            sendGameAction('rollDice', {});
        }
    };

    const handleAskCoach = async () => {
        if (isAnalyzing) return;
        setIsAnalyzing(true);
        setAiAnalysis(null);
        setShowAnalysis(true);

        const addLog = useDebugStore.getState().addLog;
        addLog('Demande d\'analyse au Coach...', 'info');

        try {
            const analysis = await analyzeMove(gameState, gameState.dice);
            setAiAnalysis(analysis);
            addLog('Analyse reçue !', 'success');
        } catch (e) {
            addLog('Erreur analyse', 'error', e);
        }
        setIsAnalyzing(false);
    };

    const onDragStart = (index: number) => {
        if (!isMyTurn) return;
        setSelectedPoint(index);
    };

    const onDrop = (toIndex: number) => {
        if (selectedPoint !== null && isMyTurn) {
            sendGameAction('move', { from: selectedPoint, to: toIndex });
            setSelectedPoint(null);
        }
    };

    const handleLeave = () => {
        if (window.confirm('Voulez-vous vraiment quitter la partie ?')) {
            leaveRoom();
            navigate('/lobby');
        }
    };

    // Construction du plateau selon la disposition standard du backgammon
    // Top row: points 12-17 (gauche) et 18-23 (droite)
    // Bottom row: points 11-6 (gauche) et 5-0 (droite)
    const topPoints = [];
    const bottomPoints = [];

    // Top row (points 12 à 23, de gauche à droite)
    for (let i = 12; i <= 23; i++) {
        topPoints.push(
            <Point
                key={i}
                index={i}
                point={board.points[i]}
                isTop={true}
                isValidDestination={false}
                onDrop={onDrop}
                onDragStart={onDragStart}
                currentPlayer={playerColor}
                canMove={isMyTurn && (dice.length > 0 || canUndo)} // Allow drag if undo is possible
                onClick={() => handleCheckerClick(i)}
            />
        );
    }

    // Bottom row (points 11 à 0, de gauche à droite)
    for (let i = 11; i >= 0; i--) {
        bottomPoints.push(
            <Point
                key={i}
                index={i}
                point={board.points[i]}
                isTop={false}
                isValidDestination={false}
                onDrop={onDrop}
                onDragStart={onDragStart}
                currentPlayer={playerColor}
                canMove={isMyTurn && (dice.length > 0 || canUndo)} // Allow drag if undo is possible
                onClick={() => handleCheckerClick(i)}
            />
        );
    }

    return (
        <DndProvider backend={backend}>
            <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans relative">
                <DebugOverlay />

                {/* AI Coach Modal */}
                <AnimatePresence>
                    {showAnalysis && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        >
                            <div className="bg-[#1a1a1a] border border-[#FFD700]/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                                <button
                                    onClick={() => setShowAnalysis(false)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-[#FFD700]/10 flex items-center justify-center">
                                        <Lightbulb className="w-6 h-6 text-[#FFD700]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">L'avis du Coach</h3>
                                </div>

                                {isAnalyzing ? (
                                    <div className="py-8 flex flex-col items-center gap-4">
                                        <div className="w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
                                        <p className="text-gray-400 animate-pulse">Analyse de la position...</p>
                                    </div>
                                ) : aiAnalysis ? (
                                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {/* Meilleur Coup */}
                                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Meilleur Coup</div>
                                            <div className="text-lg font-mono text-[#FFD700]">
                                                {aiAnalysis.bestMove.map(m => `${m.from + 1} → ${m.to + 1}`).join(', ')}
                                            </div>
                                        </div>

                                        {/* Stratégie Recommandée */}
                                        {aiAnalysis.strategicAdvice && (
                                            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-4 rounded-xl border border-blue-500/20">
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="text-xs text-blue-400 uppercase font-bold">Stratégie</div>
                                                    {aiAnalysis.strategicAdvice.riskLevel && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${aiAnalysis.strategicAdvice.riskLevel === 'high' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                                            aiAnalysis.strategicAdvice.riskLevel === 'low' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                                                                'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                                                            }`}>
                                                            RISQUE: {aiAnalysis.strategicAdvice.riskLevel.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm font-bold text-white mb-1">
                                                    {aiAnalysis.strategicAdvice.recommendedStrategy}
                                                </div>
                                                <div className="text-xs text-gray-400 leading-relaxed">
                                                    {aiAnalysis.strategicAdvice.analysis}
                                                </div>
                                            </div>
                                        )}

                                        {/* Explication Technique */}
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Détails Techniques</div>
                                            <div className="text-sm text-gray-300 whitespace-pre-line">
                                                {aiAnalysis.explanation.split('\n\n🧠')[0]}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-8">
                                        Impossible de récupérer l'analyse.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header */}
                <header className="h-16 bg-[#111] border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-20">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/lobby')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-[#FFD700] flex items-center gap-2">
                                {currentRoom.name}
                                <span className="px-2 py-0.5 rounded text-[10px] bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 uppercase tracking-wider">
                                    Ranked
                                </span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${isMyTurn
                            ? 'bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                            : 'bg-gray-800/50 border-gray-700 text-gray-400'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${isMyTurn ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                            <span className="text-sm font-bold uppercase tracking-wide">
                                {isMyTurn ? "C'est à vous !" : "Tour adverse"}
                            </span>
                        </div>

                        <button
                            onClick={handleLeave}
                            className="flex items-center gap-2 text-xs font-bold text-red-500/80 hover:text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            QUITTER
                        </button>
                    </div>
                </header>

                {/* Main Layout */}
                <div className="flex-1 flex overflow-hidden">

                    {/* Left Column: Players Info */}
                    <div className="w-72 bg-[#0a0a0a] border-r border-white/10 flex flex-col shrink-0 z-10">
                        <div className="p-6 space-y-6">
                            <h3 className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-4">Joueurs</h3>

                            {players.map((player, idx) => {
                                const isCurrentTurn = turn === player.id;
                                return (
                                    <motion.div
                                        key={player.id || idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`relative p-4 rounded-xl border transition-all duration-300 ${isCurrentTurn
                                            ? 'bg-[#FFD700]/5 border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.1)]'
                                            : 'bg-white/5 border-white/5'
                                            }`}
                                    >
                                        {isCurrentTurn && (
                                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-[#FFD700] rounded-r-full shadow-[0_0_10px_#FFD700]" />
                                        )}

                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center border-2 border-white/10 overflow-hidden">
                                                    {player.avatar ? (
                                                        <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserIcon className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-bold ${idx === 0 ? 'bg-[#e2e8f0] text-black' : 'bg-[#ef4444] text-white'
                                                    }`}>
                                                    {idx === 0 ? '1' : '2'}
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm truncate">{player.username || 'Joueur'}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> 05:00
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-black/30 rounded-lg p-2">
                                            <div className="text-xs text-gray-500">Score</div>
                                            <div className="text-lg font-mono font-bold text-[#FFD700]">{score[player.id] || 0}</div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Chat */}
                        <div className="flex-1 flex flex-col min-h-0 border-t border-white/10">
                            <ChatBox />
                        </div>
                    </div>

                    {/* Center: Game Board */}
                    <div className="flex-1 bg-[#0f0f0f] relative flex flex-col">
                        <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                            {/* Board Container */}
                            <div className="relative aspect-[16/11] w-full max-w-6xl bg-[#2d5a27] rounded-lg shadow-2xl border-[16px] border-[#3e2723] overflow-hidden"
                                style={{
                                    boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)', // Vignette interne
                                    backgroundImage: 'radial-gradient(#35682d 1px, transparent 1px)', // Texture subtile
                                    backgroundSize: '4px 4px'
                                }}
                            >
                                {/* Grille des points */}
                                <div className="absolute inset-0 grid grid-cols-2 gap-12 p-8">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex-1 grid grid-cols-6 gap-0">{topPoints.slice(0, 6)}</div>
                                        <div className="flex-1 grid grid-cols-6 gap-0">{bottomPoints.slice(0, 6)}</div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex-1 grid grid-cols-6 gap-0">{topPoints.slice(6, 12)}</div>
                                        <div className="flex-1 grid grid-cols-6 gap-0">{bottomPoints.slice(6, 12)}</div>
                                    </div>
                                </div>

                                {/* Barre centrale (Bar) */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 bg-[#2d1b15] h-full shadow-2xl flex flex-col items-center justify-center gap-2 z-10 border-x border-[#1a0f0b]">
                                    <div className="flex flex-col gap-1 py-4">
                                        {Array.from({ length: board.bar?.player2 || 0 }).map((_, i) => (
                                            <div key={`bar-p2-${i}`} className="w-10 h-10"><Checker player={2} /></div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col gap-1 py-4">
                                        {Array.from({ length: board.bar?.player1 || 0 }).map((_, i) => (
                                            <div key={`bar-p1-${i}`} className="w-10 h-10"><Checker player={1} /></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dés */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-8 z-20 pointer-events-none">
                                    {dice.map((val, i) => (
                                        <Dice key={i} value={val} rolling={false} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Bar: Actions */}
                        <div className="h-20 bg-[#111] border-t border-white/10 flex items-center justify-between px-8 shrink-0 z-20">
                            <div className="flex items-center gap-4">
                                <DoublingCube value={cubeValue} />
                                <div className="text-xs text-gray-500 max-w-[150px]">
                                    Le cube double les enjeux de la partie.
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={undoMove}
                                    disabled={!canUndo || !isMyTurn}
                                    className="p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-colors"
                                    title="Annuler le dernier mouvement"
                                >
                                    <RotateCcw className="w-6 h-6 text-gray-400" />
                                </button>

                                <button
                                    onClick={handleAskCoach}
                                    disabled={isAnalyzing}
                                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all hover:scale-105 active:scale-95"
                                >
                                    <Lightbulb className="w-5 h-5" />
                                    {isAnalyzing ? 'Analyse...' : 'COACH'}
                                </button>

                                <button
                                    onClick={handleRollDice}
                                    disabled={!isMyTurn || dice.length > 0}
                                    className="px-8 py-3 bg-[#FFD700] hover:bg-[#FDB931] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-lg rounded-xl shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all hover:scale-105 active:scale-95"
                                >
                                    LANCER LES DÉS
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

export default GameRoom;

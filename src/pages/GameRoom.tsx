import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
    const location = useLocation();
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
    const [coachMode, setCoachMode] = useState<'text' | 'video'>('text');

    // Parse Game Options from URL
    const searchParams = new URLSearchParams(location.search);
    const mode = searchParams.get('mode') as 'money' | 'match' | null;
    const length = parseInt(searchParams.get('length') || '0');

    // Rejoindre la room au montage
    useEffect(() => {
        const options = mode ? { mode, matchLength: length } : undefined;

        if (roomId === 'offline-bot') {
            joinRoom('offline-bot', options);
        } else if (roomId && isConnected && !currentRoom) {
            joinRoom(roomId, options);
        }
    }, [roomId, isConnected, currentRoom, joinRoom, user, mode, length]);

    // Loading State Logs
    useEffect(() => {
        const addLog = useDebugStore.getState().addLog;
        if (!currentRoom || !gameState) {
        });
}
    }, [currentRoom, gameState, roomId]);

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
    const addLog = useDebugStore.getState().addLog;
    addLog('Tentative de lancer les dés', 'info', { isMyTurn, diceLength: dice.length });

    if (isMyTurn && dice.length === 0) {
        sendGameAction('rollDice', {});
    } else {
        addLog('Action refusée', 'error', { reason: !isMyTurn ? 'Pas votre tour' : 'Dés déjà lancés' });
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
        const analysis = await analyzeMove(gameState, gameState.dice, playerColor);
        setAiAnalysis(analysis);
        addLog('Analyse reçue !', 'success');
    } catch (e) {
        addLog('Erreur analyse', 'error', e);
    }
    setIsAnalyzing(false);
};

const onDragStart = (index: number) => {
    const addLog = useDebugStore.getState().addLog;
    if (!isMyTurn) {
        addLog('Drag refusé: Pas votre tour', 'warning');
        return;
    }
    addLog(`Drag Start: Point ${index}`, 'info');
    setSelectedPoint(index);
};

const onDrop = (toIndex: number) => {
    const addLog = useDebugStore.getState().addLog;
    addLog(`Drop Attempt: ${selectedPoint} -> ${toIndex}`, 'info', { selectedPoint, isMyTurn });

    if (selectedPoint !== null && isMyTurn) {
        sendGameAction('move', { from: selectedPoint, to: toIndex });
        setSelectedPoint(null);
    } else {
        addLog('Drop ignoré', 'warning', { reason: !isMyTurn ? 'Pas votre tour' : 'Aucun point sélectionné' });
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

                            {/* Mode Toggle */}
                            <div className="flex justify-center mb-6">
                                <div className="bg-black/40 p-1 rounded-full flex items-center border border-white/10">
                                    <button
                                        onClick={() => setCoachMode('text')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${coachMode === 'text'
                                            ? 'bg-[#FFD700] text-black shadow-lg'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        Texte
                                    </button>
                                    <button
                                        onClick={() => setCoachMode('video')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${coachMode === 'video'
                                            ? 'bg-[#FFD700] text-black shadow-lg'
                                            : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        Avatar Vidéo
                                    </button>
                                </div>
                            </div>

                            {isAnalyzing ? (
                                <div className="py-8 flex flex-col items-center gap-4">
                                    <div className="w-8 h-8 border-2 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
                                    <p className="text-gray-400 animate-pulse">Analyse de la position...</p>
                                </div>
                            ) : aiAnalysis ? (
                                coachMode === 'text' ? (
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
                                                <p className="text-xs text-gray-300 leading-relaxed">
                                                    {aiAnalysis.strategicAdvice.explanation}
                                                </p>
                                            </div>
                                        )}

                                        {/* Explication */}
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Analyse détaillée</div>
                                            <p className="text-sm text-gray-300 leading-relaxed">
                                                {aiAnalysis.explanation}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                        <div className="w-48 h-48 bg-black/50 rounded-full border-4 border-[#FFD700]/20 flex items-center justify-center overflow-hidden relative shadow-[0_0_30px_rgba(255,215,0,0.1)]">
                                            {/* Placeholder Avatar */}
                                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
                                            <UserIcon className="w-24 h-24 text-gray-600" />
                                            <div className="absolute bottom-4 z-20 px-4 text-center">
                                                <div className="text-[10px] text-[#FFD700] uppercase tracking-widest font-bold animate-pulse">
                                                    En train de parler...
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 w-full text-center">
                                            <p className="text-sm text-gray-300 italic">
                                                "{aiAnalysis.strategicAdvice?.speechScript || aiAnalysis.explanation.slice(0, 100) + '...'}"
                                            </p>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Impossible de charger l'analyse.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navbar du jeu */}
            <div className="h-16 bg-[#111] border-b border-white/10 flex items-center justify-between px-6 z-20 shadow-lg">
                <div className="flex items-center gap-4">
                    <button onClick={handleLeave} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-wide">{currentRoom.name}</h1>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            En ligne
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-white/5">
                        <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-400">Score</span>
                            <span className="text-sm font-bold text-[#FFD700]">{score.player1 || 0} - {score.player2 || 0}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleAskCoach}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-900/20 group"
                    >
                        <Lightbulb className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold">Coach AI</span>
                        <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded font-bold ml-1">BETA</span>
                    </button>
                </div>
            </div>

            {/* Zone de jeu principale */}
            <div className="flex-1 flex relative bg-[#1a1a1a]">
                {/* Plateau de jeu */}
                <div className="flex-1 relative flex items-center justify-center p-4 md:p-8">
                    {/* Cadre du plateau */}
                    <div className="relative w-full max-w-[1000px] aspect-[4/3] bg-[#0a3d1d] rounded-xl shadow-2xl border-[16px] border-[#3d2b1f] flex overflow-hidden">

                        {/* Texture bois du cadre */}
                        <div className="absolute inset-0 border-[16px] border-[#3d2b1f] pointer-events-none z-10 rounded-xl shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"></div>

                        {/* Colonne Gauche (Points 12-7 et 13-18) */}
                        <div className="flex-1 flex flex-col border-r-4 border-[#2a1d15]/50 relative">
                            {/* Top Left (13-18) */}
                            <div className="flex-1 flex flex-row-reverse">
                                {topPoints.slice(0, 6)}
                            </div>
                            {/* Bottom Left (12-7) */}
                            <div className="flex-1 flex flex-row-reverse">
                                {bottomPoints.slice(6, 12)}
                            </div>
                        </div>

                        {/* Barre Centrale (Bar) */}
                        <div className="w-16 bg-[#2a1d15] flex flex-col items-center justify-center border-x-2 border-[#1a120d] shadow-inner relative z-0">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30 mix-blend-overlay"></div>

                            {/* Pions capturés (Bar) */}
                            <div className="flex-1 flex flex-col justify-center gap-1 py-4">
                                {/* Player 1 Bar */}
                                {Array.from({ length: board.bar.player1 }).map((_, i) => (
                                    <div key={`bar-p1-${i}`} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-gray-400 shadow-lg" />
                                ))}
                                {/* Player 2 Bar */}
                                {Array.from({ length: board.bar.player2 }).map((_, i) => (
                                    <div key={`bar-p2-${i}`} className="w-10 h-10 rounded-full bg-red-700 border-2 border-red-900 shadow-lg" />
                                ))}
                            </div>
                        </div>

                        {/* Colonne Droite (Points 19-24 et 6-1) */}
                        <div className="flex-1 flex flex-col border-l-4 border-[#2a1d15]/50 relative">
                            {/* Top Right (19-24) */}
                            <div className="flex-1 flex flex-row-reverse">
                                {topPoints.slice(6, 12)}
                            </div>
                            {/* Bottom Right (6-1) */}
                            <div className="flex-1 flex flex-row-reverse">
                                {bottomPoints.slice(0, 6)}
                            </div>
                        </div>

                        {/* Zone centrale (Dés et Cube) */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                            <div className="flex gap-8 pointer-events-auto">
                                <Dice dice={dice} onRoll={handleRollDice} canRoll={isMyTurn && dice.length === 0} />
                                <DoublingCube value={cubeValue} canDouble={isMyTurn && gameState.canDouble} onDouble={() => sendGameAction('double', {})} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Droite (Chat & Infos) */}
                <div className="w-80 bg-[#111] border-l border-white/10 flex flex-col">
                    <div className="p-4 border-b border-white/10">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Joueurs</h3>
                        <div className="space-y-3">
                            <div className={`flex items-center gap-3 p-3 rounded-lg ${turn === players[0]?.id ? 'bg-white/10 border border-[#FFD700]/30' : 'bg-black/20'}`}>
                                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-white">{players[0]?.username || 'Joueur 1'}</div>
                                    <div className="text-xs text-gray-500">Blanc</div>
                                </div>
                                {turn === players[0]?.id && <Clock className="w-4 h-4 text-[#FFD700] animate-pulse" />}
                            </div>
                            <div className={`flex items-center gap-3 p-3 rounded-lg ${turn === players[1]?.id ? 'bg-white/10 border border-[#FFD700]/30' : 'bg-black/20'}`}>
                                <div className="w-2 h-2 rounded-full bg-red-600"></div>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-white">{players[1]?.username || 'Joueur 2'}</div>
                                    <div className="text-xs text-gray-500">Rouge</div>
                                </div>
                                {turn === players[1]?.id && <Clock className="w-4 h-4 text-[#FFD700] animate-pulse" />}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <ChatBox />
                    </div>
                </div>
            </div>
        </div>
    </DndProvider>
);
};

export default GameRoom;

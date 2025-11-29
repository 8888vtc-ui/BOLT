import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { motion } from 'framer-motion';
import { ArrowLeft, WifiOff, Clock, User as UserIcon, LogOut, Flag, RotateCcw } from 'lucide-react';

import { useGameSocket } from '../hooks/useGameSocket';
import { useGameStore } from '../stores/gameStore';
import { useAuth } from '../hooks/useAuth';

import Point from '../components/Point';
import Checker from '../components/Checker';
import Dice from '../components/Dice';
import DoublingCube from '../components/DoublingCube';
import ChatBox from '../components/game/ChatBox';

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

    // Rejoindre la room au montage
    useEffect(() => {
        if (roomId && isConnected && !currentRoom) {
            joinRoom(roomId);
        }
    }, [roomId, isConnected, currentRoom, joinRoom]);

    // Loading State
    if (!currentRoom || !gameState) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
                <div className="w-16 h-16 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin mb-6" />
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#B8860B]">
                    Chargement de la partie...
                </h2>
                <p className="text-gray-500 mt-2">Synchronisation avec le serveur</p>
            </div>
        );
    }

    // Offline State
    if (!isConnected) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
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
            <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans">
                {/* Header */}
                <header className="h-16 bg-[#111] border-b border-white/10 px-6 flex justify-between items-center shrink-0 z-20 relative shadow-lg">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLeave}
                            className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
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
                                                <div className="font-bold truncate text-white">{player.username}</div>
                                                <div className="text-xs text-gray-400 flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-green-500" /> En ligne
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center bg-black/30 rounded-lg p-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-gray-500 uppercase font-bold">Score</span>
                                                <span className="text-lg font-mono font-bold text-[#FFD700] leading-none">
                                                    {score[player.id] || 0}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Timer
                                                </span>
                                                <span className={`text-lg font-mono font-bold leading-none ${isCurrentTurn ? 'text-white' : 'text-gray-600'}`}>
                                                    05:00
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Game Controls */}
                        <div className="mt-auto p-6 border-t border-white/10 bg-[#0f0f0f]">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <div className="text-center mb-2 text-gray-500 text-[10px] uppercase tracking-wider font-bold">Videau (Doubling Cube)</div>
                                    <div className="flex justify-center">
                                        <DoublingCube
                                            value={cubeValue || 1}
                                            canDouble={isMyTurn && dice.length > 0}
                                            onDouble={() => sendGameAction('double', {})}
                                        />
                                    </div>
                                </div>

                                <button
                                    className="col-span-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-all text-sm font-bold"
                                    onClick={() => { if (window.confirm('Abandonner la partie ?')) sendGameAction('resign', {}); }}
                                >
                                    <Flag className="w-4 h-4" /> Abandonner
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Center Column: Game Board */}
                    <div className="flex-1 bg-[#0f0f0f] relative flex flex-col">
                        <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                            {/* Board Container */}
                            <div className="relative aspect-[16/10] w-full max-w-5xl bg-[#2d2d2d] rounded-xl shadow-2xl border-8 border-[#1a1a1a] overflow-hidden">
                                {/* Grille des points */}
                                <div className="absolute inset-0 grid grid-cols-2 gap-8 p-6">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex-1 grid grid-cols-6 gap-1">{topPoints.slice(0, 6)}</div>
                                        <div className="flex-1 grid grid-cols-6 gap-1">{bottomPoints.slice(0, 6)}</div>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex-1 grid grid-cols-6 gap-1">{topPoints.slice(6, 12)}</div>
                                        <div className="flex-1 grid grid-cols-6 gap-1">{bottomPoints.slice(6, 12)}</div>
                                    </div>
                                </div>

                                {/* Barre centrale (Bar) */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 bg-[#1a1a1a] h-full border-x-4 border-[#0f0f0f] flex flex-col items-center justify-center gap-4 z-10">
                                    <div className="flex flex-col gap-1">
                                        {Array.from({ length: board.bar?.player2 || 0 }).map((_, i) => (
                                            <div key={`bar-p2-${i}`} className="w-8 h-8"><Checker player={2} /></div>
                                        ))}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {Array.from({ length: board.bar?.player1 || 0 }).map((_, i) => (
                                            <div key={`bar-p1-${i}`} className="w-8 h-8"><Checker player={1} /></div>
                                        ))}
                                    </div>
                                </div>

                                {/* Dés */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4 z-20 pointer-events-none">
                                    {dice.map((val, i) => (
                                        <Dice key={i} value={val} rolling={false} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Bar (Bottom) */}
                        <div className="h-24 bg-[#111] border-t border-white/10 flex items-center justify-center px-8 shrink-0 gap-4">
                            {/* Undo Button */}
                            {canUndo && (
                                <button
                                    onClick={undoMove}
                                    className="px-6 py-4 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <RotateCcw className="w-5 h-5" />
                                    ANNULER
                                </button>
                            )}

                            <button
                                onClick={handleRollDice}
                                disabled={!isMyTurn || dice.length > 0}
                                className={`px-12 py-4 rounded-xl font-black text-xl tracking-wide transition-all transform ${isMyTurn && dice.length === 0
                                        ? 'bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-black hover:scale-105 shadow-[0_0_30px_rgba(255,215,0,0.3)]'
                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                                    }`}
                            >
                                {dice.length > 0 ? 'AU JEU !' : 'LANCER LES DÉS'}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Chat */}
                    <div className="w-80 bg-[#0a0a0a] border-l border-white/10 flex flex-col shrink-0 z-10">
                        <ChatBox />
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

export default GameRoom;

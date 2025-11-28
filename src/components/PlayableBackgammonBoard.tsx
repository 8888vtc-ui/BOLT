import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { motion, AnimatePresence } from 'framer-motion';
import Point from './Point';
import Checker from './Checker';
import Dice from './Dice';
import DoublingCube from './DoublingCube';
import {
  BoardState,
  PlayerColor,
  INITIAL_BOARD,
  rollDice,
  getValidMoves,
  makeMove,
  hasWon,
} from '../lib/gameLogic';

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const backend = isTouchDevice ? TouchBackend : HTML5Backend;

export default function PlayableBackgammonBoard() {
  const [board, setBoard] = useState<BoardState>(INITIAL_BOARD);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerColor>(1);
  const [dice, setDice] = useState<number[]>([]);
  const [availableMoves, setAvailableMoves] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [validDestinations, setValidDestinations] = useState<Map<number, number[]>>(new Map());
  const [doubleValue, setDoubleValue] = useState(1);
  const [canDouble, setCanDouble] = useState(true);
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (dice.length > 0 && availableMoves.length === 0) {
      const moves = getValidMoves(board, currentPlayer, dice);
      setValidDestinations(moves);

      if (moves.size === 0) {
        setTimeout(() => {
          endTurn();
        }, 1500);
      }
    }
  }, [dice, availableMoves, board, currentPlayer]);

  const handleRollDice = () => {
    if (dice.length > 0) return;

    setRolling(true);
    setGameStarted(true);

    setTimeout(() => {
      const newDice = rollDice();
      setDice(newDice);
      setAvailableMoves([...newDice]);
      setRolling(false);
    }, 800);
  };

  const handleDragStart = (from: number) => {
    setSelectedPoint(from);
  };

  const handleDrop = (to: number) => {
    if (selectedPoint === null) return;

    const destinations = validDestinations.get(selectedPoint);
    if (!destinations || !destinations.includes(to)) return;

    const from = selectedPoint;
    const distance = Math.abs(to - from);

    const newBoard = makeMove(board, currentPlayer, from, to);
    setBoard(newBoard);

    const moveIndex = availableMoves.indexOf(distance);
    if (moveIndex !== -1) {
      const newAvailableMoves = [...availableMoves];
      newAvailableMoves.splice(moveIndex, 1);
      setAvailableMoves(newAvailableMoves);

      if (newAvailableMoves.length === 0) {
        setTimeout(() => {
          endTurn();
        }, 500);
      } else {
        const newValidMoves = getValidMoves(newBoard, currentPlayer, newAvailableMoves);
        setValidDestinations(newValidMoves);
      }
    }

    setSelectedPoint(null);

    if (hasWon(newBoard, currentPlayer)) {
      setWinner(currentPlayer);
      const points = doubleValue;
      if (currentPlayer === 1) {
        setScore({ ...score, player1: score.player1 + points });
      } else {
        setScore({ ...score, player2: score.player2 + points });
      }
    }
  };

  const endTurn = () => {
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    setDice([]);
    setAvailableMoves([]);
    setValidDestinations(new Map());
    setSelectedPoint(null);
    setCanDouble(true);
  };

  const handleDouble = () => {
    if (!canDouble) return;
    setDoubleValue(doubleValue * 2);
    setCanDouble(false);
  };

  const handleResign = () => {
    const points = doubleValue;
    if (currentPlayer === 1) {
      setScore({ ...score, player2: score.player2 + points });
      setWinner(2);
    } else {
      setScore({ ...score, player1: score.player1 + points });
      setWinner(1);
    }
  };

  const handleNewGame = () => {
    setBoard(INITIAL_BOARD);
    setCurrentPlayer(1);
    setDice([]);
    setAvailableMoves([]);
    setValidDestinations(new Map());
    setDoubleValue(1);
    setCanDouble(true);
    setWinner(null);
    setGameStarted(false);
  };

  const topPoints = [];
  for (let i = 12; i < 24; i++) {
    topPoints.push(
      <Point
        key={i}
        index={i}
        point={board.points[i]}
        isTop={true}
        isValidDestination={selectedPoint !== null && validDestinations.get(selectedPoint)?.includes(i)}
        onDrop={handleDrop}
        onDragStart={handleDragStart}
        currentPlayer={currentPlayer}
        canMove={dice.length > 0 && !winner}
      />
    );
  }

  const bottomPoints = [];
  for (let i = 11; i >= 0; i--) {
    bottomPoints.push(
      <Point
        key={i}
        index={i}
        point={board.points[i]}
        isTop={false}
        isValidDestination={selectedPoint !== null && validDestinations.get(selectedPoint)?.includes(i)}
        onDrop={handleDrop}
        onDragStart={handleDragStart}
        currentPlayer={currentPlayer}
        canMove={dice.length > 0 && !winner}
      />
    );
  }

  return (
    <DndProvider backend={backend}>
      <svg width="0" height="0">
        <defs>
          <pattern id="woodGrain" patternUnits="userSpaceOnUse" width="100" height="100">
            <rect width="100" height="100" fill="#1a1a1a" />
            <path d="M0,50 Q25,45 50,50 T100,50" stroke="#2d2d2d" strokeWidth="1" fill="none" />
            <path d="M0,25 Q25,20 50,25 T100,25" stroke="#2d2d2d" strokeWidth="0.5" fill="none" />
            <path d="M0,75 Q25,70 50,75 T100,75" stroke="#2d2d2d" strokeWidth="0.5" fill="none" />
          </pattern>
        </defs>
      </svg>

      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-2 md:p-4">
        <div className="w-full max-w-7xl">
          <div className="bg-[#1a1a1a] rounded-2xl shadow-2xl p-4 md:p-8 border-4 border-[#2d2d2d]">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-center">
              <div className="flex flex-col gap-4 order-2 lg:order-1">
                <div className="flex flex-col gap-2 items-center bg-[#0f0f0f] p-4 rounded-xl">
                  <div className="text-xs text-gray-500 uppercase">Player 2</div>
                  <div className="w-8 h-8 rounded-full bg-[#8B0000] border-2 border-white shadow-lg" />
                  <div className="text-2xl font-bold text-white">{score.player2}</div>
                </div>

                <DoublingCube
                  value={doubleValue}
                  canDouble={canDouble && dice.length > 0 && !winner}
                  onDouble={handleDouble}
                />

                <div className="flex flex-col gap-2 items-center bg-[#0f0f0f] p-4 rounded-xl">
                  <div className="text-xs text-gray-500 uppercase">Player 1</div>
                  <div className="w-8 h-8 rounded-full bg-[#D2B48C] border-2 border-white shadow-lg" />
                  <div className="text-2xl font-bold text-white">{score.player1}</div>
                </div>
              </div>

              <div className="flex-1 order-1 lg:order-2 w-full">
                <div className="relative aspect-[16/10] bg-[#2d2d2d] rounded-xl shadow-inner border-8 border-[#1a1a1a] overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-2 gap-4 p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex-1 grid grid-cols-6 gap-1">{topPoints.slice(6, 12)}</div>
                      <div className="flex-1 grid grid-cols-6 gap-1">{bottomPoints.slice(6, 12)}</div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex-1 grid grid-cols-6 gap-1">{topPoints.slice(0, 6)}</div>
                      <div className="flex-1 grid grid-cols-6 gap-1">{bottomPoints.slice(0, 6)}</div>
                    </div>
                  </div>

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 md:w-20 bg-[#1a1a1a] h-full border-x-4 border-[#0f0f0f] flex flex-col items-center justify-center gap-4">
                    <div className="flex flex-col gap-2">
                      {Array.from({ length: board.bar.player2 }).map((_, i) => (
                        <div key={i} className="w-8 h-8 md:w-10 md:h-10 relative">
                          <Checker player={2} />
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2">
                      {Array.from({ length: board.bar.player1 }).map((_, i) => (
                        <div key={i} className="w-8 h-8 md:w-10 md:h-10 relative">
                          <Checker player={1} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 flex gap-2">
                    {dice.map((die, i) => (
                      <Dice key={i} value={die} rolling={rolling} />
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <motion.button
                    className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg ${
                      dice.length === 0 && !winner
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600'
                        : 'bg-gray-700 cursor-not-allowed opacity-50'
                    }`}
                    onClick={handleRollDice}
                    disabled={dice.length > 0 || winner !== null}
                    whileHover={dice.length === 0 && !winner ? { scale: 1.05 } : {}}
                    whileTap={dice.length === 0 && !winner ? { scale: 0.95 } : {}}
                  >
                    {gameStarted ? 'Roll Dice' : 'Start Game'}
                  </motion.button>

                  {gameStarted && !winner && (
                    <motion.button
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-white shadow-lg"
                      onClick={handleResign}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Resign
                    </motion.button>
                  )}

                  {winner && (
                    <motion.button
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-white shadow-lg"
                      onClick={handleNewGame}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      New Game
                    </motion.button>
                  )}
                </div>

                <div className="mt-4 text-center">
                  <div className="text-gray-400 text-sm">
                    {winner ? (
                      <span className="text-2xl font-bold text-green-500">
                        Player {winner} wins! 🎉
                      </span>
                    ) : dice.length === 0 ? (
                      <span>
                        <span className={currentPlayer === 1 ? 'text-[#D2B48C]' : 'text-[#8B0000]'}>
                          Player {currentPlayer}
                        </span>{' '}
                        - Click "Roll Dice" to play
                      </span>
                    ) : (
                      <span>
                        <span className={currentPlayer === 1 ? 'text-[#D2B48C]' : 'text-[#8B0000]'}>
                          Player {currentPlayer}
                        </span>{' '}
                        - Drag checkers to move ({availableMoves.length} moves left)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {winner && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#1a1a1a] rounded-2xl p-8 max-w-md w-full border-4 border-[#FFD700] shadow-2xl"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-4xl font-black text-[#FFD700] mb-4">Victory!</h2>
                <p className="text-2xl text-white mb-6">
                  Player {winner} wins {doubleValue} point{doubleValue > 1 ? 's' : ''}!
                </p>
                <div className="flex gap-4 justify-center">
                  <motion.button
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-white shadow-lg"
                    onClick={handleNewGame}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Play Again
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DndProvider>
  );
}

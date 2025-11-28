import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { motion } from 'framer-motion';
import { Award, Dices, Flag } from 'lucide-react';
import { useGurugammonGame } from '../hooks/useGurugammonGame';
import { gurugammonApi } from '../lib/gurugammonApi';
import CoachModal, { AnalysisData } from '../components/CoachModal';
import Point from '../components/Point';
import Checker from '../components/Checker';
import Dice from '../components/Dice';
import DoublingCube from '../components/DoublingCube';
import { BoardState, PlayerColor } from '../lib/gameLogic';

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const backend = isTouchDevice ? TouchBackend : HTML5Backend;

function convertGuruBoard(guruBoard: any): BoardState {
  const points = guruBoard.positions.map((count: number) => {
    if (count === 0) return { player: null, count: 0 };
    if (count > 0) return { player: 1 as PlayerColor, count };
    return { player: 2 as PlayerColor, count: Math.abs(count) };
  });

  return {
    points,
    bar: {
      player1: guruBoard.whiteBar,
      player2: guruBoard.blackBar,
    },
    off: {
      player1: guruBoard.whiteOff,
      player2: guruBoard.blackOff,
    },
  };
}

export default function GurugammonGame() {
  const { gameId } = useParams<{ gameId: string }>();
  const { gameState, loading, error, rolling, rollDice, makeMove, resign } = useGurugammonGame(gameId!);

  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [quotaRemaining, setQuotaRemaining] = useState(5);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);

  const handleDragStart = (from: number) => {
    setSelectedPoint(from);
  };

  const handleDrop = async (to: number) => {
    if (selectedPoint === null) return;
    await makeMove(selectedPoint, to);
    setSelectedPoint(null);
  };

  const handleAnalyze = async () => {
    setIsCoachModalOpen(true);

    if (quotaRemaining <= 0 || analyzing) return;

    setAnalyzing(true);
    setAnalysisData(null);

    try {
      const evalRes = await gurugammonApi.evaluatePosition(gameId!);
      const coachRes = await gurugammonApi.getCoachAdvice(gameId!);

      const mockAnalysis: AnalysisData = {
        equityLoss: Math.random() * 0.3,
        bestMove: '24/18 13/7',
        explanation: coachRes.data?.advice || 'GNUBg suggests this move to improve your position.',
        isBlunder: Math.random() > 0.8,
        pr: evalRes.data?.pr || 0,
        winrate: evalRes.data?.winrate || 0.5,
      };

      setAnalysisData(mockAnalysis);
      setQuotaRemaining((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-[#FFD700] text-xl">Loading game...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!gameState) return null;

  const board = convertGuruBoard(gameState.board);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isPlayer1 = gameState.player1.id === currentUser.id;
  const isPlayer2 = gameState.player2?.id === currentUser.id;
  const currentPlayer = gameState.currentPlayer === 'white' ? 1 : 2;
  const isMyTurn = (isPlayer1 && currentPlayer === 1) || (isPlayer2 && currentPlayer === 2);

  const topPoints = [];
  for (let i = 12; i < 24; i++) {
    topPoints.push(
      <Point
        key={i}
        index={i}
        point={board.points[i]}
        isTop={true}
        isValidDestination={false}
        onDrop={handleDrop}
        onDragStart={handleDragStart}
        currentPlayer={currentPlayer as PlayerColor}
        canMove={isMyTurn && gameState.dice.dice.length > 0}
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
        isValidDestination={false}
        onDrop={handleDrop}
        onDragStart={handleDragStart}
        currentPlayer={currentPlayer as PlayerColor}
        canMove={isMyTurn && gameState.dice.dice.length > 0}
      />
    );
  }

  return (
    <DndProvider backend={backend}>
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
        <div className="bg-[#1a1a1a] border-b-2 border-[#FFD700]/20 p-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D2B48C] border-2 border-white shadow-lg" />
              <div>
                <div className="font-bold text-white">{gameState.player1.name}</div>
                <div className="text-sm text-gray-400">Score: {gameState.whiteScore}</div>
              </div>
            </div>

            <div className="text-2xl font-black text-[#FFD700]">VS</div>

            <div className="flex items-center gap-3">
              <div>
                <div className="font-bold text-white text-right">
                  {gameState.player2?.name || 'Waiting...'}
                </div>
                <div className="text-sm text-gray-400 text-right">Score: {gameState.blackScore}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#8B0000] border-2 border-white shadow-lg" />
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              className="bg-[#FFD700] hover:bg-[#FFC700] text-black px-6 py-2 rounded-full font-bold flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyze}
            >
              <Award className="w-5 h-5" />
              Analyze
            </motion.button>

            {isMyTurn && gameState.dice.dice.length === 0 && (
              <motion.button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={rollDice}
                disabled={rolling}
              >
                <Dices className={rolling ? 'animate-spin' : ''} />
                {rolling ? 'Rolling...' : 'Roll Dice'}
              </motion.button>
            )}

            <motion.button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => resign('SINGLE')}
            >
              <Flag className="w-5 h-5" />
              Resign
            </motion.button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative aspect-[16/10] max-w-6xl w-full bg-[#2d2d2d] rounded-xl shadow-2xl border-8 border-[#1a1a1a] overflow-hidden">
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

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 bg-[#1a1a1a] h-full border-x-4 border-[#0f0f0f] flex flex-col items-center justify-center gap-4">
              {Array.from({ length: board.bar.player2 }).map((_, i) => (
                <div key={i} className="w-10 h-10 relative">
                  <Checker player={2} />
                </div>
              ))}
              {Array.from({ length: board.bar.player1 }).map((_, i) => (
                <div key={i} className="w-10 h-10 relative">
                  <Checker player={1} />
                </div>
              ))}
            </div>

            <div className="absolute top-4 right-4 flex gap-2">
              {gameState.dice.dice.map((die, i) => (
                <Dice key={i} value={die} rolling={rolling} />
              ))}
            </div>

            <div className="absolute bottom-4 left-4">
              <DoublingCube
                value={gameState.cube.level}
                owner={gameState.cube.owner === 'white' ? 1 : gameState.cube.owner === 'black' ? 2 : null}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border-t-2 border-[#FFD700]/20 p-4 text-center">
          <div className="text-gray-400">
            {isMyTurn ? (
              <span className="text-[#FFD700] font-bold">Your turn</span>
            ) : (
              <span>Waiting for opponent...</span>
            )}
          </div>
        </div>
      </div>

      <CoachModal
        isOpen={isCoachModalOpen}
        onClose={() => setIsCoachModalOpen(false)}
        analysis={analysisData}
        isLoading={analyzing}
        onPlayAudio={() => console.log('Play audio')}
        onPlayVideo={() => console.log('Play video')}
        quotaRemaining={quotaRemaining}
        onUpgrade={() => alert('Upgrade to premium')}
      />
    </DndProvider>
  );
}

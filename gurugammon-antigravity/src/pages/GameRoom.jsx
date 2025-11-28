import { useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameSocket } from '../hooks/useGameSocket';
import { GameContext } from '../context/GameContext';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import Board from '../components/game/Board';
import Dice from '../components/game/Dice';
import DoublingCube from '../components/game/DoublingCube';

export default function GameRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { gameState } = useContext(GameContext);
  const { rollDice, makeMove, offerDouble, acceptDouble, declineDouble } = useGameSocket(roomId);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-primary-400 text-xl mb-4">Loading game...</div>
          <Button onClick={() => navigate('/lobby')} variant="secondary">
            Back to Lobby
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <Button
            onClick={() => navigate('/lobby')}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Leave Game
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gradient">
              {gameState.roomName || `Game ${roomId}`}
            </h1>
            <p className="text-gray-400 mt-1">
              {gameState.currentPlayer === 'player1' ? 'Your turn' : 'Opponent\'s turn'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <DoublingCube
              value={gameState.doublingCubeValue || 1}
              onOffer={offerDouble}
              onAccept={acceptDouble}
              onDecline={declineDouble}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Board
              gameState={gameState}
              onMove={makeMove}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
              <h3 className="text-xl font-semibold mb-4">Dice</h3>
              <Dice
                dice={gameState.dice || []}
                onRoll={rollDice}
                canRoll={gameState.canRoll || false}
              />
            </div>

            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
              <h3 className="text-xl font-semibold mb-4">Players</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">You</span>
                  <span className="text-primary-400 font-semibold">
                    {gameState.player1Score || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Opponent</span>
                  <span className="text-red-400 font-semibold">
                    {gameState.player2Score || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
              <h3 className="text-xl font-semibold mb-4">Game Info</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Match to: {gameState.matchLength || 1}</p>
                <p>Stakes: {gameState.stakes || 1}</p>
                <p>Timer: {gameState.timeRemaining || '--:--'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

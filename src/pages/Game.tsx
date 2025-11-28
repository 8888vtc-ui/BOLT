import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Flag, Crown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useGame } from '../hooks/useGame'
import BackgammonBoard from '../components/BackgammonBoard'

export default function Game() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { game, loading, error, rollDice, makeMove, resignGame } = useGame(gameId || null)
  const [canRoll, setCanRoll] = useState(true)

  useEffect(() => {
    if (game && game.dice && game.dice.length > 0) {
      setCanRoll(false)
    } else {
      setCanRoll(true)
    }
  }, [game])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading game...</div>
      </div>
    )
  }

  if (error || !game || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error || 'Game not found'}</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-[#FFD700] text-black font-bold rounded-xl"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const playerNumber = game.player1_id === user.id ? 1 : 2

  const handleRollDice = async () => {
    try {
      await rollDice()
      setCanRoll(false)
    } catch (err) {
      console.error('Failed to roll dice:', err)
    }
  }

  const handleMove = async (from: number, to: number) => {
    try {
      await makeMove(from, to)
      setCanRoll(true)
    } catch (err) {
      console.error('Failed to make move:', err)
    }
  }

  const handleResign = async () => {
    if (window.confirm('Are you sure you want to resign?')) {
      try {
        await resignGame()
        navigate('/dashboard')
      } catch (err) {
        console.error('Failed to resign:', err)
      }
    }
  }

  const isGameFinished = game.status === 'finished'

  return (
    <div className="min-h-screen bg-black backgammon-pattern">
      <nav className="border-b border-gray-900 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-[#FFD700] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-4">
              {!isGameFinished && (
                <button
                  onClick={handleResign}
                  className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                >
                  <Flag className="w-4 h-4" />
                  Resign
                </button>
              )}

              <div className="text-[#FFD700] font-bold">
                Score: {game.score.player1} - {game.score.player2}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isGameFinished && (
          <div className="mb-6 p-6 bg-gradient-to-r from-[#FFD700]/20 to-[#FFC700]/20 border-2 border-[#FFD700] rounded-2xl text-center">
            <Crown className="w-16 h-16 text-[#FFD700] mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
            <p className="text-xl text-gray-300">
              {game.winner_id === user.id ? 'You won!' : 'You lost'}
            </p>
            <p className="text-gray-400 mt-2">Win type: {game.win_type}</p>
          </div>
        )}

        <BackgammonBoard
          boardState={game.board_state}
          currentPlayer={game.current_turn}
          dice={game.dice || []}
          onMove={handleMove}
          onRollDice={handleRollDice}
          canRoll={canRoll && !isGameFinished}
          playerNumber={playerNumber}
        />

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-2">Player 1 (White)</h3>
            <div className="text-gray-400">
              <div>Checkers off: {game.board_state.off.player1}</div>
              <div>Checkers on bar: {game.board_state.bar.player1}</div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl">
            <h3 className="text-lg font-bold text-white mb-2">Player 2 (Black)</h3>
            <div className="text-gray-400">
              <div>Checkers off: {game.board_state.off.player2}</div>
              <div>Checkers on bar: {game.board_state.bar.player2}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-6 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl">
          <h3 className="text-xl font-bold text-[#FFD700] mb-3">Game Rules</h3>
          <ul className="text-gray-400 space-y-2 text-sm">
            <li>Click on your checker to select it, then click on a valid destination point</li>
            <li>Roll the dice at the start of your turn</li>
            <li>You must use both dice if possible</li>
            <li>Move your checkers according to the dice values</li>
            <li>You cannot move to a point occupied by 2 or more opponent checkers</li>
            <li>Get all 15 checkers off the board to win</li>
            <li>Cube value: {game.cube_value}x | Crawford: {game.crawford ? 'Yes' : 'No'}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

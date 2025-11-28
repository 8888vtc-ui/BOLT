import { useState } from 'react'
import { Dices } from 'lucide-react'

interface Point {
  player: number | null
  count: number
}

interface BoardState {
  points: (Point | null)[]
  bar: { player1: number; player2: number }
  off: { player1: number; player2: number }
}

interface BackgammonBoardProps {
  boardState: BoardState
  currentPlayer: number
  dice: number[]
  onMove?: (from: number, to: number) => void
  onRollDice?: () => void
  canRoll: boolean
  playerNumber: number
}

export default function BackgammonBoard({
  boardState,
  currentPlayer,
  dice,
  onMove,
  onRollDice,
  canRoll,
  playerNumber
}: BackgammonBoardProps) {
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null)
  const [possibleMoves, setPossibleMoves] = useState<number[]>([])

  const isMyTurn = currentPlayer === playerNumber

  const getPointColor = (point: Point | null) => {
    if (!point) return 'transparent'
    return point.player === 1 ? '#FFF' : '#1a1a1a'
  }

  const getPointBorderColor = (point: Point | null) => {
    if (!point) return 'transparent'
    return point.player === 1 ? '#FFD700' : '#FFD700'
  }

  const handlePointClick = (pointIndex: number) => {
    if (!isMyTurn || !onMove) return

    if (selectedPoint === null) {
      const point = boardState.points[pointIndex]
      if (point && point.player === playerNumber) {
        setSelectedPoint(pointIndex)
        const moves = calculatePossibleMoves(pointIndex)
        setPossibleMoves(moves)
      }
    } else {
      if (possibleMoves.includes(pointIndex)) {
        onMove(selectedPoint, pointIndex)
        setSelectedPoint(null)
        setPossibleMoves([])
      } else {
        setSelectedPoint(null)
        setPossibleMoves([])
      }
    }
  }

  const calculatePossibleMoves = (fromPoint: number): number[] => {
    if (dice.length === 0) return []

    const moves: number[] = []
    const direction = playerNumber === 1 ? 1 : -1

    dice.forEach(die => {
      const targetPoint = fromPoint + (die * direction)
      if (targetPoint >= 0 && targetPoint < 24) {
        const target = boardState.points[targetPoint]
        if (!target || target.player === playerNumber || target.count === 1) {
          moves.push(targetPoint)
        }
      }
    })

    return [...new Set(moves)]
  }

  const renderPoint = (index: number, isTop: boolean) => {
    const point = boardState.points[index]
    const isSelected = selectedPoint === index
    const isPossibleMove = possibleMoves.includes(index)

    const checkerCount = point?.count || 0
    const maxVisible = 5

    return (
      <div
        key={index}
        onClick={() => handlePointClick(index)}
        className={`relative flex flex-col ${isTop ? 'items-center justify-start' : 'items-center justify-end'} cursor-pointer transition-all ${
          isSelected ? 'ring-4 ring-[#FFD700]' : ''
        } ${isPossibleMove ? 'bg-[#FFD700]/20' : ''}`}
        style={{ width: '50px', height: '200px' }}
      >
        <div
          className={`w-full ${isTop ? 'rounded-t-full' : 'rounded-b-full'}`}
          style={{
            height: '100px',
            background: index % 2 === 0 ? '#8B4513' : '#DEB887'
          }}
        />

        <div className={`absolute ${isTop ? 'top-2' : 'bottom-2'} flex flex-col ${isTop ? 'items-center' : 'items-center flex-col-reverse'} gap-0.5`}>
          {Array.from({ length: Math.min(checkerCount, maxVisible) }).map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-full border-2 shadow-lg transition-transform hover:scale-110"
              style={{
                backgroundColor: getPointColor(point),
                borderColor: getPointBorderColor(point)
              }}
            />
          ))}
          {checkerCount > maxVisible && (
            <div
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm"
              style={{
                backgroundColor: getPointColor(point),
                borderColor: getPointBorderColor(point),
                color: point?.player === 1 ? '#000' : '#FFD700'
              }}
            >
              +{checkerCount - maxVisible}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 text-xs text-gray-500 font-mono">
          {index + 1}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-8 bg-gradient-to-br from-gray-900 to-black rounded-3xl border-4 border-[#FFD700] shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold text-white">
          Player {currentPlayer === 1 ? 'White' : 'Black'}
        </div>

        <div className="flex gap-4 items-center">
          {dice.length > 0 && (
            <div className="flex gap-2">
              {dice.map((die, i) => (
                <div
                  key={i}
                  className="w-16 h-16 bg-white rounded-lg shadow-xl flex items-center justify-center text-3xl font-bold text-black border-2 border-[#FFD700]"
                >
                  {die}
                </div>
              ))}
            </div>
          )}

          {canRoll && isMyTurn && (
            <button
              onClick={onRollDice}
              className="flex items-center gap-2 px-6 py-3 bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              <Dices className="w-5 h-5" />
              Roll Dice
            </button>
          )}
        </div>

        <div className="text-lg font-bold">
          <span className="text-gray-400">You: </span>
          <span className="text-[#FFD700]">Player {playerNumber === 1 ? 'White' : 'Black'}</span>
        </div>
      </div>

      <div className="relative bg-[#654321] rounded-2xl p-4" style={{ height: '500px' }}>
        <div className="absolute left-1/2 top-0 bottom-0 w-16 -translate-x-1/2 bg-gradient-to-b from-[#8B4513] to-[#654321] border-x-4 border-[#FFD700]">
          <div className="h-full flex flex-col justify-center items-center gap-2 text-white">
            <div className="text-xs font-bold">BAR</div>
            {boardState.bar.player1 > 0 && (
              <div className="text-sm bg-white text-black px-2 py-1 rounded">
                W: {boardState.bar.player1}
              </div>
            )}
            {boardState.bar.player2 > 0 && (
              <div className="text-sm bg-black text-white border border-[#FFD700] px-2 py-1 rounded">
                B: {boardState.bar.player2}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-16 h-full">
          <div className="flex flex-col gap-4">
            <div className="flex gap-1 justify-end">
              {Array.from({ length: 6 }).map((_, i) => renderPoint(12 + i, true))}
            </div>
            <div className="flex gap-1 justify-end">
              {Array.from({ length: 6 }).map((_, i) => renderPoint(11 - i, false))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-1">
              {Array.from({ length: 6 }).map((_, i) => renderPoint(18 + i, true))}
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 6 }).map((_, i) => renderPoint(5 - i, false))}
            </div>
          </div>
        </div>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-b from-gray-900 to-black rounded-xl p-4 border-2 border-[#FFD700]">
          <div className="text-white text-sm font-bold mb-2 text-center">OFF</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-white text-black px-3 py-2 rounded font-bold">
              <span>W:</span>
              <span>{boardState.off.player1}</span>
            </div>
            <div className="flex items-center gap-2 bg-black text-white border border-[#FFD700] px-3 py-2 rounded font-bold">
              <span>B:</span>
              <span>{boardState.off.player2}</span>
            </div>
          </div>
        </div>
      </div>

      {!isMyTurn && (
        <div className="mt-4 text-center text-gray-400 text-lg">
          Waiting for opponent...
        </div>
      )}
    </div>
  )
}

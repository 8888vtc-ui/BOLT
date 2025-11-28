import { useState } from 'react';
import Checker from './Checker';

export default function Board({ gameState, onMove }) {
  const [selectedPoint, setSelectedPoint] = useState(null);

  const handlePointClick = (pointIndex) => {
    if (selectedPoint === null) {
      if (gameState.board[pointIndex] && gameState.board[pointIndex].length > 0) {
        setSelectedPoint(pointIndex);
      }
    } else {
      onMove(selectedPoint, pointIndex);
      setSelectedPoint(null);
    }
  };

  const renderPoint = (pointIndex, isTop = false) => {
    const checkers = gameState.board?.[pointIndex] || [];
    const isSelected = selectedPoint === pointIndex;
    const isEven = pointIndex % 2 === 0;

    return (
      <div
        key={pointIndex}
        onClick={() => handlePointClick(pointIndex)}
        className={`
          relative flex flex-col items-center cursor-pointer p-2
          ${isTop ? 'justify-start' : 'justify-end'}
          ${isSelected ? 'ring-2 ring-primary-400' : ''}
          ${isEven ? 'bg-dark-700' : 'bg-dark-600'}
          hover:bg-primary-900 hover:bg-opacity-20 transition-colors
        `}
        style={{ minHeight: '200px' }}
      >
        <div className="absolute top-2 text-xs text-gray-500">{pointIndex + 1}</div>
        <div className={`flex flex-col gap-1 ${isTop ? 'flex-col' : 'flex-col-reverse'}`}>
          {checkers.slice(0, 5).map((checker, i) => (
            <Checker
              key={i}
              color={checker.color}
              size="md"
            />
          ))}
          {checkers.length > 5 && (
            <div className="text-xs text-gray-400 text-center font-bold">
              +{checkers.length - 5}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
      <div className="bg-dark-900 rounded-lg p-4">
        <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 12 }, (_, i) => renderPoint(i, true))}
        </div>

        <div className="h-20 bg-dark-800 my-2 rounded flex items-center justify-center">
          <div className="text-gray-500 text-sm">BAR</div>
        </div>

        <div className="grid grid-cols-12 gap-1">
          {Array.from({ length: 12 }, (_, i) => renderPoint(i + 12, false))}
        </div>
      </div>
    </div>
  );
}

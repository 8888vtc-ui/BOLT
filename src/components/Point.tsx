import { motion } from 'framer-motion';
import { useDrop } from 'react-dnd';
import Checker from './Checker';
import { Point as PointType, PlayerColor } from '../lib/gameLogic';

interface PointProps {
  index: number;
  point: PointType;
  isTop: boolean;
  isValidDestination?: boolean;
  onDrop?: (from: number) => void;
  onDragStart?: (from: number) => void;
  currentPlayer: PlayerColor;
  canMove: boolean;
}

export default function Point({
  index,
  point,
  isTop,
  isValidDestination,
  onDrop,
  onDragStart,
  currentPlayer,
  canMove,
}: PointProps) {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: 'CHECKER',
      canDrop: () => isValidDestination || false,
      drop: () => {
        onDrop?.(index);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [isValidDestination, index]
  );

  const isDark = Math.floor(index / 6) % 2 === (index % 2);
  const bgColor = isDark ? '#2d2d2d' : '#1a1a1a';

  const checkers = [];
  const maxVisible = 5;
  for (let i = 0; i < Math.min(point.count, maxVisible); i++) {
    checkers.push(
      <Checker
        key={i}
        player={point.player!}
        draggable={canMove && point.player === currentPlayer && i === point.count - 1}
        onDragStart={() => onDragStart?.(index)}
        index={i}
        stackHeight={point.count}
      />
    );
  }

  return (
    <motion.div
      ref={drop}
      className="relative flex flex-col items-center"
      style={{
        width: '100%',
        height: '100%',
      }}
      animate={{
        boxShadow: isValidDestination
          ? '0 0 30px rgba(34, 197, 94, 0.8), inset 0 0 20px rgba(34, 197, 94, 0.3)'
          : isOver && canDrop
          ? '0 0 30px rgba(34, 197, 94, 0.6)'
          : 'none',
      }}
    >
      <svg
        className="absolute"
        style={{
          width: '100%',
          height: '100%',
          transform: isTop ? 'none' : 'rotate(180deg)',
        }}
        viewBox="0 0 100 300"
        preserveAspectRatio="none"
      >
        <polygon points="0,0 50,280 100,0" fill={bgColor} stroke="#0f0f0f" strokeWidth="1" />
        {isDark && (
          <polygon
            points="0,0 50,280 100,0"
            fill="url(#woodGrain)"
            opacity="0.1"
            stroke="#0f0f0f"
            strokeWidth="1"
          />
        )}
      </svg>

      {isValidDestination && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.3), transparent 70%)',
          }}
        />
      )}

      <div
        className="relative z-10 flex flex-col gap-0 items-center justify-start"
        style={{
          width: '70%',
          height: '100%',
          paddingTop: isTop ? '8px' : '0',
          paddingBottom: isTop ? '0' : '8px',
          flexDirection: isTop ? 'column' : 'column-reverse',
        }}
      >
        {checkers}
      </div>

      <div className="absolute bottom-1 text-[10px] text-gray-600 font-mono">{index + 1}</div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { useDrag } from 'react-dnd';
import { PlayerColor } from '../lib/gameLogic';

interface CheckerProps {
  player: PlayerColor;
  draggable?: boolean;
  onDragStart?: () => void;
  index?: number;
  stackHeight?: number;
}

export default function Checker({ player, draggable, onDragStart, index = 0, stackHeight = 1 }: CheckerProps) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: 'CHECKER',
      canDrag: draggable,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      item: () => {
        onDragStart?.();
        return { player };
      },
    }),
    [draggable, player]
  );

  const color = player === 1 ? '#FFFFFF' : '#FF0000'; // Blanc pur vs Rouge vif
  const shadow = player === 1 ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 0, 0, 0.8)';

  return (
    <motion.div
      ref={draggable ? drag : null}
      className="absolute cursor-pointer select-none"
      style={{
        width: '100%',
        height: '100%',
        zIndex: index,
        opacity: isDragging ? 0.3 : 1,
        bottom: `${index * 85}%`,
      }}
      animate={{
        scale: draggable ? [1, 1.05, 1] : 1,
      }}
      transition={{
        scale: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      whileHover={draggable ? { scale: 1.1 } : {}}
    >
      <div
        className="relative w-full h-full rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}, ${color}dd)`,
          boxShadow: draggable
            ? `0 0 20px ${shadow}, 0 4px 8px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)`
            : `0 4px 8px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)`,
          border: `3px solid ${player === 1 ? '#E0E0E0' : '#CC0000'}`,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 40% 40%, rgba(255,255,255,0.4), transparent 50%)`,
          }}
        />

        {stackHeight > 5 && index === stackHeight - 1 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xs md:text-sm font-bold drop-shadow-lg">{stackHeight}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

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

  // COULEURS ULTRA FLASHY IMPOSSIBLES À MANQUER
  const color = player === 1 ? '#00FF00' : '#FF00FF'; // Vert fluo vs Magenta fluo
  const borderColor = player === 1 ? '#00DD00' : '#DD00DD';
  const glowColor = player === 1 ? 'rgba(0, 255, 0, 0.8)' : 'rgba(255, 0, 255, 0.8)';

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
          boxShadow: `
            0 0 30px ${glowColor},
            0 0 60px ${glowColor},
            0 8px 16px rgba(0,0,0,0.9),
            inset 0 4px 8px rgba(255,255,255,0.5)
          `,
          border: `5px solid ${borderColor}`,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 40% 40%, rgba(255,255,255,0.6), transparent 60%)`,
          }}
        />

        {stackHeight > 5 && index === stackHeight - 1 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-black text-lg md:text-xl font-black drop-shadow-[0_2px_4px_rgba(255,255,255,1)]">
              {stackHeight}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

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

  // Couleurs classiques et élégantes
  // Player 1: Ivoire (Blanc cassé)
  // Player 2: Rouge Profond
  const borderColor = player === 1 ? '#C0C0C0' : '#800000';

  // Dégradé subtil pour effet 3D
  const gradient = player === 1
    ? 'radial-gradient(circle at 30% 30%, #FFFFFF, #D0D0D0)'
    : 'radial-gradient(circle at 30% 30%, #FF4444, #8B0000)';

  return (
    <motion.div
      ref={draggable ? drag : null}
      className="absolute cursor-pointer select-none"
      style={{
        width: '100%',
        height: '100%',
        zIndex: index,
        opacity: isDragging ? 0.3 : 1,
        // Positionnement géré par le parent (Point.tsx) via Flexbox + Marges négatives
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
        className="relative w-full h-full rounded-full shadow-lg"
        style={{
          background: gradient,
          boxShadow: '0 4px 6px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
          border: `2px solid ${borderColor}`,
        }}
      >
        {/* Reflet subtil */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 40% 40%, rgba(255,255,255,0.4), transparent 60%)`,
          }}
        />

        {/* Compteur si pile > 5 */}
        {stackHeight > 5 && index === stackHeight - 1 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${player === 1 ? 'text-black' : 'text-white'}`}>
              {stackHeight}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

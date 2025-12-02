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
        zIndex: index + 100,  // ✅ Z-index élevé
        opacity: isDragging ? 0.3 : 1,
        visibility: 'visible',  // ✅ FORCER
        display: 'block',       // ✅ FORCER
        // backgroundColor: player === 1 ? 'white' : 'black',  // ✅ DEBUG: couleur visible
        // borderRadius: '50%',
        // border: '2px solid gold'  // ✅ DEBUG: bordure visible
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
        className="relative w-full h-full rounded-full shadow-md"
        style={{
          background: player === 1
            ? 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)' // Blanc cassé
            : 'linear-gradient(135deg, #212121 0%, #000000 100%)', // Noir profond
          boxShadow: '0 3px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)',
          border: player === 1 ? '1px solid #9e9e9e' : '1px solid #424242',
        }}
      >
        {/* Effet de texture (cercle interne) */}
        <div
          className="absolute inset-[15%] rounded-full border opacity-30"
          style={{
            borderColor: player === 1 ? '#000' : '#fff',
            borderWidth: '1px'
          }}
        />

        {/* Reflet supérieur */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, transparent 40%)'
          }}
        />

        {/* Compteur si pile > 5 */}
        {stackHeight > 5 && index === stackHeight - 1 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full backdrop-blur-[1px]">
            <span className="text-sm font-bold text-white drop-shadow-md">
              {stackHeight}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

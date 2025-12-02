import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import Checker from './Checker';
import { Point as PointType } from '../lib/gameLogic';

interface PointProps {
  index: number;
  point: PointType;
  isTop: boolean;
  isValidDestination: boolean;
  onDrop: (index: number) => void;
  onDragStart: (index: number) => void;
  currentPlayer: number;
  canMove: boolean;
  onClick?: () => void;
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
  onClick
}: PointProps) {
  // Protection contre point null/undefined
  if (!point) {
    point = { player: null, count: 0 };
  }
  
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: 'CHECKER',
      drop: () => onDrop(index),
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [index, onDrop]
  );

  const checkers = [];
  // Vérifier que point.count existe et est > 0
  const displayCount = point && point.count > 0 ? Math.min(point.count, 5) : 0;

  for (let i = 0; i < displayCount; i++) {
    const isLastVisible = i === displayCount - 1;
    const stackHeight = isLastVisible ? point.count : 1;

    // Seul le pion du haut est interactif (click ou drag)
    const isInteractive = canMove && point.player === currentPlayer && isLastVisible;

    checkers.push(
      <div
        key={i}
        className="relative w-[90%] aspect-square flex-shrink-0"
        style={{ marginBottom: '-15%' }}
        onClick={(e) => {
          if (isInteractive && onClick) {
            e.stopPropagation(); // Empêcher la propagation si nécessaire
            onClick();
          }
        }}
      >
        <Checker
          player={point.player || 1}
          draggable={isInteractive}
          onDragStart={() => onDragStart(index)}
          index={i}
          stackHeight={stackHeight}
        />
      </div>
    );
  }

  return (
    <motion.div
      ref={drop}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative h-full flex flex-col items-center justify-end group ${isTop ? 'flex-col' : 'flex-col-reverse'
        }`}
    >
      {/* Triangle du point */}
      <div
        className={`absolute inset-0 w-full h-full transition-all duration-300 ${isValidDestination || isOver ? 'opacity-80 bg-[#FFD700]/40' : 'opacity-100'
          }`}
        style={{
          clipPath: isTop
            ? 'polygon(50% 85%, 0 0, 100% 0)' // Pointes un peu moins longues pour laisser de la place aux pions
            : 'polygon(50% 15%, 0 100%, 100% 100%)',
          background: index % 2 === 0 ? '#5d4037' : '#d7ccc8', // Marron foncé et Beige
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)' // Légère ombre interne
        }}
      />

      {/* Conteneur des pions */}
      <div
        className="relative z-10 flex flex-col items-center w-full h-full py-2"
        style={{
          justifyContent: isTop ? 'flex-start' : 'flex-end',
        }}
      >
        {/* Pas de reverse() ici car flex-col-reverse gère déjà l'ordre visuel pour le bas */}
        {checkers}
      </div>

      {/* Numéro du point - Z-INDEX ÉLEVÉ pour être toujours visible */}
      <div
        className={`absolute ${isTop ? '-top-6' : '-bottom-6'} left-1/2 -translate-x-1/2 text-xs font-bold text-gray-500 z-20`}
      >
        {index + 1}
      </div>

      {/* Indicateur de destination valide */}
      {(isValidDestination || isOver) && (
        <div
          className={`absolute ${isTop ? 'bottom-4' : 'top-4'} w-3 h-3 rounded-full bg-[#FFD700] animate-pulse z-20`}
        />
      )}
    </motion.div>
  );
}

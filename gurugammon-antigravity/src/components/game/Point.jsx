import { motion } from 'framer-motion';
import Checker from './Checker';

export default function Point({ index, checkers, isTop, isSelected, onClick, onDragStart, onDragEnd }) {
  const isEven = index % 2 === 0;

  const maxVisible = 5;
  const visibleCheckers = checkers.slice(0, maxVisible);
  const hiddenCount = Math.max(0, checkers.length - maxVisible);

  return (
    <motion.div
      onClick={onClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDragEnd()}
      className="relative cursor-pointer group"
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className={`
          absolute inset-0 transition-all duration-200
          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
        `}
        animate={isSelected ? {
          boxShadow: [
            '0 0 0 0 rgba(251, 191, 36, 0.7)',
            '0 0 0 10px rgba(251, 191, 36, 0)',
          ],
        } : {}}
        transition={{ duration: 1, repeat: isSelected ? Infinity : 0 }}
      >
        <div className="absolute inset-0 bg-gold-400/30 rounded-lg" />
      </motion.div>

      <div className="relative h-full flex flex-col items-center justify-start">
        <svg
          viewBox="0 0 100 200"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`point-gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isEven ? '#d39a58' : '#84573a'} stopOpacity="0.9" />
              <stop offset="100%" stopColor={isEven ? '#c5844d' : '#6b4731'} stopOpacity="0.95" />
            </linearGradient>
            <filter id={`point-shadow-${index}`}>
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <polygon
            points={isTop ? "50,0 100,200 0,200" : "50,200 0,0 100,0"}
            fill={`url(#point-gradient-${index})`}
            filter={`url(#point-shadow-${index})`}
            stroke="rgba(251, 191, 36, 0.2)"
            strokeWidth="1"
          />

          <text
            x="50"
            y={isTop ? "190" : "15"}
            textAnchor="middle"
            fill="rgba(251, 191, 36, 0.4)"
            fontSize="12"
            fontWeight="bold"
          >
            {index + 1}
          </text>
        </svg>

        <div className={`
          absolute inset-0 flex flex-col items-center gap-0.5 p-1
          ${isTop ? 'justify-start pt-2' : 'justify-end pb-2'}
        `}>
          {visibleCheckers.map((checker, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              draggable
              onDragStart={() => onDragStart(i)}
            >
              <Checker
                color={checker.color}
                size="md"
                isDraggable={i === visibleCheckers.length - 1}
              />
            </motion.div>
          ))}

          {hiddenCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white text-xs font-bold bg-obsidian-900/80 rounded-full w-6 h-6 flex items-center justify-center border border-gold-400/50 shadow-lg"
            >
              +{hiddenCount}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

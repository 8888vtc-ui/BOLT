import { motion } from 'framer-motion';
import { ClockIcon, TrophyIcon } from '@heroicons/react/24/outline';

export default function PlayerInfo({ player, isActive, timeRemaining }) {
  const progress = timeRemaining ? (timeRemaining / 60) * 100 : 100;
  const isLowTime = timeRemaining && timeRemaining < 10;

  return (
    <motion.div
      animate={isActive ? {
        boxShadow: [
          '0 0 0 0 rgba(251, 191, 36, 0.7)',
          '0 0 0 10px rgba(251, 191, 36, 0)',
        ],
      } : {}}
      transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
      className={`
        glass p-4 rounded-xl border-2 transition-all duration-300
        ${isActive
          ? 'border-gold-400 bg-gold-400/10'
          : 'border-gold-500/20'
        }
      `}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <motion.img
            src={player.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.name)}&background=fbbf24&color=0a0a0a&bold=true`}
            alt={player.name}
            className={`
              w-16 h-16 rounded-full object-cover
              ring-4 ${isActive ? 'ring-gold-400' : 'ring-gold-500/30'}
              ring-offset-2 ring-offset-obsidian-900
            `}
            animate={isActive ? { scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {isActive && (
            <motion.div
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-obsidian-900 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
            </motion.div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-lg text-white truncate">
            {player.name}
          </h4>

          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1 text-sm text-gold-400">
              <TrophyIcon className="w-4 h-4" />
              <span className="font-semibold">{player.elo || 1500}</span>
            </div>

            <div className="h-3 w-px bg-gold-500/30" />

            <div className="text-sm text-gray-400">
              Pip: <span className="text-white font-semibold">{player.pipCount || 167}</span>
            </div>
          </div>
        </div>
      </div>

      {isActive && timeRemaining !== undefined && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              Temps restant
            </span>
            <motion.span
              className={`font-mono font-bold ${isLowTime ? 'text-red-400' : 'text-gold-400'}`}
              animate={isLowTime ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 1, repeat: isLowTime ? Infinity : 0 }}
            >
              {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
            </motion.span>
          </div>

          <div className="relative h-2 bg-obsidian-900 rounded-full overflow-hidden">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full ${
                isLowTime
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : 'bg-gradient-to-r from-gold-400 to-gold-600'
              }`}
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />

            {isLowTime && (
              <motion.div
                className="absolute inset-0 bg-red-500/30"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
  game: SparklesIcon,
};

const colors = {
  success: {
    bg: 'from-green-500 to-emerald-600',
    border: 'border-green-500/50',
    icon: 'text-green-400',
  },
  error: {
    bg: 'from-red-500 to-rose-600',
    border: 'border-red-500/50',
    icon: 'text-red-400',
  },
  info: {
    bg: 'from-blue-500 to-cyan-600',
    border: 'border-blue-500/50',
    icon: 'text-blue-400',
  },
  warning: {
    bg: 'from-yellow-500 to-orange-600',
    border: 'border-yellow-500/50',
    icon: 'text-yellow-400',
  },
  game: {
    bg: 'from-gold-400 to-gold-600',
    border: 'border-gold-500/50',
    icon: 'text-gold-400',
  },
};

export default function ToastNotification({ toast, onClose }) {
  const Icon = icons[toast.type] || InformationCircleIcon;
  const colorScheme = colors[toast.type] || colors.info;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 300, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="relative"
      >
        <motion.div
          className={`
            absolute -inset-1 bg-gradient-to-r ${colorScheme.bg} rounded-2xl blur opacity-30
          `}
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <div className={`
          relative glass-strong rounded-2xl border-2 ${colorScheme.border}
          p-4 pr-12 min-w-[320px] max-w-md shadow-2xl overflow-hidden
        `}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorScheme.bg}" />

          <div className="flex items-start gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
              className={`flex-shrink-0 w-8 h-8 rounded-full bg-obsidian-900/50 flex items-center justify-center border ${colorScheme.border}`}
            >
              <Icon className={`w-5 h-5 ${colorScheme.icon}`} />
            </motion.div>

            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="font-bold text-white mb-1">
                  {toast.title}
                </h4>
              )}
              <p className="text-sm text-gray-300 leading-relaxed">
                {toast.message}
              </p>
              {toast.detail && (
                <p className="text-xs text-gray-400 mt-1">
                  {toast.detail}
                </p>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-3 right-3 w-6 h-6 rounded-full glass hover:bg-red-500/20 flex items-center justify-center transition-colors"
          >
            <XCircleIcon className="w-4 h-4 text-gray-400 hover:text-red-400" />
          </motion.button>

          {toast.duration && (
            <motion.div
              className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${colorScheme.bg}`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: toast.duration / 1000, ease: 'linear' }}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export const showCustomToast = (message, options = {}) => {
  const {
    type = 'info',
    title = null,
    detail = null,
    duration = 3000,
  } = options;

  const toast = {
    id: Date.now(),
    type,
    title,
    message,
    detail,
    duration,
  };

  if (window.showToast) {
    window.showToast(toast);
  }
};

export const gameToast = (message, detail) => {
  showCustomToast(message, {
    type: 'game',
    title: '🎮 Partie',
    detail,
    duration: 4000,
  });
};

export const moveToast = (from, to) => {
  gameToast('Coup joué', `${from} → ${to}`);
};

export const diceToast = (dice) => {
  gameToast('Dés lancés', `Résultat : ${dice.join(' • ')}`);
};

export const winToast = (winner) => {
  showCustomToast(`${winner} remporte la partie !`, {
    type: 'success',
    title: '🏆 Victoire',
    duration: 5000,
  });
};

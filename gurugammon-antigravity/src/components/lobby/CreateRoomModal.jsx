import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  LockClosedIcon,
  ClockIcon,
  UsersIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function CreateRoomModal({ isOpen, onClose, onCreateRoom }) {
  const [roomName, setRoomName] = useState('');
  const [timerPerTurn, setTimerPerTurn] = useState(60);
  const [matchLength, setMatchLength] = useState(5);
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [stakes, setStakes] = useState(1);

  const timerOptions = [
    { value: 10, label: '10 sec' },
    { value: 30, label: '30 sec' },
    { value: 60, label: '1 min' },
    { value: 120, label: '2 min' },
    { value: 180, label: '3 min' },
    { value: 300, label: '5 min' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!roomName.trim()) {
      toast.error('Le nom de la salle est requis');
      return;
    }

    if (isPrivate && !password) {
      toast.error('Un mot de passe est requis pour les salles privées');
      return;
    }

    const roomData = {
      name: roomName,
      timerPerTurn,
      matchLength,
      maxPlayers,
      isPrivate,
      password: isPrivate ? password : null,
      stakes,
    };

    onCreateRoom(roomData);
    handleClose();
  };

  const handleClose = () => {
    setRoomName('');
    setPassword('');
    setIsPrivate(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative glass-strong rounded-3xl border border-gold-500/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-glow-gold-lg"
          >
            <div className="sticky top-0 z-10 glass-strong border-b border-gold-500/20 p-6 flex items-center justify-between backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg"
                >
                  <SparklesIcon className="w-6 h-6 text-obsidian-950" />
                </motion.div>
                <h2 className="text-3xl font-display font-black gradient-text">
                  Créer une Partie
                </h2>
              </div>

              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="p-2 rounded-xl glass hover:bg-red-500/20 transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-red-400 transition-colors" />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gold-400 mb-2">
                  Nom de la salle
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Ma partie épique..."
                  className="w-full px-4 py-3 bg-obsidian-900/50 border border-gold-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-all"
                  required
                  maxLength={30}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gold-400 mb-2 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" />
                    Timer par tour
                  </label>
                  <select
                    value={timerPerTurn}
                    onChange={(e) => setTimerPerTurn(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-obsidian-900/50 border border-gold-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all cursor-pointer"
                  >
                    {timerOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gold-400 mb-2">
                    Match en
                  </label>
                  <select
                    value={matchLength}
                    onChange={(e) => setMatchLength(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-obsidian-900/50 border border-gold-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all cursor-pointer"
                  >
                    {[1, 3, 5, 7, 11, 15].map((length) => (
                      <option key={length} value={length}>
                        {length} {length === 1 ? 'point' : 'points'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gold-400 mb-2 flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" />
                    Nombre de joueurs
                  </label>
                  <select
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-obsidian-900/50 border border-gold-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all cursor-pointer"
                  >
                    <option value={2}>2 joueurs</option>
                    <option value={4}>4 joueurs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gold-400 mb-2">
                    Enjeu
                  </label>
                  <select
                    value={stakes}
                    onChange={(e) => setStakes(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-obsidian-900/50 border border-gold-500/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all cursor-pointer"
                  >
                    {[1, 2, 5, 10, 20, 50].map((stake) => (
                      <option key={stake} value={stake}>
                        {stake}×
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <motion.div
                className="glass p-4 rounded-xl border border-gold-500/20"
                whileHover={{ scale: 1.01 }}
              >
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <LockClosedIcon className="w-5 h-5 text-gold-400" />
                    <div>
                      <div className="font-semibold text-white">Salle privée</div>
                      <div className="text-xs text-gray-400">Protégez votre partie avec un mot de passe</div>
                    </div>
                  </div>
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="relative"
                  >
                    <input
                      type="checkbox"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gold-500"></div>
                  </motion.div>
                </label>
              </motion.div>

              <AnimatePresence>
                {isPrivate && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-sm font-semibold text-gold-400 mb-2">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-obsidian-900/50 border border-gold-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all"
                      required={isPrivate}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3 pt-4">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-xl font-semibold btn-glass"
                >
                  Annuler
                </motion.button>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-xl font-bold btn-primary shadow-glow-gold flex items-center justify-center gap-2"
                >
                  <SparklesIcon className="w-5 h-5" />
                  Créer la Partie
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

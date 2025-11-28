import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, AlertCircle, Award, Volume2, Video, Sparkles } from 'lucide-react';

export interface AnalysisData {
  equityLoss: number;
  bestMove: string;
  explanation: string;
  isBlunder: boolean;
  pr?: number;
  winrate?: number;
}

interface CoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisData | null;
  isLoading: boolean;
  onPlayAudio?: () => void;
  onPlayVideo?: () => void;
  quotaRemaining: number;
  onUpgrade?: () => void;
}

export default function CoachModal({
  isOpen,
  onClose,
  analysis,
  isLoading,
  onPlayAudio,
  onPlayVideo,
  quotaRemaining,
  onUpgrade,
}: CoachModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl max-w-2xl w-full border-2 border-[#FFD700] shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#FFD700] to-[#FFC700] p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-black">GNUBg Analysis</h2>
                  <p className="text-sm text-black/70">AI-powered move evaluation</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between bg-black/10 rounded-lg px-4 py-2">
                <span className="text-sm font-medium text-black">Analysis Credits</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < quotaRemaining ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-black">{quotaRemaining}/5</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  >
                    <Sparkles className="w-12 h-12 text-[#FFD700]" />
                  </motion.div>
                  <p className="text-gray-400 text-lg">Analyzing position with GNUBg...</p>
                  <p className="text-gray-500 text-sm">This may take a few seconds</p>
                </div>
              ) : analysis ? (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-center">
                      <div className="text-xs text-gray-500 uppercase mb-1">Equity Loss</div>
                      <div
                        className={`text-2xl font-bold ${
                          analysis.equityLoss > 0.1 ? 'text-red-500' : 'text-green-500'
                        }`}
                      >
                        {(analysis.equityLoss * 100).toFixed(1)}%
                      </div>
                    </div>

                    {analysis.pr !== undefined && (
                      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-center">
                        <div className="text-xs text-gray-500 uppercase mb-1">PR Rating</div>
                        <div className="text-2xl font-bold text-blue-400">{analysis.pr.toFixed(1)}</div>
                      </div>
                    )}

                    {analysis.winrate !== undefined && (
                      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-center">
                        <div className="text-xs text-gray-500 uppercase mb-1">Win Rate</div>
                        <div className="text-2xl font-bold text-purple-400">
                          {(analysis.winrate * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                  </div>

                  {analysis.isBlunder && (
                    <motion.div
                      className="bg-red-900/20 border border-red-500 rounded-xl p-4 flex items-start gap-3"
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                    >
                      <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-red-400 mb-1">Blunder Detected!</h3>
                        <p className="text-sm text-red-300">
                          This move significantly decreases your winning chances.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <div className="bg-[#1a1a1a] border border-[#FFD700]/30 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-[#FFD700]" />
                      <h3 className="font-bold text-[#FFD700]">Recommended Move</h3>
                    </div>
                    <div className="text-3xl font-black text-white mb-4 font-mono tracking-wider">
                      {analysis.bestMove}
                    </div>
                    <p className="text-gray-300 leading-relaxed">{analysis.explanation}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      className="bg-[#1a1a1a] hover:bg-[#222] border border-[#333] hover:border-[#FFD700] text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onPlayAudio}
                    >
                      <Volume2 className="w-5 h-5" />
                      Listen to Coach
                    </motion.button>

                    <motion.button
                      className="bg-[#1a1a1a] hover:bg-[#222] border border-[#333] hover:border-[#FFD700] text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={onPlayVideo}
                    >
                      <Video className="w-5 h-5" />
                      Watch Video
                    </motion.button>
                  </div>
                </>
              ) : quotaRemaining === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <AlertCircle className="w-16 h-16 text-gray-500 mx-auto" />
                  <h3 className="text-xl font-bold text-white">Out of Analysis Credits</h3>
                  <p className="text-gray-400">
                    Upgrade to Premium for unlimited AI analysis and coaching.
                  </p>
                  <motion.button
                    className="bg-gradient-to-r from-[#FFD700] to-[#FFC700] text-black px-8 py-3 rounded-full font-bold shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onUpgrade}
                  >
                    Upgrade to Premium
                  </motion.button>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <Award className="w-16 h-16 text-gray-500 mx-auto" />
                  <h3 className="text-xl font-bold text-white">Make a move to analyze</h3>
                  <p className="text-gray-400">
                    After your move, GNUBg will provide detailed analysis and suggestions.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

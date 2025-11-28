import { motion } from 'framer-motion';

interface DoublingCubeProps {
  value: number;
  owner?: 1 | 2 | null;
  onDouble?: () => void;
  canDouble?: boolean;
}

export default function DoublingCube({ value, owner, onDouble, canDouble }: DoublingCubeProps) {
  const displayValue = value;
  const faceRotations: Record<number, { rotateX: number; rotateY: number }> = {
    2: { rotateX: 0, rotateY: 0 },
    4: { rotateX: 0, rotateY: 90 },
    8: { rotateX: 0, rotateY: 180 },
    16: { rotateX: 0, rotateY: 270 },
    32: { rotateX: 90, rotateY: 0 },
    64: { rotateX: -90, rotateY: 0 },
  };

  const rotation = faceRotations[displayValue] || { rotateX: 0, rotateY: 0 };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        className="relative w-16 h-16 md:w-20 md:h-20 cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        animate={rotation}
        transition={{
          duration: 0.6,
          ease: [0.34, 1.56, 0.64, 1],
        }}
        onClick={canDouble ? onDouble : undefined}
        whileHover={canDouble ? { scale: 1.1 } : {}}
        whileTap={canDouble ? { scale: 0.95 } : {}}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-300 rounded-lg shadow-2xl border-2 border-amber-400 flex items-center justify-center">
          <span className="text-3xl md:text-4xl font-black text-amber-900">{displayValue}</span>
        </div>

        {owner && (
          <motion.div
            className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white shadow-lg ${
              owner === 1 ? 'bg-[#D2B48C]' : 'bg-[#8B0000]'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500 }}
          />
        )}
      </motion.div>

      {canDouble && (
        <motion.button
          className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-lg hover:bg-amber-600"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDouble}
        >
          Double
        </motion.button>
      )}
    </div>
  );
}

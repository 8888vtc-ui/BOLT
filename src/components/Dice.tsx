import { motion } from 'framer-motion';

interface DiceProps {
  value: number;
  rolling?: boolean;
}

export default function Dice({ value, rolling }: DiceProps) {
  const dots = getDots(value);

  return (
    <motion.div
      className="relative w-12 h-12 md:w-16 md:h-16 bg-white rounded-lg shadow-2xl"
      animate={
        rolling
          ? {
              rotateX: [0, 360, 720, 1080],
              rotateY: [0, 360, 720, 1080],
              rotateZ: [0, 180, 360, 540],
            }
          : {}
      }
      transition={{
        duration: 0.8,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="absolute inset-0 rounded-lg border-2 border-gray-200 bg-gradient-to-br from-white to-gray-100 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-1 p-2 w-full h-full">
          {dots.map((show, i) => (
            <motion.div
              key={i}
              className="flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: show ? 1 : 0 }}
              transition={{ delay: rolling ? 0.8 : 0, duration: 0.2 }}
            >
              {show && (
                <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-gray-900 rounded-full shadow-inner" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function getDots(value: number): boolean[] {
  const patterns: Record<number, boolean[]> = {
    1: [false, false, false, false, true, false, false, false, false],
    2: [true, false, false, false, false, false, false, false, true],
    3: [true, false, false, false, true, false, false, false, true],
    4: [true, false, true, false, false, false, true, false, true],
    5: [true, false, true, false, true, false, true, false, true],
    6: [true, false, true, true, false, true, true, false, true],
  };
  return patterns[value] || patterns[1];
}

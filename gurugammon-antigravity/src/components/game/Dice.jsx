import Button from '../common/Button';

export default function Dice({ dice, onRoll, canRoll }) {
  const renderDie = (value) => {
    const dots = [];

    const positions = {
      1: [[50, 50]],
      2: [[25, 25], [75, 75]],
      3: [[25, 25], [50, 50], [75, 75]],
      4: [[25, 25], [25, 75], [75, 25], [75, 75]],
      5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
      6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]]
    };

    return (
      <div className="relative w-16 h-16 bg-white rounded-lg shadow-lg dice">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {positions[value]?.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="8"
              fill="#1a1a1a"
            />
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {dice.length > 0 ? (
        <div className="flex gap-4 justify-center">
          {dice.map((value, index) => (
            <div key={index}>
              {renderDie(value)}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 py-4">
          No dice rolled yet
        </div>
      )}

      <Button
        onClick={onRoll}
        variant="primary"
        className="w-full"
        disabled={!canRoll}
      >
        Roll Dice
      </Button>
    </div>
  );
}

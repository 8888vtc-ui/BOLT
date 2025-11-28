import { X } from 'lucide-react';
import Button from '../common/Button';

export default function DoublingCube({ value, onOffer, onAccept, onDecline }) {
  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
          <span className="text-white font-bold text-xl">{value}</span>
        </div>
        <div>
          <p className="text-sm text-gray-400">Doubling Cube</p>
          <p className="text-xs text-gray-500">Current Stakes</p>
        </div>
      </div>

      <Button
        onClick={onOffer}
        variant="outline"
        size="sm"
        className="w-full flex items-center justify-center gap-2"
      >
        <X className="w-4 h-4" />
        <span>2</span>
        Double
      </Button>
    </div>
  );
}

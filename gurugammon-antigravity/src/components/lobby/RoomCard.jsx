import { Users, Lock, Unlock } from 'lucide-react';
import Button from '../common/Button';

export default function RoomCard({ room, onJoin }) {
  const isFull = room.currentPlayers >= room.maxPlayers;

  return (
    <div className="bg-dark-700 rounded-xl p-6 border border-dark-600 hover:border-primary-500 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1">{room.name}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {room.isPrivate ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
            <span>{room.isPrivate ? 'Private' : 'Public'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-primary-400">
          <Users className="w-5 h-5" />
          <span className="font-semibold">
            {room.currentPlayers}/{room.maxPlayers}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm text-gray-400">
        <div className="flex justify-between">
          <span>Host:</span>
          <span className="text-white">{room.host}</span>
        </div>
        <div className="flex justify-between">
          <span>Match Length:</span>
          <span className="text-white">{room.matchLength || 1}</span>
        </div>
        <div className="flex justify-between">
          <span>Stakes:</span>
          <span className="text-white">{room.stakes || 1}</span>
        </div>
      </div>

      <Button
        onClick={onJoin}
        variant={isFull ? 'secondary' : 'primary'}
        className="w-full"
        disabled={isFull}
      >
        {isFull ? 'Room Full' : 'Join Game'}
      </Button>
    </div>
  );
}

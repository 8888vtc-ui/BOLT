import { useState } from 'react';
import Button from '../common/Button';

export default function CreateRoomForm({ onSubmit, onCancel }) {
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(roomName, isPrivate, maxPlayers);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Room Name
        </label>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter room name..."
          required
          minLength={3}
          maxLength={30}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Max Players
        </label>
        <select
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(Number(e.target.value))}
          className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value={2}>2 Players</option>
          <option value={4}>4 Players</option>
          <option value={8}>8 Players</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isPrivate"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="w-5 h-5 bg-dark-700 border border-dark-600 rounded focus:ring-2 focus:ring-primary-500"
        />
        <label htmlFor="isPrivate" className="text-sm font-medium text-gray-300">
          Make this room private
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="secondary"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
        >
          Create Room
        </Button>
      </div>
    </form>
  );
}

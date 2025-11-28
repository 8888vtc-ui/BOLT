import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLobbySocket } from '../hooks/useLobbySocket';
import { GameContext } from '../context/GameContext';
import { Plus, RefreshCw } from 'lucide-react';
import Button from '../components/common/Button';
import RoomList from '../components/lobby/RoomList';
import CreateRoomForm from '../components/lobby/CreateRoomForm';
import Modal from '../components/common/Modal';

export default function Lobby() {
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const { rooms } = useContext(GameContext);
  const { createRoom, joinRoom, refreshRooms } = useLobbySocket();
  const navigate = useNavigate();

  useEffect(() => {
    refreshRooms();
  }, []);

  const handleCreateRoom = (roomName, isPrivate, maxPlayers) => {
    createRoom(roomName, isPrivate, maxPlayers);
    setShowCreateRoom(false);
  };

  const handleJoinRoom = (roomId) => {
    joinRoom(roomId);
    navigate(`/game/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-dark py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gradient">Game Lobby</h1>

          <div className="flex gap-4">
            <Button
              onClick={refreshRooms}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={() => setShowCreateRoom(true)}
              variant="primary"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Room
            </Button>
          </div>
        </div>

        <div className="bg-dark-800 rounded-xl border border-dark-700 p-6">
          <h2 className="text-2xl font-semibold mb-4">Available Rooms</h2>
          {rooms.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-4">No rooms available</p>
              <p className="text-sm">Create a new room to start playing!</p>
            </div>
          ) : (
            <RoomList rooms={rooms} onJoinRoom={handleJoinRoom} />
          )}
        </div>

        <Modal
          isOpen={showCreateRoom}
          onClose={() => setShowCreateRoom(false)}
          title="Create New Room"
        >
          <CreateRoomForm
            onSubmit={handleCreateRoom}
            onCancel={() => setShowCreateRoom(false)}
          />
        </Modal>
      </div>
    </div>
  );
}

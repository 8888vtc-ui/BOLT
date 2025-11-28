import { useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { GameContext } from '../context/GameContext';
import { AuthContext } from '../context/AuthContext';

export function useLobbySocket() {
  const socketRef = useRef(null);
  const { updateRooms } = useContext(GameContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('gurugammon_token');

    socketRef.current = io('http://localhost:8888', {
      path: '/socket.io',
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      console.log('Lobby socket connected');
      socketRef.current.emit('get_rooms');
    });

    socketRef.current.on('rooms_list', (rooms) => {
      updateRooms(rooms);
    });

    socketRef.current.on('room_created', (room) => {
      console.log('Room created:', room);
    });

    socketRef.current.on('room_updated', (room) => {
      console.log('Room updated:', room);
    });

    socketRef.current.on('room_deleted', (roomId) => {
      console.log('Room deleted:', roomId);
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, updateRooms]);

  const createRoom = (roomName, isPrivate = false, maxPlayers = 2) => {
    if (socketRef.current) {
      socketRef.current.emit('create_room', {
        name: roomName,
        isPrivate,
        maxPlayers
      });
    }
  };

  const joinRoom = (roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_room', { roomId });
    }
  };

  const leaveRoom = (roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_room', { roomId });
    }
  };

  const refreshRooms = () => {
    if (socketRef.current) {
      socketRef.current.emit('get_rooms');
    }
  };

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    refreshRooms,
    socket: socketRef.current
  };
}

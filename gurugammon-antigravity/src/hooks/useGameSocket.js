import { useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { GameContext } from '../context/GameContext';
import { AuthContext } from '../context/AuthContext';

export function useGameSocket(roomId) {
  const socketRef = useRef(null);
  const { updateGameState } = useContext(GameContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!roomId || !user) return;

    const token = localStorage.getItem('gurugammon_token');

    socketRef.current = io('http://localhost:8888', {
      path: '/socket.io',
      auth: { token },
      query: { roomId }
    });

    socketRef.current.on('connect', () => {
      console.log('Game socket connected');
      socketRef.current.emit('join_room', { roomId, userId: user.id });
    });

    socketRef.current.on('game_state', (state) => {
      updateGameState(state);
    });

    socketRef.current.on('game_update', (update) => {
      updateGameState(prev => ({ ...prev, ...update }));
    });

    socketRef.current.on('move_made', (moveData) => {
      console.log('Move made:', moveData);
    });

    socketRef.current.on('dice_rolled', (diceData) => {
      console.log('Dice rolled:', diceData);
    });

    socketRef.current.on('game_ended', (result) => {
      console.log('Game ended:', result);
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, user, updateGameState]);

  const rollDice = () => {
    if (socketRef.current) {
      socketRef.current.emit('roll_dice', { roomId });
    }
  };

  const makeMove = (from, to) => {
    if (socketRef.current) {
      socketRef.current.emit('make_move', { roomId, from, to });
    }
  };

  const offerDouble = () => {
    if (socketRef.current) {
      socketRef.current.emit('offer_double', { roomId });
    }
  };

  const acceptDouble = () => {
    if (socketRef.current) {
      socketRef.current.emit('accept_double', { roomId });
    }
  };

  const declineDouble = () => {
    if (socketRef.current) {
      socketRef.current.emit('decline_double', { roomId });
    }
  };

  return {
    rollDice,
    makeMove,
    offerDouble,
    acceptDouble,
    declineDouble,
    socket: socketRef.current
  };
}

import { createContext, useState } from 'react';

export const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);

  const updateGameState = (newState) => {
    setGameState(newState);
  };

  const updateRooms = (roomsList) => {
    setRooms(roomsList);
  };

  const joinRoom = (room) => {
    setCurrentRoom(room);
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setGameState(null);
  };

  const value = {
    gameState,
    rooms,
    currentRoom,
    updateGameState,
    updateRooms,
    joinRoom,
    leaveRoom
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

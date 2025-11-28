import { useState, useEffect, useCallback } from 'react';
import { gurugammonApi } from '../lib/gurugammonApi';

const WS_URL = import.meta.env.VITE_WS_URL || 'wss://gurugammon.onrender.com';

interface GameState {
  id: string;
  status: string;
  currentPlayer: 'white' | 'black';
  board: {
    positions: number[];
    whiteBar: number;
    blackBar: number;
    whiteOff: number;
    blackOff: number;
  };
  dice: {
    dice: number[];
    remaining: number[];
    doubles: boolean;
    used: number[];
  };
  cube: {
    level: number;
    owner: 'white' | 'black' | null;
    lastAction: string | null;
  };
  player1: {
    id: string;
    name: string;
  };
  player2: {
    id: string;
    name: string;
  } | null;
  whiteScore: number;
  blackScore: number;
  availableMoves: any[];
}

export function useGurugammonGame(gameId: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await gurugammonApi.getGame(gameId);
        setGameState(response.data.game);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchGame();
  }, [gameId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const websocket = new WebSocket(`${WS_URL}?token=${token}`);

    websocket.onopen = () => {
      console.log('WebSocket connected');
    };

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'gameUpdate' && message.gameId === gameId) {
          setGameState(message.payload);
          setRolling(false);
        }
      } catch (err) {
        console.error('WebSocket message parse error:', err);
      }
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      websocket.close();
    };
  }, [gameId]);

  const rollDice = useCallback(async () => {
    setRolling(true);
    try {
      await gurugammonApi.rollDice(gameId);
    } catch (err: any) {
      setError(err.message);
      setRolling(false);
    }
  }, [gameId]);

  const makeMove = useCallback(async (from: number, to: number) => {
    if (!gameState) return;

    const distance = Math.abs(to - from);
    const die = gameState.dice.remaining.find(d => d === distance);

    if (!die) {
      console.error('No matching die for this move');
      return;
    }

    try {
      await gurugammonApi.makeMove(gameId, from, to, die);
    } catch (err: any) {
      setError(err.message);
    }
  }, [gameId, gameState]);

  const resign = useCallback(async (type: 'SINGLE' | 'GAMMON' | 'BACKGAMMON' = 'SINGLE') => {
    try {
      await gurugammonApi.resign(gameId, type);
    } catch (err: any) {
      setError(err.message);
    }
  }, [gameId]);

  const doubleCube = useCallback(async () => {
    try {
      await gurugammonApi.doubleCube(gameId);
    } catch (err: any) {
      setError(err.message);
    }
  }, [gameId]);

  const takeCube = useCallback(async () => {
    try {
      await gurugammonApi.takeCube(gameId);
    } catch (err: any) {
      setError(err.message);
    }
  }, [gameId]);

  const passCube = useCallback(async () => {
    try {
      await gurugammonApi.passCube(gameId);
    } catch (err: any) {
      setError(err.message);
    }
  }, [gameId]);

  return {
    gameState,
    loading,
    error,
    rolling,
    rollDice,
    makeMove,
    resign,
    doubleCube,
    takeCube,
    passCube,
  };
}

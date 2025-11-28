import { useState, useEffect } from 'react'
import { api, Game } from '../lib/api'
import { supabase } from '../lib/supabase'

export function useGame(gameId: string | null) {
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!gameId) {
      setLoading(false)
      return
    }

    loadGame()

    const channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          if (payload.new) {
            setGame(payload.new as Game)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId])

  const loadGame = async () => {
    if (!gameId) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single()

      if (error) throw error
      setGame(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const rollDice = async () => {
    if (!gameId) return

    try {
      const result = await api.rollDice(gameId)
      return result.dice
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const makeMove = async (from: number, to: number) => {
    if (!gameId) return

    try {
      const result = await api.makeMove(gameId, [{ from, to, player: game?.current_turn || 1 }])
      setGame(result.game)
      return result.game
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const resignGame = async () => {
    if (!gameId) return

    try {
      const result = await api.resignGame(gameId)
      setGame(result.game)
      return result.game
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const createGame = async (opponentId?: string, gameType: string = 'pvp') => {
    try {
      setLoading(true)
      const newGame = await api.createGame(opponentId, gameType)
      setGame(newGame)
      return newGame
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    game,
    loading,
    error,
    rollDice,
    makeMove,
    resignGame,
    createGame,
    refreshGame: loadGame
  }
}

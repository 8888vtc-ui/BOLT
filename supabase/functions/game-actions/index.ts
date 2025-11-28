import { createClient } from 'npm:@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
}

interface GameMove {
  from: number
  to: number
  player: number
}

interface RollDiceRequest {
  gameId: string
}

interface MakeMoveRequest {
  gameId: string
  moves: GameMove[]
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const url = new URL(req.url)
    const path = url.pathname.replace('/game-actions', '')

    if (path === '/roll-dice' && req.method === 'POST') {
      const { gameId }: RollDiceRequest = await req.json()

      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single()

      if (gameError || !game) {
        return new Response(JSON.stringify({ error: 'Game not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (game.player1_id !== user.id && game.player2_id !== user.id) {
        return new Response(JSON.stringify({ error: 'Not authorized for this game' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const dice = [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]

      const { data: updatedGame, error: updateError } = await supabase
        .from('games')
        .update({ dice })
        .eq('id', gameId)
        .select()
        .single()

      if (updateError) {
        return new Response(JSON.stringify({ error: 'Failed to update game' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ game: updatedGame, dice }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (path === '/make-move' && req.method === 'POST') {
      const { gameId, moves }: MakeMoveRequest = await req.json()

      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single()

      if (gameError || !game) {
        return new Response(JSON.stringify({ error: 'Game not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (game.player1_id !== user.id && game.player2_id !== user.id) {
        return new Response(JSON.stringify({ error: 'Not authorized for this game' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const playerNumber = game.player1_id === user.id ? 1 : 2
      if (game.current_turn !== playerNumber) {
        return new Response(JSON.stringify({ error: 'Not your turn' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const boardState = game.board_state
      for (const move of moves) {
        if (boardState.points[move.from]) {
          if (boardState.points[move.from].player === playerNumber) {
            boardState.points[move.from].count -= 1
            if (boardState.points[move.from].count === 0) {
              boardState.points[move.from] = null
            }
          }
        }

        if (move.to >= 0 && move.to < 24) {
          if (!boardState.points[move.to]) {
            boardState.points[move.to] = { player: playerNumber, count: 1 }
          } else if (boardState.points[move.to].player === playerNumber) {
            boardState.points[move.to].count += 1
          }
        } else if (move.to === 24 || move.to === 25) {
          const offKey = playerNumber === 1 ? 'player1' : 'player2'
          boardState.off[offKey] += 1
        }
      }

      const nextTurn = game.current_turn === 1 ? 2 : 1

      await supabase
        .from('game_moves')
        .insert({
          game_id: gameId,
          player_id: user.id,
          move_number: game.current_turn,
          dice: game.dice,
          moves: moves,
          board_after: boardState,
        })

      const { data: updatedGame, error: updateError } = await supabase
        .from('games')
        .update({
          board_state: boardState,
          current_turn: nextTurn,
          dice: [],
        })
        .eq('id', gameId)
        .select()
        .single()

      if (updateError) {
        return new Response(JSON.stringify({ error: 'Failed to update game' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ game: updatedGame }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (path === '/resign' && req.method === 'POST') {
      const { gameId } = await req.json()

      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single()

      if (gameError || !game) {
        return new Response(JSON.stringify({ error: 'Game not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const winnerId = game.player1_id === user.id ? game.player2_id : game.player1_id

      const { data: updatedGame, error: updateError } = await supabase
        .from('games')
        .update({
          status: 'finished',
          winner_id: winnerId,
          win_type: 'resignation',
          finished_at: new Date().toISOString(),
        })
        .eq('id', gameId)
        .select()
        .single()

      if (updateError) {
        return new Response(JSON.stringify({ error: 'Failed to resign game' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ game: updatedGame }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Route not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

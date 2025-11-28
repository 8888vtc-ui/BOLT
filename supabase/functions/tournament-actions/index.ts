import { createClient } from 'npm:@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
}

interface StartTournamentRequest {
  tournamentId: string
}

interface ReportMatchRequest {
  matchId: string
  winnerId: string
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
    const path = url.pathname.replace('/tournament-actions', '')

    if (path === '/start' && req.method === 'POST') {
      const { tournamentId }: StartTournamentRequest = await req.json()

      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single()

      if (tournamentError || !tournament) {
        return new Response(JSON.stringify({ error: 'Tournament not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (tournament.created_by !== user.id) {
        return new Response(JSON.stringify({ error: 'Only tournament creator can start it' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (tournament.status !== 'open') {
        return new Response(JSON.stringify({ error: 'Tournament already started or finished' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: participants, error: participantsError } = await supabase
        .from('tournament_participants')
        .select('*')
        .eq('tournament_id', tournamentId)

      if (participantsError || !participants || participants.length < 2) {
        return new Response(JSON.stringify({ error: 'Not enough participants' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const brackets = generateBrackets(participants)

      for (let i = 0; i < brackets.length; i += 2) {
        if (brackets[i + 1]) {
          await supabase.from('tournament_matches').insert({
            tournament_id: tournamentId,
            round: 1,
            match_number: Math.floor(i / 2) + 1,
            player1_id: brackets[i].user_id,
            player2_id: brackets[i + 1].user_id,
            status: 'pending',
          })
        }
      }

      const { data: updatedTournament, error: updateError } = await supabase
        .from('tournaments')
        .update({
          status: 'in_progress',
          start_time: new Date().toISOString(),
          brackets: { rounds: [brackets.map(p => p.user_id)] },
        })
        .eq('id', tournamentId)
        .select()
        .single()

      if (updateError) {
        return new Response(JSON.stringify({ error: 'Failed to start tournament' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ tournament: updatedTournament }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (path === '/report-match' && req.method === 'POST') {
      const { matchId, winnerId }: ReportMatchRequest = await req.json()

      const { data: match, error: matchError } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('id', matchId)
        .single()

      if (matchError || !match) {
        return new Response(JSON.stringify({ error: 'Match not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (match.player1_id !== user.id && match.player2_id !== user.id) {
        return new Response(JSON.stringify({ error: 'Not authorized for this match' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: updatedMatch, error: updateError } = await supabase
        .from('tournament_matches')
        .update({
          winner_id: winnerId,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', matchId)
        .select()
        .single()

      if (updateError) {
        return new Response(JSON.stringify({ error: 'Failed to report match' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: allMatches } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', match.tournament_id)
        .eq('round', match.round)

      const allCompleted = allMatches?.every(m => m.status === 'completed')

      if (allCompleted && allMatches && allMatches.length > 0) {
        const winners = allMatches.map(m => m.winner_id).filter(Boolean)
        
        if (winners.length > 1) {
          for (let i = 0; i < winners.length; i += 2) {
            if (winners[i + 1]) {
              await supabase.from('tournament_matches').insert({
                tournament_id: match.tournament_id,
                round: match.round + 1,
                match_number: Math.floor(i / 2) + 1,
                player1_id: winners[i],
                player2_id: winners[i + 1],
                status: 'pending',
              })
            }
          }
        } else {
          await supabase
            .from('tournaments')
            .update({
              status: 'finished',
              end_time: new Date().toISOString(),
            })
            .eq('id', match.tournament_id)
        }
      }

      return new Response(JSON.stringify({ match: updatedMatch }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (path === '/standings' && req.method === 'GET') {
      const tournamentId = url.searchParams.get('tournamentId')
      if (!tournamentId) {
        return new Response(JSON.stringify({ error: 'Missing tournamentId' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: matches, error: matchesError } = await supabase
        .from('tournament_matches')
        .select('*, player1:users!tournament_matches_player1_id_fkey(username, rating), player2:users!tournament_matches_player2_id_fkey(username, rating)')
        .eq('tournament_id', tournamentId)

      if (matchesError) {
        return new Response(JSON.stringify({ error: 'Failed to fetch standings' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const standings = new Map()
      matches?.forEach(match => {
        if (match.winner_id) {
          const current = standings.get(match.winner_id) || { wins: 0, losses: 0 }
          standings.set(match.winner_id, { ...current, wins: current.wins + 1 })

          const loserId = match.winner_id === match.player1_id ? match.player2_id : match.player1_id
          const loserCurrent = standings.get(loserId) || { wins: 0, losses: 0 }
          standings.set(loserId, { ...loserCurrent, losses: loserCurrent.losses + 1 })
        }
      })

      const standingsArray = Array.from(standings.entries()).map(([userId, stats]) => ({
        userId,
        wins: stats.wins,
        losses: stats.losses,
      })).sort((a, b) => b.wins - a.wins)

      return new Response(JSON.stringify({ standings: standingsArray, matches }), {
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

function generateBrackets(participants: any[]) {
  const shuffled = [...participants].sort(() => Math.random() - 0.5)
  return shuffled.map((p, index) => ({
    ...p,
    seed: index + 1,
  }))
}

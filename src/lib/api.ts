import { supabase } from './supabase'

export interface User {
  id: string
  email?: string
  username: string
  role: string
  avatar?: string
  rating?: number
  premium?: boolean
  country?: string
}

export interface Game {
  id: string
  player1_id: string
  player2_id?: string
  game_type: string
  status: string
  board_state: any
  current_turn: number
  dice: number[]
  cube_value: number
  cube_owner?: number
  crawford?: boolean
  jacoby?: boolean
  beaver?: boolean
  raccoon?: boolean
  match_length?: number
  score: { player1: number; player2: number }
  winner_id?: string
  win_type?: string
  created_at: string
  finished_at?: string
}

export interface Tournament {
  id: string
  name: string
  description?: string
  status: string
  max_participants: number
  created_by: string
  start_time?: string
  brackets?: any
  created_at: string
}

export const api = {
  async loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) throw error
  },

  async loginWithEmail(email: string, password: string): Promise<{ user: User }> {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Login failed')

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('User profile not found')

    return {
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        avatar: data.avatar,
        role: data.role || 'player',
        rating: data.rating,
        premium: data.premium,
        country: data.country
      }
    }
  },

  async registerWithEmail(email: string, password: string, username: string): Promise<{ user: User }> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Registration failed')

    await new Promise(resolve => setTimeout(resolve, 1000))

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('Profile creation failed')

    return {
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role || 'player',
        rating: data.rating,
        premium: data.premium,
        country: data.country
      }
    }
  },

  async loginAsGuest(): Promise<{ user: User }> {
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
    if (authError) throw authError
    if (!authData.user) throw new Error('Guest login failed')

    const username = `Guest_${Math.random().toString(36).substr(2, 9)}`

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        username,
        email: null,
        role: 'guest',
        rating: 1500
      })

    if (insertError && insertError.code !== '23505') throw insertError

    return {
      user: {
        id: authData.user.id,
        username,
        role: 'guest',
        rating: 1500
      }
    }
  },

  async getProfile(): Promise<User> {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    if (error) throw error
    if (!data) throw new Error('User profile not found')

    return {
      id: data.id,
      username: data.username,
      email: data.email,
      avatar: data.avatar,
      role: data.role || 'player',
      rating: data.rating,
      premium: data.premium,
      country: data.country
    }
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async createGame(opponentId?: string, gameType: string = 'pvp'): Promise<Game> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const initialBoardState = {
      points: Array(24).fill(null).map((_, i) => {
        if (i === 0) return { player: 2, count: 2 }
        if (i === 5) return { player: 1, count: 5 }
        if (i === 7) return { player: 1, count: 3 }
        if (i === 11) return { player: 2, count: 5 }
        if (i === 12) return { player: 1, count: 5 }
        if (i === 16) return { player: 2, count: 3 }
        if (i === 18) return { player: 2, count: 5 }
        if (i === 23) return { player: 1, count: 2 }
        return null
      }),
      bar: { player1: 0, player2: 0 },
      off: { player1: 0, player2: 0 }
    }

    const { data, error } = await supabase
      .from('games')
      .insert({
        player1_id: user.id,
        player2_id: opponentId,
        game_type: gameType,
        status: opponentId ? 'active' : 'waiting',
        board_state: initialBoardState,
        current_turn: 1,
        dice: [],
        cube_value: 1,
        score: { player1: 0, player2: 0 }
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getGames(): Promise<Game[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('games')
      .select('*')
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getLeaderboard(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, rating, country, premium, email, avatar, role')
      .order('rating', { ascending: false })
      .limit(100)

    if (error) throw error
    return (data || []).map(user => ({
      id: user.id,
      username: user.username,
      email: user.email || undefined,
      avatar: user.avatar || undefined,
      role: user.role || 'player',
      rating: user.rating,
      premium: user.premium,
      country: user.country
    }))
  },

  async getTournaments(): Promise<Tournament[]> {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async createTournament(name: string, description: string, maxParticipants: number = 16): Promise<Tournament> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('tournaments')
      .insert({
        name,
        description,
        created_by: user.id,
        max_participants: maxParticipants,
        status: 'open'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async joinTournament(tournamentId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('tournament_participants')
      .insert({
        tournament_id: tournamentId,
        user_id: user.id
      })

    if (error) throw error
  },

  async rollDice(gameId: string): Promise<{ dice: number[] }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-actions/roll-dice`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to roll dice')
    }

    return response.json()
  },

  async makeMove(gameId: string, moves: any[]): Promise<{ game: Game }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-actions/make-move`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId, moves })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to make move')
    }

    return response.json()
  },

  async resignGame(gameId: string): Promise<{ game: Game }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-actions/resign`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to resign')
    }

    return response.json()
  },

  async startTournament(tournamentId: string): Promise<Tournament> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tournament-actions/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tournamentId })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to start tournament')
    }

    const result = await response.json()
    return result.tournament
  },

  async getTournamentStandings(tournamentId: string): Promise<any> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tournament-actions/standings?tournamentId=${tournamentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to get standings')
    }

    return response.json()
  }
}

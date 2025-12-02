import { supabase } from './supabase';

export interface UserStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  eloRating: number;
  rank: number | null;
  tournamentsWon: number;
  tournamentsPlayed: number;
  tournamentPoints: number;
  bestTournamentFinish: number;
}

export interface RecentGame {
  id: string;
  opponent: string;
  opponentId: string;
  result: 'win' | 'loss' | 'draw';
  score: string;
  date: string;
  gameType: string;
}

/**
 * Récupère les statistiques complètes d'un utilisateur
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    // 1. Récupérer le profil utilisateur avec ELO et stats tournois
    // Essayer d'abord avec 'users', puis 'profiles' en fallback
    let profile: any = null;
    let profileError: any = null;
    
    // Essayer avec 'users' (si la table existe)
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('rating, tournaments_won, tournaments_played, tournament_points, best_tournament_finish, elo_rating')
      .eq('id', userId)
      .maybeSingle();
    
    if (!usersError && usersData) {
      profile = usersData;
    } else {
      // Fallback sur 'profiles'
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('elo_rating, tournaments_won, tournaments_played, tournament_points, best_tournament_finish')
        .eq('id', userId)
        .maybeSingle();
      
      if (profilesError) {
        profileError = profilesError;
      } else {
        profile = profilesData;
      }
    }

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    // 2. Compter les parties jouées (gérer les deux formats de colonnes)
    let gamesPlayed = 0;
    let wins = 0;
    
    // Essayer d'abord avec player1_id/player2_id
    const { count: gamesCount1, error: gamesError1 } = await supabase
      .from('games')
      .select('*', { count: 'exact', head: true })
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .eq('status', 'finished');
    
    if (!gamesError1 && gamesCount1 !== null) {
      gamesPlayed = gamesCount1;
      
      // Compter les victoires
      const { count: winsCount1, error: winsError1 } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .eq('winner_id', userId)
        .eq('status', 'finished');
      
      if (!winsError1 && winsCount1 !== null) {
        wins = winsCount1;
      }
    } else {
      // Fallback sur white_player_id/black_player_id
      const { count: gamesCount2, error: gamesError2 } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`);
      
      if (!gamesError2 && gamesCount2 !== null) {
        gamesPlayed = gamesCount2;
        
        const { count: winsCount2, error: winsError2 } = await supabase
          .from('games')
          .select('*', { count: 'exact', head: true })
          .eq('winner_id', userId);
        
        if (!winsError2 && winsCount2 !== null) {
          wins = winsCount2;
        }
      }
    }

    if (winsError) {
      console.error('Error counting wins:', winsError);
    }

    // 4. Calculer les défaites
    const losses = (gamesPlayed || 0) - (wins || 0);
    const winRate = (gamesPlayed || 0) > 0 
      ? Math.round(((wins || 0) / (gamesPlayed || 0)) * 100) 
      : 0;

    // 5. Récupérer le classement depuis leaderboards
    const { data: leaderboardEntry, error: leaderboardError } = await supabase
      .from('leaderboards')
      .select('rank')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (leaderboardError) {
      console.error('Error fetching leaderboard:', leaderboardError);
    }

    // Gérer les deux formats de colonnes (rating vs elo_rating)
    const eloRating = profile?.rating || profile?.elo_rating || 1200;
    
    return {
      gamesPlayed: gamesPlayed || 0,
      wins: wins || 0,
      losses: losses,
      winRate,
      eloRating,
      rank: leaderboardEntry?.rank || null,
      tournamentsWon: profile?.tournaments_won || 0,
      tournamentsPlayed: profile?.tournaments_played || 0,
      tournamentPoints: profile?.tournament_points || 0,
      bestTournamentFinish: profile?.best_tournament_finish || 0,
    };
  } catch (error) {
    console.error('Error in getUserStats:', error);
    // Retourner des valeurs par défaut en cas d'erreur
    return {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      eloRating: 1200,
      rank: null,
      tournamentsWon: 0,
      tournamentsPlayed: 0,
      tournamentPoints: 0,
      bestTournamentFinish: 0,
    };
  }
}

/**
 * Récupère les parties récentes d'un utilisateur
 */
export async function getRecentGames(userId: string, limit: number = 10): Promise<RecentGame[]> {
  try {
    // Récupérer les parties (gérer les deux formats)
    let games: any[] = [];
    let error: any = null;
    
    // Essayer d'abord avec player1_id/player2_id
    const { data: games1, error: error1 } = await supabase
      .from('games')
      .select('id, player1_id, player2_id, winner_id, score, game_type, finished_at, created_at, status')
      .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
      .eq('status', 'finished')
      .order('finished_at', { ascending: false })
      .limit(limit);
    
    if (!error1 && games1 && games1.length > 0) {
      games = games1;
    } else {
      // Fallback sur white_player_id/black_player_id
      const { data: games2, error: error2 } = await supabase
        .from('games')
        .select('id, white_player_id, black_player_id, winner_id, score, game_type, finished_at, created_at')
        .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
        .order('finished_at', { ascending: false })
        .limit(limit);
      
      if (!error2 && games2) {
        // Mapper les colonnes pour uniformiser
        games = games2.map(g => ({
          ...g,
          player1_id: g.white_player_id,
          player2_id: g.black_player_id,
        }));
      } else {
        error = error2;
      }
    }

    if (error) {
      console.error('Error fetching recent games:', error);
      return [];
    }

    if (!games || games.length === 0) return [];

    // Récupérer les IDs des adversaires
    const opponentIds = games
      .map(game => game.player1_id === userId ? game.player2_id : game.player1_id)
      .filter(id => id !== null) as string[];

    // Récupérer les usernames des adversaires
    // Essayer d'abord 'users', puis 'profiles' en fallback
    let opponents: any[] = [];
    const { data: usersOpponents } = await supabase
      .from('users')
      .select('id, username')
      .in('id', opponentIds);
    
    if (usersOpponents && usersOpponents.length > 0) {
      opponents = usersOpponents;
    } else {
      // Fallback sur 'profiles'
      const { data: profilesOpponents } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', opponentIds);
      if (profilesOpponents) {
        opponents = profilesOpponents;
      }
    }

    const opponentMap = new Map(
      (opponents || []).map(opp => [opp.id, opp.username])
    );

    return games.map((game: any) => {
      // Gérer les deux formats de colonnes
      const player1Id = game.player1_id || game.white_player_id;
      const player2Id = game.player2_id || game.black_player_id;
      const isPlayer1 = player1Id === userId;
      const opponentId = isPlayer1 ? player2Id : player1Id;
      const opponent = opponentId 
        ? (opponentMap.get(opponentId) || 'Joueur inconnu')
        : 'IA';
      
      const won = game.winner_id === userId;
      const result: 'win' | 'loss' | 'draw' = won ? 'win' : (game.winner_id ? 'loss' : 'draw');
      
      // Formater le score
      let score = '0-0';
      if (game.score) {
        if (typeof game.score === 'object') {
          score = `${game.score.player1 || 0}-${game.score.player2 || 0}`;
        } else {
          score = game.score;
        }
      }

      // Formater la date
      const date = formatGameDate(game.finished_at || game.created_at);

      return {
        id: game.id,
        opponent,
        opponentId: opponentId || '',
        result,
        score,
        date,
        gameType: game.game_type || 'pvp',
      };
    });
  } catch (error) {
    console.error('Error in getRecentGames:', error);
    return [];
  }
}

/**
 * Formate la date d'une partie en format relatif
 */
function formatGameDate(dateString: string): string {
  if (!dateString) return 'Date inconnue';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'À l\'instant';
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  
  // Format complet pour les dates plus anciennes
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'long',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}


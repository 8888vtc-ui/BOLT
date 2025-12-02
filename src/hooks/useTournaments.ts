import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Tournament {
    id: string;
    name: string;
    description?: string;
    format: 'single_elimination' | 'double_elimination' | 'swiss' | 'round_robin';
    match_length: 3 | 5 | 7 | 9 | 11 | 15;
    max_players: 8 | 16 | 32 | 64 | 128 | 256;
    status: 'registration' | 'in_progress' | 'completed' | 'cancelled';
    registration_deadline?: string;
    start_date: string;
    end_date?: string;
    prize_pool: number;
    entry_fee: number;
    created_by?: string;
    created_at: string;
    updated_at: string;
    allow_late_registration: boolean;
    crawford_rule: boolean;
    jacoby_rule: boolean;

    // Données jointes
    participants_count?: number;
    is_registered?: boolean;
    my_status?: string;
}

export interface TournamentParticipant {
    id: string;
    tournament_id: string;
    user_id: string;
    status: 'registered' | 'active' | 'eliminated' | 'withdrawn' | 'winner';
    seed?: number;
    wins: number;
    losses: number;
    points_scored: number;
    points_against: number;
    final_rank?: number;
    prize_won: number;
    registered_at: string;
    eliminated_at?: string;

    // Données jointes
    user?: {
        username: string;
        avatar_url?: string;
    };
}

export interface TournamentMatch {
    id: string;
    tournament_id: string;
    player1_id?: string;
    player2_id?: string;
    round: number;
    match_number: number;
    bracket_position?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'bye';
    winner_id?: string;
    player1_score: number;
    player2_score: number;
    game_room_id?: string;
    scheduled_time?: string;
    started_at?: string;
    completed_at?: string;

    // Données jointes
    player1?: {
        username: string;
        avatar_url?: string;
    };
    player2?: {
        username: string;
        avatar_url?: string;
    };
}

export const useTournaments = () => {
    const { user } = useAuth();
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [myTournaments, setMyTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Récupérer tous les tournois disponibles
     */
    const fetchTournaments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('tournaments')
                .select(`
                    *,
                    participants:tournament_participants(count)
                `)
                .order('start_date', { ascending: true });

            if (fetchError) throw fetchError;

            // Enrichir avec le nombre de participants
            const enrichedTournaments = (data || []).map(t => ({
                ...t,
                participants_count: t.participants?.[0]?.count || 0
            }));

            setTournaments(enrichedTournaments);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching tournaments:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Récupérer les tournois de l'utilisateur
     */
    const fetchMyTournaments = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error: fetchError } = await supabase
                .from('tournament_participants')
                .select(`
                    *,
                    tournament:tournaments(*)
                `)
                .eq('user_id', user.id)
                .in('status', ['registered', 'active']);

            if (fetchError) throw fetchError;

            const myTournamentsData = (data || []).map(p => ({
                ...p.tournament,
                my_status: p.status,
                is_registered: true
            }));

            setMyTournaments(myTournamentsData);
        } catch (err: any) {
            console.error('Error fetching my tournaments:', err);
        }
    }, [user]);

    /**
     * Créer un nouveau tournoi
     */
    const createTournament = useCallback(async (tournamentData: Partial<Tournament>) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const { data, error: createError } = await supabase
                .from('tournaments')
                .insert({
                    ...tournamentData,
                    created_by: user.id,
                    status: 'registration'
                })
                .select()
                .single();

            if (createError) throw createError;

            // Rafraîchir la liste
            await fetchTournaments();

            return data;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    }, [user, fetchTournaments]);

    /**
     * S'inscrire à un tournoi
     */
    const registerForTournament = useCallback(async (tournamentId: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            // Vérifier si déjà inscrit
            const { data: existing } = await supabase
                .from('tournament_participants')
                .select('id')
                .eq('tournament_id', tournamentId)
                .eq('user_id', user.id)
                .single();

            if (existing) {
                throw new Error('Already registered for this tournament');
            }

            // Vérifier le nombre de participants
            const { data: tournament } = await supabase
                .from('tournaments')
                .select('max_players, participants:tournament_participants(count)')
                .eq('id', tournamentId)
                .single();

            if (tournament) {
                const currentCount = tournament.participants?.[0]?.count || 0;
                if (currentCount >= tournament.max_players) {
                    throw new Error('Tournament is full');
                }
            }

            // Inscription
            const { error: registerError } = await supabase
                .from('tournament_participants')
                .insert({
                    tournament_id: tournamentId,
                    user_id: user.id,
                    status: 'registered'
                });

            if (registerError) throw registerError;

            // Rafraîchir
            await Promise.all([fetchTournaments(), fetchMyTournaments()]);

            return true;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    }, [user, fetchTournaments, fetchMyTournaments]);

    /**
     * Se désinscrire d'un tournoi
     */
    const unregisterFromTournament = useCallback(async (tournamentId: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            const { error: updateError } = await supabase
                .from('tournament_participants')
                .update({ status: 'withdrawn' })
                .eq('tournament_id', tournamentId)
                .eq('user_id', user.id);

            if (updateError) throw updateError;

            // Rafraîchir
            await Promise.all([fetchTournaments(), fetchMyTournaments()]);

            return true;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    }, [user, fetchTournaments, fetchMyTournaments]);

    /**
     * Récupérer les participants d'un tournoi
     */
    const fetchTournamentParticipants = useCallback(async (tournamentId: string): Promise<TournamentParticipant[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('tournament_participants')
                .select(`
                    *,
                    user:profiles(username, avatar_url)
                `)
                .eq('tournament_id', tournamentId)
                .order('seed', { ascending: true, nullsFirst: false })
                .order('registered_at', { ascending: true });

            if (fetchError) throw fetchError;

            return data || [];
        } catch (err: any) {
            console.error('Error fetching participants:', err);
            return [];
        }
    }, []);

    /**
     * Récupérer les matchs d'un tournoi
     */
    const fetchTournamentMatches = useCallback(async (tournamentId: string): Promise<TournamentMatch[]> => {
        try {
            const { data, error: fetchError } = await supabase
                .from('tournament_matches')
                .select(`
                    *,
                    player1:profiles!tournament_matches_player1_id_fkey(username, avatar_url),
                    player2:profiles!tournament_matches_player2_id_fkey(username, avatar_url)
                `)
                .eq('tournament_id', tournamentId)
                .order('round', { ascending: true })
                .order('match_number', { ascending: true });

            if (fetchError) throw fetchError;

            return data || [];
        } catch (err: any) {
            console.error('Error fetching matches:', err);
            return [];
        }
    }, []);

    /**
     * Démarrer un tournoi (générer les brackets)
     */
    const startTournament = useCallback(async (tournamentId: string) => {
        if (!user) throw new Error('User not authenticated');

        try {
            // Appeler la fonction PostgreSQL pour générer le bracket
            const { data: bracketData, error: bracketError } = await supabase
                .rpc('generate_single_elimination_bracket', {
                    p_tournament_id: tournamentId
                });

            if (bracketError) throw bracketError;

            // Mettre à jour le statut du tournoi
            const { error: updateError } = await supabase
                .from('tournaments')
                .update({ status: 'in_progress' })
                .eq('id', tournamentId);

            if (updateError) throw updateError;

            // Rafraîchir
            await fetchTournaments();

            return bracketData;
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    }, [user, fetchTournaments]);

    // Charger les tournois au montage
    useEffect(() => {
        fetchTournaments();
        if (user) {
            fetchMyTournaments();
        }
    }, [fetchTournaments, fetchMyTournaments, user]);

    // S'abonner aux changements en temps réel
    useEffect(() => {
        const tournamentsChannel = supabase
            .channel('tournaments_changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'tournaments'
            }, () => {
                fetchTournaments();
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'tournament_participants'
            }, () => {
                fetchTournaments();
                if (user) fetchMyTournaments();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(tournamentsChannel);
        };
    }, [fetchTournaments, fetchMyTournaments, user]);

    /**
     * Récupérer le match en cours de l'utilisateur pour un tournoi
     */
    const fetchMyCurrentMatch = useCallback(async (tournamentId: string) => {
        if (!user) return null;

        try {
            const { data, error: fetchError } = await supabase
                .from('tournament_matches')
                .select('*')
                .eq('tournament_id', tournamentId)
                .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
                .in('status', ['pending', 'in_progress'])
                .single();

            if (fetchError) {
                if (fetchError.code === 'PGRST116') return null; // Pas de match trouvé
                throw fetchError;
            }

            return data as TournamentMatch;
        } catch (err: any) {
            console.error('Error fetching my match:', err);
            return null;
        }
    }, [user]);

    return {
        tournaments,
        myTournaments,
        loading,
        error,
        createTournament,
        registerForTournament,
        unregisterFromTournament,
        fetchTournamentParticipants,
        fetchTournamentMatches,
        fetchMyCurrentMatch,
        startTournament,
        refreshTournaments: fetchTournaments
    };
};

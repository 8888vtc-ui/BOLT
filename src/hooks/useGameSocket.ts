import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { useGameStore, Room, GameState, Player } from '../stores/gameStore';
import { INITIAL_BOARD, getSmartMove, makeMove, PlayerColor, hasWon, checkWinType, calculateMatchScore } from '../lib/gameLogic';
import { supabase } from '../lib/supabase';
import { useDebugStore } from '../stores/debugStore';
import { analyzeMove } from '../lib/aiService';

const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL;

// --- Helper pour gérer les erreurs Supabase ---
const handleSupabaseError = (error: any, context: string, addLog: (message: string, type?: 'info' | 'error' | 'success' | 'warning', data?: any) => void): boolean => {
    // Retourne true si c'est une erreur de permissions (on peut continuer)
    if (error?.code === '42501' || error?.message?.includes('permission denied')) {
        addLog(`⚠️ [SUPABASE] Permissions refusées (${context}) - Continuation en mode offline`, 'warning', error);
        return true; // Erreur de permissions, on peut continuer
    }
    addLog(`❌ [SUPABASE] Erreur (${context}): ${error?.message || 'Unknown error'}`, 'error', error);
    return false; // Autre erreur
};

// --- Mock Data for Demo Mode ---
interface GameOptions {
    mode: 'money' | 'match';
    matchLength: number;
}

const createMockGameState = (userId?: string, options?: GameOptions): GameState => {
    // Copie profonde sécurisée de INITIAL_BOARD
    let boardCopy;
    try {
        boardCopy = JSON.parse(JSON.stringify(INITIAL_BOARD));
    } catch (error) {
        // Fallback : copie manuelle si JSON échoue
        boardCopy = {
            points: INITIAL_BOARD.points.map(p => ({ ...p })),
            bar: { ...INITIAL_BOARD.bar },
            off: { ...INITIAL_BOARD.off }
        };
    }

    return {
        board: boardCopy,
        dice: [],
        turn: userId || 'guest', // Le tour est au joueur par défaut (cohérent avec players[0].id)
        score: {},
        cubeValue: 1,
        cubeOwner: null, // Cube au centre au début
        doubleValue: 1,
        canDouble: true,
        matchLength: options?.mode === 'match' ? (options.matchLength || 3) : 0, // 0 = Money Game, défaut 3 pour match
        currentPlayer: 1,
        pendingDouble: null
    };
};

const createMockRooms = (): Room[] => [];

export const useGameSocket = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState<GameState[]>([]);

    const {
        setIsConnected,
        setRoomsList,
        setRoom,
        setPlayers,
        updateGame,
        addMessage,
        resetGame,
        currentRoom,
        gameState,
        isConnected,
        roomsList,
        players
    } = useGameStore();

    const channelRef = useRef<any>(null);

    // --- Supabase Realtime Subscription ---
    useEffect(() => {
        if (DEMO_MODE) {
            setIsConnected(true);
            setRoomsList(createMockRooms());
            return;
        }

        if (!user) return;

        // Protection contre les erreurs de permissions Supabase
        try {
            // 1. Listen to Rooms list updates
            const roomsChannel = supabase.channel('public:rooms')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
                    fetchRooms().catch((err: any) => {
                        const addLog = useDebugStore.getState().addLog;
                        addLog(`⚠️ [SUPABASE] Erreur fetchRooms: ${err.message}`, 'warning', err);
                        // En cas d'erreur de permissions, passer en mode démo
                        if (err.code === '42501' || err.message?.includes('permission denied')) {
                            addLog(`⚠️ [SUPABASE] Permissions refusées - Passage en mode démo`, 'warning');
                            setIsConnected(true);
                            setRoomsList(createMockRooms());
                        }
                    });
                })
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        setIsConnected(true);
                    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                        const addLog = useDebugStore.getState().addLog;
                        addLog(`⚠️ [SUPABASE] Erreur channel: ${status} - Passage en mode démo`, 'warning');
                        setIsConnected(true);
                        setRoomsList(createMockRooms());
                    }
                });

            fetchRooms().catch((err: any) => {
                const addLog = useDebugStore.getState().addLog;
                addLog(`⚠️ [SUPABASE] Erreur fetchRooms initial: ${err.message}`, 'warning', err);
                if (err.code === '42501' || err.message?.includes('permission denied')) {
                    addLog(`⚠️ [SUPABASE] Permissions refusées - Passage en mode démo`, 'warning');
                    setIsConnected(true);
                    setRoomsList(createMockRooms());
                }
            });

            return () => {
                try {
                    supabase.removeChannel(roomsChannel);
                } catch (err) {
                    // Ignorer les erreurs de cleanup
                }
            };
        } catch (error: any) {
            const addLog = useDebugStore.getState().addLog;
            addLog(`❌ [SUPABASE] Erreur critique: ${error.message} - Passage en mode démo`, 'error', error);
            setIsConnected(true);
            setRoomsList(createMockRooms());
        }
    }, [user]);

    // --- Fetch Rooms Helper ---
    const fetchRooms = async () => {
        try {
            const { data, error } = await supabase
                .from('rooms')
                .select('*, profiles:created_by(username, avatar_url)')
                .order('created_at', { ascending: false });

            if (error) {
                const addLog = useDebugStore.getState().addLog;
                addLog(`⚠️ [SUPABASE] Erreur fetchRooms: ${error.message}`, 'warning', error);

                // Si erreur de permissions, retourner liste vide
                if (error.code === '42501' || error.message?.includes('permission denied')) {
                    addLog(`⚠️ [SUPABASE] Permissions refusées - Liste vide`, 'warning');
                    setRoomsList([]);
                    return;
                }
                throw error;
            }

            if (data) {
                const formattedRooms: Room[] = data.map(r => ({
                    id: r.id,
                    name: r.name,
                    status: r.status,
                    players: []
                }));
                setRoomsList(formattedRooms);
            }
        } catch (error: any) {
            const addLog = useDebugStore.getState().addLog;
            addLog(`❌ [SUPABASE] Erreur fetchRooms: ${error.message}`, 'error', error);
            setRoomsList([]);
        }
    };

    // --- Fetch Room Players Helper ---
    const fetchRoomPlayers = async (roomId: string): Promise<Player[]> => {
        const addLog = useDebugStore.getState().addLog;

        if (roomId === 'offline-bot') {
            // Solo mode: return player + bot
            if (user) {
                return [
                    { id: user.id, username: user.username || 'Guest', avatar: user.avatar },
                    { id: 'bot', username: 'Guru AI', avatar: undefined }
                ];
            }
            return [
                { id: 'guest-1', username: 'Guest', avatar: undefined },
                { id: 'bot', username: 'Guru AI', avatar: undefined }
            ];
        }

        try {
            // Fetch participants from room_participants
            const { data: participants, error: participantsError } = await supabase
                .from('room_participants')
                .select('user_id')
                .eq('room_id', roomId);

            if (participantsError) {
                addLog('Error fetching participants', 'error', participantsError);
                return [];
            }

            if (!participants || participants.length === 0) {
                addLog('No participants found', 'info');
                return [];
            }

            const userIds = participants.map(p => p.user_id);

            // Try to fetch from profiles table first
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('id, username, avatar_url')
                .in('id', userIds);

            if (profilesError) {
                addLog('Error fetching profiles, trying auth.users', 'error', profilesError);
            }

            // If profiles found, use them
            if (profilesData && profilesData.length > 0) {
                const players: Player[] = profilesData.map(p => ({
                    id: p.id,
                    username: p.username || 'Unknown',
                    avatar: p.avatar_url || undefined
                }));
                addLog(`Fetched ${players.length} players from profiles`, 'success');
                return players;
            }

            // Fallback: try to get from auth.users metadata
            // Note: We can't directly query auth.users, so we'll use what we have
            // For now, return basic players with IDs
            const players: Player[] = userIds.map(id => ({
                id,
                username: `Player ${id.slice(0, 8)}`,
                avatar: undefined
            }));
            addLog(`Fetched ${players.length} players (fallback)`, 'info');
            return players;

        } catch (err) {
            addLog('Exception fetching room players', 'error', err);
            return [];
        }
    };

    // --- Join Room & Subscribe to Game State ---
    const joinRoom = useCallback(async (roomId: string, options?: GameOptions) => {
        const addLog = useDebugStore.getState().addLog;
        addLog(`🚀 [JOIN_ROOM] Début - Room ID: ${roomId}`, 'info', { roomId, options, DEMO_MODE, user: user?.id });

        if (DEMO_MODE) {
            addLog('✅ [JOIN_ROOM] Mode démo activé', 'info');
            // FORCER isConnected à true en mode démo
            setIsConnected(true);

            const room = roomsList.find(r => r.id === roomId) || {
                id: roomId,
                name: 'Salle Demo',
                status: 'playing',
                players: []
            };
            addLog(`✅ [JOIN_ROOM] Room définie (démo): ${room.name}`, 'success');
            setRoom(room as Room);
            const mockState = createMockGameState(user?.id, options);
            addLog(`✅ [JOIN_ROOM] État de jeu créé (démo)`, 'success', { dice: mockState.dice, turn: mockState.turn });
            updateGame(mockState);
            addLog(`✅ [JOIN_ROOM] Terminé (démo)`, 'success');
            return;
        }

        try {
            if (roomId === 'offline-bot') {
                addLog('🤖 [JOIN_ROOM] Initialisation mode bot offline', 'info');

                // FORCER isConnected à true pour mode offline-bot
                setIsConnected(true);

                // Vérifier si on est déjà dans cette room ET que gameState existe
                if (currentRoom && currentRoom.id === 'offline-bot' && gameState && gameState.board) {
                    addLog(`✅ [JOIN_ROOM] Déjà dans offline-bot avec gameState, skip`, 'info');
                    return;
                }

                // VERSION ULTRA-RAPIDE - Pas d'appel API qui peut bloquer
                addLog(`📋 [JOIN_ROOM] Création joueurs locaux...`, 'info', { user: user?.id, hasUser: !!user });
                // CRITIQUE : Ajouter le bot comme deuxième joueur
                const botId = 'bot';
                const soloPlayers = user
                    ? [
                        { id: user.id, username: user.username || 'Joueur', avatar: user.avatar },
                        { id: botId, username: 'Bot IA', avatar: undefined }
                    ]
                    : [
                        { id: 'guest', username: 'Invité', avatar: undefined },
                        { id: botId, username: 'Bot IA', avatar: undefined }
                    ];
                // VÉRIFICATION CRITIQUE
                console.log('🎮 [JOIN_ROOM] Joueurs créés:', soloPlayers.length, soloPlayers);
                if (soloPlayers.length !== 2) {
                    console.error('❌ ERREUR: Doit avoir 2 joueurs !');
                }
                addLog(`✅ [JOIN_ROOM] Joueurs créés: ${soloPlayers.length}`, 'success', {
                    count: soloPlayers.length,
                    players: soloPlayers,
                    botId,
                    userExists: !!user
                });

                const botRoom = {
                    id: 'offline-bot',
                    name: 'Entraînement Solo (Offline)',
                    status: 'playing' as const,
                    players: []
                };
                addLog(`✅ [JOIN_ROOM] Room définie (bot): ${botRoom.name}`, 'success');

                // SET ROOM ET PLAYERS IMMÉDIATEMENT (synchrone)
                setRoom(botRoom);
                setPlayers(soloPlayers);

                // Créer l'état de jeu IMMÉDIATEMENT - pas d'attente
                const botState = createMockGameState(user?.id, options);

                // Vérifier que le board est valide AVANT les logs - utiliser copie profonde sécurisée
                if (!botState.board || !botState.board.points || botState.board.points.length !== 24) {
                    addLog(`❌ [JOIN_ROOM] Board invalide, utilisation INITIAL_BOARD`, 'error');
                    try {
                        botState.board = JSON.parse(JSON.stringify(INITIAL_BOARD));
                    } catch (error) {
                        // Fallback : copie manuelle
                        botState.board = {
                            points: INITIAL_BOARD.points.map(p => ({ ...p })),
                            bar: { ...INITIAL_BOARD.bar },
                            off: { ...INITIAL_BOARD.off }
                        };
                    }
                }

                // Vérifier que le board a des jetons
                const totalCheckers = botState.board.points.reduce((sum: number, p: any) => sum + (p?.count || 0), 0);
                if (totalCheckers === 0) {
                    addLog(`❌ [JOIN_ROOM] Board vide, utilisation INITIAL_BOARD`, 'error');
                    try {
                        botState.board = JSON.parse(JSON.stringify(INITIAL_BOARD));
                    } catch (error) {
                        // Fallback : copie manuelle
                        botState.board = {
                            points: INITIAL_BOARD.points.map(p => ({ ...p })),
                            bar: { ...INITIAL_BOARD.bar },
                            off: { ...INITIAL_BOARD.off }
                        };
                    }
                }

                // Vérifier le board AVANT de l'envoyer au store
                const boardCheck = {
                    hasBoard: !!botState.board,
                    hasPoints: !!botState.board?.points,
                    pointsLength: botState.board?.points?.length,
                    totalCheckers: botState.board?.points?.reduce((sum: number, p: any) => sum + (p?.count || 0), 0) || 0,
                    pointsWithCheckers: botState.board?.points?.filter((p: any) => p?.count > 0).length || 0,
                    samplePoints: {
                        point0: botState.board?.points?.[0],
                        point5: botState.board?.points?.[5],
                        point11: botState.board?.points?.[11],
                        point12: botState.board?.points?.[12],
                        point23: botState.board?.points?.[23]
                    }
                };

                addLog(`✅ [JOIN_ROOM] État de jeu créé (bot)`, 'success', {
                    dice: botState.dice,
                    turn: botState.turn,
                    ...boardCheck
                });

                // Si le board est vide ou invalide, FORCER l'utilisation de INITIAL_BOARD
                if (!boardCheck.hasBoard || !boardCheck.hasPoints || boardCheck.pointsLength !== 24 || boardCheck.totalCheckers === 0) {
                    addLog(`❌ [JOIN_ROOM] Board invalide détecté, FORCAGE INITIAL_BOARD`, 'error', boardCheck);
                    try {
                        botState.board = JSON.parse(JSON.stringify(INITIAL_BOARD));
                        addLog(`✅ [JOIN_ROOM] Board FORCÉ avec INITIAL_BOARD`, 'success');
                    } catch (error) {
                        botState.board = {
                            points: INITIAL_BOARD.points.map(p => ({ ...p })),
                            bar: { ...INITIAL_BOARD.bar },
                            off: { ...INITIAL_BOARD.off }
                        };
                        addLog(`✅ [JOIN_ROOM] Board FORCÉ avec INITIAL_BOARD (fallback)`, 'success');
                    }
                }

                // UPDATE GAME IMMÉDIATEMENT (synchrone) - CRITIQUE pour éviter écran noir
                updateGame(botState);
                addLog(`✅ [JOIN_ROOM] Terminé (bot offline) - INSTANTANÉ - Room et GameState définis`, 'success', {
                    roomSet: true,
                    gameStateSet: true,
                    hasBoard: !!botState.board
                });
                return;
            }

            addLog(`📡 [JOIN_ROOM] Mode Supabase - User: ${user?.id || 'null'}`, 'info');

            // Étape 1: Upsert participant
            if (user) {
                addLog(`📡 [JOIN_ROOM] Étape 1: Upsert participant...`, 'info');
                try {
                    const upsertResult = await Promise.race([
                        supabase.from('room_participants').upsert({ room_id: roomId, user_id: user.id }).select(),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout upsert participant')), 10000))
                    ]) as any;
                    addLog(`✅ [JOIN_ROOM] Participant upsert réussi`, 'success', upsertResult);
                } catch (err: any) {
                    addLog(`⚠️ [JOIN_ROOM] Erreur upsert participant (continuation): ${err.message}`, 'error', err);
                }
            } else {
                addLog(`⚠️ [JOIN_ROOM] Pas d'utilisateur, skip upsert`, 'info');
            }

            // Étape 2: Fetch players (avec protection permissions)
            addLog(`📡 [JOIN_ROOM] Étape 2: Récupération des joueurs...`, 'info');
            let roomPlayers: Player[] = [];
            try {
                roomPlayers = await Promise.race([
                    fetchRoomPlayers(roomId),
                    new Promise<Player[]>((_, reject) => setTimeout(() => reject(new Error('Timeout fetch players')), 10000))
                ]);
                addLog(`✅ [JOIN_ROOM] Joueurs récupérés: ${roomPlayers.length}`, 'success', roomPlayers);
            } catch (err: any) {
                // Si erreur de permissions, utiliser joueur local
                if (err.code === '42501' || err.message?.includes('permission denied')) {
                    addLog(`⚠️ [JOIN_ROOM] Permissions refusées - Utilisation joueur local`, 'warning', err);
                    roomPlayers = user ? [{ id: user.id, username: user.username || 'Guest', avatar: user.avatar }] : [];
                } else {
                    addLog(`⚠️ [JOIN_ROOM] Erreur fetch players (fallback): ${err.message}`, 'error', err);
                    roomPlayers = user ? [{ id: user.id, username: user.username || 'Guest', avatar: user.avatar }] : [];
                }
            }
            setPlayers(roomPlayers);

            // Étape 3: Fetch room data (avec protection permissions)
            addLog(`📡 [JOIN_ROOM] Étape 3: Récupération des données de la room...`, 'info');
            try {
                const roomResult = await Promise.race([
                    supabase.from('rooms').select('*').eq('id', roomId).single(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout fetch room')), 10000))
                ]) as any;

                const { data: roomData, error: roomError } = roomResult;

                if (roomError) {
                    // Si erreur de permissions, utiliser room par défaut
                    if (roomError.code === '42501' || roomError.message?.includes('permission denied')) {
                        addLog(`⚠️ [JOIN_ROOM] Permissions refusées - Room par défaut`, 'warning', roomError);
                        setRoom({ id: roomId, name: 'Partie en cours', status: 'playing', players: [] });
                    } else {
                        addLog(`⚠️ [JOIN_ROOM] Erreur fetch room (fallback): ${roomError.message}`, 'error', roomError);
                        setRoom({ id: roomId, name: 'Partie en cours', status: 'playing', players: [] });
                    }
                } else if (roomData) {
                    addLog(`✅ [JOIN_ROOM] Room récupérée: ${roomData.name}`, 'success', roomData);
                    setRoom({ ...roomData, players: [] });
                }
            } catch (err: any) {
                // Si erreur de permissions, utiliser room par défaut
                if (err.code === '42501' || err.message?.includes('permission denied')) {
                    addLog(`⚠️ [JOIN_ROOM] Permissions refusées - Room par défaut`, 'warning', err);
                } else {
                    addLog(`⚠️ [JOIN_ROOM] Erreur fetch room (catch): ${err.message}`, 'error', err);
                }
                setRoom({ id: roomId, name: 'Partie en cours', status: 'playing', players: [] });
            }

            // Étape 4: Setup channel
            addLog(`📡 [JOIN_ROOM] Étape 4: Configuration du channel...`, 'info');
            if (channelRef.current) {
                addLog(`📡 [JOIN_ROOM] Suppression ancien channel...`, 'info');
                supabase.removeChannel(channelRef.current);
            }

            try {
                const channel = supabase.channel(`room:${roomId}`)
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'games', filter: `room_id=eq.${roomId}` }, (payload) => {
                        const newGame = payload.new as any;
                        if (newGame && newGame.board_state) {
                            addLog('📥 [JOIN_ROOM] Mise à jour jeu reçue via channel', 'info');
                            updateGame(newGame.board_state);
                        }
                    })
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (payload) => {
                        const msg = payload.new as any;
                        addMessage({
                            id: msg.id,
                            userId: msg.user_id,
                            username: 'Joueur',
                            text: msg.content,
                            timestamp: new Date(msg.created_at).getTime()
                        });
                    })
                    .subscribe((status) => {
                        addLog(`📡 [JOIN_ROOM] Statut subscription: ${status}`, status === 'SUBSCRIBED' ? 'success' : 'info');
                    });

                channelRef.current = channel;
                addLog(`✅ [JOIN_ROOM] Channel configuré`, 'success');
            } catch (err: any) {
                addLog(`⚠️ [JOIN_ROOM] Erreur setup channel (continuation): ${err.message}`, 'error', err);
            }

            // Étape 5: Fetch or create game
            addLog(`📡 [JOIN_ROOM] Étape 5: Récupération/création du jeu...`, 'info');
            try {
                const gameResult = await Promise.race([
                    supabase.from('games').select('*').eq('room_id', roomId).single(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout fetch game')), 10000))
                ]) as any;

                const { data: gameData, error: gameError } = gameResult;

                if (gameData) {
                    addLog(`✅ [JOIN_ROOM] État de jeu trouvé`, 'success', { dice: gameData.board_state?.dice, turn: gameData.board_state?.turn });
                    updateGame(gameData.board_state);
                } else {
                    addLog(`📝 [JOIN_ROOM] Aucun jeu trouvé, création...`, 'info');
                    const initialState = createMockGameState(user?.id, options);
                    addLog(`📝 [JOIN_ROOM] État initial créé`, 'info', { dice: initialState.dice, turn: initialState.turn });

                    try {
                        const insertResult = await Promise.race([
                            supabase.from('games').insert({
                                room_id: roomId,
                                board_state: initialState,
                                white_player_id: user?.id
                            }),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout insert game')), 10000))
                        ]) as any;

                        const { error: insertError } = insertResult;

                        if (insertError) {
                            addLog(`⚠️ [JOIN_ROOM] Erreur création jeu (retry): ${insertError.message}`, 'error', insertError);
                            try {
                                const retryResult = await Promise.race([
                                    supabase.from('games').select('*').eq('room_id', roomId).single(),
                                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout retry game')), 5000))
                                ]) as any;
                                const { data: retryGame } = retryResult;
                                if (retryGame) {
                                    addLog(`✅ [JOIN_ROOM] Jeu récupéré après retry`, 'success');
                                    updateGame(retryGame.board_state);
                                } else {
                                    addLog(`⚠️ [JOIN_ROOM] Fallback: utilisation état initial local`, 'info');
                                    updateGame(initialState);
                                }
                            } catch (retryErr: any) {
                                addLog(`⚠️ [JOIN_ROOM] Erreur retry (fallback local): ${retryErr.message}`, 'error', retryErr);
                                updateGame(initialState);
                            }
                        } else {
                            addLog(`✅ [JOIN_ROOM] Jeu créé avec succès`, 'success');
                            updateGame(initialState);
                        }
                    } catch (insertErr: any) {
                        addLog(`⚠️ [JOIN_ROOM] Erreur insert (fallback local): ${insertErr.message}`, 'error', insertErr);
                        updateGame(initialState);
                    }
                }
            } catch (err: any) {
                addLog(`⚠️ [JOIN_ROOM] Erreur fetch/create game (fallback): ${err.message}`, 'error', err);
                const fallbackState = createMockGameState(user?.id, options);
                addLog(`⚠️ [JOIN_ROOM] Utilisation état fallback`, 'info');
                updateGame(fallbackState);
            }

            addLog(`✅ [JOIN_ROOM] Terminé avec succès`, 'success');
        } catch (err: any) {
            addLog(`❌ [JOIN_ROOM] Erreur critique: ${err.message}`, 'error', err);
            addLog(`❌ [JOIN_ROOM] Stack: ${err.stack}`, 'error');
            setRoom({ id: roomId, name: 'Erreur Connexion', status: 'playing', players: [] });
            const errorState = createMockGameState(user?.id);
            addLog(`⚠️ [JOIN_ROOM] Utilisation état d'erreur`, 'info');
            updateGame(errorState);
        }

    }, [user, roomsList, setRoom, updateGame, addMessage, currentRoom]);

    const leaveRoom = useCallback(async () => {
        if (DEMO_MODE) { resetGame(); return; }
        if (currentRoom && user) {
            await supabase.from('room_participants').delete().match({ room_id: currentRoom.id, user_id: user.id });
            if (channelRef.current) supabase.removeChannel(channelRef.current);
            resetGame();
        }
    }, [currentRoom, user, resetGame]);

    const createRoom = useCallback(async (roomName: string) => {
        if (DEMO_MODE) { return; }
        if (user) {
            const { data } = await supabase.from('rooms').insert({ name: roomName, created_by: user.id }).select().single();
            if (data) joinRoom(data.id);
        }
    }, [user, joinRoom]);

    const sendMessage = useCallback(async (message: string) => {
        if (DEMO_MODE) {
            addMessage({ id: Date.now().toString(), userId: 'me', username: 'Me', text: message, timestamp: Date.now() });
            return;
        }
        if (currentRoom && user) {
            await supabase.from('messages').insert({
                room_id: currentRoom.id,
                user_id: user.id,
                content: message
            });
        }
    }, [currentRoom, user, addMessage]);

    const undoMove = useCallback(() => {
        if (history.length === 0) return;
        const previousState = history[history.length - 1];
        updateGame(previousState);
        setHistory(prev => prev.slice(0, -1));

        if (!DEMO_MODE && currentRoom) {
            supabase.from('games').update({ board_state: previousState }).eq('room_id', currentRoom.id);
        }
    }, [history, updateGame, currentRoom]);

    // --- Game Actions ---
    const sendGameAction = useCallback(async (action: string, payload: any, forcePlayerColor?: number) => {
        const addLog = useDebugStore.getState().addLog;
        addLog(`Action: ${action}`, 'info', payload);

        let newState = { ...gameState } as GameState;

        if (action === 'rollDice') {
            setHistory([]);
            const dice1 = Math.floor(Math.random() * 6) + 1;
            const dice2 = Math.floor(Math.random() * 6) + 1;
            newState.dice = dice1 === dice2 ? [dice1, dice1, dice1, dice1] : [dice1, dice2];
            addLog(`Dice rolled: ${newState.dice.join(', ')}`, 'success');
        } else if (action === 'move') {
            const { from, to, die } = payload; // Récupérer le die si fourni par l'API

            // Déterminer la couleur du joueur
            let playerColor = forcePlayerColor || 1;
            if (!forcePlayerColor && user && players && players.length > 0) {
                // Si je suis le créateur/premier joueur -> Blanc (1)
                // Sinon -> Noir (2)
                if (players[0]?.id === user.id) playerColor = 1;
                else if (players[1]?.id === user.id) playerColor = 2;
            }

            // Hack pour le mode demo/guest si on joue seul
            if (!forcePlayerColor && (DEMO_MODE || (players && players.length === 0))) {
                playerColor = 1;
            }

            addLog(`Player Color: ${playerColor}`, 'info', { from, to, die, payload });

            const isBackwardMove = to > from;
            if (isBackwardMove && history.length > 0 && !forcePlayerColor) {
                undoMove();
                return;
            }

            const currentDice = newState.dice || [];

            // Utiliser le die fourni par l'API si disponible, sinon le calculer
            let dieUsed = (die !== undefined && die !== null && die > 0) ? die : -1;

            addLog(`🔍 [MOVE] Calcul dieUsed`, 'info', {
                dieFromPayload: die,
                dieUsed,
                from,
                to,
                playerColor,
                currentDice
            });

            if (dieUsed === -1) {
                // Calculer le die si non fourni
                if (playerColor === 1) {
                    // Blanc (23 -> 0) : se déplace vers le bas, donc from > to
                    if (from > to) dieUsed = from - to;
                } else {
                    // Noir (0 -> 23) : se déplace vers le haut, donc to > from
                    // MAIS peut aussi se déplacer depuis le point 23 vers le bas (23->18)
                    // Dans ce cas, from > to, et on utilise from - to
                    if (to > from) {
                        dieUsed = to - from; // Mouvement vers le haut (0→23)
                    } else if (from > to) {
                        dieUsed = from - to; // Mouvement vers le bas depuis le point 23
                    }
                }
                addLog(`🔍 [MOVE] Die calculé: ${dieUsed}`, 'info', { from, to, playerColor });
            }

            const dieIndex = currentDice.indexOf(dieUsed);

            if (dieIndex > -1) {
                if (!forcePlayerColor) {
                    setHistory(prev => [...prev, JSON.parse(JSON.stringify(gameState))]);
                }
                const newBoard = makeMove(newState.board, playerColor as PlayerColor, from, to);
                const newDice = [...currentDice];
                newDice.splice(dieIndex, 1);

                newState.board = newBoard;
                newState.dice = newDice;
                addLog('Move executed locally', 'success');
            } else {
                addLog('Invalid move or no matching die', 'error', { from, to, dieUsed, dice: currentDice, playerColor });
                return;
            }
        } else if (action === 'board:move') {
            const { from, to, playerId } = payload;
            
            // Validation: gameState doit exister
            if (!gameState) {
                addLog('⛔ [board:move] No gameState available', 'error');
                return;
            }
            
            // Validation stricte du tour AVANT traitement
            const myId = user?.id || (players && players.length > 0 ? players[0].id : 'guest');
            const currentTurn = gameState.turn;
            
            // Log détaillé AVANT validation
            addLog('🔍 [board:move] Validation du tour...', 'info', {
                currentTurn,
                myId,
                playerId,
                players: players?.map(p => ({ id: p.id, username: p.username })),
                gameStateTurn: gameState.turn
            });
            
            const isPlayerTurn = currentTurn === myId || 
                                currentTurn === 'guest' || 
                                currentTurn === 'guest-1' ||
                                (players && players.length > 0 && currentTurn === players[0].id);
            
            if (!isPlayerTurn) {
                addLog('⛔ [board:move] Not my turn, ignoring move', 'warning', {
                    isMyTurn: false,
                    currentTurn,
                    myId,
                    playerId,
                    gameStateTurn: gameState.turn,
                    isPlayerTurn
                });
                
                // Émettre move:rejected si on a un channel
                if (currentRoom && currentRoom.id !== 'offline-bot' && channelRef.current) {
                    channelRef.current.send({
                        type: 'broadcast',
                        event: 'move:rejected',
                        payload: {
                            reason: 'not-your-turn',
                            currentTurn,
                            myId,
                            playerId
                        }
                    });
                }
                
                return; // Ne pas traiter le move
            }
            
            // Déterminer playerColor
            let playerColor = 1;
            if (players && players.length > 0) {
                if (players[0]?.id === myId || players[0]?.id === playerId) playerColor = 1;
                else if (players[1]?.id === myId || players[1]?.id === playerId) playerColor = 2;
            }
            
            addLog('✅ [board:move] Validation OK, traitement du move', 'success', {
                from,
                to,
                playerColor,
                currentTurn,
                myId
            });
            
            // Les coordonnées sont déjà en format legacy (from/to sont des nombres)
            // Appeler récursivement avec l'action 'move' standard
            const result = sendGameAction('move', { from, to }, playerColor);
            
            // Émettre move:confirmed si on a un channel et que le move a réussi
            if (currentRoom && currentRoom.id !== 'offline-bot' && channelRef.current) {
                channelRef.current.send({
                    type: 'broadcast',
                    event: 'move:confirmed',
                    payload: {
                        from,
                        to,
                        playerId: myId,
                        playerColor
                    }
                });
            }
            
            return result;
        }

        // Check for win condition before switching turn
        if (action === 'move' && newState.board) {
            const player1Won = hasWon(newState.board, 1);
            const player2Won = hasWon(newState.board, 2);

            if (player1Won || player2Won) {
                const winner = player1Won ? 1 : 2;
                const winType = checkWinType(newState.board, winner);
                addLog(`Player ${winner} won! Type: ${winType}`, 'success');

                // Calculate and update match score if match game
                if (newState.matchLength && newState.matchLength > 0 && players && players.length > 0) {
                    const winnerPlayerId = winner === 1
                        ? (players[0]?.id || 'player1')
                        : (players[1]?.id || 'player2');

                    const newMatchScore = calculateMatchScore(
                        winType,
                        newState.cubeValue,
                        newState.matchLength,
                        newState.score || {},
                        winnerPlayerId,
                        players
                    );

                    if (newMatchScore) {
                        newState.score = newMatchScore;
                        addLog(`Match score updated: ${JSON.stringify(newMatchScore)}`, 'success');
                    }
                }

                // Mark the game as ended
                newState.dice = [];
                // Don't switch turn, game is over
            } else {
                // Switch turn if no dice left
                if (newState.dice.length === 0) {
                    const currentPlayerId = newState.turn;
                    // const myId = user?.id || 'guest-1'; // Supprimé car redéclaré plus bas

                    // Determine current player color
                    let currentPlayerColor = 1;
                    if (players && players.length > 0) {
                        if (currentPlayerId === players[0].id) currentPlayerColor = 1;
                        else if (currentPlayerId === players[1]?.id) currentPlayerColor = 2;
                        else if (currentPlayerId === 'bot') currentPlayerColor = 2;
                    }

                    // Switch to other player
                    // FORCER l'alternance avec logique robuste
                    const myId = user?.id || (players && players.length > 0 ? players[0].id : 'guest');
                    const botId = players && players.length > 1 ? players[1].id : 'bot';

                    let newTurn: string;
                    // Vérifier si c'est le tour du joueur (avec toutes les variations possibles)
                    const isPlayerTurn = currentPlayerId === myId || 
                                        currentPlayerId === 'guest' || 
                                        currentPlayerId === 'guest-1' ||
                                        currentPlayerId === players?.[0]?.id;
                    
                    if (isPlayerTurn) {
                        newTurn = botId;  // C'est au bot
                    } else {
                        newTurn = myId;  // C'est au joueur
                    }

                    newState.turn = newTurn;
                    addLog(`🔄 [MOVE] Tour alterné: ${currentPlayerId} → ${newTurn}`, 'success', {
                        players: players?.map(p => p.id),
                        currentPlayerId,
                        newTurn,
                        myId,
                        botId,
                        isPlayerTurn
                    });
                }
            }
        }

        // Double Cube state is handled via newState properties (pendingDouble, cubeValue)

        if (newState.board) {
            addLog('Updating local game state...', 'info');
            updateGame(newState);
            addLog('Local game state updated', 'success');
        }

        if (!DEMO_MODE && currentRoom && currentRoom.id !== 'offline-bot' && newState.board) {
            if (!DEMO_MODE && currentRoom && currentRoom.id !== 'offline-bot') {
                const { error } = await supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
                if (error) {
                    handleSupabaseError(error, 'update game', addLog);
                    // Continuer quand même, même en cas d'erreur
                } else {
                    addLog('Game updated in DB', 'success');
                }
            }
        }

    }, [gameState, updateGame, history, currentRoom, undoMove, players, user]);

    // --- Bot Logic ---
    const botIsThinking = useRef(false);
    const botTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const botAnalysisInProgress = useRef<string | null>(null); // Verrou pour éviter les appels multiples

    useEffect(() => {
        // Vérifier que tout est initialisé
        if (!currentRoom || !gameState || !gameState.board || !gameState.board.points) {
            return; // Attendre l'initialisation complète
        }

        // Check if it's a solo training game
        const isSoloGame = currentRoom.id === 'offline-bot' ||
            currentRoom.name?.startsWith('Entraînement') ||
            (players && players.length <= 1);

        if (!isSoloGame) {
            return; // Pas un jeu solo, ignorer
        }

        // CRITIQUE : Vérifier que players contient 2 joueurs avant de continuer
        if (!players || players.length < 2) {
            return; // Attendre que les 2 joueurs soient définis
        }

        // Check if it's Bot's turn
        const myId = user?.id || (players.length > 0 ? players[0].id : 'guest');
        const currentTurn = gameState.turn;

        // CRITIQUE : Identifier le bot depuis la liste des joueurs
        // Le bot est toujours le deuxième joueur dans offline-bot mode
        const botId = players && players.length > 1 ? players[1].id : 'bot';
        
        // Vérifier TOUTES les conditions possibles pour le tour du bot
        // Le bot peut être identifié par son ID, 'bot', ou être le joueur 2
        const isBotTurn = (
            currentTurn === botId ||
            currentTurn === 'bot' ||
            (players && players.length > 1 && currentTurn === players[1].id) ||
            // Fallback: si ce n'est pas mon tour et qu'on a 2 joueurs, c'est probablement le bot
            (currentTurn !== myId && players && players.length === 2 && currentTurn !== 'guest' && currentTurn !== 'guest-1')
        );

        // Créer une clé unique pour cette analyse (turn + dice)
        // Gérer le cas où les dés sont vides (avant le premier lancer)
        const analysisKey = gameState.dice.length > 0
            ? `${currentTurn}-${gameState.dice.join(',')}`
            : `${currentTurn}-no-dice`;

        // Logs détaillés pour diagnostiquer
        const addLog = useDebugStore.getState().addLog;
        addLog('🤖 Bot: Checking turn...', 'info', {
            currentTurn,
            myId,
            isBotTurn,
            botIsThinking: botIsThinking.current,
            analysisInProgress: botAnalysisInProgress.current,
            analysisKey,
            players: players?.map(p => ({ id: p.id, username: p.username }))
        });

        // Vérifier si une analyse est déjà en cours pour cette position exacte
        if (isBotTurn && !botIsThinking.current && botAnalysisInProgress.current !== analysisKey) {
            // Clear any existing timeout
            if (botTimeoutRef.current) {
                clearTimeout(botTimeoutRef.current);
                botTimeoutRef.current = null;
            }

            // Safety timeout: débloquer le bot après 45 secondes (plus long que le timeout API de 30s)
            botTimeoutRef.current = setTimeout(() => {
                addLog('🤖 Bot: TIMEOUT - Forcing unlock after 45s', 'error');
                botIsThinking.current = false;
                botAnalysisInProgress.current = null;
                if (botTimeoutRef.current) {
                    clearTimeout(botTimeoutRef.current);
                    botTimeoutRef.current = null;
                }
            }, 45000);
            const performBotMove = async () => {
                botIsThinking.current = true;
                botAnalysisInProgress.current = analysisKey; // Marquer cette analyse comme en cours
                const addLog = useDebugStore.getState().addLog;

                // 0. Check if Bot needs to respond to a double offer
                if (gameState.pendingDouble && gameState.pendingDouble.offeredBy !== 'bot') {
                    addLog('🤖 Bot: Évaluation de la proposition de double...', 'info');
                    await new Promise(r => setTimeout(r, 1500));

                    try {
                        // Analyser la position pour décider
                        const analysis = await analyzeMove(gameState, gameState.dice.length > 0 ? gameState.dice : [1, 1], 2);

                        // Import dynamique pour éviter les dépendances circulaires
                        const { shouldBotAcceptDouble } = await import('../lib/botDoublingLogic');

                        const shouldAccept = shouldBotAcceptDouble(
                            analysis.winProbability / 100, // Convertir en 0-1
                            analysis.equity || 0,
                            gameState.cubeValue,
                            undefined,
                            gameState.matchLength || 0
                        );

                        if (shouldAccept) {
                            addLog(`🤖 Bot: J'accepte ! (${analysis.winProbability.toFixed(1)}% de chances)`, 'success');
                            await new Promise(r => setTimeout(r, 800));

                            // Accepter le double
                            const botId = 'bot';
                            const newState = {
                                ...gameState,
                                cubeValue: gameState.cubeValue * 2,
                                cubeOwner: botId,
                                pendingDouble: null
                            };
                            updateGame(newState);

                            if (!DEMO_MODE && currentRoom && currentRoom.id !== 'offline-bot') {
                                await supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
                            }
                        } else {
                            addLog(`🤖 Bot: J'abandonne. (${analysis.winProbability.toFixed(1)}% de chances, trop faible)`, 'error');
                            await new Promise(r => setTimeout(r, 800));

                            // Refuser = Abandonner, l'adversaire gagne
                            const pointsWon = gameState.cubeValue;
                            const newScore = { ...gameState.score };
                            newScore[gameState.pendingDouble.offeredBy] = (newScore[gameState.pendingDouble.offeredBy] || 0) + pointsWon;

                            const newState = {
                                ...gameState,
                                score: newScore,
                                pendingDouble: null,
                                dice: [],
                                turn: gameState.pendingDouble.offeredBy
                            };
                            updateGame(newState);

                            if (!DEMO_MODE && currentRoom && currentRoom.id !== 'offline-bot') {
                                await supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
                            }
                        }
                    } catch (e) {
                        addLog('🤖 Bot: Erreur évaluation double, j\'accepte par défaut', 'error', e);
                        // Par défaut, accepter pour ne pas bloquer le jeu
                        const botId = 'bot';
                        const newState = {
                            ...gameState,
                            cubeValue: gameState.cubeValue * 2,
                            cubeOwner: botId,
                            pendingDouble: null
                        };
                        updateGame(newState);
                    }

                    botIsThinking.current = false;
                    return;
                }

                // 1. Consider doubling BEFORE rolling dice (if dice not rolled yet)
                if (gameState.dice.length === 0 && !gameState.pendingDouble) {
                    // Check if bot can double
                    const { canOfferDouble } = await import('../lib/gameLogic');
                    const botId = 'bot';

                    const canDouble = canOfferDouble(
                        gameState.cubeValue,
                        gameState.cubeOwner,
                        botId,
                        false, // Pas encore lancé les dés
                        gameState.matchLength || 0
                    );

                    if (canDouble) {
                        // Analyser la position pour décider
                        try {
                            const analysis = await analyzeMove(gameState, [1, 1], 2); // Dés fictifs pour l'analyse
                            const { shouldBotDouble } = await import('../lib/botDoublingLogic');

                            const shouldDouble = shouldBotDouble(
                                analysis.winProbability / 100,
                                analysis.equity || 0,
                                gameState.cubeValue,
                                undefined,
                                gameState.matchLength || 0
                            );

                            if (shouldDouble) {
                                addLog(`🤖 Bot: Je propose de doubler ! (${analysis.winProbability.toFixed(1)}% de chances)`, 'info');
                                await new Promise(r => setTimeout(r, 1200));

                                const newState = {
                                    ...gameState,
                                    pendingDouble: {
                                        offeredBy: botId,
                                        timestamp: Date.now()
                                    }
                                };
                                updateGame(newState);

                                if (!DEMO_MODE && currentRoom && currentRoom.id !== 'offline-bot') {
                                    await supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
                                }

                                botIsThinking.current = false;
                                botAnalysisInProgress.current = null;
                                return; // Attendre la réponse du joueur
                            }
                        } catch (e) {
                            addLog('🤖 Bot: Erreur évaluation pour doubler', 'error', e);
                            // Continuer normalement
                        }
                    }
                }

                // 2. Roll Dice if needed
                if (gameState.dice.length === 0) {
                    addLog('🤖 Bot: Rolling dice...', 'info');
                    await new Promise(r => setTimeout(r, 1000));
                    sendGameAction('rollDice', {}, 2); // Force Player 2 (Black)
                    // Clear timeout on success
                    if (botTimeoutRef.current) {
                        clearTimeout(botTimeoutRef.current);
                        botTimeoutRef.current = null;
                    }
                    botIsThinking.current = false;
                    botAnalysisInProgress.current = null;
                    return;
                }

                // 2. Analyze and Move
                addLog('🤖 Bot: Analyzing position...', 'info', {
                    dice: gameState.dice,
                    diceCount: gameState.dice.length
                });

                try {
                    // L'API a son propre timeout de 30s avec retry, pas besoin de timeout supplémentaire ici
                    const analysis = await analyzeMove(gameState, gameState.dice, 2);

                    if (analysis.bestMove && analysis.bestMove.length > 0) {
                        addLog(`🤖 Bot: Found ${analysis.bestMove.length} move(s)`, 'success', {
                            moves: analysis.bestMove.map((m: any) => `${m.from}→${m.to}`)
                        });

                        // Play ALL moves in the sequence, en attendant la confirmation de chaque coup
                        for (let i = 0; i < analysis.bestMove.length; i++) {
                            const move = analysis.bestMove[i];
                            addLog(`🤖 Bot: Playing move ${i + 1}/${analysis.bestMove.length}: ${move.from} -> ${move.to}`, 'info', {
                                move: { from: move.from, to: move.to, die: move.die },
                                availableDice: gameState.dice
                            });

                            // Attendre un peu avant chaque coup pour la visualisation
                            await new Promise(r => setTimeout(r, 800));

                            // Envoyer le coup avec le die fourni par l'API
                            // IMPORTANT: On passe 'die' explicitement dans le payload
                            sendGameAction('move', {
                                from: move.from,
                                to: move.to,
                                die: move.die
                            }, 2);

                            // Attendre que le state se mette à jour avant le prochain coup
                            // On attend un peu plus pour les doubles
                            const waitTime = analysis.bestMove.length > 2 ? 1200 : 1000;
                            await new Promise(r => setTimeout(r, waitTime));

                            // Vérifier que le coup a été appliqué (dice devrait diminuer)
                            // Si on a encore des dés et qu'on n'est pas au dernier coup, continuer
                            if (i < analysis.bestMove.length - 1) {
                                // Attendre un peu plus pour la synchronisation
                                await new Promise(r => setTimeout(r, 500));
                            }
                        }

                        addLog('🤖 Bot: All moves completed', 'success');
                    } else {
                        addLog('🤖 Bot: No moves found or turn done.', 'warning');
                        // Force turn switch if no moves possible
                        await new Promise(r => setTimeout(r, 2000));

                        // Clear dice to force turn switch in the next render cycle
                        const newState = { ...gameState, dice: [] };
                        updateGame(newState);

                        // Also update DB to ensure sync (SKIP for offline-bot)
                        if (!DEMO_MODE && currentRoom && currentRoom.id !== 'offline-bot') {
                            supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
                        }
                    }
                } catch (e: any) {
                    addLog('🤖 Bot: API Error, using fallback', 'error', e);

                    // FALLBACK: Utiliser une logique heuristique améliorée
                    // FALLBACK: Utiliser une logique heuristique améliorée
                    try {
                        const { findAnyValidMove } = await import('../lib/gameLogic');

                        // Essayer de trouver un coup valide
                        const validMove = findAnyValidMove(gameState.board, 2, gameState.dice);

                        if (validMove) {
                            addLog(`🤖 Bot: Fallback move found: ${validMove.from} -> ${validMove.to} (dé: ${validMove.dieUsed || 'N/A'})`, 'warning');
                            await new Promise(r => setTimeout(r, 1000));
                            sendGameAction('move', { from: validMove.from, to: validMove.to, die: validMove.dieUsed }, 2);
                        } else {
                            addLog('🤖 Bot: No fallback move available, switching turn', 'error');
                            // Switch turn if no moves possible
                            await new Promise(r => setTimeout(r, 2000));
                            const newState = { ...gameState, dice: [] };
                            updateGame(newState);

                            if (!DEMO_MODE && currentRoom && currentRoom.id !== 'offline-bot') {
                                supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
                            }
                        }
                    } catch (fallbackError) {
                        addLog('🤖 Bot: Fallback also failed, switching turn', 'error', fallbackError);
                        // Last resort: switch turn
                        await new Promise(r => setTimeout(r, 2000));
                        const newState = { ...gameState, dice: [] };
                        updateGame(newState);

                        if (!DEMO_MODE && currentRoom && currentRoom.id !== 'offline-bot') {
                            supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
                        }
                    }
                }

                // Clear timeout on success
                if (botTimeoutRef.current) {
                    clearTimeout(botTimeoutRef.current);
                    botTimeoutRef.current = null;
                }
                botIsThinking.current = false;
                botAnalysisInProgress.current = null; // Libérer le verrou
            };
            performBotMove();
        } else if (isBotTurn && botAnalysisInProgress.current === analysisKey) {
            // Une analyse est déjà en cours pour cette position, ne rien faire
            const addLog = useDebugStore.getState().addLog;
            addLog('🤖 Bot: Analysis already in progress, skipping duplicate call', 'info', { analysisKey });
        }

        // Cleanup function
        return () => {
            if (botTimeoutRef.current) {
                clearTimeout(botTimeoutRef.current);
                botTimeoutRef.current = null;
            }
        };
    }, [gameState, currentRoom, user, sendGameAction, players, updateGame]);

    const handleCheckerClick = useCallback((index: number) => {
        if (!gameState || !user) return;

        // Déterminer la couleur du joueur (même logique)
        let playerColor = 1;
        if (players && players.length > 0) {
            if (players[0]?.id === user.id) playerColor = 1;
            else if (players[1]?.id === user.id) playerColor = 2;
        }

        const point = gameState.board.points[index];
        if (point.player !== playerColor || point.count === 0) return;

        const smartMove = getSmartMove(gameState.board, playerColor as PlayerColor, index, gameState.dice);
        if (smartMove) {
            setHistory(prev => [...prev, JSON.parse(JSON.stringify(gameState))]);
            const newBoard = makeMove(gameState.board, playerColor as PlayerColor, index, smartMove.to);
            const newDice = [...gameState.dice];
            const dieIndex = newDice.indexOf(smartMove.dieUsed);
            if (dieIndex > -1) newDice.splice(dieIndex, 1);

            const newState = { ...gameState, board: newBoard, dice: newDice };
            updateGame(newState);

            if (!DEMO_MODE && currentRoom) {
                supabase.from('games').update({ board_state: newState }).eq('room_id', currentRoom.id);
            }
        }
    }, [gameState, user, updateGame, currentRoom, players]);

    const playVsBot = useCallback(async () => {
        const addLog = useDebugStore.getState().addLog;
        addLog('Creating training room...', 'info');

        try {
            const { data, error } = await supabase
                .from('rooms')
                .insert({
                    name: `Entraînement ${user?.username || 'Solo'}`,
                    created_by: user?.id,
                    status: 'playing'
                })
                .select()
                .single();

            if (error) {
                addLog('Error creating training room', 'error', error);
                return null;
            }

            if (data) {
                addLog('Training room created', 'success', { roomId: data.id });
                return data.id;
            }
        } catch (err) {
            addLog('Exception creating training room', 'error', err);
            return null;
        }

        return null;
    }, [user]);

    return {
        socket: null,
        isConnected,
        rooms: roomsList,
        currentRoom,
        gameState,
        createRoom,
        joinRoom,
        leaveRoom,
        sendGameAction,
        sendMessage,
        playVsBot,
        handleCheckerClick,
        undoMove,
        canUndo: history.length > 0
    };
};

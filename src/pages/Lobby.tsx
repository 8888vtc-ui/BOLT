import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trophy, LogOut, Swords, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useGameStore } from '../stores/gameStore';
import { supabase } from '../lib/supabase';

const Lobby = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { roomsList, setRoomsList } = useGameStore();
    const [isSearching, setIsSearching] = useState(false);
    const [queueTime, setQueueTime] = useState(0);

    // Fetch active rooms
    useEffect(() => {
        const fetchRooms = async () => {
            const { data } = await supabase
                .from('rooms')
                .select('*, profiles:created_by(username, avatar_url)')
                .eq('status', 'waiting')
                .order('created_at', { ascending: false });

            if (data) {
                setRoomsList(data.map(r => ({ ...r, players: [] })));
            }
        };

        fetchRooms();

        // Subscribe to room updates
        const channel = supabase.channel('lobby_rooms')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () => {
                fetchRooms();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [setRoomsList]);

    // Matchmaking Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSearching) {
            interval = setInterval(() => setQueueTime(t => t + 1), 1000);
        } else {
            setQueueTime(0);
        }
        return () => clearInterval(interval);
    }, [isSearching]);

    const handleFindMatch = async () => {
        if (!user) return;
        setIsSearching(true);

        try {
            const { data, error } = await supabase.rpc('find_match', { p_user_id: user.id });

            if (error) throw error;

            const result = data[0];

            if (result && result.room_id) {
                setIsSearching(false);
                navigate(`/game/${result.room_id}`);
            } else {
                const pollInterval = setInterval(async () => {
                    const { data: myRooms } = await supabase
                        .from('room_participants')
                        .select('room_id')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(1);

                    if (myRooms && myRooms.length > 0) {
                        clearInterval(pollInterval);
                        setIsSearching(false);
                        navigate(`/game/${myRooms[0].room_id}`);
                    }
                }, 3000);
            }

        } catch (err) {
            console.error('Matchmaking error:', err);
            setIsSearching(false);
            alert('Erreur lors de la recherche de partie.');
        }
    };

    const handleCancelSearch = async () => {
        if (!user) return;
        setIsSearching(false);
        await supabase.from('matchmaking_queue').delete().eq('user_id', user.id);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
            {/* Header */}
            <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#111]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FFD700] rounded-lg flex items-center justify-center text-black font-black text-xl">
                        G
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">GuruGammon</h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} className="w-full h-full object-cover" alt="avatar" />
                            ) : (
                                user?.username?.substring(0, 2).toUpperCase()
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold">{user?.username}</span>
                            <span className="text-[10px] text-[#FFD700] flex items-center gap-1">
                                <Trophy className="w-3 h-3" /> 1200 ELO
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Actions */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Section / Matchmaking */}
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-8 border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#FFD700]/10 transition-all duration-700" />

                        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Swords className="w-8 h-8 text-[#FFD700]" />
                            Partie Classée
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-md">
                            Affrontez des joueurs du monde entier, montez dans le classement et devenez le Guru du Backgammon.
                        </p>

                        {isSearching ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-6">
                                <div className="relative">
                                    <div className="w-24 h-24 border-4 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xl">
                                        {formatTime(queueTime)}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-white mb-1">Recherche d'adversaire...</h3>
                                    <p className="text-gray-500 text-sm">Estimation: 0:30</p>
                                </div>
                                <button
                                    onClick={handleCancelSearch}
                                    className="px-6 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold"
                                >
                                    Annuler
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleFindMatch}
                                className="w-full sm:w-auto px-12 py-5 bg-[#FFD700] hover:bg-[#FDB931] text-black font-black text-xl rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.2)] hover:shadow-[0_0_50px_rgba(255,215,0,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-3"
                            >
                                <Search className="w-6 h-6" />
                                TROUVER UNE PARTIE
                            </button>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-6 bg-[#111] hover:bg-[#161616] border border-white/5 hover:border-white/10 rounded-2xl transition-all text-left group">
                            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-1">Jouer avec un ami</h3>
                            <p className="text-sm text-gray-500">Créez une salle privée et invitez un ami.</p>
                        </button>

                        <button
                            onClick={async () => {
                                // Créer une salle d'entraînement rapide
                                const { data, error } = await supabase
                                    .from('rooms')
                                    .insert({
                                        name: `Entraînement ${user?.username}`,
                                        created_by: user?.id,
                                        status: 'playing', // Directement en jeu
                                        is_public: false
                                    })
                                    .select()
                                    .single();

                                if (data) {
                                    navigate(`/game/${data.id}`);
                                }
                            }}
                            className="p-6 bg-[#111] hover:bg-[#161616] border border-white/5 hover:border-white/10 rounded-2xl transition-all text-left group"
                        >
                            <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Swords className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-1">Entraînement Solo</h3>
                            <p className="text-sm text-gray-500">Testez le Coach IA sans pression.</p>
                        </button>

                        <button className="p-6 bg-[#111] hover:bg-[#161616] border border-white/5 hover:border-white/10 rounded-2xl transition-all text-left group opacity-50 cursor-not-allowed">
                            <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-4">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-1">Tournois</h3>
                            <p className="text-sm text-gray-500">Bientôt disponible.</p>
                        </button>
                    </div>
                </div>

                {/* Right Column: Active Rooms / Leaderboard */}
                <div className="bg-[#111] rounded-3xl border border-white/10 p-6 flex flex-col">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Salles en attente
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {roomsList.length === 0 ? (
                            <div className="text-center py-12 text-gray-600">
                                Aucune salle publique en attente.
                                <br />
                                Créez-en une !
                            </div>
                        ) : (
                            roomsList.map(room => (
                                <div key={room.id} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors flex items-center justify-between group">
                                    <div>
                                        <div className="font-bold text-sm mb-1">{room.name}</div>
                                        <div className="text-xs text-gray-500">Par {room.profiles?.username || 'Anonyme'}</div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/game/${room.id}`)}
                                        className="px-4 py-2 rounded-lg bg-[#FFD700]/10 text-[#FFD700] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FFD700] hover:text-black"
                                    >
                                        REJOINDRE
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Lobby;

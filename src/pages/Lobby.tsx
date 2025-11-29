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
                    {/* Hero Section / Bot Mode (Now the Main Focus) */}
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-8 border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/10 transition-all duration-700" />

                        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            <Swords className="w-8 h-8 text-green-500" />
                            Jouer contre le Guru
                        </h2>
                        <p className="text-gray-400 mb-8 max-w-md">
                            Affrontez notre IA Superhumaine avec son Avatar Coach. C'est l'expérience ultime pour progresser.
                        </p>

                        <button
                            onClick={async () => {
                                if (!user) {
                                    alert("Vous devez être connecté pour jouer.");
                                    return;
                                }
                                try {
                                    const { data, error } = await supabase
                                        .from('rooms')
                                        .insert({
                                            name: `Dojo ${user.username}`,
                                            created_by: user.id,
                                            status: 'playing'
                                        })
                                        .select()
                                        .single();

                                    if (error) {
                                        console.error("Erreur création salle:", error);
                                        alert(`Erreur lors de la création de la salle: ${error.message}`);
                                        return;
                                    }
                                    if (data) navigate(`/game/${data.id}`);
                                } catch (err) {
                                    console.error("Exception création salle:", err);
                                    alert("Une erreur inattendue est survenue.");
                                }
                            }}
                            className="w-full sm:w-auto px-12 py-5 bg-green-500 hover:bg-green-400 text-black font-black text-xl rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.2)] hover:shadow-[0_0_50px_rgba(34,197,94,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-3"
                        >
                            <Swords className="w-6 h-6" />
                            DÉFIER LE BOT
                        </button>
                    </div>

                    {/* Other Modes (Disabled / Coming Soon) */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-6 bg-[#111] border border-white/5 rounded-2xl text-left group opacity-50 cursor-not-allowed relative overflow-hidden">
                            <div className="absolute top-2 right-2 bg-[#FFD700] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                                BIENTÔT
                            </div>
                            <div className="w-12 h-12 bg-[#FFD700]/10 text-[#FFD700] rounded-xl flex items-center justify-center mb-4">
                                <Search className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-1">Partie Classée</h3>
                            <p className="text-sm text-gray-500">Matchmaking mondial.</p>
                        </button>

                        <button className="p-6 bg-[#111] border border-white/5 rounded-2xl text-left group opacity-50 cursor-not-allowed relative overflow-hidden">
                            <div className="absolute top-2 right-2 bg-[#FFD700] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                                BIENTÔT
                            </div>
                            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center mb-4">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-1">Jouer avec un ami</h3>
                            <p className="text-sm text-gray-500">Salles privées.</p>
                        </button>

                        <button className="p-6 bg-[#111] border border-white/5 rounded-2xl text-left group opacity-50 cursor-not-allowed relative overflow-hidden col-span-2">
                            <div className="absolute top-2 right-2 bg-[#FFD700] text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                                BIENTÔT
                            </div>
                            <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-4">
                                <Trophy className="w-6 h-6" />
                            </div>
                            <h3 className="font-bold text-lg mb-1">Tournois</h3>
                            <p className="text-sm text-gray-500">Compétitions officielles.</p>
                        </button>
                    </div>
                </div>

                {/* Right Column: Active Rooms (Disabled / Coming Soon) */}
                <div className="bg-[#111] rounded-3xl border border-white/10 p-6 flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
                        <div className="w-16 h-16 bg-[#FFD700]/10 rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-[#FFD700]" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Lobby Multijoueur</h3>
                        <p className="text-gray-400 text-sm">
                            Le lobby public ouvrira ses portes très prochainement. Préparez-vous !
                        </p>
                        <span className="mt-4 px-4 py-1 bg-[#FFD700] text-black text-xs font-bold rounded-full">
                            COMING SOON
                        </span>
                    </div>

                    <h3 className="font-bold text-lg mb-6 flex items-center gap-2 opacity-30">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        Salles en attente
                    </h3>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar opacity-30 pointer-events-none">
                        {/* Fake content for visual background */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <div>
                                <div className="font-bold text-sm mb-1">Salle #124</div>
                                <div className="text-xs text-gray-500">Par Player1</div>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <div>
                                <div className="font-bold text-sm mb-1">Salle #125</div>
                                <div className="text-xs text-gray-500">Par Player2</div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Lobby;

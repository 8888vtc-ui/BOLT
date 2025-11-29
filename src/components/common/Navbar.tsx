import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, Users, BarChart3, LogOut, Dices } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
    const location = useLocation();
    const { user, logout } = useAuth();

    const navItems = [
        { path: '/dashboard', icon: Home, label: 'Dashboard' },
        { path: '/lobby', icon: Users, label: 'Lobby' },
        { path: '/tournaments', icon: Trophy, label: 'Tournois' },
        { path: '/leaderboard', icon: BarChart3, label: 'Classement' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="h-16 bg-[#111] border-b border-white/10 px-6 flex items-center justify-between shrink-0 z-50 sticky top-0">
            <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2 text-[#FFD700] hover:text-white transition-colors">
                    <Dices className="w-8 h-8" />
                    <span className="text-xl font-black tracking-tight">GuruGammon</span>
                </Link>

                <div className="flex items-center gap-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isActive(item.path)
                                    ? 'bg-[#FFD700] text-black'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {user && (
                    <>
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-lg border border-white/10">
                            {user.avatar && (
                                <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
                            )}
                            <span className="text-white font-medium">{user.username}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Déconnexion
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

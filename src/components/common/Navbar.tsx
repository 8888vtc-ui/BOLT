import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Dices, ChevronDown, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { MAIN_MENU, USER_MENU } from '../../config/menu';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isActive = (path?: string) => path && location.pathname.startsWith(path);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <nav className="h-16 bg-[#111] border-b border-white/10 px-6 flex items-center justify-between shrink-0 z-50 sticky top-0">
            <div className="flex items-center gap-8">
                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-400 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>

                <Link to="/dashboard" className="flex items-center gap-2 text-[#FFD700] hover:text-white transition-colors">
                    <Dices className="w-8 h-8" />
                    <span className="text-xl font-black tracking-tight hidden sm:block">GuruGammon</span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-1">
                    {MAIN_MENU.map((item) => (
                        <Link
                            key={item.id}
                            to={item.route || '#'}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isActive(item.route)
                                ? 'bg-[#FFD700] text-black'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {item.icon && <item.icon className="w-4 h-4" />}
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {user ? (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all group"
                        >
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FFD700] to-[#B8860B] flex items-center justify-center text-black font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-white font-medium max-w-[100px] truncate hidden sm:block">
                                {user.username}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Desktop Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                                <div className="px-4 py-3 border-b border-white/5">
                                    <p className="text-sm text-white font-bold">{user.username}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email || 'Invité'}</p>
                                </div>

                                <div className="py-1">
                                    {USER_MENU.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                if (item.action === 'logout') {
                                                    logout();
                                                } else if (item.route) {
                                                    navigate(item.route);
                                                }
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${item.action === 'logout'
                                                ? 'text-red-400 hover:bg-red-500/10'
                                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            {item.icon && <item.icon className="w-4 h-4" />}
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="text-sm font-bold text-[#FFD700] hover:underline">
                        Se connecter
                    </Link>
                )}
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 top-16 bg-[#050505] z-40 md:hidden flex flex-col p-4 animate-in slide-in-from-left duration-200">
                    <div className="space-y-2">
                        {MAIN_MENU.map((item) => (
                            <Link
                                key={item.id}
                                to={item.route || '#'}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-lg transition-all ${isActive(item.route)
                                    ? 'bg-[#FFD700] text-black'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {item.icon && <item.icon className="w-5 h-5" />}
                                {item.label}
                            </Link>
                        ))}

                        <div className="h-px bg-white/10 my-4" />

                        {USER_MENU.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.action === 'logout') {
                                        logout();
                                    } else if (item.route) {
                                        navigate(item.route);
                                    }
                                }}
                                className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-lg transition-all ${item.action === 'logout'
                                    ? 'text-red-500 hover:bg-red-500/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {item.icon && <item.icon className="w-5 h-5" />}
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}

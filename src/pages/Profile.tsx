import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Save, Check, X, Edit2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../components/common/Toast';
import { showSuccess, showError } from '../lib/notifications';

const Profile = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isSetupMode = searchParams.get('setup') === 'username';
    const { user, updateUsername } = useAuth();
    const [username, setUsername] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.username) {
            setUsername(user.username);
            // Si en mode setup et qu'un pseudo existe déjà, sortir du mode setup
            if (isSetupMode && user.username && user.username !== 'Joueur') {
                navigate('/lobby');
            }
        } else if (isSetupMode) {
            // Mode setup : activer l'édition automatiquement
            setIsEditing(true);
        }
    }, [user, isSetupMode, navigate]);

    const validateUsername = (value: string): string | null => {
        if (value.length < 3) {
            return 'Username must be at least 3 characters';
        }
        if (value.length > 20) {
            return 'Username must be at most 20 characters';
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
            return 'Username can only contain letters, numbers, underscores, and hyphens';
        }
        return null;
    };

    const handleSave = async () => {
        const validationError = validateUsername(username);
        if (validationError) {
            setError(validationError);
            return;
        }

        if (username === user?.username) {
            setIsEditing(false);
            return;
        }

        setIsSaving(true);
        setError('');

        try {
            const result = await updateUsername(username);
            if (result.error) {
                setError(result.error);
                showError(result.error);
            } else {
                setIsEditing(false);
                showSuccess('Pseudo mis à jour avec succès !');
                
                // Si en mode setup, rediriger vers le lobby
                if (isSetupMode) {
                    setTimeout(() => {
                        navigate('/lobby');
                    }, 1000);
                }
            }
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to update username';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setUsername(user?.username || '');
        setError('');
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FDB931]">
                        {isSetupMode ? 'Choisissez votre pseudo' : 'Profile'}
                    </h1>
                    <p className="text-gray-400">
                        {isSetupMode ? 'Créez votre pseudo pour commencer à jouer' : 'Manage your account settings'}
                    </p>
                </motion.div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl"
                >
                    {/* Avatar Section */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                        <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FDB931] flex items-center justify-center overflow-hidden border-4 border-[#FFD700]/30">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 md:w-16 md:h-16 text-black" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-[#1a1a1a] flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">{user?.username || 'Guest'}</h2>
                            <p className="text-gray-400 mb-1">{user?.email || 'No email'}</p>
                            <span className="inline-block px-3 py-1 bg-[#FFD700]/10 text-[#FFD700] text-xs font-bold rounded-full">
                                {user?.role === 'guest' ? 'Guest' : 'Member'}
                            </span>
                        </div>
                    </div>

                    {/* Username Section */}
                    <div className="border-t border-white/10 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold mb-1">Username</h3>
                                <p className="text-sm text-gray-400">Your display name in games and leaderboards</p>
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-5 h-5 text-[#FFD700]" />
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            setError('');
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSave();
                                            if (e.key === 'Escape') handleCancel();
                                        }}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all"
                                        placeholder="Enter username"
                                        autoFocus
                                        disabled={isSaving}
                                    />
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-400 text-sm mt-2 flex items-center gap-2"
                                        >
                                            <X className="w-4 h-4" />
                                            {error}
                                        </motion.p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-2">
                                        3-20 characters, letters, numbers, underscores, and hyphens only
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || !username.trim()}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FFD700]/20"
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                Save
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-black/40 border border-white/5 rounded-xl px-4 py-3">
                                <p className="text-lg font-mono text-[#FFD700]">{user?.username || 'No username'}</p>
                            </div>
                        )}
                    </div>

                    {/* Additional Info */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <h3 className="text-lg font-bold mb-4">Account Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                                <p className="text-xs text-gray-400 mb-1">User ID</p>
                                <p className="text-sm font-mono text-gray-300 truncate">{user?.id || 'N/A'}</p>
                            </div>
                            <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                                <p className="text-xs text-gray-400 mb-1">Account Type</p>
                                <p className="text-sm font-bold text-[#FFD700]">
                                    {user?.role === 'guest' ? 'Guest Account' : 'Full Account'}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;

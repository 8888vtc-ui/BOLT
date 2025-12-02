import { motion } from 'framer-motion';
import { Trophy, Users, Search, BarChart3, Award, Calendar, MapPin, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: Trophy,
            title: 'Ranked Matches',
            description: 'Global matchmaking with ELO rating system. Climb the leaderboard and prove your skills.',
            color: 'from-yellow-500 to-orange-500',
            date: 'Q2 2024'
        },
        {
            icon: Users,
            title: 'Play with Friends',
            description: 'Create private rooms, invite friends, and play together. Share your games and analyze together.',
            color: 'from-blue-500 to-cyan-500',
            date: 'Q2 2024'
        },
        {
            icon: Calendar,
            title: 'Official Tournaments',
            description: 'Compete in official tournaments with prizes. Monthly championships and special events.',
            color: 'from-purple-500 to-pink-500',
            date: 'Q3 2024'
        },
        {
            icon: BarChart3,
            title: 'Global Leaderboard',
            description: 'See where you rank worldwide. Track your progress, statistics, and achievements.',
            color: 'from-green-500 to-emerald-500',
            date: 'Q2 2024'
        },
        {
            icon: MapPin,
            title: 'Club Finder',
            description: 'Find backgammon clubs near you. Connect with local players and join communities.',
            color: 'from-red-500 to-rose-500',
            date: 'Q3 2024'
        },
        {
            icon: BarChart3,
            title: 'Advanced Analytics',
            description: 'Detailed game analysis, move-by-move breakdowns, and personalized improvement suggestions.',
            color: 'from-indigo-500 to-blue-500',
            date: 'Q3 2024'
        },
        {
            icon: Users,
            title: 'Multiplayer Lobby',
            description: 'Public lobby with active rooms. Join games instantly or create your own room.',
            color: 'from-teal-500 to-cyan-500',
            date: 'Q2 2024'
        },
        {
            icon: Award,
            title: 'Achievements & Trophies',
            description: 'Unlock achievements, earn trophies, and showcase your accomplishments.',
            color: 'from-amber-500 to-yellow-500',
            date: 'Q3 2024'
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 via-transparent to-[#8B0000]/10" />
                
                <div className="relative z-10 container mx-auto px-4 py-16 md:py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="inline-block mb-6"
                        >
                            <div className="px-6 py-2 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full">
                                <span className="text-[#FFD700] font-bold text-sm">COMING SOON</span>
                            </div>
                        </motion.div>
                        
                        <h1 className="text-5xl md:text-7xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FDB931]">
                            Exciting Features Ahead
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
                            We're working hard to bring you the ultimate backgammon experience. Here's what's coming next.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="container mx-auto px-4 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 hover:border-[#FFD700]/30 transition-all group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity`} />
                                
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 relative z-10`}>
                                    <Icon className="w-7 h-7 text-white" />
                                </div>
                                
                                <h3 className="text-xl font-bold mb-2 relative z-10">{feature.title}</h3>
                                <p className="text-gray-400 text-sm mb-4 relative z-10">{feature.description}</p>
                                
                                <div className="flex items-center justify-between relative z-10">
                                    <span className="text-xs text-[#FFD700] font-bold">{feature.date}</span>
                                    <div className="px-2 py-1 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full">
                                        <span className="text-[10px] text-[#FFD700] font-bold">SOON</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-4 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gradient-to-br from-[#FFD700]/10 to-[#FDB931]/10 border border-[#FFD700]/30 rounded-3xl p-8 md:p-12 text-center"
                >
                    <Zap className="w-16 h-16 text-[#FFD700] mx-auto mb-6" />
                    <h2 className="text-3xl md:text-4xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FDB931]">
                        Stay Updated
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                        Be the first to know when these features launch. Add this page to your favorites!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/lobby')}
                            className="px-8 py-4 bg-[#FFD700] hover:bg-[#FFC700] text-black font-bold rounded-xl transition-all shadow-lg shadow-[#FFD700]/20"
                        >
                            Play Now
                        </button>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ComingSoon;


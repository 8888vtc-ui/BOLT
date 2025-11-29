import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { useGameStore, ChatMessage } from '../../stores/gameStore';
import { useGameSocket } from '../../hooks/useGameSocket';

const ChatBox = () => {
    const { messages, currentUser } = useGameStore();
    const { sendMessage } = useGameSocket();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            sendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#111] border-l border-white/10 relative overflow-hidden">
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 bg-[#FFD700]/10 rounded-full flex items-center justify-center mb-3">
                    <Send className="w-6 h-6 text-[#FFD700]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Chat Global</h3>
                <p className="text-gray-400 text-xs mb-4">
                    Discutez avec les autres joueurs et le Guru. Bientôt disponible.
                </p>
                <span className="px-3 py-1 bg-[#FFD700] text-black text-[10px] font-bold rounded-full">
                    COMING SOON
                </span>
            </div>

            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-[#0a0a0a] opacity-30">
                <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold">Chat en direct</h3>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent opacity-30 pointer-events-none">
                <AnimatePresence initial={false}>
                    {messages.map((msg, index) => {
                        const isMe = msg.userId === currentUser?.id;
                        return (
                            <motion.div
                                key={index} // Idéalement utiliser msg.id
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className={`text-xs font-bold ${isMe ? 'text-[#FFD700]' : 'text-gray-400'}`}>
                                        {msg.username}
                                    </span>
                                    <span className="text-[10px] text-gray-600">
                                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div
                                    className={`px-3 py-2 rounded-xl text-sm max-w-[90%] break-words shadow-sm ${isMe
                                        ? 'bg-[#FFD700] text-black rounded-tr-none font-medium'
                                        : 'bg-white/10 text-gray-200 rounded-tl-none'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 bg-[#0a0a0a] border-t border-white/10 opacity-30 pointer-events-none">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Envoyer un message..."
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700]/50 focus:ring-1 focus:ring-[#FFD700]/50 transition-all placeholder-gray-600"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#FFD700] disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatBox;

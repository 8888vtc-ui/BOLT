import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Loader2 } from 'lucide-react';
import { useGameStore, ChatMessage } from '../../stores/gameStore';
import { useGameSocket } from '../../hooks/useGameSocket';
import { askDeepSeekCoach, GameContext } from '../../lib/deepseekService';

const ChatBox = () => {
    const { messages, currentUser, currentRoom, gameState } = useGameStore();
    const { sendMessage } = useGameSocket();
    const [input, setInput] = useState('');
    const [isCoachLoading, setIsCoachLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Check if this is an official tournament (bot disabled)
    const isTournament = currentRoom?.id?.includes('tournament') || (currentRoom as any)?.tournament_id;
    const isCoachEnabled = !isTournament;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setInput('');

        // Send user message
        sendMessage(userMessage);

        // If coach is enabled, get AI response
        if (isCoachEnabled) {
            setIsCoachLoading(true);

            try {
                // Build game context
                const gameContext: GameContext = {
                    board: gameState?.board,
                    dice: gameState?.dice,
                    cubeValue: gameState?.cubeValue,
                    cubeOwner: gameState?.cubeOwner,
                    matchLength: gameState?.matchLength,
                    score: gameState?.score
                };

                // Get AI coach response
                const coachResponse = await askDeepSeekCoach(userMessage, gameContext, 'game');

                // Add bot message to chat
                const botMessage: ChatMessage = {
                    id: `bot-${Date.now()}`,
                    userId: 'ai-coach',
                    username: '🤖 AI Coach',
                    text: coachResponse,
                    timestamp: Date.now()
                };

                // Add to messages (would need addMessage from store)
                const { addMessage } = useGameStore.getState();
                addMessage(botMessage);
            } catch (error) {
                console.error('Error getting coach response:', error);
                const errorMessage: ChatMessage = {
                    id: `bot-error-${Date.now()}`,
                    userId: 'ai-coach',
                    username: '🤖 AI Coach',
                    text: 'Sorry, I encountered an error. Please try again.',
                    timestamp: Date.now()
                };
                const { addMessage } = useGameStore.getState();
                addMessage(errorMessage);
            } finally {
                setIsCoachLoading(false);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#111] border-l border-white/10 relative overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-[#0a0a0a]">
                <div className="flex items-center justify-between">
                    <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold">Chat</h3>
                    {isCoachEnabled && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-full">
                            <Bot className="w-3 h-3 text-[#FFD700]" />
                            <span className="text-[10px] text-[#FFD700] font-bold">AI Coach</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <AnimatePresence initial={false}>
                    {messages.map((msg, index) => {
                        const isMe = msg.userId === currentUser?.id;
                        const isBot = msg.userId === 'ai-coach';
                        const isSystem = msg.type === 'system';

                        if (isSystem) {
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-center my-2"
                                >
                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                        {msg.text}
                                    </span>
                                </motion.div>
                            );
                        }

                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className={`text-xs font-bold ${isMe ? 'text-[#FFD700]' :
                                            isBot ? 'text-[#FFD700]' :
                                                'text-gray-400'
                                        }`}>
                                        {msg.username}
                                    </span>
                                    <span className="text-[10px] text-gray-600">
                                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div
                                    className={`px-3 py-2 rounded-xl text-sm max-w-[90%] break-words shadow-sm ${isMe
                                            ? 'bg-[#FFD700] text-black rounded-tr-none font-medium'
                                            : isBot
                                                ? 'bg-[#FFD700]/20 border border-[#FFD700]/30 text-[#FFD700] rounded-tl-none'
                                                : 'bg-white/10 text-gray-200 rounded-tl-none'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                {isCoachLoading && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-[#FFD700] text-xs"
                    >
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI Coach is thinking...</span>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-3 bg-[#0a0a0a] border-t border-white/10">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isCoachEnabled ? "Ask the AI Coach anything..." : "Send a message..."}
                        disabled={isCoachLoading}
                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-[#FFD700]/50 focus:ring-1 focus:ring-[#FFD700]/50 transition-all placeholder-gray-600 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isCoachLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#FFD700] disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                    >
                        {isCoachLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatBox;

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { io } from 'socket.io-client';

export default function ChatBox({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('gurugammon_token');
    const newSocket = io(import.meta.env.VITE_BACKEND_URL, {
      path: '/socket.io',
      auth: { token },
      query: { roomId },
    });

    newSocket.on('chat_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('chat_history', (history) => {
      setMessages(history);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();

    if (!inputValue.trim() || !socket) return;

    socket.emit('send_message', {
      roomId,
      message: inputValue.trim(),
    });

    setInputValue('');
    inputRef.current?.focus();
  };

  return (
    <div className="glass-strong rounded-2xl border border-gold-500/20 h-[500px] flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gold-500/20 flex items-center gap-2">
        <ChatBubbleLeftRightIcon className="w-5 h-5 text-gold-400" />
        <h3 className="text-lg font-bold text-gold-400">Chat</h3>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="ml-auto w-2 h-2 bg-green-500 rounded-full"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 text-sm py-8"
            >
              <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Aucun message pour le moment</p>
              <p className="text-xs mt-1">Soyez le premier à parler !</p>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={`${message.timestamp}-${index}`}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] rounded-2xl px-4 py-2 break-words
                    ${message.isOwn
                      ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-obsidian-950'
                      : 'glass border border-gold-500/20 text-white'
                    }
                  `}
                >
                  {!message.isOwn && (
                    <p className="text-xs font-semibold text-gold-400 mb-1">
                      {message.sender}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.isOwn ? 'text-obsidian-900/60' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gold-500/20">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Écrivez un message..."
            className="flex-1 px-4 py-2 bg-obsidian-900/50 border border-gold-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all text-sm"
            maxLength={200}
          />

          <motion.button
            type="submit"
            disabled={!inputValue.trim()}
            whileHover={{ scale: inputValue.trim() ? 1.05 : 1 }}
            whileTap={{ scale: inputValue.trim() ? 0.95 : 1 }}
            className={`
              p-2 rounded-xl transition-all duration-200
              ${inputValue.trim()
                ? 'bg-gradient-to-br from-gold-400 to-gold-600 text-obsidian-950 shadow-glow-gold'
                : 'bg-gray-600/20 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </motion.button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          {inputValue.length}/200 caractères
        </p>
      </form>
    </div>
  );
}

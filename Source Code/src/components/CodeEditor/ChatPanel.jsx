import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ChatPanel({ messages, currentUser, onSendMessage }) {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-slate-700 px-4 py-3 border-b border-slate-600">
                <h3 className="text-white font-bold text-sm">Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, index) => {
                    const isOwn = currentUser && msg.userId === currentUser._id;
                    return (
                        <motion.div
                            key={index}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                                {!isOwn && msg.userName && (
                                    <span className="text-xs text-slate-400 mb-1 px-2">
                                        {msg.userName}
                                    </span>
                                )}
                                <div
                                    className={`px-4 py-2 rounded-2xl ${
                                        isOwn
                                            ? 'bg-indigo-600 text-white rounded-br-sm'
                                            : 'bg-slate-700 text-white rounded-bl-sm'
                                    }`}
                                >
                                    <p className="text-sm">{msg.message}</p>
                                </div>
                                <span className="text-xs text-slate-500 mt-1 px-2">
                                    {formatTime(msg.timestamp)}
                                </span>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-700">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        onClick={handleSend}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

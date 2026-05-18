import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import aiTutorService from '../services/api/aiTutorService';
import {
  SparklesIcon,
  CommandLineIcon,
  LightBulbIcon,
  PaperAirplaneIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

export default function AIAssistant({ code, problemDescription, language }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi! I'm DevMerge's Neural Core. How can I assist with your logic flow today?" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleAction = async (actionType) => {
    setLoading(true);
    let prompt = '';

    if (actionType === 'explain') {
      prompt = `Synthesize logic explanation for current ${language} code sequence:\n\n${code}`;
    } else if (actionType === 'hint') {
      prompt = `Provide logic hint for the current cognitive node. Context: ${problemDescription}`;
    }

    setMessages(prev => [...prev, { role: 'user', content: prompt }]);

    try {
      const res = await aiTutorService.sendMessage({
        message: prompt,
        mode: actionType === 'explain' ? 'Coding' : 'Concepts',
        topic: actionType === 'explain' ? 'Code Explanation' : 'Logic Hint'
      });

      setMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Neural uplink failure. Protocol recalibration required.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await aiTutorService.sendMessage({
        message: userMessage,
        mode: 'General'
      });

      setMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Neural servers unresponsive. Link down." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] flex flex-col h-full border border-white/20 dark:border-dark-700/50 shadow-3xl overflow-hidden font-sans min-h-[500px]">
      {/* Header */}
      <div className="bg-slate-900 dark:bg-dark-900/80 backdrop-blur-3xl p-6 flex justify-between items-center shadow-lg border-b border-white/5 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <h3 className="text-sm font-black text-white flex items-center gap-3 uppercase tracking-tighter italic relative z-10">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
            <CpuChipIcon className="w-5 h-5" />
          </div>
          Neural Core <span className="text-[10px] text-indigo-400 opacity-60 animate-pulse">• v2.0</span>
        </h3>
        <div className="flex gap-3 relative z-10">
          <button
            onClick={() => handleAction('explain')}
            type="button"
            disabled={loading || !code}
            className="text-[9px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all disabled:opacity-30 border border-white/5"
          >
            Trace Logic
          </button>
          <button
            onClick={() => handleAction('hint')}
            type="button"
            disabled={loading}
            className="text-[9px] font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all disabled:opacity-30 shadow-lg shadow-indigo-600/20 shadow-inner"
          >
            Intel Node
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 dark:bg-dark-950/50 custom-scrollbar relative">
        <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-800 opacity-[0.03] pointer-events-none"></div>
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}
            >
              <div
                className={`max-w-[85%] p-6 rounded-[1.5rem] shadow-2xl text-xs font-bold leading-relaxed italic ${msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/20 uppercase tracking-tight'
                  : 'bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-dark-700 rounded-tl-none shadow-slate-200/50'
                  }`}
              >
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mb-3">
                    <SparklesIcon className="w-4 h-4 text-indigo-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Core Response</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start relative z-10">
              <div className="bg-white dark:bg-dark-800 border border-slate-100 dark:border-dark-700 p-4 rounded-[1.5rem] rounded-tl-none shadow-2xl flex gap-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-8 bg-white dark:bg-dark-900/80 border-t border-slate-100 dark:border-dark-800 relative z-20 shrink-0">
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-10 group-focus-within:opacity-20 transition-opacity"></div>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
              placeholder="Query neural network..."
              className="w-full px-8 py-4 bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-full text-xs font-bold focus:outline-none focus:border-indigo-500 disabled:opacity-50 dark:text-white transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="bg-indigo-600 text-white w-14 h-14 rounded-full flex items-center justify-center hover:bg-slate-900 transition-all disabled:opacity-30 shadow-2xl transform active:scale-90 group"
          >
            <PaperAirplaneIcon className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}

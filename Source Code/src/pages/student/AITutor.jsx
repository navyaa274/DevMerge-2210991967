import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import aiTutorService from '../../services/api/aiTutorService';
import {
    SparklesIcon,
    ChatBubbleLeftRightIcon,
    CommandLineIcon,
    AdjustmentsHorizontalIcon,
    AcademicCapIcon,
    ChevronDownIcon,
    PaperAirplaneIcon,
    PlusIcon,
    ClockIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function AITutor() {
    const { user } = useAuthStore();
    const [sessions, setSessions] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [modes, setModes] = useState([]);
    const [selectedMode, setSelectedMode] = useState('General');
    const [showConfig, setShowConfig] = useState(false);
    const [config, setConfig] = useState({ subject: '', topic: '' });
    const [weakness, setWeakness] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchInitialData = async () => {
        try {
            const [modesRes, sessionsRes, weaknessRes] = await Promise.allSettled([
                aiTutorService.getModes(),
                aiTutorService.getSessions({ active: true }),
                aiTutorService.getWeaknessContext()
            ]);

            if (modesRes.status === 'fulfilled') setModes(modesRes.value.data.modes || []);
            if (sessionsRes.status === 'fulfilled') setSessions(sessionsRes.value.data || []);
            if (weaknessRes.status === 'fulfilled') setWeakness(weaknessRes.value.data || null);
        } catch (error) {
            console.error('Initial data sync failed:', error);
        }
    };

    const createNewSession = async () => {
        try {
            const res = await aiTutorService.createSession({ mode: selectedMode, ...config });
            setActiveSession(res.data);
            setMessages([]);
            fetchInitialData();
        } catch (error) {
            console.error('Session synthesis failed:', error);
        }
    };

    const loadSession = async (sessionId) => {
        try {
            const res = await aiTutorService.getSessionDetails(sessionId);
            const sessionData = res.data;
            setActiveSession(sessionData);
            setMessages(sessionData.messages || []);
            setSelectedMode(sessionData.mode);
        } catch (error) {
            console.error('Session recall failed:', error);
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || loading) return;

        const userMessage = inputMessage;
        setInputMessage('');
        setLoading(true);

        const newUserMessage = { role: 'user', content: userMessage, timestamp: new Date() };
        setMessages(prev => [...prev, newUserMessage]);

        try {
            const res = await aiTutorService.sendMessage({
                message: userMessage,
                sessionId: activeSession?._id,
                mode: selectedMode,
                ...config
            });

            const aiMessage = {
                role: 'assistant',
                content: res.data.response,
                timestamp: new Date(),
                metadata: res.data.metadata
            };
            setMessages(prev => [...prev, aiMessage]);

            if (!activeSession) {
                setActiveSession({ _id: res.data.sessionId });
                fetchInitialData();
            }
        } catch (error) {
            console.error('Neural uplink failed:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Critical uplink error. Please re-initialize the neural connection.',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="h-screen bg-slate-50 dark:bg-dark-950 flex overflow-hidden font-sans">
            {/* Sidebar - Tactical Overview */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-96 bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-dark-800 flex flex-col shadow-2xl z-40"
            >
                <div className="p-10 border-b border-slate-100 dark:border-dark-800">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter uppercase italic">
                        Neural Tutor
                    </h1>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]"></span>
                        AI Core Active
                    </p>
                </div>

                <div className="p-6 flex flex-col gap-6 flex-1 overflow-y-auto custom-scrollbar">
                    <button
                        onClick={createNewSession}
                        className="w-full flex items-center justify-center gap-3 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-[1.02] shadow-2xl active:scale-95 italic"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Init Neural Link
                    </button>

                    <div>
                        <label className="block text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4 ml-6">Logic Protocol</label>
                        <div className="relative">
                            <select
                                value={selectedMode}
                                onChange={(e) => setSelectedMode(e.target.value)}
                                className="w-full px-8 py-5 rounded-[2rem] border-2 border-slate-100 dark:border-dark-700 bg-white dark:bg-dark-800 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer focus:border-indigo-500 transition-all shadow-sm"
                            >
                                {modes.map(mode => (
                                    <option key={mode.id} value={mode.id} className="bg-white dark:bg-dark-800">
                                        {mode.name} Mode
                                    </option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-dark-800/50 rounded-[2.5rem] p-8 border border-slate-100 dark:border-dark-700">
                        <button
                            onClick={() => setShowConfig(!showConfig)}
                            className="w-full flex items-center justify-between group"
                        >
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">Neural Context</span>
                            <AdjustmentsHorizontalIcon className={`w-5 h-5 text-slate-400 transition-transform ${showConfig ? 'rotate-180 text-indigo-600' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showConfig && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="mt-6 space-y-4 overflow-hidden"
                                >
                                    <input
                                        type="text"
                                        placeholder="SUBJECT VECTOR"
                                        value={config.subject}
                                        onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all shadow-inner"
                                    />
                                    <input
                                        type="text"
                                        placeholder="SPECIFIC LOGIC NODE"
                                        value={config.topic}
                                        onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all shadow-inner"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {weakness?.weakTopics?.length > 0 && (
                        <div className="p-8 bg-rose-500/5 rounded-[2.5rem] border-2 border-dashed border-rose-500/20">
                            <h3 className="text-[10px] font-black text-rose-600 dark:text-rose-400 mb-6 uppercase tracking-widest flex items-center gap-3 leading-none italic">
                                <ExclamationTriangleIcon className="w-5 h-5" />
                                Corruption Detected
                            </h3>
                            <div className="space-y-3">
                                {weakness.weakTopics.slice(0, 3).map((topic, i) => (
                                    <div key={i} className="text-[9px] font-black text-rose-500/80 uppercase tracking-widest flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]"></span>
                                        {topic.topic}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 ml-6">Recent Vectors</h3>
                        <div className="space-y-4">
                            {sessions.map(session => (
                                <button
                                    key={session._id}
                                    onClick={() => loadSession(session._id)}
                                    className={`w-full text-left p-6 rounded-[2rem] transition-all transform hover:scale-[1.02] border ${activeSession?._id === session._id
                                        ? 'bg-indigo-600 text-white shadow-2xl border-indigo-500 scale-105 relative z-10'
                                        : 'bg-white dark:bg-dark-800 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-dark-700 hover:border-indigo-300 shadow-sm'
                                        }`}
                                >
                                    <div className="text-[10px] font-black uppercase tracking-widest italic mb-3 leading-none truncate">
                                        {session.topic || session.subject || 'Nexus Session'}
                                    </div>
                                    <div className={`flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest ${activeSession?._id === session._id ? 'text-indigo-200' : 'text-slate-400'}`}>
                                        <ClockIcon className="w-4 h-4" />
                                        {session.messageCount || 0} Packets Traced
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Matrix Core (Chat Area) */}
            <div className="flex-1 flex flex-col relative bg-slate-50 dark:bg-dark-950">
                {/* HUD Header */}
                <header className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-3xl border-b border-slate-200 dark:border-dark-800 px-12 py-8 flex items-center justify-between z-30 shadow-sm">
                    <div className="flex items-center gap-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl hover:rotate-12 transition-transform cursor-pointer">
                            <SparklesIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2">
                                {modes.find(m => m.id === selectedMode)?.name || 'Neural Tutor'}
                            </h2>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                Protocol: Adaptive Learning Matrix // User: 0x{user?._id?.slice(-4)?.toUpperCase() || 'XXXX'}
                            </p>
                        </div>
                    </div>
                    {activeSession && (
                        <div className="flex items-center gap-4 bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Uplink Stable</span>
                        </div>
                    )}
                </header>

                {/* Tactical Display (Messages) */}
                <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar relative">
                    <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-800 opacity-[0.03] pointer-events-none"></div>

                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-full text-slate-400 relative z-10"
                        >
                            <div className="text-9xl mb-12 opacity-10 animate-pulse">💬</div>
                            <p className="text-2xl font-black uppercase italic tracking-tighter text-slate-600 dark:text-slate-400 mb-4">Initialize Learning Sequence</p>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 text-center max-w-sm leading-relaxed">
                                Deploy neural queries to explain complex logic architectures, solve algorithmic paradoxes, or synthesize practice nodes.
                            </p>
                        </motion.div>
                    )}

                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} relative z-10`}
                        >
                            <div className={`max-w-4xl flex items-end gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-white shadow-2xl ${msg.role === 'user' ? 'bg-slate-900 border border-slate-700 font-black italic' : 'bg-indigo-600'
                                    }`}>
                                    {msg.role === 'user' ? (user?.name?.charAt(0) || 'U') : 'AI'}
                                </div>

                                <div className={`group flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`rounded-[2.5rem] px-10 py-8 shadow-3xl relative ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white shadow-indigo-600/20'
                                        : 'bg-white dark:bg-dark-800 text-slate-900 dark:text-white border border-slate-100 dark:border-dark-700 shadow-slate-200/50'
                                        }`}>
                                        <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-code:text-indigo-600 dark:prose-code:text-indigo-400">
                                            {msg.role === 'assistant' ? (
                                                <ReactMarkdown
                                                    components={{
                                                        code({ node, inline, className, children, ...props }) {
                                                            return inline ? (
                                                                <code className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-lg text-xs font-black" {...props}>{children}</code>
                                                            ) : (
                                                                <div className="relative group/code my-6">
                                                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover/code:opacity-40 transition-opacity"></div>
                                                                    <pre className="relative bg-slate-950 text-slate-100 rounded-2xl p-8 overflow-x-auto text-xs font-mono shadow-2xl border border-white/5"><code {...props}>{children}</code></pre>
                                                                </div>
                                                            );
                                                        },
                                                        p({ children }) { return <p className="mb-6 last:mb-0 font-bold tracking-tight">{children}</p>; },
                                                        ul({ children }) { return <ul className="list-square pl-8 mb-6 space-y-3 font-bold">{children}</ul>; },
                                                        strong({ children }) { return <strong className="font-black text-indigo-600 dark:text-indigo-400 italic">{children}</strong>; },
                                                        blockquote({ children }) { return <blockquote className="border-l-8 border-indigo-500/30 pl-8 italic text-slate-500 dark:text-slate-400 my-8 py-2 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-r-3xl">{children}</blockquote>; },
                                                    }}
                                                >{msg.content}</ReactMarkdown>
                                            ) : (
                                                <span className="whitespace-pre-wrap font-bold text-lg tracking-tight italic leading-relaxed">{msg.content}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-3 px-6">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 opacity-60">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {msg.metadata?.codeProvided && (
                                            <div className="flex items-center gap-2 text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                                                <CommandLineIcon className="w-3 h-3" />
                                                Code Node Attached
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {loading && (
                        <div className="flex justify-start relative z-10">
                            <div className="bg-white dark:bg-dark-800 rounded-[2rem] px-8 py-6 shadow-2xl border border-slate-100 dark:border-dark-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce"></div>
                                    <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-4">Processing Neural Query...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Command Input Area */}
                <div className="bg-white dark:bg-dark-900/50 backdrop-blur-3xl border-t border-slate-200 dark:border-dark-800 p-12 relative z-30">
                    <div className="max-w-6xl mx-auto flex gap-8 items-end relative">
                        <div className="absolute -top-12 left-0 right-0 flex justify-between px-4">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Ready for input sequence...</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Shift+Enter for newline</p>
                        </div>

                        <div className="relative flex-1 group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[3rem] blur opacity-10 group-focus-within:opacity-30 transition-opacity"></div>
                            <textarea
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter query parameters or ask a conceptual question..."
                                rows={1}
                                className="w-full px-10 py-8 rounded-[2.5rem] border-2 border-slate-200 dark:border-dark-700 bg-white dark:bg-dark-900 text-slate-900 dark:text-white text-lg font-bold leading-relaxed resize-none focus:outline-none focus:border-indigo-500 transition-all shadow-2xl custom-scrollbar relative"
                            />
                        </div>

                        <button
                            onClick={sendMessage}
                            disabled={loading || !inputMessage.trim()}
                            className="h-[84px] w-[84px] bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-900 transform transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group active:scale-90"
                        >
                            <PaperAirplaneIcon className="w-10 h-10 group-hover:rotate-12 group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

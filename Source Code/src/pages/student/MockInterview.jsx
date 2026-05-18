import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import {
    ChatBubbleBottomCenterTextIcon,
    MicrophoneIcon,
    StopIcon,
    PlayIcon,
    ArrowRightIcon,
    AcademicCapIcon,
    SparklesIcon,
    SpeakerWaveIcon
} from '@heroicons/react/24/outline';

export default function Interview() {
    const { user, token } = useAuthStore();
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const startInterview = async (type = 'technical') => {
        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/learning/mock-interviews/start`, { targetRole: type }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSession(res.data.sessionId ? { _id: res.data.sessionId } : res.data.session);
            setMessages([{
                role: 'assistant',
                content: res.data.initialMessage?.content || `Welcome, ${user.firstName}. I'm your AI Interviewer. Today we'll be conducting a ${type} interview. Are you ready to begin?`
            }]);
        } catch (error) {
            console.error('Interview start failed:', error);
            alert('Failed to initialize AI Interviewer. Please ensure your portfolio/skills are updated in Preferences.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!userInput.trim() || loading || !session) return;

        const newMessages = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE_URL}/learning/mock-interviews/respond`, {
                sessionId: session._id,
                content: userInput
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessages([...newMessages, { role: 'assistant', content: res.data.message }]);

            if (res.data.metadata?.isOver) {
                setSession(null);
                setMessages(prev => [...prev, { role: 'assistant', content: "Interview concluded. Evaluation saved to your profile." }]);
            }
        } catch (error) {
            console.error('Response failed:', error);
            alert('Neural link interrupted. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <AcademicCapIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tighter italic">AI Career Sentinel</h1>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Autonomous  Interview Protocol</p>
                    </div>
                </div>

                {!session && (
                    <div className="flex gap-4">
                        <button
                            onClick={() => startInterview('Technical Architect')}
                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                        >
                            Start Tech Interview
                        </button>
                        <button
                            onClick={() => startInterview('Social Lead')}
                            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                        >
                            Start HR Session
                        </button>
                    </div>
                )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-4xl mx-auto w-full">
                {!session && messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center"
                        >
                            <SparklesIcon className="w-12 h-12 text-indigo-500" />
                        </motion.div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter">Ready to benchmark your skills?</h2>
                        <p className="max-w-md text-slate-400 font-medium">
                            Start a custom  interview powered by your DevMerge portfolio stats and technical history.
                        </p>
                    </div>
                )}

                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: msg.role === 'assistant' ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                        >
                            <div className={`max-w-[80%] p-6 rounded-[2rem] ${msg.role === 'assistant'
                                    ? 'bg-slate-800 border border-slate-700 rounded-tl-none'
                                    : 'bg-indigo-600 rounded-tr-none'
                                }`}>
                                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                            </div>
                        </motion.div>
                    ))}
                    {loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                            <div className="bg-slate-800/50 p-6 rounded-[2rem] rounded-tl-none border border-slate-700">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-100" />
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            {session && (
                <div className="p-8 bg-slate-900 border-t border-slate-800 max-w-4xl mx-auto w-full">
                    <div className="relative group">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                            placeholder="Inject response into the matrix..."
                            className="w-full bg-slate-800 border border-slate-700 rounded-[2.5rem] py-6 pl-8 pr-32 focus:outline-none focus:border-indigo-500 transition-all font-medium text-slate-100 resize-none h-20"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                            <button
                                onClick={() => setIsRecording(!isRecording)}
                                className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                            >
                                {isRecording ? <StopIcon className="w-6 h-6" /> : <MicrophoneIcon className="w-6 h-6" />}
                            </button>
                            <button
                                onClick={handleSendMessage}
                                disabled={!userInput.trim() || loading}
                                className="p-4 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                            >
                                <ArrowRightIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    <p className="text-center text-[8px] font-black uppercase tracking-widest text-slate-500 mt-4">
                        Shift + Enter for multi-line. Response quality impacts your professional profile evaluation.
                    </p>
                </div>
            )}
        </div>
    );
}

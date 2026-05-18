import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../services/api/apiClient';
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    UserIcon,
    BookOpenIcon,
    CodeBracketIcon
} from '@heroicons/react/24/outline';

export default function SearchModal({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'user', 'course', 'problem'
    const searchInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current.focus(), 100);
        } else {
            setQuery('');
            setResults([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }
            setLoading(true);
            try {
                const type = activeTab === 'all' ? '' : `&type=${activeTab}`;
                const response = await apiClient.get(`/search?q=${encodeURIComponent(query)}${type}`);
                setResults(response.data?.data || []);
            } catch (err) {
                console.error('Search failed', err);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounceTimer);
    }, [query, activeTab]);

    const handleSelectResult = (result) => {
        onClose();
        if (result._type === 'user') {
            navigate(`/users/${result._id}`); // Adjust this based on your user profile route
        } else if (result._type === 'course') {
            navigate(`/courses/${result._id}`); // Adjust based on course details route
        } else if (result._type === 'problem') {
            navigate(`/problems/${result.slug}`); // Adjust based on problem details route
        }
    };

    const getResultIcon = (type) => {
        switch (type) {
            case 'user': return <UserIcon className="w-5 h-5 text-indigo-500" />;
            case 'course': return <BookOpenIcon className="w-5 h-5 text-emerald-500" />;
            case 'problem': return <CodeBracketIcon className="w-5 h-5 text-cyan-500" />;
            default: return <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />;
        }
    };

    const getResultBadge = (result) => {
        if (result._type === 'user') {
            return <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-md">{result.role}</span>
        }
        if (result._type === 'problem') {
            return <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${result.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                result.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-rose-500/10 text-rose-500'
                }`}>{result.difficulty}</span>
        }
        return null;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4 bg-slate-900/40 backdrop-blur-md"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="w-full max-w-3xl bg-white dark:bg-dark-900 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-dark-800"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search Input Area */}
                        <div className="flex items-center gap-4 p-6 border-b border-slate-100 dark:border-dark-800">
                            <MagnifyingGlassIcon className={`w-8 h-8 ${query ? 'text-indigo-500' : 'text-slate-400'} transition-colors duration-300`} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search subjects, entities, and assignments..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1 text-xl md:text-2xl font-bold bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-dark-600 outline-none"
                            />
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-xl transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex px-6 border-b border-slate-100 dark:border-dark-800 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'all', label: 'All Operations' },
                                { id: 'user', label: 'Personnel' },
                                { id: 'course', label: 'Curriculum' },
                                { id: 'problem', label: 'Algorithms' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-colors relative whitespace-nowrap ${activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                        }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Results Area */}
                        <div className="max-h-[50vh] overflow-y-auto w-full custom-scrollbar">
                            {loading && query.length > 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center">
                                    <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 inline-block rounded-full animate-spin"></div>
                                    <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Scanning Matrix...</p>
                                </div>
                            ) : results.length > 0 ? (
                                <ul className="py-2">
                                    {results.map((result, index) => (
                                        <motion.li
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={`${result._type}-${result._id}`}
                                        >
                                            <button
                                                onClick={() => handleSelectResult(result)}
                                                className="w-full text-left px-6 py-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-dark-800 group transition-colors group"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-dark-700 transition-colors shrink-0 shadow-sm relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent z-10"></div>
                                                    {getResultIcon(result._type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-4 mb-1">
                                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                            {result.name || result.title}
                                                        </h4>
                                                        {getResultBadge(result)}
                                                    </div>

                                                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                                                        {result._type === 'user' && (result.email || result.studentId || result.employeeId)}
                                                        {result._type === 'course' && (result.code + (result.description ? ` - ${result.description}` : ''))}
                                                        {result._type === 'problem' && (result.slug)}
                                                    </p>
                                                </div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-dark-600 group-hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100">
                                                    Jump &rarr;
                                                </div>
                                            </button>
                                        </motion.li>
                                    ))}
                                </ul>
                            ) : query.length > 0 ? (
                                <div className="py-24 flex flex-col items-center justify-center text-center px-8">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-dark-950 rounded-[1.5rem] flex items-center justify-center mb-6">
                                        <MagnifyingGlassIcon className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-xl font-black uppercase text-slate-800 dark:text-white tracking-widest italic mb-2">Zero Signals Detected</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-xs">
                                        The search vector returned no entity matches. Verify spelling or adjust parameter focus.
                                    </p>
                                </div>
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-center px-8 text-slate-400">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] font-mono leading-relaxed">
                                        Global Entity Routing<br />
                                        [ Awaiting Input Vector ]
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-50 dark:bg-dark-950 border-t border-slate-100 dark:border-dark-800 p-4 px-6 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1"><kbd className="px-2 border rounded border-slate-200 dark:border-dark-700 font-mono">↑</kbd><kbd className="px-2 border rounded border-slate-200 dark:border-dark-700 font-mono">↓</kbd> Navigate</span>
                                <span className="flex items-center gap-1"><kbd className="px-2 border rounded border-slate-200 dark:border-dark-700 font-mono">ESC</kbd> Close</span>
                            </div>
                            <div>Global Search Module v4</div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

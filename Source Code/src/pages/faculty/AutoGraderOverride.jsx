import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AdjustmentsHorizontalIcon,
    CheckCircleIcon,
    XCircleIcon,
    CpuChipIcon,
    BoltIcon,
    BeakerIcon,
    ArrowPathIcon,
    VariableIcon,
    ShieldExclamationIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import facultyService from '../../services/api/facultyService';
import toast from '../../utils/toast';

export default function AutoGraderOverride() {
    const [submissions, setSubmissions] = useState([]);
    const [selectedSub, setSelectedSub] = useState(null);
    const [overrideScore, setOverrideScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchFlagged = useCallback(async (quiet = false) => {
        if (!quiet) setLoading(true);
        else setIsRefreshing(true);

        try {
            const res = await facultyService.getFlaggedSubmissions();
            if (res.success) {
                setSubmissions(res.data);
            }
        } catch (error) {
            console.error(error);
            toast.error("Subspace Communication Error: Failed to load Queue");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchFlagged();
    }, [fetchFlagged]);

    const handleSelect = (sub) => {
        setSelectedSub(sub);
        setOverrideScore(sub.aiScore || 0);
    };

    const handleOverride = async (forceStatus = null, customScore = null) => {
        if (!selectedSub) return;

        const finalScore = customScore !== null ? customScore : overrideScore;

        try {
            const res = await facultyService.overrideSubmission(selectedSub.id, finalScore, forceStatus);
            if (res.success) {
                toast.success('Override Protocol Executed Successfully');
                setSelectedSub(null);
                setOverrideScore(0);
                fetchFlagged(true); // refresh list quietly
            }
        } catch (error) {
            toast.error(error.message || "Override Protocol Violation");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-dark-950">
                <div className="relative">
                    <div className="w-24 h-24 border-8 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <CpuChipIcon className="w-10 h-10 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse italic">Initializing Judgment Matrix</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 md:p-8 lg:p-12 w-full max-w-[1700px] mx-auto min-h-screen font-sans bg-slate-50 dark:bg-[#020617] pt-20 md:pt-24"
        >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
                <div className="max-w-4xl">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-4 py-1.5 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] border border-rose-500/20 rounded-full flex items-center gap-2.5">
                            <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                            Secure Override Authority
                        </span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.85] italic">
                        Auto-Grader <span className="text-indigo-600 dark:text-indigo-400 underline decoration-rose-500/30 decoration-[12px] underline-offset-[12px]">Override</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-dark-900/50 backdrop-blur-2xl p-3 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 shadow-2xl">
                    <div className="px-8 py-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 italic">Queue Status</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white italic leading-none">{submissions.length} <span className="text-sm font-bold text-slate-400 ml-1">PENDING</span></p>
                    </div>
                    <button
                        onClick={() => fetchFlagged()}
                        disabled={isRefreshing}
                        className="p-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.8rem] transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50 group"
                    >
                        <ArrowPathIcon className={`w-8 h-8 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16">
                <div className="lg:col-span-7">
                    <div className="bg-white dark:bg-dark-900 rounded-[3.5rem] shadow-3xl border border-slate-50 dark:border-dark-800 p-8 md:p-12">
                        <div className="flex items-center justify-between mb-12 pb-8 border-b border-slate-100 dark:border-dark-800">
                            <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-5 text-slate-900 dark:text-white">
                                <CpuChipIcon className="w-10 h-10 text-indigo-500" /> Neural Queue
                            </h2>
                            <div className="flex gap-2.5">
                                <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                                <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            </div>
                        </div>

                        <div className="space-y-6 max-h-[900px] overflow-y-auto pr-4 custom-scrollbar">
                            {submissions.length === 0 ? (
                                <div className="py-20 text-center flex flex-col items-center">
                                    <div className="w-24 h-24 bg-slate-50 dark:bg-dark-950 rounded-full flex items-center justify-center mb-8 border border-slate-100 dark:border-dark-800">
                                        <BeakerIcon className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Workspace Optimized</h4>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">No flagged algorithmic outputs detected</p>
                                </div>
                            ) : (
                                submissions.map((sub, idx) => (
                                    <motion.div
                                        key={sub.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => handleSelect(sub)}
                                        className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer group relative overflow-hidden ${selectedSub?.id === sub.id
                                            ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10 shadow-[0_0_50px_rgba(79,70,229,0.15)] translate-x-4'
                                            : 'border-slate-50 dark:border-dark-800/50 bg-slate-50/50 dark:bg-dark-950/50 hover:border-indigo-500/30'
                                            }`}
                                    >
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-16 h-16 rounded-3xl flex flex-col items-center justify-center font-black italic border-2 ${sub.aiScore < 50 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                    sub.aiScore < 80 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                        'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                    }`}>
                                                    <span className="text-2xl leading-none">{sub.aiScore}</span>
                                                    <span className="text-[9px] uppercase font-black opacity-50 mt-1">Score</span>
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-indigo-500 transition-colors italic mb-1">{sub.student}</p>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2.5">
                                                        <VariableIcon className="w-4 h-4" /> {sub.problem || 'Root Process'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-8">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 italic">Anomaly Type</p>
                                                    <p className={`text-xs font-black uppercase tracking-widest ${sub.status === 'Review Needed' ? 'text-amber-500' : 'text-rose-500'
                                                        }`}>{sub.status}</p>
                                                </div>
                                                <div className={`p-3 rounded-2xl transition-all ${selectedSub?.id === sub.id ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-dark-800 text-slate-400'}`}>
                                                    <ChevronRightIcon className={`w-6 h-6 transition-transform duration-500 ${selectedSub?.id === sub.id ? 'rotate-90' : ''}`} />
                                                </div>
                                            </div>
                                        </div>

                                        {selectedSub?.id === sub.id && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-8 pt-8 border-t border-indigo-500/10"
                                            >
                                                <div className="bg-white/50 dark:bg-dark-950/80 rounded-[2rem] p-6 border border-indigo-500/10 shadow-inner">
                                                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-indigo-500 mb-3 italic">Neural Trace Analysis</p>
                                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                                        "{sub.aiReason}"
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Background Decor */}
                                        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-indigo-500/5 to-transparent skew-x-[30deg] translate-x-16 pointer-events-none"></div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5 h-full">
                    <AnimatePresence mode="wait">
                        {selectedSub ? (
                            <motion.div
                                key={selectedSub.id}
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                                className="bg-slate-950 rounded-[4rem] p-10 md:p-14 shadow-[0_40px_100px_-20px_rgba(79,70,229,0.5)] border border-indigo-500/30 sticky top-32 overflow-hidden"
                            >
                                {/* Decorative elements for dark panel */}
                                <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/20 blur-[120px] rounded-full"></div>
                                <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-rose-500/10 blur-[120px] rounded-full"></div>

                                <div className="relative z-10">
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-6 mb-12 pb-10 border-b border-white/10">
                                        <div className="p-3 bg-rose-500/20 rounded-2xl shadow-[0_0_30px_rgba(225,29,72,0.3)]">
                                            <ShieldExclamationIcon className="w-10 h-10 text-rose-500" />
                                        </div>
                                        Manual Intervention
                                    </h3>

                                    <div className="mb-14">
                                        <div className="flex justify-between items-start mb-12">
                                            <div>
                                                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-widest mb-4 italic">Active Sector</label>
                                                <p className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic mb-3">{selectedSub.student}</p>
                                                <p className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2 italic">
                                                    <VariableIcon className="w-4 h-4" /> Routine: {selectedSub.problem}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 italic">System Grade</p>
                                                <div className="relative inline-block">
                                                    <p className="text-7xl font-black text-white opacity-10 italic leading-none">{selectedSub.aiScore}%</p>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className={`w-3 h-3 rounded-full animate-pulse ${selectedSub.aiScore < 50 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-10">
                                            <div>
                                                <div className="flex justify-between items-center mb-6">
                                                    <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest italic">Manual Score Override (0-100)</label>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-2 h-2 rounded-full animate-ping ${overrideScore < 50 ? 'bg-rose-500' : overrideScore < 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                                        <span className={`text-4xl font-black italic ${overrideScore < 50 ? 'text-rose-500' :
                                                            overrideScore < 80 ? 'text-amber-500' : 'text-emerald-500'
                                                            }`}>{overrideScore}%</span>
                                                    </div>
                                                </div>
                                                <div className="relative group px-2">
                                                    <input
                                                        type="range"
                                                        min="0" max="100"
                                                        value={overrideScore}
                                                        onChange={(e) => setOverrideScore(Number(e.target.value))}
                                                        className="w-full h-3 bg-slate-900 rounded-full appearance-none cursor-pointer accent-indigo-500 border border-slate-800"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-5 gap-4">
                                                {[0, 25, 50, 75, 100].map(val => (
                                                    <button
                                                        key={val}
                                                        onClick={() => setOverrideScore(val)}
                                                        className={`py-4 rounded-2xl text-[11px] font-black transition-all border-2 ${overrideScore === val
                                                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_10px_30px_rgba(79,70,229,0.4)] scale-105'
                                                            : 'bg-slate-900 border-slate-800/50 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                                                            }`}
                                                    >
                                                        {val}%
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5 pt-12 border-t border-white/10">
                                        <motion.button
                                            whileHover={{ scale: 1.02, y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleOverride('Faculty Overridden')}
                                            className="w-full py-7 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-[0.5em] rounded-[2.5rem] flex justify-center items-center gap-5 transition-all shadow-[0_25px_50px_-12px_rgba(79,70,229,0.6)] italic"
                                        >
                                            <BoltIcon className="w-7 h-7" /> Commit Neural Override
                                        </motion.button>

                                        <div className="grid grid-cols-2 gap-5">
                                            <button
                                                onClick={() => { setOverrideScore(100); handleOverride('Accepted', 100); }}
                                                className="py-6 bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-500 font-black uppercase text-[11px] tracking-[0.2em] rounded-3xl flex justify-center items-center gap-4 transition-all border-2 border-white/5 hover:border-emerald-500/30 italic group"
                                            >
                                                <CheckCircleIcon className="w-6 h-6 group-hover:scale-110 transition-transform" /> Force Pass
                                            </button>
                                            <button
                                                onClick={() => { setOverrideScore(0); handleOverride('Rejected', 0); }}
                                                className="py-6 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 font-black uppercase text-[11px] tracking-[0.2em] rounded-3xl flex justify-center items-center gap-4 transition-all border-2 border-white/5 hover:border-rose-500/30 italic group"
                                            >
                                                <XCircleIcon className="w-6 h-6 group-hover:scale-110 transition-transform" /> Force Fail
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-10">
                                        <p className="text-[10px] text-slate-500 text-center uppercase tracking-[0.2em] italic leading-relaxed font-bold opacity-60">
                                            PROTOCOL NOTICE: Execution will permanently rewrite assessment vectors in the core ledger.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white dark:bg-dark-900 rounded-[4rem] p-16 lg:p-24 shadow-3xl border-4 border-dashed border-slate-100 dark:border-dark-800 flex flex-col items-center justify-center text-center h-full min-h-[700px] sticky top-32"
                            >
                                <div className="relative mb-12">
                                    <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full animate-pulse"></div>
                                    <BeakerIcon className="w-40 h-40 text-slate-100 dark:text-dark-800 relative z-10" />
                                    <AdjustmentsHorizontalIcon className="w-20 h-20 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 z-20" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-300 dark:text-dark-700 uppercase tracking-[0.3em] italic mb-8">Matrix Standby</h3>
                                <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] max-w-[320px] leading-[2.2] italic">
                                    Select a neural node from the judgment queue to initiate manual intervention protocol.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}




import React from 'react';
import { motion } from 'framer-motion';
import {
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    BoltIcon,
    MagnifyingGlassIcon,
    ScaleIcon
} from '@heroicons/react/24/outline';

const WeaknessDensity = ({ density = 0.0, riskTopics = [], activeInterventions = 0, status = 'NOMINAL' }) => {
    // Ensure we have sensible defaults and safety
    const safeDensity = Number(density) || 0;
    const safeStatus = status || 'NOMINAL';
    const displayVector = safeDensity > 0 ? (100 - safeDensity).toFixed(1) : "100.0";

    return (
        <div className="glass-card rounded-[3rem] p-10 border border-white/20 dark:border-dark-700/50 shadow-3xl relative overflow-hidden group font-sans">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full -ml-32 -mb-32 blur-[80px] pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative z-10">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <ExclamationTriangleIcon className="w-8 h-8 text-rose-500" /> Weakness Density
                    </h3>
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mt-2 italic">Cognitive Friction Monitor</p>
                </div>
                <div className={`px-6 py-3 rounded-2xl border shadow-xl flex flex-col items-center ${safeStatus === 'NOMINAL'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                    }`}>
                    <p className="text-[9px] font-black uppercase tracking-widest mb-1 italic">System Integrity</p>
                    <p className="text-xl font-black italic tracking-widest animate-pulse">{safeStatus}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                <div className="space-y-10">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-slate-50/50 dark:bg-dark-900/30 p-8 rounded-[2rem] border border-slate-100 dark:border-dark-800/50 relative overflow-hidden">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Density Level</p>
                            <p className="text-4xl font-black text-slate-900 dark:text-white italic">{safeDensity.toFixed(1)}%</p>
                            <div className="mt-4 h-1.5 w-full bg-slate-200 dark:bg-dark-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${safeDensity}%` }}
                                    className="h-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50/50 dark:bg-dark-900/30 p-8 rounded-[2rem] border border-slate-100 dark:border-dark-800/50 relative overflow-hidden">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Average Vector</p>
                            <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 italic">{displayVector}%</p>
                            <div className="mt-4 h-1.5 w-full bg-slate-200 dark:bg-dark-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${displayVector}%` }}
                                    className="h-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.3)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                        <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 italic flex items-center gap-2">
                            <BoltIcon className="w-4 h-4 text-amber-500" /> Active Interventions
                        </h4>
                        <div className="flex items-center gap-6">
                            <div className="text-6xl font-black text-white italic tracking-tighter">{activeInterventions}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-relaxed">
                                Autonomous protocols currently executing to stabilize logic decay
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 italic flex items-center gap-2">
                        <MagnifyingGlassIcon className="w-4 h-4 text-rose-500" /> High-Risk Topics
                    </h4>

                    <div className="space-y-4">
                        {riskTopics.length > 0 ? riskTopics.map((topic, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white dark:bg-dark-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-dark-800 flex items-center justify-between group/item hover:border-rose-500/30 transition-all shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                    <span className="text-xs font-black uppercase tracking-tight text-slate-700 dark:text-slate-300 italic">{topic.name}</span>
                                </div>
                                <div className="text-[9px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 dark:bg-rose-950/30 px-3 py-1 rounded-lg border border-rose-100 dark:border-rose-900/30">
                                    {topic.impact}% Impact
                                </div>
                            </motion.div>
                        )) : (
                            <div className="bg-emerald-500/5 p-12 rounded-[2rem] border border-emerald-500/10 flex flex-col items-center justify-center text-center">
                                <ShieldCheckIcon className="w-12 h-12 text-emerald-500 mb-4 opacity-40" />
                                <p className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest italic">
                                    Zero critical friction detected in active logic nodes
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pt-4">
                        <div className="bg-rose-500/5 p-6 rounded-[1.5rem] border border-rose-500/10">
                            <div className="flex items-start gap-4">
                                <ScaleIcon className="w-5 h-5 text-rose-500 mt-1 shrink-0" />
                                <p className="text-[11px] font-bold text-slate-500 dark:text-dark-400 italic leading-relaxed">
                                    Logic density imbalance often precedes <span className="text-rose-500 font-black">longitudinal skill decay</span>. Neural Core suggests increasing sandbox iteration for high-impact topics.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeaknessDensity;

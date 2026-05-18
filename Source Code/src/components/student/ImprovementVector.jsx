import React from 'react';
import { motion } from 'framer-motion';
import {
    ChartBarIcon,
    ArrowTrendingUpIcon,
    CheckBadgeIcon,
    ExclamationTriangleIcon,
    CpuChipIcon
} from '@heroicons/react/24/outline';

const ImprovementVector = ({ baseline = 65.0, current = 78.0, elevation = 13.0 }) => {
    return (
        <div className="glass-card rounded-[3rem] p-10 border border-white/20 dark:border-dark-700/50 shadow-3xl relative overflow-hidden group font-sans">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-[80px] pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative z-10">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                        <ArrowTrendingUpIcon className="w-8 h-8 text-indigo-600" /> Improvement Vector
                    </h3>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mt-2 italic">Neural Elevation Protocol v4.2</p>
                </div>
                <div className="bg-slate-900 dark:bg-dark-950 px-6 py-3 rounded-2xl border border-white/10 shadow-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic text-center">Current Phase Elevation</p>
                    <p className="text-2xl font-black text-indigo-400 italic text-center">+{elevation.toFixed(1)}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                <div className="space-y-12">
                    {/* Progress Visualizer */}
                    <div className="relative pt-12">
                        <div className="flex justify-between mb-4 px-2">
                            <div className="text-center">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Baseline</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white italic">{baseline.toFixed(1)}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mb-1 italic">Current Elevation</p>
                                <p className="text-xl font-black text-indigo-600 italic">{current.toFixed(1)}%</p>
                            </div>
                        </div>

                        <div className="h-6 w-full bg-slate-100 dark:bg-dark-900 rounded-full overflow-hidden shadow-inner border border-slate-200 dark:border-dark-800 p-1">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${current}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.4)] relative"
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/40 blur-sm"></div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 dark:bg-dark-900/30 p-8 rounded-[2rem] border border-slate-100 dark:border-dark-800/50 relative overflow-hidden">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 italic flex items-center gap-2">
                            <CpuChipIcon className="w-4 h-4 text-indigo-500" /> Temporal Performance Vector
                        </h4>
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <div className="w-12 h-12 bg-slate-200 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4 opacity-50">
                                <SignalIcon className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest italic group-hover:text-indigo-500 transition-colors">
                                Progress Trace
                            </p>
                            <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500 mt-2 italic max-w-xs">
                                Insufficient temporal data to generate vector trace
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <GapCard label="Resolved Gaps" count={4} icon={<CheckBadgeIcon />} color="indigo" />
                    <GapCard label="Elevation Success" count={1} icon={<ArrowTrendingUpIcon />} color="emerald" />
                    <GapCard label="Regressed Gaps" count={0} icon={<ExclamationTriangleIcon />} color="rose" />

                    <div className="sm:col-span-3 bg-indigo-600/5 dark:bg-indigo-500/5 p-8 rounded-[2rem] border border-indigo-100 dark:border-indigo-900/30">
                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] mb-4 italic">Neural Insight</p>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 italic leading-relaxed">
                            Your "Improvement Vector" shows a high-stability ascent. The 13% delta since baseline indicates successful assimilation of the
                            <span className="text-indigo-600 dark:text-indigo-400 mx-1">Architectural Patterns</span> logic nodes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GapCard = ({ label, count, icon, color }) => {
    const colors = {
        indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900/30',
        emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30',
        rose: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30'
    };

    return (
        <div className={`p-6 rounded-[2rem] border flex flex-col items-center justify-center text-center transition-all hover:scale-105 ${colors[color]}`}>
            <div className="mb-3 opacity-80">{React.cloneElement(icon, { className: 'w-8 h-8' })}</div>
            <p className="text-3xl font-black italic tracking-tighter mb-1">{count}</p>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 leading-tight">{label}</p>
        </div>
    );
};

const SignalIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
);

export default ImprovementVector;

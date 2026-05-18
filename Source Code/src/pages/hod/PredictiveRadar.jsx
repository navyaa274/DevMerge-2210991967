import React from 'react';
import { motion } from 'framer-motion';
import { 
    SignalIcon, 
    CursorArrowRaysIcon, 
    ChartBarIcon,
    ExclamationTriangleIcon,
    CheckBadgeIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function PredictiveRadar() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 md:p-8 lg:p-12 max-w-[1700px] mx-auto min-h-screen pt-20 md:pt-24 font-sans"
        >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
                <div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                        Predictive <span className="text-indigo-600">Radar</span>
                    </h1>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2">
                        <SignalIcon className="w-4 h-4 text-indigo-500" />
                        Early-Warning System & Success Forecasting Matrix
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">
                        Scan All Cohorts
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 bg-white dark:bg-dark-900 rounded-[3rem] p-8 md:p-12 shadow-3xl border border-slate-100 dark:border-dark-800">
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white mb-8">Success Probability Matrix</h2>
                    <div className="space-y-8">
                        {[
                            { cohort: 'CS 2024-A', probability: 94, trend: 'up', risk: 'Low' },
                            { cohort: 'ECE 2024-B', probability: 78, trend: 'down', risk: 'Medium' },
                            { cohort: 'CS 2025-C', probability: 82, trend: 'up', risk: 'Low' },
                            { cohort: 'ME 2024-A', probability: 65, trend: 'down', risk: 'High' },
                        ].map((c, i) => (
                            <div key={i} className="group cursor-pointer">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-4">
                                        <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg">{c.cohort}</span>
                                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            c.risk === 'Low' ? 'bg-emerald-500/10 text-emerald-500' : 
                                            c.risk === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 
                                            'bg-rose-500/10 text-rose-500'
                                        }`}>
                                            {c.risk} Risk Profile
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <ArrowTrendingUpIcon className={`w-5 h-5 ${c.trend === 'up' ? 'text-emerald-500' : 'text-rose-500 rotate-180'}`} />
                                        <span className="font-black text-slate-900 dark:text-white text-xl tracking-tighter">{c.probability}%</span>
                                    </div>
                                </div>
                                <div className="h-2 bg-slate-50 dark:bg-dark-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${c.probability > 90 ? 'bg-emerald-500' : c.probability > 75 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                                        style={{ width: `${c.probability}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white dark:bg-dark-900 p-8 rounded-[3rem] border border-slate-100 dark:border-dark-800 shadow-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <ExclamationTriangleIcon className="w-8 h-8 text-rose-500" />
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Risk Alert</h3>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">14 students in ME 2024-A show a 60% probability of missing project milestones based on recent lab activity.</p>
                        <button className="w-full py-4 bg-rose-500/10 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">
                            Initiate Intervention
                        </button>
                    </div>

                    <div className="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-3xl relative overflow-hidden group">
                        <CheckBadgeIcon className="w-16 h-16 text-indigo-400 mb-8 opacity-50 group-hover:scale-110 transition-transform" />
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4 leading-none">High-Flyer<br/>Detector</h2>
                        <p className="text-indigo-100 text-sm font-medium mb-8">Radar has identified 8 students with exceptional progress vectors suitable for elite research fast-tracking.</p>
                        <button className="w-full py-4 bg-white text-indigo-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">
                            View Elite Cohort
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

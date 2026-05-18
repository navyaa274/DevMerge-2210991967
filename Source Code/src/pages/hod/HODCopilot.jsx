import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    SparklesIcon, 
    ChatBubbleLeftRightIcon, 
    LightBulbIcon,
    ChartPieIcon,
    AcademicCapIcon,
    BoltIcon
} from '@heroicons/react/24/outline';

export default function HODCopilot() {
    const [query, setQuery] = useState('');

    const suggestions = [
        "Analyze faculty workload for Q3",
        "Predict student dropout risk for CS dept",
        "Optimize lab resource allocation",
        "Generate accreditation readiness report"
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 md:p-8 lg:p-12 max-w-[1700px] mx-auto min-h-screen pt-20 md:pt-24 font-sans"
        >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
                <div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                        HOD <span className="text-indigo-600">Copilot</span>
                    </h1>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-indigo-500" />
                        AI-Powered Academic Decision Engine
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-8 md:p-12 shadow-3xl border border-slate-100 dark:border-dark-800">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Neural Interface</h2>
                        </div>

                        <div className="relative group">
                            <textarea
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="ASK COPILOT ANYTHING ABOUT YOUR DEPARTMENT..."
                                className="w-full min-h-[200px] p-8 bg-slate-50 dark:bg-dark-800/50 border border-slate-100 dark:border-dark-800 rounded-[2rem] text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none uppercase tracking-widest"
                            />
                            <button className="absolute bottom-6 right-6 px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3">
                                <BoltIcon className="w-4 h-4" />
                                Execute Analysis
                            </button>
                        </div>

                        <div className="mt-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Directives</p>
                            <div className="flex flex-wrap gap-3">
                                {suggestions.map((s, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setQuery(s)}
                                        className="px-6 py-3 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 transition-all"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 shadow-xl">
                            <LightBulbIcon className="w-8 h-8 text-amber-500 mb-6" />
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Smart Insight</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Faculty workload in the ECE department is projected to exceed capacity by 15% next semester. Recommend early section planning.</p>
                        </div>
                        <div className="bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 shadow-xl">
                            <ChartPieIcon className="w-8 h-8 text-emerald-500 mb-6" />
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Resource Efficiency</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Lab utilization peaks on Tuesdays. Shifting 3 sections to Thursday would balance infrastructure load by 22%.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 dark:bg-indigo-950 p-8 md:p-12 rounded-[3rem] text-white shadow-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/40 transition-all" />
                        <SparklesIcon className="w-12 h-12 text-indigo-400 mb-8" />
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4 leading-none">Predictive<br/>Intelligence</h2>
                        <p className="text-indigo-200 text-sm font-medium mb-8 leading-relaxed">Copilot uses multi-layered neural networks to forecast academic trends and operational bottlenecks before they occur.</p>
                        <button className="w-full py-4 bg-white text-indigo-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">
                            View Full Forecast
                        </button>
                    </div>

                    <div className="bg-white dark:bg-dark-900 p-8 rounded-[3rem] border border-slate-100 dark:border-dark-800 shadow-xl">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Recent Analysis</h3>
                        <div className="space-y-6">
                            {[
                                { title: 'Accreditation Audit', time: '2h ago', status: 'Completed' },
                                { title: 'Syllabus Alignment', time: '5h ago', status: 'In Review' },
                                { title: 'Student Risk Matrix', time: '1d ago', status: 'Archived' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{item.title}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.time}</p>
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic">{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

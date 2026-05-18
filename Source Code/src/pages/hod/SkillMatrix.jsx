import React from 'react';
import { motion } from 'framer-motion';
import { 
    AcademicCapIcon, 
    ChartBarSquareIcon, 
    UserIcon,
    RocketLaunchIcon,
    FireIcon,
    PuzzlePieceIcon
} from '@heroicons/react/24/outline';

export default function SkillMatrix() {
    const skills = [
        { name: 'Data Structures', level: 85, trend: 'up' },
        { name: 'Machine Learning', level: 72, trend: 'up' },
        { name: 'System Design', level: 64, trend: 'stable' },
        { name: 'Cybersecurity', level: 45, trend: 'down' },
        { name: 'Cloud Computing', level: 78, trend: 'up' },
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
                        Skill <span className="text-amber-500">Matrix</span>
                    </h1>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2">
                        <ChartBarSquareIcon className="w-4 h-4 text-amber-500" />
                        Competency Mapping & Gap Analysis
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-dark-800 transition-all">
                        Download Report
                    </button>
                    <button className="px-8 py-4 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20">
                        Calibrate Matrix
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-8 md:p-12 shadow-3xl border border-slate-100 dark:border-dark-800">
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white mb-10">Department Proficiency</h2>
                        <div className="space-y-10">
                            {skills.map((skill, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-4">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 group-hover:animate-ping" />
                                            <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-lg">{skill.name}</span>
                                        </div>
                                        <span className="font-black text-amber-500 text-lg tracking-tighter">{skill.level}%</span>
                                    </div>
                                    <div className="h-4 bg-slate-50 dark:bg-dark-800 rounded-full overflow-hidden border border-slate-100 dark:border-dark-700/50">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${skill.level}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className="h-full bg-gradient-to-r from-amber-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 shadow-xl">
                            <RocketLaunchIcon className="w-10 h-10 text-indigo-500 mb-6" />
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Emerging Tech</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">Quantum Computing interest is up 40%. Recommend introducing an elective in the next cycle.</p>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic cursor-pointer hover:underline">View Detailed Trend →</span>
                        </div>
                        <div className="bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 shadow-xl border-l-4 border-l-rose-500">
                            <FireIcon className="w-10 h-10 text-rose-500 mb-6" />
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Critical Gaps</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">Low proficiency in Cloud Security across 4th-year cohorts. Intervention required.</p>
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic cursor-pointer hover:underline">Schedule Workshop →</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-white dark:bg-dark-900 p-8 rounded-[3rem] border border-slate-100 dark:border-dark-800 shadow-xl">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                            <PuzzlePieceIcon className="w-4 h-4" />
                            Cohort distribution
                        </h3>
                        <div className="space-y-6">
                            {[
                                { cohort: 'CS 2024-A', avg: 78, color: 'bg-emerald-500' },
                                { cohort: 'CS 2024-B', avg: 62, color: 'bg-amber-500' },
                                { cohort: 'ECE 2024-A', avg: 84, color: 'bg-indigo-500' },
                                { cohort: 'ME 2024-C', avg: 45, color: 'bg-rose-500' },
                            ].map((c, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                        <span className="text-slate-900 dark:text-white">{c.cohort}</span>
                                        <span className="text-slate-400">{c.avg}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-50 dark:bg-dark-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${c.color}`} style={{ width: `${c.avg}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-3xl relative overflow-hidden group">
                        <UserIcon className="w-16 h-16 text-amber-400 mb-8 opacity-30 group-hover:scale-110 transition-transform" />
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4 leading-none">Individual<br/>Profiling</h2>
                        <p className="text-slate-400 text-sm font-medium mb-8">Deep-dive into individual student competency maps to identify top talent for high-tier placements.</p>
                        <button className="w-full py-4 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all">
                            Scan Talent Pool
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

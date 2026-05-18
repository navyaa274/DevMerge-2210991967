import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RocketLaunchIcon,
    AcademicCapIcon,
    BriefcaseIcon,
    CpuChipIcon,
    ArrowTrendingUpIcon,
    CheckBadgeIcon,
    LightBulbIcon,
    SparklesIcon,
    TrophyIcon
} from '@heroicons/react/24/outline';
import API_BASE_URL from '../../config/api';
import toast from '../../utils/toast';

const SuccessPortal = () => {
    const { token } = useAuthStore();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCareerData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/analytics/career`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(response.data.projection);
            } catch (error) {
                console.error('Error fetching career projection:', error);
                toast.error('AI Career Insights are taking a bit longer to stabilize.');
            } finally {
                setLoading(false);
            }
        };

        fetchCareerData();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full mb-8"
                />
                <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Synchronizing Workforce Models</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen p-6 md:p-12 bg-slate-50 dark:bg-[#020617] relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/[0.03] rounded-full blur-[120px] -mr-96 -mt-96" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/[0.03] rounded-full blur-[100px] -ml-72 -mb-72" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 max-w-7xl mx-auto"
            >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
                                <RocketLaunchIcon className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-600">Career Intelligence Node</h2>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                            Student Success <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Portal</span>
                        </h1>
                        <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
                            Our AI engine has synthesized your academic performance, coding patterns, and module mastery to project your most viable industry trajectories.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 shadow-2xl flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Model Confidence</p>
                            <p className="text-3xl font-black italic text-slate-900 dark:text-white">94.2%</p>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-slate-100 dark:border-dark-800 flex items-center justify-center p-1 relative">
                            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                            <CpuChipIcon className="w-8 h-8 text-indigo-600" />
                        </div>
                    </div>
                </div>

                {/* Career Projections Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {data.roleMatches.map((role, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -10 }}
                            className={`p-10 rounded-[3rem] border shadow-2xl transition-all duration-500 relative overflow-hidden group ${idx === 0
                                    ? 'bg-slate-900 text-white border-slate-800'
                                    : 'bg-white dark:bg-dark-900 text-slate-900 dark:text-white border-slate-100 dark:border-dark-800'
                                }`}
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                <BriefcaseIcon className="w-24 h-24" />
                            </div>

                            <div className="relative z-10">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-10 ${idx === 0 ? 'bg-indigo-600' : 'bg-slate-100 dark:bg-dark-800'
                                    }`}>
                                    <BriefcaseIcon className={`w-8 h-8 ${idx === 0 ? 'text-white' : 'text-indigo-600'}`} />
                                </div>

                                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-2">{role.role}</h3>
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="h-1 w-12 bg-indigo-600 rounded-full" />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${idx === 0 ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                        Match Score: {role.matchScore}%
                                    </span>
                                </div>

                                <ul className="space-y-4 mb-10">
                                    {role.why.map((reason, rIdx) => (
                                        <li key={rIdx} className="flex gap-3 text-xs font-bold leading-relaxed opacity-70 italic">
                                            <SparklesIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                                            {reason}
                                        </li>
                                    ))}
                                </ul>

                                <button className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${idx === 0
                                        ? 'bg-white text-slate-900 hover:bg-slate-100'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    }`}>
                                    Explore Career Blueprint
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Skill Gaps & Action Items */}
                    <div className="bg-white dark:bg-dark-900 rounded-[4rem] p-12 border border-slate-100 dark:border-dark-800 shadow-2xl">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-10 flex items-center gap-4 text-slate-900 dark:text-white">
                            <BoltIcon className="w-8 h-8 text-indigo-600" />
                            Strategic Skill Gaps
                        </h3>

                        <div className="space-y-10">
                            {data.skillGaps.map((gap, gIdx) => (
                                <div key={gIdx} className="relative pl-10 border-l-2 border-slate-100 dark:border-dark-800">
                                    <div className="absolute top-0 left-[-11px] w-5 h-5 rounded-full bg-slate-50 dark:bg-dark-900 border-2 border-indigo-600 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                                    </div>

                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
                                        <h4 className="text-lg font-black italic uppercase text-slate-900 dark:text-white">{gap.skill}</h4>
                                        <span className="px-5 py-1.5 rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-black uppercase tracking-widest">
                                            Gap Intensity: {gap.gap}%
                                        </span>
                                    </div>

                                    <p className="text-xs font-bold italic text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                                        {gap.recommendation}
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-4 py-2 bg-slate-50 dark:bg-dark-800 rounded-xl text-[8px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-600/10">
                                            Recommended Lab-ID: 4022
                                        </span>
                                        <span className="px-4 py-2 bg-slate-50 dark:bg-dark-800 rounded-xl text-[8px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-600/10">
                                            Certification Path: AWS-CCP
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        {/* 12-Month Roadmap Summary */}
                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[4rem] p-12 text-white shadow-3xl relative overflow-hidden flex-1">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />

                            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4">
                                <ArrowTrendingUpIcon className="w-8 h-8 text-indigo-400" />
                                Growth Trajectory
                            </h3>

                            <div className="space-y-8">
                                {data.roadmap.map((step, sIdx) => (
                                    <div key={sIdx} className="group cursor-help">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{step.timeline}</span>
                                            <span className="text-[10px] font-bold text-white/40 italic">Phase {sIdx + 1}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-3">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${60 + (sIdx * 10)}%` }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1, delay: sIdx * 0.2 }}
                                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                            />
                                        </div>
                                        <p className="text-sm font-black italic uppercase tracking-tight">{step.focus}</p>
                                        <p className="text-[10px] font-medium text-white/60 italic mt-1 line-clamp-1 group-hover:line-clamp-none transition-all">
                                            Outcome: {step.outcome}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 p-6 bg-white/10 rounded-[2rem] border border-white/10 backdrop-blur-md flex items-center gap-6 group hover:bg-white/15 transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-xl font-black">?</div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Doubt Resolution</p>
                                    <p className="text-sm font-bold italic leading-tight">Ask AI Tutor about this Roadmap</p>
                                </div>
                            </div>
                        </div>

                        {/* Micro-Achievements / Synergy */}
                        <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-3xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-dot-pattern opacity-10 animate-float" />
                            <div className="relative z-10 flex items-center gap-8">
                                <div className="w-20 h-20 rounded-[2rem] bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <TrophyIcon className="w-10 h-10" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black italic uppercase tracking-tighter mb-1">Collaboration Sync</h4>
                                    <p className="text-xs font-bold italic text-white/70">
                                        AI has identified 4 peers for your next capstone project with 98% synergy.
                                    </p>
                                    <button className="mt-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-2 transition-transform">
                                        View Synergy Groups <ArrowTrendingUpIcon className="w-4 h-4 rotate-90" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SuccessPortal;

const BoltIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
);

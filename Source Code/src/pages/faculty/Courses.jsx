import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import {
    CpuChipIcon,
    ExclamationTriangleIcon,
    ChartBarIcon,
    AcademicCapIcon,
    SparklesIcon,
    PlusIcon,
    BookOpenIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';
import API_BASE_URL from '../../config/api';

export default function FacultyCourses() {
    const { user, token } = useAuthStore();
    const [courses, setCourses] = useState([]);
    const [insights, setInsights] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignedCourses();
    }, []);

    const fetchAssignedCourses = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/courses`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            const userId = user.id?.toString() || user._id?.toString();
            const assigned = (response.data.data || []).filter(c =>
                c.facultyIds?.some(f => (f._id || f)?.toString() === userId)
            );

            setCourses(assigned);

            // Fetch insights for each course (silently fail if endpoint not ready)
            const insightPromises = assigned.slice(0, 10).map(course =>
                axios.get(`${API_BASE_URL}/faculty-copilot/insights/course/${course._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(() => null)
            );

            const results = await Promise.allSettled(insightPromises);
            const newInsights = {};
            results.forEach((res, idx) => {
                if (res.status === 'fulfilled' && res.value?.data?.data) {
                    newInsights[assigned[idx]._id] = res.value.data.data;
                }
            });
            setInsights(newInsights);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                        <BookOpenIcon className="w-8 h-8 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <p className="mt-8 font-black text-indigo-500 uppercase tracking-[0.4em] text-[10px] italic animate-pulse">Accessing Pedagogy Matrix...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-6 py-12 md:p-12 lg:p-16 max-w-[1700px] mx-auto min-h-screen pt-24 md:pt-32 font-sans bg-slate-50 dark:bg-[#020617]"
        >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-16 lg:mb-24 gap-12">
                <div className="w-full xl:w-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="px-5 py-2 bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20 rounded-full flex items-center gap-3 italic">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                            Instructional Command Center
                        </span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.85] italic">
                        Intelligence <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-500/30 decoration-[12px] underline-offset-[12px]">Command</span>
                    </h1>
                    <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.3em] text-[11px] mt-10 flex items-center gap-3 italic bg-indigo-500/5 px-6 py-2.5 rounded-full border border-indigo-500/10 w-fit shadow-sm">
                        <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(79,70,229,0.6)]"></span>
                        Active Teaching Nodes • {courses.length} Sectors Online
                    </p>
                </div>
                <Link
                    to="/faculty/courses/create"
                    className="w-full xl:w-auto bg-indigo-600 hover:bg-slate-950 text-white px-12 py-7 rounded-[2rem] md:rounded-[3rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-[0_20px_50px_rgba(79,70,229,0.4)] transition-all duration-500 transform hover:-translate-y-2 flex items-center justify-center gap-4 italic shrink-0 border-2 border-transparent hover:border-indigo-500/30"
                >
                    <PlusIcon className="w-6 h-6" />
                    Initialize New Sector
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
                {courses.map((course, idx) => {
                    const courseInsight = insights[course._id];
                    const criticalRate = courseInsight?.heatmap?.[0]?.criticalRate || 0;

                    return (
                        <motion.div
                            key={course._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group relative bg-white dark:bg-slate-900/50 backdrop-blur-2xl rounded-[3.5rem] md:rounded-[4.5rem] p-10 md:p-12 shadow-3xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all duration-500 flex flex-col h-full overflow-hidden"
                        >
                            {/* Accent Background */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-bl-[6rem] -mr-12 -mt-12 group-hover:scale-125 group-hover:bg-indigo-600/10 transition-all duration-1000 pointer-events-none" />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-12">
                                    <span className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] italic shadow-2xl border border-slate-800 dark:border-slate-200">
                                        Node: {course.code}
                                    </span>
                                    {criticalRate > 20 && (
                                        <div className="flex items-center gap-3 bg-rose-500/10 text-rose-500 px-5 py-2.5 rounded-full border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.2)] animate-pulse">
                                            <ExclamationTriangleIcon className="w-5 h-5" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Anomalies Detected</span>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter uppercase leading-[0.9] italic line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-500">{course.title}</h3>
                                <p className="text-[10px] md:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-12 flex items-center gap-3 italic bg-slate-50 dark:bg-slate-950/50 px-5 py-2 rounded-full border border-slate-200 dark:border-slate-800 w-fit">
                                    <BookOpenIcon className="w-5 h-5 text-indigo-500" />
                                    {course.programId?.name || 'Academic Core'} · Level {course.semesterNumber}
                                </p>

                                {/* Mini Vital Signs Grid */}
                                <div className="grid grid-cols-3 gap-4 mb-10">
                                    {[
                                        { label: 'CRIT %', val: `${criticalRate}%`, color: criticalRate > 20 ? 'text-rose-500' : 'text-slate-900 dark:text-white' },
                                        { label: 'INTERV.', val: courseInsight?.interventionSummary?.activeCount || 0, color: 'text-indigo-500' },
                                        { label: 'REMEDIAL', val: courseInsight?.modeDistribution?.remedial || 0, color: 'text-amber-500' }
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-slate-50 dark:bg-slate-950/60 backdrop-blur-xl p-6 rounded-[2rem] text-center border border-slate-200 dark:border-slate-800/50 transition-all duration-500 group-hover:bg-indigo-500/5 group-hover:border-indigo-500/20 shadow-sm">
                                            <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-3 italic leading-none">{stat.label}</p>
                                            <p className={`text-2xl font-black italic tracking-tighter ${stat.color}`}>{stat.val}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Top Struggle Topic Peek */}
                                {courseInsight?.heatmap?.[0] && (
                                    <div className="bg-indigo-500/5 dark:bg-indigo-500/10 backdrop-blur-xl p-8 rounded-[3rem] border border-indigo-500/20 mb-10 relative group/topic overflow-hidden shadow-sm">
                                        <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover/topic:scale-125 group-hover/topic:rotate-12 transition-all duration-700">
                                            <ChartBarIcon className="w-12 h-12 text-indigo-500" />
                                        </div>
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-3 italic relative z-10">
                                            <CpuChipIcon className="w-5 h-5" />
                                            Active Bottleneck
                                        </p>
                                        <div className="flex justify-between items-center relative z-10">
                                            <p className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tighter italic truncate pr-6 selection:bg-indigo-500/30">{courseInsight.heatmap[0].topic}</p>
                                            <span className="flex-shrink-0 bg-indigo-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase italic animate-pulse shadow-xl shadow-indigo-600/30 border border-indigo-400/20">LIVE</span>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto grid grid-cols-2 gap-5">
                                    <Link
                                        to={`/faculty/copilot/${course._id}`}
                                        className="py-6 bg-indigo-600 hover:bg-slate-950 text-white rounded-[2.5rem] text-[10px] font-black uppercase text-center tracking-[0.3em] shadow-[0_15px_35px_rgba(79,70,229,0.3)] transition-all duration-500 transform hover:-translate-y-2 flex items-center justify-center gap-3 italic border-2 border-transparent hover:border-indigo-500/30"
                                    >
                                        <SparklesIcon className="w-5 h-5" />
                                        COPILOT
                                    </Link>
                                    <Link
                                        to={`/faculty/analytics`}
                                        className="py-6 bg-slate-100 dark:bg-slate-950/50 text-slate-600 dark:text-white rounded-[2.5rem] text-[10px] font-black uppercase text-center tracking-[0.3em] hover:bg-slate-950 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 transition-all duration-500 flex items-center justify-center gap-3 italic border-2 border-slate-200 dark:border-slate-800"
                                    >
                                        <ChartBarIcon className="w-5 h-5" />
                                        STATS
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {courses.length === 0 && (
                    <div className="col-span-full py-32 md:py-48 bg-white dark:bg-slate-900/50 backdrop-blur-2xl rounded-[4rem] md:rounded-[5.5rem] border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center px-12 group shadow-2xl">
                        <div className="relative mb-12">
                            <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="w-32 h-32 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center text-6xl shadow-inner relative z-10 border-4 border-slate-100 dark:border-slate-900 group-hover:rotate-12 transition-transform duration-700">
                                <BookOpenIcon className="w-16 h-16 text-slate-200 dark:text-slate-800 group-hover:text-indigo-500 transition-colors duration-500" />
                            </div>
                        </div>
                        <p className="font-black uppercase tracking-[0.5em] text-xl text-slate-400 dark:text-slate-500 italic mb-6">No Active Sectors Detected</p>
                        <p className="text-[11px] md:text-xs font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.3em] max-w-md leading-relaxed italic opacity-60">No teaching assignments detected in your operational matrix. Initialize your first sector to begin delivery.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

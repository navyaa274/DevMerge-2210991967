import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import {
    ChevronLeftIcon,
    AdjustmentsHorizontalIcon,
    AcademicCapIcon,
    EnvelopeIcon,
    Squares2X2Icon,
    IdentificationIcon,
    MagnifyingGlassIcon,
    IdentificationIcon as StudentIcon
} from '@heroicons/react/24/outline';
import API_BASE_URL from '../../config/api';

export default function FacultyStudents() {
    const { courseId } = useParams();
    const { token } = useAuthStore();
    const [course, setCourse] = useState(null);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterSection, setFilterSection] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCourseAndStudents();
    }, [courseId]);

    const fetchCourseAndStudents = async () => {
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const [courseRes, enrollRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/courses/${courseId}`, { headers }),
                axios.get(`${API_BASE_URL}/course-enrollments/course/${courseId}`, { headers })
            ]);

            setCourse(courseRes.data.data);
            setEnrollments(enrollRes.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const sections = [...new Set(enrollments.map(e => e.sectionId?.name).filter(Boolean))];

    const filteredEnrollments = enrollments.filter(e => {
        const matchesSection = filterSection === 'all' || e.sectionId?.name === filterSection;
        const matchesSearch = e.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            e.studentId?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSection && matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                    <p className="mt-6 font-black text-violet-600 uppercase tracking-[0.4em] text-[10px]">Accessing Enrollment Matrix...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 md:p-8 lg:p-12 max-w-[1700px] mx-auto min-h-screen pt-20 md:pt-24 font-sans"
        >
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 lg:mb-16 gap-8">
                <div className="w-full xl:w-auto">
                    <Link to="/faculty/courses" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 hover:text-violet-600 transition-colors italic group">
                        <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Intelligence Command Hub
                    </Link>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic truncate max-w-2xl">
                        {course?.title || 'Academic Sector'}
                    </h1>
                    <p className="text-violet-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 flex items-center gap-2 italic">
                        <span className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.3)]"></span>
                        Student Enrollment Matrix • {enrollments.length} Active Nodes
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    <div className="relative w-full sm:w-80 group">
                        <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-violet-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="SEARCH BY NAME OR ENNOD_ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-white dark:bg-dark-900 rounded-[2rem] text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-dark-800 shadow-xl shadow-slate-200/50 dark:shadow-none focus:ring-8 ring-violet-500/5 focus:border-violet-500/30 transition-all italic"
                        />
                    </div>
                    <div className="relative w-full sm:w-auto overflow-hidden rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-violet-600 transition-colors pointer-events-none">
                            <AdjustmentsHorizontalIcon className="w-5 h-5" />
                        </div>
                        <select
                            value={filterSection}
                            onChange={(e) => setFilterSection(e.target.value)}
                            className="w-full sm:w-auto pl-14 pr-10 py-5 bg-transparent rounded-[2rem] text-[10px] font-black uppercase tracking-widest border-none focus:ring-0 cursor-pointer appearance-none italic transition-all"
                        >
                            <option value="all">Across Entire Sector</option>
                            {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Content Table / Cards Wrapper */}
            <div className="bg-white dark:bg-dark-900 rounded-[3.5rem] md:rounded-[4.5rem] shadow-[0_20px_60px_-15px_rgba(15,23,42,0.1)] dark:shadow-none overflow-hidden border border-slate-50 dark:border-dark-800 relative group">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-dark-950/50 border-b border-slate-100 dark:border-dark-800/50">
                                <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Student Entity Asset</th>
                                <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Vector Communication</th>
                                <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Deployment Node</th>
                                <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic text-right">Synchronization Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-dark-800/30">
                            {filteredEnrollments.map((en, idx) => (
                                <motion.tr
                                    key={en._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className="hover:bg-violet-50/30 dark:hover:bg-violet-900/5 transition-all group/row"
                                >
                                    <td className="px-12 py-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-[1.5rem] bg-slate-900 dark:bg-dark-950 text-white flex items-center justify-center text-xl italic font-black shadow-xl shadow-slate-900/20 group-hover/row:rotate-12 transition-transform shrink-0">
                                                {en.studentId?.name?.charAt(0) || 'S'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-base md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none mb-2 truncate">
                                                    {en.studentId?.name}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-violet-600 bg-violet-50 dark:bg-violet-950/50 px-2 py-0.5 rounded-md uppercase italic border border-violet-100 dark:border-violet-900/30">ID VECTOR</span>
                                                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase italic font-mono">
                                                        {en.studentId?.id?.slice(-8) || 'NOD_####'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-12 py-8">
                                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 group-hover/row:text-violet-600 transition-colors">
                                            <EnvelopeIcon className="w-5 h-5 opacity-50" />
                                            <p className="text-xs font-black uppercase tracking-tight italic">{en.studentId?.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-12 py-8">
                                        <div className="inline-flex items-center gap-3 px-5 py-3 bg-slate-50 dark:bg-dark-950/50 rounded-2xl border border-slate-100 dark:border-dark-800 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest italic group-hover/row:border-violet-500/20 transition-all">
                                            <Squares2X2Icon className="w-4 h-4 text-violet-500" />
                                            SEC: {en.sectionId?.name || 'TBD'}
                                        </div>
                                    </td>
                                    <td className="px-12 py-8 text-right">
                                        <span className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest italic border border-emerald-100 dark:border-emerald-900/30 shadow-lg shadow-emerald-500/10">
                                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                            ENCRYPTED_ACTIVE
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-8 bg-slate-50 dark:bg-dark-950/50">
                    {filteredEnrollments.map((en, idx) => (
                        <motion.div
                            key={en._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-dark-800 flex flex-col gap-6 group hover:border-violet-500 transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-[1.8rem] bg-slate-900 dark:bg-dark-950 text-white flex items-center justify-center text-2xl font-black italic shadow-2xl shrink-0 group-hover:rotate-12 transition-transform">
                                        {en.studentId?.name?.charAt(0) || 'S'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none mb-3 truncate pr-4">
                                            {en.studentId?.name}
                                        </p>
                                        <span className="text-[8px] font-black text-violet-600 bg-violet-50 dark:bg-violet-950/50 px-3 py-1 rounded-md uppercase italic border border-violet-100 dark:border-violet-900/30">
                                            Vector Node ID: {en.studentId?.id?.slice(-8) || '####'}
                                        </span>
                                    </div>
                                </div>
                                <div className="shrink-0 bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                    <span className="w-3 h-3 bg-emerald-500 rounded-full block animate-pulse"></span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-slate-50 dark:border-dark-800">
                                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                    <EnvelopeIcon className="w-5 h-5 opacity-40" />
                                    <p className="text-[10px] font-black uppercase tracking-tight italic truncate">{en.studentId?.email}</p>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                    <Squares2X2Icon className="w-5 h-5 opacity-40 text-violet-500" />
                                    <p className="text-[11px] font-black uppercase tracking-widest italic leading-none">SECTOR NODE: {en.sectionId?.name || 'TBD'}</p>
                                </div>
                            </div>

                            <button className="w-full py-5 bg-slate-50 dark:bg-dark-950/50 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] italic text-slate-400 hover:bg-violet-600 hover:text-white transition-all shadow-inner group/btn">
                                ANALYZE VECTOR PORTFOLIO →
                            </button>
                        </motion.div>
                    ))}
                </div>

                {filteredEnrollments.length === 0 && (
                    <div className="py-24 md:py-40 text-center flex flex-col items-center justify-center px-8 bg-slate-50 dark:bg-dark-950/30">
                        <div className="w-24 h-24 bg-white dark:bg-dark-900 rounded-full flex items-center justify-center mb-10 text-4xl shadow-2xl animate-bounce">🌫️</div>
                        <p className="font-black uppercase tracking-[0.4em] text-sm text-slate-900 dark:text-white italic">Zero Nodes Synchronized</p>
                        <p className="text-[10px] mt-4 font-bold text-slate-500 uppercase tracking-widest max-w-sm leading-relaxed opacity-60">
                            No student assets discovered matching the specified identity or node vectors in the current sector context.
                        </p>
                    </div>
                )}
            </div>

            {/* Legend Nodes */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 md:gap-12 opacity-30">
                <div className="flex items-center gap-3">
                    <IdentificationIcon className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Asset Verification: Active</span>
                </div>
                <div className="flex items-center gap-3">
                    <Squares2X2Icon className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Syncing Cross-Vector Nodes</span>
                </div>
                <div className="flex items-center gap-3">
                    <AcademicCapIcon className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Institutional Standard Node-01</span>
                </div>
            </div>
        </motion.div>
    );
}

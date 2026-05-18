import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import {
    ChevronLeftIcon,
    AcademicCapIcon,
    ClipboardDocumentCheckIcon,
    ClockIcon,
    DocumentTextIcon,
    SparklesIcon,
    Bars3CenterLeftIcon,
    CodeBracketIcon,
    CheckBadgeIcon,
    ExclamationCircleIcon,
    ArrowsRightLeftIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';

export default function GradingHub() {
    const { user, token } = useAuthStore();
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [gradeData, setGradeData] = useState({ grade: '', feedback: '', rubricScores: {} });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState('all'); // all, pending, graded
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail' (for mobile)

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await axios.get(
                `${API_BASE_URL}/courses?faculty=${user.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const raw = res.data.courses || res.data.data || res.data || [];
            setCourses(raw);
            if (raw.length > 0) {
                setSelectedCourse(raw[0]);
                fetchSubmissions(raw[0]._id);
            }
        } catch (err) {
            console.error('Error fetching courses:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async (courseId) => {
        try {
            const [labSubsRes, probSubsRes, assignSubsRes] = await Promise.allSettled([
                axios.get(`${API_BASE_URL}/lab-submissions?course=${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/submissions/course/${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/assignment-submissions/assignment/all?course=${courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            let allSubs = [];
            if (labSubsRes.status === 'fulfilled') {
                const labData = Array.isArray(labSubsRes.value.data) ? labSubsRes.value.data : labSubsRes.value.data.data || [];
                allSubs = [...allSubs, ...labData.map(s => ({ ...s, _type: 'lab' }))];
            }
            if (probSubsRes.status === 'fulfilled') {
                const probData = probSubsRes.value.data.submissions || probSubsRes.value.data.data || [];
                allSubs = [...allSubs, ...probData.map(s => ({ ...s, _type: 'problem' }))];
            }
            if (assignSubsRes.status === 'fulfilled') {
                const assignData = assignSubsRes.value.data.submissions || [];
                allSubs = [...allSubs, ...assignData.map(s => ({ ...s, _type: 'assignment' }))];
            }

            setSubmissions(allSubs.sort((a, b) => new Date(b.createdAt || b.submittedAt) - new Date(a.createdAt || a.submittedAt)));
        } catch (err) {
            console.error('Error fetching submissions:', err);
            setSubmissions([]);
        }
    };

    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        setSelectedSubmission(null);
        setSubmissions([]);
        fetchSubmissions(course._id);
    };

    const selectSubmission = (sub) => {
        setSelectedSubmission(sub);
        setGradeData({
            grade: sub.grade || '',
            feedback: sub.feedback || '',
            rubricScores: sub.rubricScores || {}
        });
        setViewMode('detail');
    };

    const submitGrade = async () => {
        if (!selectedSubmission) return;
        setSubmitting(true);
        try {
            const endpoint = selectedSubmission._type === 'lab'
                ? `${API_BASE_URL}/lab-submissions/${selectedSubmission._id}/grade`
                : selectedSubmission._type === 'assignment'
                    ? `${API_BASE_URL}/assignment-submissions/${selectedSubmission._id}/grade`
                    : `${API_BASE_URL}/submissions/${selectedSubmission._id}/grade`;

            await axios.put(endpoint, gradeData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh
            fetchSubmissions(selectedCourse._id);
            setSelectedSubmission(null);
            setViewMode('list');
        } catch (err) {
            console.error('Grade error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredSubmissions = submissions.filter(s => {
        if (filter === 'pending') return !s.grade && s.status !== 'graded';
        if (filter === 'graded') return s.grade || s.status === 'graded';
        return true;
    });

    const pendingCount = submissions.filter(s => !s.grade && s.status !== 'graded').length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                        <AcademicCapIcon className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <p className="mt-8 font-black text-emerald-500 uppercase tracking-[0.4em] text-[10px] italic animate-pulse">Accessing Grading Matrix...</p>
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
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-16 lg:mb-24 gap-12">
                <div className="w-full xl:w-auto">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="px-5 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] border border-emerald-500/20 rounded-full flex items-center gap-3 italic">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                            Live Assessment Terminal
                        </span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.85] italic">
                        Grading <span className="text-emerald-600 dark:text-emerald-400 underline decoration-emerald-500/30 decoration-[12px] underline-offset-[12px]">Console</span>
                    </h1>
                    <div className="flex items-center gap-6 mt-10">
                        <div className="flex items-center gap-3 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] italic bg-white dark:bg-slate-900/50 backdrop-blur-xl px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                            {submissions.length} Entities Synchronized
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-black text-rose-500 uppercase tracking-[0.2em] italic bg-rose-500/5 px-5 py-2.5 rounded-full border border-rose-500/10 shadow-sm">
                            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>
                            {pendingCount} PENDING EVALUATION
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-2 bg-white dark:bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl w-full md:w-auto overflow-x-auto no-scrollbar">
                    {[
                        { id: 'all', label: 'ALL', count: submissions.length, color: 'emerald' },
                        { id: 'pending', label: 'PENDING', count: pendingCount, color: 'rose' },
                        { id: 'graded', label: 'GRADED', count: submissions.length - pendingCount, color: 'indigo' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id)}
                            className={`px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap flex items-center gap-4 italic ${filter === f.id ? `bg-${f.color}-600 text-white shadow-xl shadow-${f.color}-500/30 border border-${f.color}-400/20` : 'text-slate-500 hover:text-indigo-500 dark:text-slate-400'}`}
                        >
                            {f.label} <span className={`px-3 py-1 rounded-xl text-[9px] font-black ${filter === f.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-950/50'}`}>{f.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Course Navigation Hub */}
            <div className="flex gap-5 mb-16 md:mb-24 overflow-x-auto no-scrollbar pb-4">
                {courses.map(course => (
                    <button
                        key={course._id}
                        onClick={() => handleCourseSelect(course)}
                        className={`px-10 py-6 rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.3em] whitespace-nowrap transition-all duration-500 flex items-center gap-4 border-2 shrink-0 italic ${selectedCourse?._id === course._id
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_20px_50px_rgba(79,70,229,0.4)] scale-105'
                            : 'bg-white dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-500/5 backdrop-blur-xl shadow-sm'
                            }`}
                    >
                        <AcademicCapIcon className={`w-6 h-6 ${selectedCourse?._id === course._id ? 'text-white' : 'text-indigo-500'}`} />
                        {course.code || course.title}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 relative overflow-hidden h-full lg:h-auto">

                {/* Submission Queue (List) */}
                <div className={`lg:col-span-12 xl:col-span-4 h-full ${viewMode === 'detail' ? 'hidden xl:block' : 'block'}`}>
                    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-2xl rounded-[3.5rem] md:rounded-[4.5rem] shadow-3xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full max-h-[85vh]">
                        <div className="p-10 md:p-12 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-5">
                                <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                                    <Bars3CenterLeftIcon className="w-8 h-8 text-emerald-500" />
                                </div>
                                Matrix Queue
                            </h2>
                            <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] italic bg-slate-50 dark:bg-slate-950/50 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">{filteredSubmissions.length} Assets</span>
                        </div>
                        <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 grow custom-scrollbar">
                            {filteredSubmissions.map((sub, idx) => (
                                <motion.button
                                    key={sub._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    onClick={() => selectSubmission(sub)}
                                    className={`w-full p-10 text-left transition-all duration-500 relative group/sub ${selectedSubmission?._id === sub._id
                                        ? 'bg-emerald-600/5 dark:bg-emerald-500/10'
                                        : 'bg-transparent hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10'
                                        }`}
                                >
                                    {selectedSubmission?._id === sub._id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-emerald-600 shadow-[4px_0_20px_rgba(16,185,129,0.6)]" />
                                    )}
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-[1.8rem] bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center text-2xl font-black italic shadow-2xl shrink-0 group-hover/sub:rotate-12 group-hover/sub:scale-110 transition-all duration-500 border border-slate-800 dark:border-slate-200">
                                                {(sub.user?.name || sub.student?.name || 'S').charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none truncate pr-6 group-hover/sub:text-indigo-500 dark:group-hover/sub:text-indigo-400 transition-colors">
                                                    {sub.user?.name || sub.student?.name || 'Student Asset'}
                                                </p>
                                                <div className="flex items-center gap-3 mt-4">
                                                    {sub.grade ? (
                                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/5 dark:bg-emerald-500/10 px-3 py-1 rounded-lg uppercase italic border border-emerald-500/20 shadow-sm flex items-center gap-2">
                                                            <CheckBadgeIcon className="w-4 h-4" /> VERIFIED: {sub.grade}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] font-black text-amber-500 bg-amber-500/5 dark:bg-amber-500/10 px-3 py-1 rounded-lg uppercase italic border border-amber-500/20 shadow-sm flex items-center gap-2 animate-pulse">
                                                            <ClockIcon className="w-4 h-4" /> LATENT_SYNC
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] italic shrink-0 border-2 shadow-sm ${sub._type === 'lab' ? 'bg-indigo-500/5 text-indigo-600 border-indigo-500/20' : 'bg-amber-500/5 text-amber-600 border-amber-500/20'}`}>
                                            {sub._type}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] italic opacity-70">
                                        <span className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-950/50 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800"><CalendarIcon className="w-4 h-4 text-indigo-500" /> {new Date(sub.createdAt || sub.submittedAt).toLocaleDateString()}</span>
                                        <span className="group-hover/sub:translate-x-3 transition-all duration-500 text-indigo-500">INSPECT NODE →</span>
                                    </div>
                                </motion.button>
                            ))}

                            {filteredSubmissions.length === 0 && (
                                <div className="py-24 text-center flex flex-col items-center">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center mb-8 border border-slate-100 dark:border-slate-800">
                                        <SparklesIcon className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                                    </div>
                                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Queue Optimized</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3 italic">No matching assessment vectors detected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Grading Workbench (Detail) */}
                <div className={`lg:col-span-12 xl:col-span-8 h-full ${viewMode === 'list' && 'hidden xl:block'}`}>
                    <AnimatePresence mode="wait">
                        {selectedSubmission ? (
                            <motion.div
                                key={selectedSubmission._id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="space-y-12 md:space-y-16"
                            >
                                {/* Asset Identity Card */}
                                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-2xl rounded-[3.5rem] md:rounded-[4.5rem] p-12 md:p-16 shadow-3xl border border-slate-200 dark:border-slate-800 relative group overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-bl-[8rem] -mr-16 -mt-16 group-hover:scale-110 group-hover:bg-indigo-600/10 transition-all duration-1000 pointer-events-none" />

                                    <button
                                        onClick={() => setViewMode('list')}
                                        className="xl:hidden inline-flex items-center gap-3 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em] mb-12 hover:text-indigo-600 transition-colors italic group/back bg-slate-100 dark:bg-slate-950/50 px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-800"
                                    >
                                        <ChevronLeftIcon className="w-5 h-5 group-hover/back:-translate-x-2 transition-transform" />
                                        Return to Matrix Queue
                                    </button>

                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
                                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[3rem] md:rounded-[4rem] bg-slate-950 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center text-5xl md:text-6xl font-black italic shadow-[0_30px_60px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_60px_rgba(255,255,255,0.1)] shrink-0 group-hover:rotate-6 group-hover:scale-105 transition-all duration-700 border border-slate-800 dark:border-slate-200">
                                            {(selectedSubmission.user?.name || selectedSubmission.student?.name || 'S').charAt(0)}
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                                                <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-[0.9] truncate max-w-lg">
                                                    {selectedSubmission.user?.name || selectedSubmission.student?.name || 'Student Asset'}
                                                </h2>
                                                <span className={`px-6 py-2 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] italic shadow-sm border-2 ${selectedSubmission._type === 'lab' ? 'bg-indigo-500/5 text-indigo-600 border-indigo-500/20' : 'bg-amber-500/5 text-amber-600 border-amber-500/20'}`}>
                                                    {selectedSubmission._type} ENNOD
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
                                                <div className="flex items-center gap-3 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] italic bg-slate-50 dark:bg-slate-950/50 px-5 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                                                    <SparklesIcon className="w-5 h-5 text-emerald-500" />
                                                    {selectedSubmission.user?.email || selectedSubmission.student?.email}
                                                </div>
                                                <div className="flex items-center gap-3 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] italic bg-slate-50 dark:bg-slate-950/50 px-5 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                                                    <ClockIcon className="w-5 h-5 text-indigo-500" />
                                                    SYNC_LOCKED: {new Date(selectedSubmission.createdAt || selectedSubmission.submittedAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Curricular Logic Nodes (Code/Report) */}
                                <div className="bg-slate-950 rounded-[4rem] md:rounded-[5.5rem] p-1 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] group border border-white/5">
                                    <div className="p-12 md:p-16 lg:p-20">
                                        <div className="flex justify-between items-center mb-12">
                                            <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.5em] italic flex items-center gap-4">
                                                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                                    <CodeBracketIcon className="w-6 h-6" />
                                                </div>
                                                Node Logic Structure
                                            </h3>
                                            <div className="flex items-center gap-4">
                                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic opacity-60">UTF-8 • MATRIX_READ_ONLY</span>
                                            </div>
                                        </div>

                                        {(selectedSubmission.submissionData?.code || selectedSubmission.code) && (
                                            <div className="relative group/code">
                                                <div className="absolute top-8 right-8 z-10 opacity-0 group-hover/code:opacity-100 transition-all duration-500 translate-y-2 group-hover/code:translate-y-0">
                                                    <span className="px-5 py-2 bg-white/10 backdrop-blur-xl rounded-xl text-[10px] font-black text-white italic tracking-[0.3em] border border-white/10 shadow-2xl">ASM_V2.0 // DECRYPTED</span>
                                                </div>
                                                <pre className="custom-scrollbar bg-black/60 backdrop-blur-3xl text-sm md:text-base font-mono p-12 md:p-16 lg:p-20 rounded-[3.5rem] md:rounded-[4.5rem] overflow-x-auto max-h-[700px] border border-white/10 text-emerald-400/90 group-hover:border-emerald-500/30 transition-all duration-700 leading-relaxed no-scrollbar selection:bg-emerald-500/30 shadow-inner">
                                                    <code className="block py-4">{selectedSubmission.submissionData?.code || selectedSubmission.code}</code>
                                                </pre>
                                            </div>
                                        )}

                                        {selectedSubmission.submissionData?.labReport && (
                                            <div className="mt-12 p-12 md:p-16 bg-white/5 rounded-[3.5rem] md:rounded-[4.5rem] border border-white/5 backdrop-blur-xl shadow-2xl group/report hover:border-indigo-500/20 transition-all duration-700">
                                                <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-8 italic flex items-center gap-4">
                                                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                                        <DocumentTextIcon className="w-6 h-6" />
                                                    </div>
                                                    Executive Node Summary
                                                </p>
                                                <p className="text-base md:text-lg text-slate-300 font-bold uppercase tracking-tight italic leading-loose opacity-80 whitespace-pre-wrap selection:bg-indigo-500/30">{selectedSubmission.submissionData.labReport}</p>
                                            </div>
                                        )}
                                        {selectedSubmission.answer && (
                                            <div className="mt-12 p-12 md:p-16 bg-white/5 rounded-[3.5rem] md:rounded-[4.5rem] border border-white/5 backdrop-blur-xl shadow-2xl">
                                                <p className="text-base md:text-lg text-slate-200 font-bold italic leading-relaxed selection:bg-emerald-500/30">{selectedSubmission.answer}</p>
                                            </div>
                                        )}
                                        {selectedSubmission.fileUrl && (
                                            <div className="mt-16 flex justify-center">
                                                <motion.a 
                                                    whileHover={{ scale: 1.05, y: -5 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    href={selectedSubmission.fileUrl} target="_blank" rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-6 px-16 py-8 bg-white/5 hover:bg-white/10 text-white rounded-[2.5rem] border border-white/10 text-[11px] font-black uppercase tracking-[0.4em] italic shadow-2xl transition-all duration-500 group/download"
                                                >
                                                    <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30 group-hover/download:rotate-12 transition-transform">
                                                        <ArrowsRightLeftIcon className="w-7 h-7 text-emerald-500" />
                                                    </div>
                                                    EXTRACT EXTERNAL_VOL_01
                                                </motion.a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Evaluation Vector (Grading) */}
                                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-2xl rounded-[3.5rem] md:rounded-[5.5rem] p-12 md:p-20 lg:p-24 shadow-3xl border border-slate-200 dark:border-slate-800 relative group overflow-hidden">
                                    <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-600/5 rounded-br-[8rem] -ml-16 -mt-16 group-hover:scale-110 group-hover:bg-emerald-600/10 transition-all duration-1000 pointer-events-none" />

                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-16 flex items-center gap-6">
                                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-sm">
                                            <ClipboardDocumentCheckIcon className="w-10 h-10 text-emerald-600" />
                                        </div>
                                        Evaluation Calibration
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-24">
                                        <div className="md:col-span-4 flex flex-col items-center">
                                            <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em] italic mb-8 block text-center">Matrix Grade (0-100)</label>
                                            <div className="relative group/score w-full max-w-[240px]">
                                                <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full opacity-0 group-hover/score:opacity-100 transition-opacity duration-700"></div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={gradeData.grade}
                                                    onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                                                    className="w-full h-40 md:h-48 rounded-[3.5rem] md:rounded-[4.5rem] bg-slate-950 dark:bg-white border-4 border-slate-800 dark:border-slate-100 focus:border-emerald-500/50 text-7xl md:text-8xl font-black text-emerald-500 dark:text-emerald-600 transition-all duration-500 focus:ring-[20px] ring-emerald-500/5 placeholder:opacity-10 text-center outline-none italic shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative z-10"
                                                    placeholder="00"
                                                />
                                                <p className="text-center mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic bg-slate-100 dark:bg-slate-950/50 px-6 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm relative z-10">Percentage Node Lock</p>
                                            </div>
                                        </div>
                                        <div className="md:col-span-8 flex flex-col">
                                            <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em] italic mb-8 block px-8">Pedagogical Feedback Vector</label>
                                            <textarea
                                                value={gradeData.feedback}
                                                onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                                                rows={8}
                                                placeholder="ENTER QUANTITATIVE AND QUALITATIVE PERFORMANCE VECTORS FOR THE STUDENT ASSET..."
                                                className="w-full px-12 py-12 rounded-[3.5rem] md:rounded-[4.5rem] bg-slate-950 dark:bg-slate-50 border-4 border-slate-800 dark:border-slate-200 focus:border-indigo-500/50 text-base md:text-lg font-black text-slate-300 dark:text-slate-900 transition-all duration-500 focus:ring-[20px] ring-indigo-500/5 placeholder:opacity-30 placeholder:italic italic uppercase tracking-tight leading-relaxed resize-none outline-none shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={submitGrade}
                                        disabled={submitting || !gradeData.grade}
                                        className="w-full mt-20 py-10 bg-indigo-600 hover:bg-slate-950 text-white rounded-[3rem] md:rounded-[5rem] font-black uppercase tracking-[0.5em] text-xs md:text-sm shadow-[0_30px_60px_rgba(79,70,229,0.5)] transition-all duration-500 flex items-center justify-center gap-6 italic disabled:opacity-50 group/btn border-2 border-transparent hover:border-indigo-500/30"
                                    >
                                        {submitting ? (
                                            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Initialize Node Verification
                                                <div className="p-2 bg-white/20 rounded-xl group-hover/btn:rotate-12 transition-transform">
                                                    <CheckBadgeIcon className="w-8 h-8" />
                                                </div>
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-2xl rounded-[3.5rem] md:rounded-[5.5rem] p-24 shadow-3xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center h-full min-h-[800px] text-center group">
                                <div className="relative mb-16">
                                    <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                                    <div className="w-48 h-48 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center text-8xl shadow-inner relative z-10 border-4 border-slate-100 dark:border-slate-900 group-hover:rotate-12 transition-transform duration-700">
                                        <SparklesIcon className="w-24 h-24 text-slate-200 dark:text-slate-800 group-hover:text-indigo-500 transition-colors duration-500" />
                                    </div>
                                </div>
                                <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-8">Zero Node Selected</h3>
                                <p className="text-[11px] md:text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.5em] max-w-md italic leading-relaxed opacity-60">Synchronize with an individual asset node from the Matrix Queue to initiate pedagogical evaluation vectors.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* System Performance Display */}
            <div className="mt-24 pt-12 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-center gap-12 md:gap-20 opacity-40">
                <div className="flex items-center gap-4 group cursor-default">
                    <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 group-hover:scale-110 transition-transform">
                        <ExclamationCircleIcon className="w-6 h-6 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.6em] italic leading-none">Integrity: Verified</span>
                </div>
                <div className="flex items-center gap-4 group cursor-default">
                    <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 group-hover:scale-110 transition-transform">
                        <SparklesIcon className="w-6 h-6 text-indigo-500" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.6em] italic leading-none">Pedagogy Sync: Online</span>
                </div>
            </div>
        </motion.div>
    );
}


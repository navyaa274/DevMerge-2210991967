import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import {
    ChevronLeftIcon,
    DocumentTextIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    PaperClipIcon,
    ChartBarIcon,
    CheckBadgeIcon,
    SparklesIcon,
    CloudArrowUpIcon,
    ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

export default function AssignmentSubmission() {
    const { assignmentId } = useParams();
    const { user, token } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [assignment, setAssignment] = useState(null);
    const [content, setContent] = useState('');
    const [answers, setAnswers] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [mySubmission, setMySubmission] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignment();
    }, [assignmentId]);

    const fetchAssignment = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [assignRes, subRes] = await Promise.allSettled([
                axios.get(`${API_BASE_URL}/assignments/${assignmentId}`, { headers }),
                axios.get(`${API_BASE_URL}/assignment-submissions/my`, { headers })
            ]);

            if (assignRes.status === 'fulfilled') {
                const data = assignRes.value.data.data || assignRes.value.data;
                setAssignment(data);
            }

            if (subRes.status === 'fulfilled') {
                const subs = subRes.value.data.submissions || [];
                const existing = subs.find(s => s.assignment?._id === assignmentId || s.assignment === assignmentId);
                if (existing) setMySubmission(existing);
            }
        } catch (err) {
            console.error('Error loading assignment:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerChange = (index, value) => {
        setAnswers(prev => ({ ...prev, [index]: value }));
    };

    const handleSubmit = async () => {
        const payload = {
            assignmentId,
            content: content || JSON.stringify(answers),
            submissionType: assignment?.questions?.length > 0 ? 'text' : 'text'
        };

        setSubmitting(true);
        try {
            await axios.post(
                `${API_BASE_URL}/assignment-submissions`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchAssignment();
        } catch (err) {
            console.error('Submission error:', err);
            alert('Failed to submit: ' + (typeof err.response?.data?.error === 'string' ? err.response?.data?.error : err.response?.data?.error?.toString() || typeof err.message === 'string' ? err.message : err?.toString() || 'Unknown error occurred'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="mt-6 font-black text-indigo-600 uppercase tracking-[0.4em] text-[10px]">Retrieving Mission Protocol...</p>
                </div>
            </div>
        );
    }

    if (!assignment) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-dark-950 p-8 flex flex-col items-center justify-center">
                <div className="text-6xl mb-6 grayscale text-slate-300">⚠️</div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-8">Protocol Not Found</h2>
                <Link to="/student/dashboard" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-colors flex items-center gap-2 italic">
                    <ChevronLeftIcon className="w-4 h-4" /> Return to Active Matrix
                </Link>
            </div>
        );
    }

    const isPastDue = new Date(assignment.dueDate) < new Date();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-slate-50 dark:bg-dark-950 px-4 py-8 md:p-8 lg:p-12 pt-24 md:pt-32 font-sans"
        >
            <div className="max-w-[1400px] mx-auto">
                {/* Header Sequence */}
                <div className="mb-12 lg:mb-16">
                    <Link to="/student/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 hover:text-indigo-600 transition-colors italic group">
                        <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Active Missions Database
                    </Link>
                    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic max-w-4xl truncate">
                                {assignment.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-6">
                                <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest italic border ${isPastDue ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30' : 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/30'}`}>
                                    <ClockIcon className="w-4 h-4" />
                                    SYNC DEADLINE: {new Date(assignment.dueDate).toLocaleString()}
                                    {isPastDue && <span className="ml-2">— OVERDUE</span>}
                                </span>
                                {mySubmission && (
                                    <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/30 text-[9px] md:text-[10px] font-black uppercase tracking-widest italic shadow-sm">
                                        <CheckCircleIcon className="w-4 h-4" /> ARTIFACT SECURED
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Primary Mission Interface */}
                    <div className="lg:col-span-8 xl:col-span-9 space-y-8 md:space-y-12">

                        {/* Mission Briefing */}
                        <div className="bg-white dark:bg-dark-900 rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 shadow-3xl border border-slate-50 dark:border-dark-800 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 rounded-bl-[6rem] -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 italic flex items-center gap-4 relative z-10">
                                <DocumentTextIcon className="w-8 h-8 text-indigo-600" /> Tactical Briefing
                            </h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base whitespace-pre-wrap font-medium relative z-10">
                                {assignment.description}
                            </div>
                        </div>

                        {/* Submission Matrix */}
                        <div className="bg-slate-900 dark:bg-dark-950 rounded-[3rem] md:rounded-[4rem] p-1 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.3)] relative group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>

                            <div className="bg-white dark:bg-dark-900 rounded-[2.9rem] md:rounded-[3.9rem] p-8 md:p-12 relative z-10 h-full border border-slate-50 dark:border-dark-800">
                                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-10 italic flex items-center gap-4">
                                    <CloudArrowUpIcon className="w-8 h-8 text-indigo-600" /> Artifact Link
                                </h2>

                                {assignment.questions && assignment.questions.length > 0 ? (
                                    <div className="space-y-10 md:space-y-12">
                                        {assignment.questions.map((q, i) => (
                                            <div key={i} className="group/q">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-black text-xs italic group-hover/q:scale-110 transition-transform">{i + 1}</span>
                                                        <p className="text-sm md:text-base font-black text-slate-800 dark:text-white leading-tight italic">{q.text}</p>
                                                    </div>
                                                    <span className="px-3 py-1 bg-slate-100 dark:bg-dark-950 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0 border border-slate-200 dark:border-dark-800 italic">{q.marks} NODE PTS</span>
                                                </div>
                                                <div className="relative">
                                                    <ChatBubbleBottomCenterTextIcon className="absolute left-6 top-6 w-5 h-5 text-slate-300 pointer-events-none" />
                                                    <textarea
                                                        disabled={mySubmission || (isPastDue && !assignment.allowLate) || submitting}
                                                        value={answers[i] || ''}
                                                        onChange={(e) => handleAnswerChange(i, e.target.value)}
                                                        placeholder="Initialize response sequence..."
                                                        className="w-full bg-slate-50 dark:bg-dark-950 rounded-[2rem] pl-16 pr-8 py-6 text-sm md:text-base border-2 border-transparent focus:border-indigo-500/30 outline-none focus:ring-8 ring-indigo-500/5 dark:text-white min-h-[140px] resize-y transition-all placeholder:italic placeholder:opacity-40 italic font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3 italic">
                                            <PaperClipIcon className="w-4 h-4" /> Upload Sequence Payload
                                        </p>
                                        <div className="relative">
                                            <textarea
                                                disabled={mySubmission || (isPastDue && !assignment.allowLate) || submitting}
                                                value={content}
                                                onChange={(e) => setContent(e.target.value)}
                                                placeholder="Provide your artifact sequence or cloud link references..."
                                                className="w-full bg-slate-50 dark:bg-dark-950 rounded-[2.5rem] p-8 md:p-10 text-sm md:text-base border-2 border-transparent focus:border-indigo-500/30 outline-none focus:ring-8 ring-indigo-500/5 dark:text-white min-h-[300px] md:min-h-[400px] resize-y transition-all placeholder:italic placeholder:opacity-40 italic font-bold leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                                            />
                                        </div>
                                    </div>
                                )}

                                {!mySubmission && (!isPastDue || assignment.allowLate) && (
                                    <div className="mt-12 md:mt-16 pt-8 border-t border-slate-100 dark:border-dark-800 flex justify-end">
                                        <button
                                            onClick={handleSubmit}
                                            disabled={submitting}
                                            className="w-full sm:w-auto px-12 md:px-16 py-6 md:py-8 bg-indigo-600 text-white rounded-[2rem] md:rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] md:text-xs shadow-3xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:bg-slate-900 transition-all transform hover:-translate-y-2 flex items-center justify-center gap-4 italic disabled:opacity-50 disabled:hover:translate-y-0 group/btn"
                                        >
                                            {submitting ? (
                                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    Transmit Artifact Sequence
                                                    <SparklesIcon className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mission Parameters & Status Sidebar */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-8">

                        {/* Status Check (If Submitted) */}
                        <AnimatePresence>
                            {mySubmission && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-emerald-50 dark:bg-emerald-950/20 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/10 relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-16 -mt-16 pointer-events-none"></div>

                                    <h3 className="text-sm md:text-base font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter mb-8 flex items-center gap-3 italic leading-none">
                                        <CheckBadgeIcon className="w-8 h-8" /> Sequence Secured
                                    </h3>

                                    <div className="space-y-6 relative z-10">
                                        <div>
                                            <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 italic">Current Vector</p>
                                            <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                {mySubmission.status}
                                            </p>
                                        </div>

                                        {mySubmission.grade !== null && mySubmission.grade !== undefined && (
                                            <div className="pt-6 border-t border-emerald-500/20">
                                                <p className="text-[8px] md:text-[9px] font-black text-emerald-600/60 uppercase tracking-[0.3em] mb-2 italic">Evaluated Output</p>
                                                <p className="text-3xl md:text-4xl font-black text-emerald-600 italic tracking-tighter shadow-sm">{mySubmission.grade} <span className="text-sm text-emerald-600/50 tracking-widest uppercase">/ {assignment.totalMarks || 100}</span></p>
                                            </div>
                                        )}

                                        {mySubmission.feedback && (
                                            <div className="mt-6 p-6 bg-white/60 dark:bg-dark-900/40 backdrop-blur-sm rounded-2xl border border-emerald-500/20">
                                                <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2 italic">
                                                    <ChatBubbleBottomCenterTextIcon className="w-4 h-4" /> Intel Reply
                                                </p>
                                                <p className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed">"{mySubmission.feedback}"</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Parameters Terminal */}
                        <div className="bg-slate-900 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors pointer-events-none"></div>

                            <h3 className="text-xs md:text-sm font-black uppercase tracking-[0.3em] mb-8 text-indigo-400 flex items-center gap-3 italic">
                                <ChartBarIcon className="w-5 h-5" /> Mission Vectors
                            </h3>

                            <div className="space-y-6 md:space-y-8 relative z-10 divide-y divide-white/5">
                                <div className="flex justify-between items-center sm:items-end w-full">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Payload Cap</span>
                                    <span className="text-xl md:text-2xl font-black text-indigo-400 italic leading-none">{assignment.totalMarks || 100} PTS</span>
                                </div>
                                <div className="flex justify-between items-center sm:items-end pt-6 md:pt-8 w-full">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Modifier</span>
                                    <span className="text-lg md:text-xl font-black text-emerald-400 italic leading-none">{assignment.weightage || 1}x</span>
                                </div>
                                <div className="flex justify-between items-center sm:items-end pt-6 md:pt-8 w-full">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Late Sync Matrix</span>
                                    <span className={`text-xs md:text-sm font-black uppercase tracking-widest italic flex items-center gap-2 ${assignment.allowLate ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {assignment.allowLate ? <CheckCircleIcon className="w-4 h-4" /> : <ExclamationTriangleIcon className="w-4 h-4" />}
                                        {assignment.allowLate ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </motion.div>
    );
}

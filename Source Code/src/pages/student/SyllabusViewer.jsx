import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function SyllabusViewer() {
    const { courseId } = useParams();
    const { token } = useAuthStore();
    const [syllabus, setSyllabus] = useState(null);
    const [units, setUnits] = useState([]);
    const [expandedUnit, setExpandedUnit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSyllabus();
    }, [courseId]);

    const fetchSyllabus = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(
                `${API_BASE_URL}/syllabus/course/${courseId}`,
                { headers }
            );
            const syllabusData = res.data.syllabus || res.data.data;
            setSyllabus(syllabusData);

            // Fetch units if syllabus exists
            if (syllabusData?._id) {
                try {
                    const unitsRes = await axios.get(
                        `${API_BASE_URL}/syllabus/${syllabusData._id}/units`,
                        { headers }
                    );
                    setUnits(unitsRes.data.units || []);
                } catch {
                    // Units endpoint might not exist, use embedded units
                    setUnits(syllabusData.units || []);
                }
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setError('No syllabus has been published for this course yet.');
            } else {
                setError('Failed to load syllabus.');
            }
            console.error('Syllabus fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getCompletionPercent = () => {
        if (!units.length) return 0;
        const completed = units.filter(u => u.isCompleted || u.status === 'Completed').length;
        return Math.round((completed / units.length) * 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-dark-900 p-8">
                <div className="max-w-4xl mx-auto">
                    <Link to="/student/courses" className="text-xs font-black text-violet-600 uppercase tracking-widest hover:underline mb-4 inline-block">← Back to Courses</Link>
                    <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-16 shadow-lg border border-slate-100 dark:border-dark-700 text-center">
                        <div className="text-5xl mb-4">📚</div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">Syllabus Unavailable</h2>
                        <p className="text-sm text-slate-500">{typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50 dark:bg-dark-900 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                    <Link to="/student/courses" className="text-xs font-black text-violet-600 uppercase tracking-widest hover:underline mb-2 inline-block">← Back to Courses</Link>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                        {syllabus?.course?.title || syllabus?.title || 'Course Syllabus'}
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        {syllabus?.course?.code || ''} · {syllabus?.academicYear || ''} · {syllabus?.status || 'Active'}
                    </p>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {[
                        { label: 'Units', value: units.length, color: 'violet' },
                        { label: 'Total Hours', value: syllabus?.totalHours || units.reduce((s, u) => s + (u.hours || 0), 0), color: 'indigo' },
                        { label: 'Credits', value: syllabus?.course?.credits || syllabus?.credits || '-', color: 'purple' },
                        { label: 'Progress', value: `${getCompletionPercent()}%`, color: 'emerald' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-dark-800 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-dark-700"
                        >
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className={`text-3xl font-black text-${stat.color}-600 tracking-tighter`}>{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Course Objectives */}
                {(syllabus?.objectives || syllabus?.courseObjectives) && (
                    <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 shadow-lg border border-slate-100 dark:border-dark-700 mb-8">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Course Objectives</h2>
                        <ul className="space-y-3">
                            {(syllabus.objectives || syllabus.courseObjectives || []).map((obj, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="w-6 h-6 bg-violet-100 dark:bg-violet-900/20 rounded-lg flex items-center justify-center text-violet-600 font-black text-xs flex-shrink-0 mt-0.5">
                                        {i + 1}
                                    </div>
                                    {typeof obj === 'string' ? obj : obj.description || obj.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Units / Modules */}
                <div className="space-y-4">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">Syllabus Units</h2>
                    {units.length > 0 ? units.map((unit, i) => (
                        <motion.div
                            key={unit._id || i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white dark:bg-dark-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-dark-700 overflow-hidden"
                        >
                            {/* Unit Header */}
                            <button
                                onClick={() => setExpandedUnit(expandedUnit === i ? null : i)}
                                className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-dark-900/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-violet-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-violet-600/20">
                                        {unit.unitNumber || i + 1}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-sm">
                                            {unit.title || unit.name || `Unit ${i + 1}`}
                                        </p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {unit.hours || 0} Hours · {unit.topics?.length || 0} Topics
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {(unit.isCompleted || unit.status === 'Completed') && (
                                        <span className="text-emerald-600 text-sm">✅</span>
                                    )}
                                    <span className={`text-slate-400 transition-transform ${expandedUnit === i ? 'rotate-180' : ''}`}>▼</span>
                                </div>
                            </button>

                            {/* Expanded Content */}
                            <AnimatePresence>
                                {expandedUnit === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-6 border-t border-slate-100 dark:border-dark-700 pt-4">
                                            {/* Description */}
                                            {unit.description && (
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">{unit.description}</p>
                                            )}
                                            {/* Topics */}
                                            {unit.topics && unit.topics.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Topics Covered</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {unit.topics.map((topic, j) => (
                                                            <span key={j} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold">
                                                                {typeof topic === 'string' ? topic : topic.name || topic.title}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {/* Learning Outcomes */}
                                            {unit.learningOutcomes && unit.learningOutcomes.length > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Learning Outcomes</p>
                                                    <ul className="space-y-2">
                                                        {unit.learningOutcomes.map((lo, j) => (
                                                            <li key={j} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                                <span className="text-emerald-500">→</span>
                                                                {typeof lo === 'string' ? lo : lo.description}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )) : (
                        <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-16 shadow-lg border border-dashed border-slate-200 dark:border-dark-700 text-center">
                            <p className="text-sm font-bold text-slate-400 uppercase">No units have been defined for this syllabus yet.</p>
                        </div>
                    )}
                </div>

                {/* Reference Materials */}
                {syllabus?.references && syllabus.references.length > 0 && (
                    <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 shadow-lg border border-slate-100 dark:border-dark-700 mt-8">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">📖 Reference Materials</h2>
                        <ul className="space-y-2">
                            {syllabus.references.map((ref, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                    <span className="text-violet-600 font-bold">{i + 1}.</span>
                                    {typeof ref === 'string' ? ref : ref.title || ref.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

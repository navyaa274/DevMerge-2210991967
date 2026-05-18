import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PuzzlePieceIcon, UserIcon, ArrowPathIcon, CheckBadgeIcon, ShieldExclamationIcon, TrophyIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import facultyService from '../../services/api/facultyService';
import toast from '../../utils/toast';
import { useAuthStore } from '../../store/authStore';

export default function SmartCohort() {
    const { user } = useAuthStore();
    const [generating, setGenerating] = useState(false);
    const [cohorts, setCohorts] = useState([]);
    const [heuristic, setHeuristic] = useState('Balance Weaknesses (Opposites Attract)');
    const [groupSize, setGroupSize] = useState(3);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [loadingCourses, setLoadingCourses] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await facultyService.getAssignedCourses(user.id);
                setCourses(res.data || []);
                if (res.data && res.data.length > 0) {
                    setSelectedCourse(res.data[0]._id);
                }
            } catch (error) {
                console.error("Failed to fetch courses:", error);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, [user.id]);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await facultyService.generateSmartCohort(heuristic, groupSize, selectedCourse);
            if (res.success && res.cohorts && res.cohorts.length > 0) {
                setCohorts(res.cohorts);
                toast.success('Synergy Matrix Generated Successfully');
            } else {
                toast.error(res.message || 'Insufficient data nodes to form cohorts.');
            }
        } catch (error) {
            console.error("Cohort sync failed:", error);
            const errorMsg = error.response?.data?.message || error.formattedMessage || error.message || "Failed to calculate matrix vectors";
            toast.error(errorMsg);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 md:p-8 lg:p-12 max-w-[1700px] mx-auto min-h-screen pt-20 md:pt-24 font-sans bg-slate-50 dark:bg-slate-950"
        >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
                <div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                        Smart <span className="text-violet-500">Cohort</span>
                    </h1>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                        AI-Driven Algorithmic Group Formation
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-8 md:p-12 shadow-3xl border border-slate-50 dark:border-dark-800">
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3 text-slate-900 dark:text-white mb-8">
                            <PuzzlePieceIcon className="w-8 h-8 text-violet-500" /> Pairing Engine
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 italic flex items-center gap-2">
                                    <AcademicCapIcon className="w-3 h-3" /> Source Course
                                </label>
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    disabled={loadingCourses}
                                    className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold outline-none focus:border-violet-500 transition-colors uppercase tracking-widest text-xs disabled:opacity-50">
                                    {loadingCourses ? (
                                        <option>Syncing Courses...</option>
                                    ) : courses.length === 0 ? (
                                        <option>No Courses Found</option>
                                    ) : (
                                        courses.map(c => (
                                            <option key={c._id} value={c._id}>{c.title}</option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 italic">Algorithm Heuristic</label>
                                <select
                                    value={heuristic}
                                    onChange={(e) => setHeuristic(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-bold outline-none focus:border-violet-500 transition-colors uppercase tracking-widest text-xs">
                                    <option>Balance Weaknesses (Opposites Attract)</option>
                                    <option>Cluster Experts (High Performance)</option>
                                    <option>Randomize (Chaos Matrix)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 italic">Group Size</label>
                                <input
                                    type="number"
                                    value={groupSize}
                                    onChange={(e) => setGroupSize(parseInt(e.target.value) || 2)}
                                    min="2"
                                    max="10"
                                    className="w-full bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white font-black text-xl text-center outline-none focus:border-violet-500 transition-colors"
                                />
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className={`w-full py-5 text-white rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 italic transition-all shadow-xl mt-8 
                                    ${generating ? 'bg-slate-300 dark:bg-dark-800 text-slate-500 cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-500 hover:scale-105 shadow-[0_0_30px_rgba(139,92,246,0.4)]'}
                                `}
                            >
                                {generating ? (
                                    <span className="flex items-center gap-2"><ArrowPathIcon className="w-5 h-5 animate-spin" /> Calculating Vectors...</span>
                                ) : (
                                    <span className="flex items-center gap-2"><ArrowPathIcon className="w-5 h-5" /> Generate Matrix</span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-slate-900 rounded-[3rem] p-8 shadow-3xl border border-violet-500/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl group-hover:bg-violet-500/20 transition-all"></div>
                        <ShieldExclamationIcon className="w-8 h-8 text-violet-500 mb-6" />
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-2 relative z-10 leading-none">Skill Distribution</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest relative z-10 leading-loose">
                            Front-End Heavy: <span className="text-rose-400">Warning.</span> Suggest clustering by supplementary back-end vectors to prevent project failure.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <AnimatePresence>
                        {cohorts.length === 0 && !generating ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="h-full min-h-[400px] flex flex-col items-center justify-center border-4 border-dashed border-slate-200 dark:border-dark-800 rounded-[3rem] p-12 text-center"
                            >
                                <PuzzlePieceIcon className="w-24 h-24 text-slate-300 dark:text-slate-700 mb-6 opacity-50" />
                                <h3 className="text-2xl font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest italic mb-2">Unassembled</h3>
                                <p className="text-sm font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest max-w-sm">
                                    Initiate the pairing engine to construct highly synchronized learning squads.
                                </p>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {cohorts.map((cohort, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: idx * 0.2 }}
                                className="bg-white dark:bg-dark-900 rounded-[3rem] p-8 shadow-3xl border border-slate-50 dark:border-dark-800 hover:border-violet-500/50 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic group-hover:text-violet-500 transition-colors">
                                        {cohort.name}
                                    </h3>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                                            <TrophyIcon className="w-4 h-4" /> {cohort.matchScore}% Synergy
                                        </div>
                                    </div>
                                </div>

                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 dark:border-dark-800 pb-4 italic">
                                    Vector: {cohort.synergy}
                                </p>

                                <div className="space-y-4">
                                    {cohort.students.map((stu) => (
                                        <div key={stu.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-950 rounded-2xl border border-slate-100 dark:border-dark-800">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 rounded-full flex items-center justify-center font-black">
                                                    {stu.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-1">{stu.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stu.role}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 justify-end mb-1 text-[10px] font-black uppercase tracking-widest text-indigo-500">
                                                    {stu.rating} XP
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-dark-800 flex justify-between gap-4">
                                    <button className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors italic border border-rose-500/20">
                                        Dissolve
                                    </button>
                                    <button className="flex-1 py-3 text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl transition-colors italic border border-emerald-500/20 flex justify-center items-center gap-2">
                                        <CheckBadgeIcon className="w-4 h-4" /> Finalize
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}




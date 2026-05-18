import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import courseService from '../../services/api/courseService';

export default function StudentCourses() {
    const { user } = useAuthStore();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                const data = await courseService.getStudentEnrollments(user?.id || user?._id);
                const result = data?.data || data;
                if (result && Array.isArray(result) && result.length > 0) setEnrollments(result);
            } catch (err) {
                console.error('Failed to fetch courses:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrolledCourses();
    }, [user?.id]);

    const displayEnrollments = useMemo(() => enrollments, [enrollments]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="flex flex-col items-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 border-t-2 border-b-2 border-indigo-500 rounded-full"
                    />
                    <p className="mt-8 font-black text-indigo-400 uppercase tracking-[0.4em] text-[10px] animate-pulse italic">ACCESSING ACADEMIC MATRIX...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-12 max-w-[1700px] mx-auto min-h-screen font-sans"
        >
            <div className="mb-24">
                <motion.h1 
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-8xl md:text-9xl font-black text-white tracking-[0.2em] uppercase leading-none italic"
                >
                    LEARNING <span className="text-indigo-500">PORTFOLIO</span>
                </motion.h1>
                <p className="text-indigo-400 font-bold uppercase tracking-[0.5em] text-[11px] mt-10 flex items-center gap-4">
                    <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.8)]"></span>
                    ENROLLED COURSE CATALOG • ACTIVE LEARNING NODES
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {displayEnrollments.map((en, idx) => {
                    const course = en.courseId;
                    return (
                        <motion.div
                            key={en._id}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -20, scale: 1.02 }}
                            className="bg-slate-950/40 backdrop-blur-2xl rounded-[4rem] p-12 shadow-3xl border border-white/10 group relative overflow-hidden flex flex-col"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.1] transition-all text-9xl italic font-black pointer-events-none group-hover:scale-150 group-hover:rotate-12">
                                {course?.code?.slice(0, 2)}
                            </div>

                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <span className="bg-indigo-600 text-white px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-indigo-600/30 border border-white/10">
                                    {course?.code || 'CRS'}
                                </span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] bg-white/5 px-6 py-3 rounded-[1.5rem] border border-white/5 italic">
                                    SEMESTER {en.semesterId?.semesterNumber || 1}
                                </span>
                            </div>

                            <h3 className="text-3xl font-black text-white mb-4 uppercase leading-tight italic tracking-tighter group-hover:text-indigo-400 transition-colors">
                                {course?.title}
                            </h3>
                            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-12 border-l-4 border-indigo-500 pl-6 py-2 italic">
                                {course?.programId?.name || 'ACADEMIC COURSE'}
                            </p>

                            <div className="grid grid-cols-2 gap-6 mb-12">
                                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] text-center border border-white/5 group-hover:bg-indigo-500/10 transition-colors">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">CREDITS</p>
                                    <p className="text-4xl font-black text-indigo-400 italic tracking-tighter">{course?.credits || 0}</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] text-center border border-white/5 group-hover:bg-emerald-500/10 transition-colors">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">VECTOR</p>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] italic">ACTIVE STATUS</p>
                                </div>
                            </div>

                            <div className="mt-auto space-y-8">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 ml-2 italic">ACADEMIC MENTORS</p>
                                    <div className="flex flex-wrap gap-3">
                                        {course?.facultyIds?.length > 0 ? course.facultyIds.map(f => (
                                            <span key={f._id} className="text-[10px] font-black text-white bg-white/5 px-5 py-2.5 rounded-[1rem] border border-white/5 italic">
                                                {f.name || `${f.firstName || ''} ${f.lastName || ''}`.trim() || 'FACULTY'}
                                            </span>
                                        )) : (
                                            <span className="text-[10px] font-black text-slate-600 italic tracking-widest">UNASSIGNED NODE</span>
                                        )}
                                    </div>
                                </div>

                                <Link
                                    to={`/student/course/${course?._id}`}
                                    className="w-full py-8 mt-10 bg-white text-black rounded-[2.5rem] text-[11px] font-black uppercase text-center tracking-[0.4em] shadow-3xl hover:bg-indigo-600 hover:text-white transition-all transform group-hover:scale-[1.02] block italic border border-white/20"
                                >
                                    INITIALIZE COURSE NODE
                                </Link>
                            </div>
                        </motion.div>
                    );
                })}

                {displayEnrollments.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="col-span-full py-48 bg-slate-950/40 backdrop-blur-2xl rounded-[5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 text-center"
                    >
                        <div className="text-8xl mb-12 grayscale opacity-30">🗳️</div>
                        <p className="font-black uppercase tracking-[0.5em] text-xl text-white mb-4 italic">PORTFOLIO DATA EMPTY</p>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-50 italic">NO ACTIVE ACADEMIC VECTORS IDENTIFIED IN THE CURRENT CYCLE.</p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

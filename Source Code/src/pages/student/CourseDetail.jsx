import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import courseService from '../../services/api/courseService';
import {
    FolderIcon,
    DocumentIcon,
    PresentationChartBarIcon,
    LinkIcon,
    AcademicCapIcon,
    CpuChipIcon,
    ArrowLongLeftIcon
} from '@heroicons/react/24/outline';

const _COURSE = null;
const _MATERIALS = [];

export default function StudentCourseDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(_COURSE);
    const [materials, setMaterials] = useState(_MATERIALS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Validate courseId format (MongoDB ObjectId is 24 hex characters)
    const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

    // Handle material click
    const handleMaterialClick = (e, material) => {
        if (!material.url || material.url === '#') {
            e.preventDefault();
            alert('This material is not yet available. Please check back later or contact your instructor.');
            return;
        }

        // Handle internal links
        if (material.isInternal || material.url.startsWith('internal:')) {
            e.preventDefault();
            const path = material.url.replace('internal:', '');
            
            // Navigate to problems page with course filter
            if (path === '/problems') {
                navigate(`/problems?course=${courseId}`);
            } else {
                navigate(path);
            }
        }
    };

    useEffect(() => {
        if (!isValidObjectId(courseId)) { setError(typeof 'Invalid course ID format' === 'string' ? 'Invalid course ID format' : 'Invalid course ID format'); setLoading(false); return; }
        fetchCourseDetails();
    }, [courseId]);

    const fetchCourseDetails = useCallback(async () => {
        try {
            setLoading(true);
            const [courseRes, matRes] = await Promise.allSettled([
                courseService.getCourseDetails(courseId),
                courseService.getCourseMaterials(courseId)
            ]);

            if (courseRes.status === 'fulfilled' && courseRes.value?.data) {
                setCourse(courseRes.value.data);
            }
            if (matRes.status === 'fulfilled' && matRes.value?.data) {
                setMaterials(matRes.value.data);
            }
        } catch (err) {
            console.error('Failed to sync course node:', err);
        } finally {
            setLoading(false);
        }
    }, [courseId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="flex flex-col items-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 border-t-2 border-b-2 border-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                    />
                    <p className="mt-8 font-black text-indigo-400 uppercase tracking-[0.5em] text-[10px] animate-pulse italic">ACCESSING SUBJECT DATA...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-12 max-w-[1700px] mx-auto min-h-screen font-sans overflow-x-hidden"
        >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12 mb-24">
                <div>
                    <Link to="/student/courses" className="inline-flex items-center gap-4 text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] hover:translate-x-[-8px] transition-transform mb-10 bg-white/5 px-6 py-3 rounded-2xl border border-white/10 italic group">
                        <ArrowLongLeftIcon className="w-5 h-5 group-hover:scale-125 transition-transform" />
                        PORTFOLIO OVERVIEW
                    </Link>
                    <motion.h1 
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-[0.2em] uppercase leading-none italic"
                    >
                        {course?.title?.toUpperCase()}
                    </motion.h1>
                    <p className="text-indigo-400 font-bold uppercase tracking-[0.5em] text-[11px] mt-10 flex items-center gap-4 italic">
                        <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.8)]"></span>
                        STATUS: ACTIVE CONSUMPTION // SUBJECT ID: 0x{courseId.slice(-4).toUpperCase()}
                    </p>
                </div>

                <motion.div 
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-slate-950/40 backdrop-blur-3xl px-12 py-8 rounded-[4rem] border border-white/10 shadow-3xl flex items-center gap-8 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
                    <div className="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-2xl group-hover:rotate-12 transition-transform">
                        <AcademicCapIcon className="w-10 h-10 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mb-2 italic">SUBJECT CYCLE</p>
                        <p className="text-3xl font-black text-white italic tracking-tighter uppercase">SEMESTER {course?.semesterNumber || '0'}</p>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8 space-y-12">
                    <motion.div 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-slate-950/40 backdrop-blur-3xl rounded-[5rem] p-16 shadow-3xl border border-white/10 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-16 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-150 transition-all text-[12rem] italic font-black pointer-events-none uppercase tracking-widest">
                            ARCHIVE
                        </div>

                        <h2 className="text-3xl font-black mb-16 text-white uppercase tracking-tighter italic flex items-center gap-6 leading-none">
                            <FolderIcon className="w-10 h-10 text-indigo-500" />
                            DIGITAL ASSET REPOSITORY
                        </h2>

                        <div className="grid grid-cols-1 gap-8 relative z-10">
                            {materials.map((mat, idx) => (
                                <motion.div
                                    key={mat._id}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ x: 20, scale: 1.01 }}
                                    className="p-10 bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/5 flex flex-col md:flex-row justify-between items-center group/item hover:border-indigo-500/50 hover:shadow-3xl transition-all"
                                >
                                    <div className="flex items-center gap-10 w-full md:w-auto mb-8 md:mb-0">
                                        <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/5 group-hover/item:bg-indigo-600 group-hover/item:text-white group-hover/item:rotate-12 transition-all">
                                            {mat.type === 'pdf' ? <DocumentIcon className="w-10 h-10" /> :
                                                mat.type === 'ppt' ? <PresentationChartBarIcon className="w-10 h-10" /> :
                                                    <LinkIcon className="w-10 h-10" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-3 bg-indigo-500/10 px-4 py-1.5 rounded-xl inline-block border border-indigo-500/20 italic">{mat.type?.toUpperCase()}</p>
                                            <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none group-hover/item:text-indigo-400 transition-colors">{mat.title}</h4>
                                        </div>
                                    </div>
                                    <a
                                        href={mat.isInternal ? '#' : (mat.url && mat.url !== '#' ? mat.url : undefined)}
                                        target={mat.isInternal ? undefined : "_blank"}
                                        rel={mat.isInternal ? undefined : "noreferrer"}
                                        onClick={(e) => handleMaterialClick(e, mat)}
                                        className="w-full md:w-auto px-12 py-6 bg-white text-black rounded-[2rem] text-[11px] font-black uppercase shadow-3xl hover:bg-indigo-600 hover:text-white transition-all tracking-[0.4em] italic text-center cursor-pointer border border-white/20 transform group-hover/item:scale-105"
                                    >
                                        EXECUTE NODE
                                    </a>
                                </motion.div>
                            ))}

                            {materials.length === 0 && (
                                <div className="py-48 text-center border-2 border-dashed border-white/10 rounded-[4rem] flex flex-col items-center justify-center text-slate-500">
                                    <div className="text-9xl mb-12 grayscale opacity-20">🗂️</div>
                                    <p className="font-black uppercase tracking-[0.5em] text-xl text-white mb-4 italic">NO SYNCHRONIZED ASSETS</p>
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40 italic">FACULTY NODE HAS NOT AUTHORIZED ADDITIONAL DIGITAL MATERIALS FOR THIS CYCLE.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                <div className="lg:col-span-4 space-y-12">
                    <motion.div 
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="bg-slate-950/60 backdrop-blur-3xl rounded-[4rem] p-12 text-white shadow-3xl border border-white/10 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-500/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-16 italic flex items-center gap-4 leading-none relative z-10">
                            <CpuChipIcon className="w-8 h-8 text-indigo-500" />
                            HARDWARE METRICS
                        </h3>
                        <div className="space-y-16 relative z-10">
                            <div>
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">WEIGHT MULTIPLIER</span>
                                    <span className="text-3xl font-black text-indigo-400 italic tracking-tighter uppercase">{course?.credits || 0} CREDITS</span>
                                </div>
                                <div className="h-4 bg-slate-900 rounded-full overflow-hidden p-1 border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(course?.credits / 4) * 100}%` }}
                                        className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                    />
                                </div>
                            </div>

                            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 group-hover:bg-white/10 transition-colors">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 italic">DEPARTMENT AUTHORITY</p>
                                <p className="text-sm font-black text-white uppercase tracking-[0.2em] italic leading-tight">{course?.department?.name || 'ACADEMIC CORE'}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-slate-950/40 backdrop-blur-3xl rounded-[4rem] p-12 shadow-3xl border border-white/10 group hover:border-indigo-500/30 transition-all"
                    >
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-16 italic flex items-center gap-4 leading-none">
                            <AcademicCapIcon className="w-8 h-8 text-indigo-500" />
                            MASTER NODE
                        </h3>
                        <div className="space-y-8">
                            {course?.facultyIds?.map(f => (
                                <motion.div 
                                    key={f._id} 
                                    whileHover={{ scale: 1.05, x: 10 }}
                                    className="group flex items-center gap-8 p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/50 transition-all cursor-crosshair shadow-2xl"
                                >
                                    <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl uppercase italic shadow-3xl shadow-indigo-600/30 border border-white/10 group-hover:rotate-12 transition-transform">
                                        {f.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-xl font-black text-white uppercase tracking-tighter italic leading-none mb-2">{f.name}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">ACTIVE ACADEMIC</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import facultyService from '../../services/api/facultyService';
import {
    MagnifyingGlassIcon,
    UserGroupIcon,
    AcademicCapIcon,
    EnvelopeIcon,
    BookOpenIcon
} from '@heroicons/react/24/outline';

export default function StudentsList() {
    const { user } = useAuthStore();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await facultyService.getFacultyCourses(user?._id);
            setCourses(response?.data || []);
        } catch (error) {
            console.error('Failed to load courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCourses = courses.filter(course =>
        course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course?.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="mt-6 font-black text-indigo-600 uppercase tracking-[0.4em] text-[10px]">Loading Students...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 md:p-8 lg:p-12 max-w-[1700px] mx-auto min-h-screen font-sans"
        >
            <div className="mb-12">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic mb-4">
                    Students
                </h1>
                <p className="text-indigo-600 font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-2 italic">
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
                    Select a course to view students
                </p>
            </div>

            <div className="mb-8">
                <div className="relative w-full max-w-2xl group">
                    <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="SEARCH COURSES..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 bg-white dark:bg-dark-900 rounded-[2rem] text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-dark-800 shadow-xl focus:ring-4 ring-indigo-500/10 focus:border-indigo-500/30 transition-all italic"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, idx) => (
                    <motion.div
                        key={course._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Link
                            to={`/faculty/students/${course._id}`}
                            className="block bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-dark-800 hover:border-indigo-500 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black italic shadow-lg group-hover:rotate-12 transition-transform">
                                    <BookOpenIcon className="w-7 h-7" />
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-950/30 px-4 py-2 rounded-full">
                                    <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                                        {course.enrollmentCount || 0} Students
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-3 leading-tight">
                                {course.title}
                            </h3>

                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-md uppercase italic border border-indigo-100 dark:border-indigo-900/30">
                                    {course.code}
                                </span>
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-dark-800 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <UserGroupIcon className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">
                                        View Roster
                                    </span>
                                </div>
                                <span className="text-indigo-600 group-hover:translate-x-2 transition-transform">→</span>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="py-24 text-center">
                    <div className="w-24 h-24 bg-white dark:bg-dark-900 rounded-full flex items-center justify-center mb-10 text-4xl shadow-2xl mx-auto">
                        📚
                    </div>
                    <p className="font-black uppercase tracking-[0.4em] text-sm text-slate-900 dark:text-white italic mb-4">
                        No Courses Found
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-sm mx-auto">
                        {searchTerm ? 'Try a different search term' : 'No courses assigned yet'}
                    </p>
                </div>
            )}
        </motion.div>
    );
}

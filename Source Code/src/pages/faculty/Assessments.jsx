import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    AcademicCapIcon,
    DocumentTextIcon,
    ClipboardDocumentCheckIcon,
    PlusIcon
} from '@heroicons/react/24/outline';

export default function Assessments() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 md:p-8 lg:p-12 max-w-[1700px] mx-auto min-h-screen font-sans"
        >
            <div className="mb-12">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic mb-4">
                    Assessments
                </h1>
                <p className="text-indigo-600 font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-2 italic">
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
                    Manage assignments and exams
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                    to="/faculty/create-assignment"
                    className="block bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-dark-800 hover:border-indigo-500 transition-all group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black italic shadow-lg group-hover:rotate-12 transition-transform mb-6">
                        <PlusIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-3">
                        Create Assignment
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Create new assignments for your courses
                    </p>
                </Link>

                <Link
                    to="/faculty/create-exam"
                    className="block bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-dark-800 hover:border-violet-500 transition-all group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center text-white text-xl font-black italic shadow-lg group-hover:rotate-12 transition-transform mb-6">
                        <DocumentTextIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-3">
                        Create Exam
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Schedule and create exams
                    </p>
                </Link>

                <Link
                    to="/faculty/grading"
                    className="block bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-dark-800 hover:border-emerald-500 transition-all group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xl font-black italic shadow-lg group-hover:rotate-12 transition-transform mb-6">
                        <ClipboardDocumentCheckIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-3">
                        Grading Hub
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                        Review and grade submissions
                    </p>
                </Link>
            </div>

            <div className="mt-12 bg-indigo-50 dark:bg-indigo-950/20 rounded-[2.5rem] p-8 border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-start gap-4">
                    <AcademicCapIcon className="w-8 h-8 text-indigo-600 shrink-0" />
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-2">
                            Assessment Tools
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            Create, manage, and grade assignments and exams. Use the AI-powered tools to generate questions and automate grading.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

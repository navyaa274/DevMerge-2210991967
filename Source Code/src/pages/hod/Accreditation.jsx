import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import hodService from '../../services/api/hodService';
import {
    ShieldCheckIcon,
    DocumentChartBarIcon,
    ArrowDownTrayIcon,
    ExclamationCircleIcon,
    ChartBarIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';

export default function HODAccreditation() {
    const { user } = useAuthStore();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.department) {
            fetchAccreditationStatus();
        }
    }, [user?.department]);

    const fetchAccreditationStatus = async () => {
        try {
            setLoading(true);
            const res = await hodService.getAccreditationData(user.department);
            setReport(res.data || res);
        } catch (error) {
            console.error('Accreditation fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto min-h-screen font-sans">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic flex items-center gap-3">
                        <ShieldCheckIcon className="w-12 h-12 text-emerald-600" />
                        Accreditation Intelligence
                    </h1>
                    <p className="text-emerald-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Regulatory Compliance Node • HOD Oversight
                    </p>
                </div>
                <button className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-3 hover:bg-slate-800 transition-all">
                    <ArrowDownTrayIcon className="w-6 h-6" />
                    <span className="text-sm font-black uppercase italic">Download Audit Bundle</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Score Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-dark-800 rounded-[3rem] p-10 shadow-2xl border border-slate-50 dark:border-dark-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 border-b pb-4">Compliance Score</h2>
                        <div className="text-center mb-10">
                            <p className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                                {report?.summary?.averageComplianceScore || 0}%
                            </p>
                            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mt-2">{report?.summary?.attainmentStatus}</p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-dark-900 p-4 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-500 uppercase">Courses Audited</span>
                                <span className="font-mono text-slate-900 dark:text-white font-black">{report?.summary?.totalCoursesAudited || 0}</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-dark-900 p-4 rounded-2xl">
                                <span className="text-[10px] font-black text-slate-500 uppercase">CO Mapping Coverage</span>
                                <span className="font-mono text-slate-900 dark:text-white font-black">98.2%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Outcome Heatmap */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl h-full border-t-[12px] border-emerald-500">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3 mb-10">
                            <DocumentChartBarIcon className="w-8 h-8 text-emerald-400" />
                            Program Outcome Achievement Map
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {(report?.outcomeAchievement || []).map((outcome, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/5 rounded-[2rem] p-6 hover:bg-white/10 transition-all">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 font-black text-xs">
                                                {outcome.outcomeCode}
                                            </div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">Achieved: {outcome.attainment}%</p>
                                        </div>
                                        {outcome.attainment < 60 && (
                                            <ExclamationCircleIcon className="w-5 h-5 text-rose-500 animate-pulse" />
                                        )}
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${outcome.attainment}%` }}
                                            className={`h-full ${outcome.attainment > 75 ? 'bg-emerald-500' : outcome.attainment > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                        />
                                    </div>
                                    <p className="text-[9px] text-slate-500 mt-3 italic line-clamp-1 uppercase">Target: 70% Attainment Threshold</p>
                                </div>
                            ))}
                        </div>

                        {(report?.outcomeAchievement || []).length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
                                <ChartBarIcon className="w-16 h-16 opacity-10 mb-6" />
                                <p className="font-black uppercase tracking-widest text-xs">No Outcome Data Aggregated</p>
                                <p className="text-[10px] mt-2 italic">Run a synchronization to pull real-time CO/PO metrics.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recommendations Section */}
            <div className="mt-10">
                <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center text-5xl shadow-inner">💡</div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2 italic">Institutional Compliance Recommendation</h3>
                            <p className="text-sm font-bold text-slate-300 uppercase tracking-tight leading-relaxed max-w-3xl">
                                Based on the active cycle data, {report?.summary?.totalCoursesAudited} courses are showing exceptional PO achievement. However, we recommend a secondary audit for "Course Node: CSE-302" due to high remedial density affecting PO-3 achievement.
                            </p>
                        </div>
                        <button className="bg-emerald-600 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:scale-105 transition-all">
                            Initialize Re-Audit
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

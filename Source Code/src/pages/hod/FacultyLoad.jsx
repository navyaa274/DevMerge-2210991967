import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

export default function HODFacultyLoad() {
    const { user, token } = useAuthStore();
    const [loadData, setLoadData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.department) {
            fetchLoadData();
        }
    }, [user?.department]);

    const getDepartmentId = () => user?.department?._id || user?.department || '';

    const fetchLoadData = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/faculty-load/${getDepartmentId()}`, 
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setLoadData(response.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
                <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Workload Matrix</h1>
                <p className="text-sky-600 font-bold uppercase tracking-widest text-[10px] mt-3">
                    Faculty Assignment Volume & Credit Distribution Analysis
                </p>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-[3rem] shadow-xl overflow-hidden border border-slate-50 dark:border-dark-700">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-dark-900/50 border-b border-slate-100 dark:border-dark-700">
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Faculty Asset</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Courses Assigned</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Total Credits</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Active Sections</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Load Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-dark-700">
                        {loadData.map((f, idx) => (
                            <motion.tr
                                key={f._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="hover:bg-sky-50/30 transition-colors"
                            >
                                <td className="px-10 py-7">
                                    <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{f.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold tracking-widest">{f.email}</p>
                                </td>
                                <td className="px-10 py-7 text-center">
                                    <span className="px-4 py-2 bg-slate-100 dark:bg-dark-900 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300">
                                        {f.coursesAssigned}
                                    </span>
                                </td>
                                <td className="px-10 py-7 text-center">
                                    <p className="text-lg font-black text-sky-600 dark:text-sky-400">{f.totalCredits}</p>
                                </td>
                                <td className="px-10 py-7 text-center">
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{f.sectionsAsTeacher} Sections</span>
                                </td>
                                <td className="px-10 py-7 text-right">
                                    {f.totalCredits > 18 ? (
                                        <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">OVERLOAD</span>
                                    ) : f.totalCredits > 12 ? (
                                        <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">OPTIMAL</span>
                                    ) : (
                                        <span className="bg-sky-100 text-sky-600 px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">UNDERLOAD</span>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {loadData.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400">
                        <p className="font-black uppercase tracking-widest text-xs">Zero Faculty Records Found</p>
                        <p className="text-[10px] mt-2 font-bold px-4">Ensure faculty members are correctly assigned to your department node.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

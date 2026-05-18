import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function AcademicYears() {
    const [years, setYears] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newYear, setNewYear] = useState('');

    useEffect(() => {
        fetchYears();
    }, []);

    const fetchYears = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/academic-years`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setYears(response.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/academic-years`,
                { year: newYear },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setNewYear('');
            setIsModalOpen(false);
            fetchYears();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleActivate = async (id) => {
        if (!window.confirm("Changing the active academic year impacts all current enrollments. Proceed?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/academic-years/${id}/activate`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchYears();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-dark-900">
                <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8 md:mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Academic Timeline</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-3 flex items-center gap-2">
                        Temporal Synchronization Control
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-500/30 transition-all hover:scale-105"
                >
                    + Add Epoch
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {years.map((y, idx) => (
                    <motion.div
                        key={y._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-8 rounded-[2rem] border transition-all gap-6 sm:gap-0 ${y.isActive
                            ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 shadow-xl shadow-amber-500/5'
                            : 'bg-white dark:bg-dark-800 border-slate-100 dark:border-dark-700 opacity-60 hover:opacity-100 shadow-sm'
                            }`}
                    >
                        <div className="flex items-center gap-4 md:gap-8 w-full sm:w-auto">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${y.isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-100 text-slate-400'
                                }`}>
                                🗓️
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Year {y.year}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest mt-1">
                                    {y.isActive ? (
                                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping" /> Current Active Master Epoch
                                        </span>
                                    ) : (
                                        <span className="text-slate-400">Archived or Pending Cycle</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {!y.isActive && (
                            <button
                                onClick={() => handleActivate(y._id)}
                                className="px-6 py-3 bg-white dark:bg-dark-900 border-2 border-slate-200 dark:border-dark-700 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-amber-500 hover:text-amber-500 transition-all self-end sm:self-auto"
                            >
                                Set as Active
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white dark:bg-dark-800 rounded-[3rem] p-6 md:p-12 max-w-md w-full shadow-2xl border-t-[12px] border-amber-500"
                        >
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">Initialize Year</h2>
                            <form onSubmit={handleCreate} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Cycle Format</label>
                                    <input
                                        required
                                        type="text"
                                        value={newYear}
                                        onChange={(e) => setNewYear(e.target.value)}
                                        placeholder="2025-2026"
                                        pattern="\d{4}-\d{4}"
                                        className="w-full px-4 md:px-6 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-dark-900 border-none text-center text-xl font-black tracking-widest text-slate-800 dark:text-white focus:ring-4 ring-amber-500/10"
                                    />
                                    <p className="text-[9px] text-slate-400 mt-3 text-center uppercase font-bold px-4">Must strictly follow YYYY-YYYY index format</p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] bg-amber-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition"
                                    >
                                        Commit Epoch
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

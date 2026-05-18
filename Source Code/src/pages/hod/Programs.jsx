import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

export default function HODPrograms() {
    const { user, token } = useAuthStore();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [formData, setFormData] = useState({
        _id: '',
        name: '',
        code: '',
        degreeType: 'bachelors',
        duration: 4,
        totalCredits: 120
    });

    useEffect(() => {
        if (user?.department) {
            fetchPrograms();
        }
    }, [user?.department]);

    const getDepartmentId = () => user?.department?._id || user?.department || '';

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const deptId = getDepartmentId();
            if (!deptId) {
                setPrograms([]);
                return;
            }
            const res = await axios.get(`${API_BASE_URL}/programs/department/${deptId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPrograms(res.data.data || []);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch programs');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (mode, prog = null) => {
        setModalMode(mode);
        if (mode === 'edit' && prog) {
            setFormData({
                _id: prog._id,
                name: prog.name,
                code: prog.code,
                degreeType: prog.degreeType || 'bachelors',
                duration: prog.duration || prog.durationYears || 4,
                totalCredits: prog.curriculum?.totalCredits || 120
            });
        } else {
            setFormData({
                _id: '',
                name: '',
                code: '',
                degreeType: 'bachelors',
                duration: 4,
                totalCredits: 120
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const payload = {
                name: formData.name,
                code: formData.code,
                degreeType: formData.degreeType,
                duration: formData.duration,
                department: getDepartmentId(),
                curriculum: { totalCredits: formData.totalCredits }
            };

            if (modalMode === 'add') {
                await axios.post(`${API_BASE_URL}/programs`, payload, { headers });
            } else {
                await axios.put(`${API_BASE_URL}/programs/${formData._id}`, payload, { headers });
            }
            setIsModalOpen(false);
            fetchPrograms();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this program?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/programs/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            fetchPrograms();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Dept. Degrees</h1>
                    <p className="text-emerald-600 font-bold uppercase tracking-widest text-[10px] mt-3">
                        Degree Catalog Oversight • Level {user.role.toUpperCase()}
                    </p>
                </div>
                <button onClick={() => openModal('add')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/30 transition-all hover:scale-105">
                    + Deploy Degree
                </button>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-xl text-rose-700 font-bold text-xs uppercase tracking-widest">
                    {typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {programs.filter(p => p.isActive !== false).map((prog, idx) => (
                    <motion.div
                        key={prog._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 shadow-xl border border-slate-50 dark:border-dark-700 hover:border-emerald-500 transition-all relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full group-hover:scale-110 transition-transform" />

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-2xl text-[10px] font-black uppercase">
                                {prog.code}
                            </span>
                            <div className="flex gap-2">
                                <button onClick={() => openModal('edit', prog)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-slate-400">✏️</button>
                                <button onClick={() => handleDelete(prog._id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-500 rounded-lg transition-colors">🗑️</button>
                            </div>
                        </div>

                        <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 uppercase leading-tight line-clamp-2 relative z-10">{prog.name}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 dark:border-dark-700 pb-4 relative z-10">
                            Type: {prog.degreeType || 'Unknown'}
                        </p>

                        <div className="space-y-4 pt-2 relative z-10">
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-dark-900 p-4 rounded-2xl">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Duration</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-white">{prog.duration || prog.durationYears} Yrs</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Semesters</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-white">{prog.totalSemesters || ((prog.duration || prog.durationYears) * 2)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Credits</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-white">{prog.curriculum?.totalCredits || 120}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {programs.filter(p => p.isActive !== false).length === 0 && (
                    <div className="col-span-full py-20 bg-slate-50 dark:bg-dark-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-dark-700 flex flex-col items-center justify-center text-slate-400">
                        <p className="font-black uppercase tracking-widest text-xs">No Degree Programs Found</p>
                        <p className="text-[10px] mt-2 font-bold px-4 text-center">Deploy a degree program to map courses and assign faculties.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-dark-800 rounded-[3rem] p-12 max-w-xl w-full shadow-2xl border-t-[12px] border-emerald-600 my-8"
                        >
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">
                                {modalMode === 'add' ? 'Deploy Degree' : 'Modify Degree'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Program Sequence Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. B.Tech Computer Science"
                                            className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-emerald-500/10 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Program Code</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.code}
                                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                                placeholder="e.g. BTECH-CSE"
                                                className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-emerald-500/10 text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Degree Type</label>
                                            <select
                                                required
                                                value={formData.degreeType}
                                                onChange={(e) => setFormData({ ...formData, degreeType: e.target.value })}
                                                className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-emerald-500/10 text-slate-900 dark:text-white"
                                            >
                                                <option value="bachelors">Bachelors</option>
                                                <option value="masters">Masters</option>
                                                <option value="doctorate">Doctorate</option>
                                                <option value="diploma">Diploma</option>
                                                <option value="certificate">Certificate</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Duration (Years)</label>
                                            <input
                                                required
                                                type="number"
                                                min="1" max="10"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                                className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-emerald-500/10 text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Total Credits</label>
                                            <input
                                                required
                                                type="number"
                                                min="1"
                                                value={formData.totalCredits}
                                                onChange={(e) => setFormData({ ...formData, totalCredits: parseInt(e.target.value) })}
                                                className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-emerald-500/10 text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-dark-700">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700 transition">
                                        Discard
                                    </button>
                                    <button type="submit" className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition">
                                        {modalMode === 'add' ? 'Initialize Profile' : 'Commit Changes'}
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

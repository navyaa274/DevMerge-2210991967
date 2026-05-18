import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../services/api/apiClient';
import { ENDPOINTS } from '../../config/urls';

export default function HODContests() {
    const { user } = useAuthStore();
    const [contests, setContests] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        problems: [],
        scoringType: 'ACM',
        isInterDepartmental: true,
        departments: []
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [contestsRes, deptsRes] = await Promise.all([
                apiClient.get('/contests'),
                apiClient.get(ENDPOINTS.DEPARTMENTS.BASE)
            ]);
            setContests(contestsRes.data.data || []);
            setDepartments(deptsRes.data.data || deptsRes.data || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch contests');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDepartmentToggle = (deptId) => {
        setFormData(prev => {
            const current = [...prev.departments];
            if (current.includes(deptId)) {
                return { ...prev, departments: current.filter(id => id !== deptId) };
            }
            return { ...prev, departments: [...current, deptId] };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/contests', formData);
            setIsModalOpen(false);
            setFormData({
                title: '',
                description: '',
                startTime: '',
                endTime: '',
                problems: [],
                scoringType: 'ACM',
                isInterDepartmental: true,
                departments: []
            });
            fetchInitialData();
        } catch (err) {
            alert(err.message || 'Failed to create contest');
        }
    };

    const getContestStatus = (startTime, endTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (now < start) return 'upcoming';
        if (now > end) return 'ended';
        return 'live';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
                <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic flex items-center gap-4">
                        <span className="text-amber-500">🏆</span> Marathons
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-3">
                        Inter-Departmental Coding Competitions Engine
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-500/30 transition-all hover:scale-105 italic"
                >
                    + Host Marathon
                </button>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-xl text-rose-700 font-bold text-xs uppercase tracking-widest">
                    {typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {contests.length === 0 ? (
                    <div className="col-span-full py-20 bg-white dark:bg-dark-800 rounded-[3rem] border border-slate-100 dark:border-dark-700 flex flex-col items-center justify-center text-slate-400">
                        <div className="text-6xl mb-6 opacity-50">🏆</div>
                        <p className="font-black uppercase tracking-widest text-xs italic">No Marathons Hosted</p>
                        <p className="text-[10px] mt-2 font-bold px-4 text-center max-w-sm">Foster inter-departmental collaboration by hosting the first competitive coding marathon.</p>
                    </div>
                ) : (
                    contests.map((contest, idx) => {
                        const status = getContestStatus(contest.startTime, contest.endTime);
                        return (
                            <motion.div
                                key={contest._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-dark-700 hover:border-amber-500 transition-all overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[5rem] -mr-8 -mt-8 group-hover:scale-110 transition-transform" />

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter shadow-sm ${status === 'live' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                status === 'upcoming' ? 'bg-sky-100 text-sky-700 border border-sky-200' :
                                                    'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-dark-700 dark:text-slate-300 dark:border-dark-600'
                                            }`}>
                                            {status}
                                        </span>
                                        {contest.isInterDepartmental && (
                                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-500/20">
                                                Inter-Dept
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight italic truncate">
                                        {contest.title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-6 line-clamp-2">
                                        {contest.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-slate-50 dark:border-dark-700">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Participants</p>
                                            <p className="font-black text-sm text-slate-800 dark:text-slate-200">{contest.participants?.length || 0}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Scoring</p>
                                            <p className="font-black text-sm text-slate-800 dark:text-slate-200">{contest.scoringType || 'ACM'}</p>
                                        </div>
                                    </div>

                                    <div className="flex bg-slate-50 dark:bg-dark-700/50 rounded-2xl p-3 items-center justify-between">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Start Time</p>
                                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                                {new Date(contest.startTime).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-dark-800 rounded-[2rem] p-8 md:p-10 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] border-t-[8px] border-amber-500"
                        >
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 italic flex items-center gap-3">
                                <span className="text-amber-500">⚡</span> Initialize Marathon
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Marathon Codename</label>
                                    <input
                                        required
                                        name="title"
                                        value={formData.title}
                                        onChange={handleFormChange}
                                        placeholder="e.g. Winter Code Sprint 2026"
                                        className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-amber-500/20 text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Tactical Briefing (Description)</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        placeholder="Brief overview of the marathon rules and themes..."
                                        rows="3"
                                        className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-amber-500/20 resize-none text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Commencement Protocol (Start)</label>
                                        <input
                                            required
                                            type="datetime-local"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleFormChange}
                                            className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-amber-500/20 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Termination Sequence (End)</label>
                                        <input
                                            required
                                            type="datetime-local"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleFormChange}
                                            className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-amber-500/20 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-dark-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Inter-Departmental Scope</label>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" name="isInterDepartmental" checked={formData.isInterDepartmental} onChange={handleFormChange} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-dark-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
                                        </label>
                                    </div>

                                    {formData.isInterDepartmental && (
                                        <div className="bg-slate-50 dark:bg-dark-900/50 p-4 rounded-2xl border border-slate-100 dark:border-dark-700 max-h-48 overflow-y-auto">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Authorize Departments</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {departments.map(dept => (
                                                    <label key={dept._id} className="flex items-center gap-3 p-2 bg-white dark:bg-dark-800 rounded-lg cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors border border-slate-100 dark:border-dark-700">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 dark:bg-dark-700 dark:border-dark-600 cursor-pointer"
                                                            checked={formData.departments.includes(dept._id)}
                                                            onChange={() => handleDepartmentToggle(dept._id)}
                                                        />
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-none">{dept.name} ({dept.code})</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {departments.length === 0 && (
                                                <p className="text-xs text-slate-500 italic">No departments available.</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-4 pt-4 mt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700 transition">
                                        Abort
                                    </button>
                                    <button type="submit" className="flex-[2] bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 transition italic relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                                        <span className="relative z-10">Deploy Marathon</span>
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

export default function Sections() {
    const { token } = useAuthStore();
    const [sections, setSections] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [filterSem, setFilterSem] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [formData, setFormData] = useState({
        semesterId: '',
        name: '',
        capacity: 60,
        classTeacherId: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            const [semRes, facRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/semesters/current`, { headers }),
                axios.get(`${API_BASE_URL}/users?role=faculty`, { headers })
            ]);

            setSemesters(semRes.data.data || []);
            setFaculty((facRes.data.data || []).map(f => ({
                ...f,
                displayName: f.name || `${f.firstName || ''} ${f.lastName || ''}`.trim()
            })));

            // Default to first semester for filter if available
            if (semRes.data.data?.length > 0) {
                setFilterSem(semRes.data.data[0]._id);
                fetchSections(semRes.data.data[0]._id);
            } else {
                setLoading(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    const fetchSections = async (semId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/sections/semester/${semId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSections(response.data.data || []);
        } catch (err) {
            console.error("Sections fetch err", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (id) => {
        setFilterSem(id);
        if (id !== 'all') {
            setLoading(true);
            fetchSections(id);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            await axios.post(`${API_BASE_URL}/sections`, formData, { headers });

            setIsModalOpen(false);
            if (formData.semesterId === filterSem) fetchSections(filterSem);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleAutoAssign = async () => {
        if (!window.confirm("Are you sure? This will delete existing section student groups and auto-distribute all students according to roll numbers.")) return;
        setIsAssigning(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/sections/semester/${filterSem}/auto-assign`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert(res.data.message);
            fetchSections(filterSem);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        } finally {
            setIsAssigning(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-dark-900">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-8 md:mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Sections</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-3 flex items-center gap-2">
                        Cohort Groups & Class Distribution
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    <select
                        value={filterSem}
                        onChange={(e) => handleFilterChange(e.target.value)}
                        className="px-4 md:px-6 py-3 md:py-4 bg-white dark:bg-dark-800 rounded-2xl text-[10px] font-black uppercase tracking-widest border-none shadow-lg shadow-slate-200/50 focus:ring-4 ring-indigo-500/10 cursor-pointer shrink-0"
                    >
                        <option value="all">Select Semester Context</option>
                        {semesters.map(s => <option key={s._id} value={s._id}>Sem {s.semesterNumber} - {s.programId?.code}</option>)}
                    </select>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 shrink-0"
                    >
                        + Create Section
                    </button>
                    {filterSem !== 'all' && (
                        <button
                            onClick={handleAutoAssign}
                            disabled={isAssigning}
                            className={`flex-shrink-0 ${isAssigning ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 shrink-0`}
                        >
                            {isAssigning ? 'Processing...' : 'Auto-Assign Students'}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sections.map((sec, idx) => (
                    <motion.div
                        key={sec._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-6 md:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-dark-700 hover:border-indigo-500 transition-all"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-500/20 shrink-0">
                                    {sec.name}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Section Group</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-white uppercase mt-1 truncate">Capacity: {sec.capacity}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-50 dark:border-dark-700">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-dark-900 flex items-center justify-center text-xs shrink-0">👨‍🏫</div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">In-Charge</p>
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{sec.classTeacherName || (sec.classTeacherId ? `${sec.classTeacherId.firstName || ''} ${sec.classTeacherId.lastName || ''}`.trim() : 'Unassigned Node')}</p>
                                </div>
                            </div>

                            <div className="relative pt-4">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                    <span className="text-slate-400">Enrolled Hub</span>
                                    <span className="text-indigo-600">{sec.enrolledCount} / {sec.capacity}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-dark-900 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(sec.enrolledCount / sec.capacity) * 100}%` }}
                                        className="h-full bg-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {sections.length === 0 && (
                    <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-center px-4">
                        <p className="font-black uppercase tracking-widest text-xs">No Section Outlets Found for this Context</p>
                        <p className="text-[10px] mt-2 font-bold text-slate-500">Select a semester context or provision a new section group.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-dark-800 rounded-[3rem] p-6 md:p-12 max-w-xl w-full shadow-2xl border-t-[12px] border-indigo-600 max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 tracking-tight">Setup Section Node</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Identification</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                            placeholder="e.g. A"
                                            className="w-full px-4 md:px-6 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-dark-900 border-none text-center text-xl font-black text-slate-800 dark:text-white focus:ring-4 ring-indigo-500/10"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Limit (Node Capacity)</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.capacity}
                                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                            className="w-full px-4 md:px-6 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-dark-900 border-none text-center text-xl font-black text-slate-800 dark:text-white focus:ring-4 ring-indigo-500/10"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Cycle Context</label>
                                    <select
                                        required
                                        value={formData.semesterId}
                                        onChange={(e) => setFormData({ ...formData, semesterId: e.target.value })}
                                        className="w-full px-4 md:px-6 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-indigo-500/10"
                                    >
                                        <option value="">Select Target Semester</option>
                                        {semesters.map(s => <option key={s._id} value={s._id}>Sem {s.semesterNumber} - {s.programId?.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Node Principal (Class Teacher)</label>
                                    <select
                                        required
                                        value={formData.classTeacherId}
                                        onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
                                        className="w-full px-4 md:px-6 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-indigo-500/10"
                                    >
                                        <option value="">Select Faculty</option>
                                        {faculty.map(f => <option key={f._id} value={f._id}>{f.displayName || f.name}</option>)}
                                    </select>
                                </div>

                                <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition"
                                    >
                                        Discard
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition"
                                    >
                                        Provision Node
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

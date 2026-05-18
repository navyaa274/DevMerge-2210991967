import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    AcademicCapIcon,
    InformationCircleIcon,
    XMarkIcon,
    AdjustmentsHorizontalIcon,
    CalendarDaysIcon,
    AcademicCapIcon as DegreeIcon
} from '@heroicons/react/24/outline';

export default function Programs() {
    const { token } = useAuthStore();
    const [programs, setPrograms] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter and Modal State
    const [filterDept, setFilterDept] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [formData, setFormData] = useState({
        _id: '',
        name: '',
        code: '',
        departmentId: '',
        durationYears: 4,
        totalSemesters: 8
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            const [deptRes, progRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/departments`, { headers }),
                axios.get(`${API_BASE_URL}/programs`, { headers })
            ]);

            setDepartments(deptRes.data.data || []);
            setPrograms(progRes.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (mode, program = null) => {
        setModalMode(mode);
        if (mode === 'edit' && program) {
            setFormData({
                _id: program._id,
                name: program.name,
                code: program.code,
                departmentId: program.departmentId?._id || '',
                durationYears: program.durationYears,
                totalSemesters: program.totalSemesters
            });
        } else {
            setFormData({
                _id: '',
                name: '',
                code: '',
                departmentId: '',
                durationYears: 4,
                totalSemesters: 8
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const headers = { 'Authorization': `Bearer ${token}` };

            if (modalMode === 'add') {
                await axios.post(`${API_BASE_URL}/programs`, formData, { headers });
            } else {
                await axios.put(`${API_BASE_URL}/programs/${formData._id}`, formData, { headers });
            }

            setIsModalOpen(false);
            fetchInitialData();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const filteredPrograms = filterDept === 'all'
        ? programs
        : programs.filter(p => p.departmentId?._id === filterDept);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-dark-950">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <p className="mt-6 font-black text-emerald-600 uppercase tracking-[0.4em] text-[10px]">Accessing Degree Catalog Matrix...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 md:p-8 lg:p-12 max-w-[1700px] mx-auto min-h-screen pt-20 md:pt-24 font-sans"
        >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
                <div className="w-full xl:w-auto">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                        Academic <span className="text-emerald-600">Programs</span>
                    </h1>
                    <p className="text-emerald-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 flex items-center gap-2 italic">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.3)]"></span>
                        Degree Configuration Terminal · {filteredPrograms.length} Nodes Active
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    <div className="relative w-full sm:w-auto overflow-hidden rounded-2xl md:rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-emerald-500 transition-colors">
                            <AdjustmentsHorizontalIcon className="w-5 h-5" />
                        </div>
                        <select
                            value={filterDept}
                            onChange={(e) => setFilterDept(e.target.value)}
                            className="w-full sm:w-auto pl-14 pr-10 py-5 bg-white dark:bg-dark-900 rounded-2xl md:rounded-[2rem] text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-dark-800 focus:ring-4 ring-emerald-500/10 cursor-pointer appearance-none italic transition-all"
                        >
                            <option value="all">Across Entire University</option>
                            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={() => openModal('add')}
                        className="w-full sm:w-auto bg-emerald-600 hover:bg-slate-900 text-white px-10 py-5 rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] md:text-xs shadow-2xl shadow-emerald-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 italic shrink-0"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Provision New Degree
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
                {filteredPrograms.map((prog, idx) => (
                    <motion.div
                        key={prog._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative bg-white dark:bg-dark-900 rounded-[3rem] md:rounded-[4rem] p-8 md:p-10 shadow-2xl border border-slate-50 dark:border-dark-800 hover:border-emerald-500 transition-all flex flex-col h-full overflow-hidden"
                    >
                        {/* Status Light */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 dark:bg-emerald-600/10 rounded-bl-[5rem] -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-center mb-10">
                                <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800/30 italic">
                                    Code: {prog.code}
                                </span>
                                <button
                                    onClick={() => openModal('edit', prog)}
                                    className="p-3 bg-slate-50 dark:bg-dark-950 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all hover:scale-110 shadow-sm"
                                    title="Edit Degree"
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                </button>
                            </div>

                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3 leading-tight uppercase italic tracking-tighter line-clamp-2">{prog.name}</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-2 italic">
                                <AcademicCapIcon className="w-4 h-4 text-emerald-500" />
                                Sector: {prog.departmentId?.name || 'Unassigned Matrix'}
                            </p>

                            <div className="mt-auto grid grid-cols-2 gap-4 pt-8 border-t border-slate-50 dark:border-dark-800">
                                <div className="bg-slate-50 dark:bg-dark-950/50 p-5 rounded-[2rem] text-center border border-slate-100 dark:border-dark-800 transition-colors group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/10">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Cycle Count</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white italic">{prog.durationYears} <span className="text-[10px] text-slate-400">Yrs</span></p>
                                </div>
                                <div className="bg-slate-50 dark:bg-dark-950/50 p-5 rounded-[2rem] text-center border border-slate-100 dark:border-dark-800 transition-colors group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/10">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Matrix Phasing</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white italic">{prog.totalSemesters} <span className="text-[10px] text-slate-400">Sems</span></p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filteredPrograms.length === 0 && (
                    <div className="col-span-full py-20 md:py-32 bg-slate-50 dark:bg-dark-950/50 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-dark-800 flex flex-col items-center justify-center text-center px-6">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-dark-900 rounded-full flex items-center justify-center mb-8 text-4xl shadow-inner">🌫️</div>
                        <p className="font-black uppercase tracking-[0.4em] text-sm text-slate-400 italic">No Degree Nodes Detected</p>
                        <p className="text-[10px] mt-4 font-bold text-slate-500 uppercase tracking-widest max-w-sm leading-relaxed">The degree matrix for this department is uninitialized. Provision your first program above.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-dark-900 rounded-[3rem] md:rounded-[4rem] p-8 md:p-14 max-w-2xl w-full shadow-2xl border-t-[15px] md:border-t-[20px] border-emerald-600 my-auto"
                        >
                            <div className="flex justify-between items-start mb-10 md:mb-12">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                                        {modalMode === 'add' ? 'Provision' : 'Update'} <span className="text-emerald-600">Degree</span>
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 flex items-center gap-2 italic">
                                        <DegreeIcon className="w-4 h-4" />
                                        Programmatic Configuration Hub
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-3 bg-slate-50 dark:bg-dark-950 text-slate-400 hover:text-rose-600 rounded-2xl transition-all hover:rotate-90"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2 italic">Program Title</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="E.G. DATA SCIENCE ARCHITECTURE"
                                            className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent text-sm font-black focus:ring-4 ring-emerald-500/10 focus:border-emerald-500/30 transition-all uppercase placeholder:opacity-30 placeholder:italic"
                                        />
                                    </div>
                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2 italic">Degree ID Vector</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            placeholder="E.G. B-DSA"
                                            className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent text-sm font-black focus:ring-4 ring-emerald-500/10 focus:border-emerald-500/30 transition-all uppercase placeholder:opacity-30 placeholder:italic"
                                        />
                                    </div>
                                </div>

                                <div className="relative group">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2 italic">Host Sector Anchor</label>
                                    <select
                                        required
                                        value={formData.departmentId}
                                        onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                        className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent text-sm font-black focus:ring-4 ring-emerald-500/10 focus:border-emerald-500/30 transition-all uppercase italic appearance-none cursor-pointer"
                                    >
                                        <option value="" className="italic">INITIALIZE ANCHOR SECTOR</option>
                                        {departments.map(d => <option key={d._id} value={d._id} className="font-black italic uppercase">{d.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2 italic">Duration (Years)</label>
                                        <div className="flex items-center gap-4">
                                            <CalendarDaysIcon className="w-6 h-6 text-slate-300 absolute left-8 top-1/2 -translate-y-[2px]" />
                                            <input
                                                required
                                                type="number"
                                                min="1" max="6"
                                                value={formData.durationYears}
                                                onChange={(e) => setFormData({ ...formData, durationYears: e.target.value, totalSemesters: e.target.value * 2 })}
                                                className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent text-sm font-black focus:ring-4 ring-emerald-500/10 focus:border-emerald-500/30 transition-all uppercase font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2 italic">Total Semester States</label>
                                        <input
                                            required
                                            type="number"
                                            min="1" max="15"
                                            value={formData.totalSemesters}
                                            onChange={(e) => setFormData({ ...formData, totalSemesters: e.target.value })}
                                            className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent text-sm font-black focus:ring-4 ring-emerald-500/10 focus:border-emerald-500/30 transition-all uppercase font-mono text-center"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-10">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-950 transition-all italic underline decoration-dotted underline-offset-8"
                                    >
                                        Discard Changes
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] bg-emerald-600 text-white py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-600/30 hover:bg-slate-900 transition-all transform hover:-translate-y-1 italic"
                                    >
                                        {modalMode === 'add' ? 'Initialize Degree Node' : 'Commit Configuration'}
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';
import {
    BoltIcon,
    CpuChipIcon,
    BeakerIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    UserGroupIcon,
    UsersIcon,
    ChevronRightIcon,
    DocumentChartBarIcon
} from '@heroicons/react/24/outline';

export default function HODSections() {
    const { user, token } = useAuthStore();
    const [sections, setSections] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [students, setStudents] = useState([]);
    const [activeSemester, setActiveSemester] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add', 'faculty', 'student', 'auto_enroll'
    const [activeSection, setActiveSection] = useState(null);

    // Form States
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState(60);
    const [selectedFaculty, setSelectedFaculty] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');

    // Auto-Enroll Engine States
    const [dryRun, setDryRun] = useState(true);
    const [sortBy, setSortBy] = useState('studentId');
    const [assignmentRule, setAssignmentRule] = useState('capacity_balanced');
    const [autoEnrollResults, setAutoEnrollResults] = useState(null);
    const [isAssimilating, setIsAssimilating] = useState(false);

    useEffect(() => {
        if (user?.department) {
            fetchInitialData();
        }
    }, [user?.department]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const headers = { 'Authorization': `Bearer ${token}` };

            const [semRes, facRes, stuRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/semesters/current`, { headers }),
                axios.get(`${API_BASE_URL}/users?role=faculty`, { headers }),
                axios.get(`${API_BASE_URL}/users?role=student`, { headers })
            ]);

            const deptId = (user.department?._id || user.department)?.toString();

            setSemesters(semRes.data.data || []);
            setFaculties(
                (facRes.data.data || []).filter(f => {
                    const fDeptId = (f.department?._id || f.department)?.toString();
                    return fDeptId === deptId;
                }).map(f => ({
                    ...f,
                    displayName: f.name || `${f.firstName || ''} ${f.lastName || ''}`.trim() || 'Faculty'
                }))
            );
            setStudents(
                (stuRes.data.data || []).filter(s => {
                    const sDeptId = (s.department?._id || s.department)?.toString();
                    return sDeptId === deptId;
                }).map(s => ({
                    ...s,
                    displayName: s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student'
                }))
            );

            const semestersData = semRes.data.data || (semRes.data._id ? [semRes.data] : []);
            setSemesters(Array.isArray(semestersData) ? semestersData : [semestersData]);

            const currentSems = Array.isArray(semestersData) ? semestersData : [semestersData];
            if (currentSems.length > 0) {
                const firstSem = currentSems[0]._id;
                setActiveSemester(firstSem);
                fetchSections(firstSem);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch initial data');
            setLoading(false);
        }
    };

    const fetchSections = async (semId) => {
        try {
            setActiveSemester(semId);
            const response = await axios.get(
                `${API_BASE_URL}/sections/semester/${semId}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setSections(response.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSection = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `${API_BASE_URL}/sections`,
                { semesterId: activeSemester, name, capacity },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setIsModalOpen(false);
            fetchSections(activeSemester);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleAssignFaculty = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `${API_BASE_URL}/sections/${activeSection._id}/assign-faculty`,
                { facultyId: selectedFaculty },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setIsModalOpen(false);
            fetchSections(activeSemester);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleEnrollStudent = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `${API_BASE_URL}/sections/${activeSection._id}/enroll`,
                { studentId: selectedStudent },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setIsModalOpen(false);
            fetchSections(activeSemester);
            alert('Student Enrolled Successfully!');
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleAutoEnroll = async (e) => {
        e.preventDefault();
        try {
            setIsAssimilating(true);
            const response = await axios.post(
                `${API_BASE_URL}/sections/semester/${activeSemester}/auto-assign`,
                { sortBy, dryRun, assignmentRule, clearExisting: true },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setAutoEnrollResults(response.data);
            if (!dryRun) {
                fetchSections(activeSemester);
            }
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        } finally {
            setIsAssimilating(false);
        }
    };

    const handleDeleteSection = async (id) => {
        if (!window.confirm('Are you sure you want to remove this section?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/sections/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            fetchSections(activeSemester);
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const openModal = (mode, section = null) => {
        setModalMode(mode);
        setActiveSection(section);
        setName('');
        setCapacity(60);
        setSelectedFaculty(section?.classTeacherId?._id || '');
        setSelectedStudent('');
        setAutoEnrollResults(null);
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-dark-950">
                <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(6,182,212,0.4)]"></div>
                <p className="mt-6 text-cyan-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Initializing Allocation Matrix...</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50 dark:bg-dark-950 p-8 pt-20">
            <div className="max-w-[1600px] mx-auto">
                {/* HUD Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1.5 bg-cyan-600 font-black text-white text-[9px] uppercase tracking-[0.3em] rounded-full shadow-lg shadow-cyan-500/30 italic">
                                Strategic HUB
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-200 dark:bg-dark-900 px-4 py-1.5 rounded-full flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Orchestrator Active
                            </span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic flex items-center gap-4">
                            Section <span className="text-cyan-500">Orchestrator</span>
                        </h1>
                        <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px] mt-4 max-w-xl">
                            Manage academic groupings, capacity utilization, and AI-driven automated enrollment protocols.
                        </p>
                    </div>

                    <div className="flex gap-4 items-center">
                        <select
                            value={activeSemester}
                            onChange={(e) => fetchSections(e.target.value)}
                            className="px-6 py-4 bg-white dark:bg-dark-800 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-dark-700 shadow-xl focus:ring-4 ring-cyan-500/10 dark:text-white outline-none"
                        >
                            {semesters.map(s => <option key={s._id} value={s._id} className="bg-slate-900">Sem {s.semesterNumber} / {s.programId?.code}</option>)}
                            {semesters.length === 0 && <option value="">No active semesters</option>}
                        </select>

                        <button
                            disabled={!activeSemester || semesters.length === 0}
                            onClick={() => openModal('add')}
                            className="bg-white dark:bg-dark-800 hover:bg-slate-50 dark:hover:bg-dark-700 disabled:opacity-50 text-slate-900 dark:text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl transition-all border border-slate-100 dark:border-dark-700"
                        >
                            + Add Node
                        </button>

                        <button
                            disabled={!activeSemester || semesters.length === 0 || sections.length === 0}
                            onClick={() => openModal('auto_enroll')}
                            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-[0_10px_30px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2 italic"
                        >
                            <CpuChipIcon className="w-4 h-4" /> AI Auto-Enrollment
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-6 bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-200 dark:border-rose-500/20 rounded-[2rem] flex items-start gap-4 shadow-xl">
                        <ExclamationTriangleIcon className="w-6 h-6 text-rose-600 shrink-0" />
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-rose-900 dark:text-rose-400 mb-1">System Error</p>
                            <p className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-widest">{typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {sections.map((sec, idx) => {
                        const utilization = (sec.enrolledCount / sec.capacity) * 100;
                        const isCritical = utilization >= 95;

                        return (
                            <motion.div
                                key={sec._id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className={`bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 shadow-xl border-t-[12px] transition-all relative overflow-hidden group ${isCritical ? 'border-t-rose-500 border-x-rose-500/20 border-b-rose-500/20' : 'border-t-cyan-500 dark:border-x-dark-800 dark:border-b-dark-800 border-b-slate-100 border-x-slate-100'}`}
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-[5rem] -mr-12 -mt-12 group-hover:scale-110 transition-transform ${isCritical ? 'bg-rose-500/10' : 'bg-cyan-500/10'}`} />

                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-[1.2rem] text-white flex items-center justify-center text-2xl font-black shadow-lg ${isCritical ? 'bg-rose-500 shadow-rose-500/20' : 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-cyan-500/20'}`}>
                                            {sec.name}
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Cluster ID</p>
                                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase">Max Cap: {sec.capacity}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleDeleteSection(sec._id)} className="w-8 h-8 flex items-center justify-center bg-rose-500/5 hover:bg-rose-500/20 text-rose-500 rounded-xl transition-colors">
                                            <span className="sr-only">Delete</span>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-dark-800 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                <UserGroupIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Assigned Faculty</p>
                                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                                                    {sec.classTeacherName || (sec.classTeacherId ? `${sec.classTeacherId.firstName || ''} ${sec.classTeacherId.lastName || ''}`.trim() : 'Unassigned')}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={() => openModal('faculty', sec)} className="text-[9px] bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-colors">
                                            Set
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <UsersIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Enrolled</p>
                                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{sec.enrolledCount} Subjects</p>
                                            </div>
                                        </div>
                                        <button onClick={() => openModal('student', sec)} className="text-[9px] bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-colors">
                                            Add
                                        </button>
                                    </div>

                                    <div className="relative pt-4">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 px-1">
                                            <span className="text-slate-400">Load Vector</span>
                                            <span className={isCritical ? 'text-rose-500' : 'text-cyan-500'}>{utilization.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 dark:bg-dark-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(utilization, 100)}%` }}
                                                className={`h-full ${isCritical ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {sections.length === 0 && (
                        <div className="col-span-full py-24 bg-white dark:bg-dark-900 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-dark-800 flex flex-col items-center justify-center text-slate-400 shadow-xl">
                            <DocumentChartBarIcon className="w-16 h-16 text-slate-300 dark:text-dark-700 mb-6" />
                            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-2xl mb-2 italic">Zero Sections Detected</p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] px-4 text-center max-w-sm">
                                Create section clusters manually or instantiate an AI auto-enrollment sequence.
                            </p>
                        </div>
                    )}
                </div>

                {/* Modals */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className={`bg-white dark:bg-dark-900 rounded-[3rem] p-10 max-w-xl w-full shadow-2xl border-t-[12px] ${modalMode === 'auto_enroll' ? 'border-indigo-500' : 'border-cyan-500'} relative overflow-hidden`}
                            >
                                <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>

                                {modalMode === 'add' && (
                                    <>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 italic">Build New Section</h2>
                                        <form onSubmit={handleCreateSection} className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Section Identifier (A, B, C)</label>
                                                <input required type="text" value={name} onChange={(e) => setName(e.target.value.toUpperCase())} placeholder="e.g. A"
                                                    className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 text-sm font-bold focus:ring-4 ring-cyan-500/20 dark:text-white outline-none transition-all" />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Maximum Capacity Limit</label>
                                                <input required type="number" min="1" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value))}
                                                    className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 text-sm font-bold focus:ring-4 ring-cyan-500/20 dark:text-white outline-none transition-all" />
                                            </div>
                                            <div className="pt-6">
                                                <button type="submit" className="w-full py-5 bg-cyan-600 text-white rounded-[1.5rem] shadow-[0_10px_30px_rgba(6,182,212,0.3)] hover:bg-cyan-500 transition-all text-[10px] uppercase font-black tracking-widest italic">
                                                    Initialize Section
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )}

                                {modalMode === 'faculty' && (
                                    <>
                                        <div className="mb-8">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-500 mb-2">Target: Section {activeSection?.name}</p>
                                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Assign Faculty</h2>
                                        </div>
                                        <form onSubmit={handleAssignFaculty} className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Select Faculty Node</label>
                                                <select required value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)}
                                                    className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 text-sm font-bold focus:ring-4 ring-cyan-500/20 dark:text-white outline-none transition-all">
                                                    <option value="">Choose User...</option>
                                                    {faculties.map(f => <option key={f._id} value={f._id}>{f.displayName || f.name} • {f.employeeId || 'No ID'}</option>)}
                                                </select>
                                            </div>
                                            <div className="pt-6">
                                                <button type="submit" className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] shadow-xl hover:-translate-y-1 transition-all text-[10px] uppercase font-black tracking-widest italic flex items-center justify-center gap-2">
                                                    Force Assign <ChevronRightIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )}

                                {modalMode === 'student' && (
                                    <>
                                        <div className="mb-8">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Target: Section {activeSection?.name}</p>
                                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Manual Enrollment</h2>
                                        </div>
                                        <form onSubmit={handleEnrollStudent} className="space-y-6">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Select Student Vector</label>
                                                <select required value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
                                                    className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 text-sm font-bold focus:ring-4 ring-emerald-500/20 dark:text-white outline-none transition-all">
                                                    <option value="">Search Subject...</option>
                                                    {students.map(s => <option key={s._id} value={s._id}>{s.displayName || s.name} • {s.studentId}</option>)}
                                                </select>
                                            </div>
                                            <div className="pt-6">
                                                <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:bg-emerald-500 transition-all text-[10px] uppercase font-black tracking-widest italic flex items-center justify-center gap-2">
                                                    Authorize Deployment <CheckCircleIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )}

                                {modalMode === 'auto_enroll' && (
                                    <>
                                        <div className="mb-8 flex items-start gap-4">
                                            <div className="bg-indigo-500/10 p-4 rounded-2xl flex items-center justify-center border border-indigo-500/20 shrink-0">
                                                <CpuChipIcon className="w-8 h-8 text-indigo-500" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Auto-Enroll Engine</h2>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mt-2">Algorithmic Capacity Balancing</p>
                                            </div>
                                        </div>

                                        {!autoEnrollResults ? (
                                            <form onSubmit={handleAutoEnroll} className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Sorting Vector</label>
                                                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                                                            className="w-full px-5 py-3.5 rounded-[1.2rem] bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 text-xs font-bold focus:ring-2 ring-indigo-500/30 dark:text-white outline-none">
                                                            <option value="studentId">Sequential (Roll No)</option>
                                                            <option value="merit">Merit (GPA)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Distribution Logic</label>
                                                        <select value={assignmentRule} onChange={(e) => setAssignmentRule(e.target.value)}
                                                            className="w-full px-5 py-3.5 rounded-[1.2rem] bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 text-xs font-bold focus:ring-2 ring-indigo-500/30 dark:text-white outline-none">
                                                            <option value="capacity_balanced">Round Robin Balance</option>
                                                            <option value="strict_roll">Strict Sequential</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <label className="flex items-center gap-4 bg-slate-50 dark:bg-dark-950 p-5 rounded-2xl border border-slate-200 dark:border-dark-800 cursor-pointer hover:border-indigo-500 transition-colors mt-6">
                                                    <div className="relative flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={dryRun}
                                                            onChange={(e) => setDryRun(e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-10 h-6 bg-slate-200 dark:bg-dark-700 rounded-full peer peer-checked:bg-amber-500 transition-colors"></div>
                                                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mb-1 leading-none">Simulation Mode (Dry Run)</p>
                                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none">Test logic without committing changes</p>
                                                    </div>
                                                </label>

                                                <div className="pt-6">
                                                    <button type="submit" disabled={isAssimilating}
                                                        className={`w-full py-5 rounded-[1.5rem] shadow-xl text-[10px] uppercase font-black tracking-widest italic transition-all flex justify-center items-center gap-3 ${dryRun ? 'bg-amber-500 hover:bg-amber-400 text-amber-950' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)]'
                                                            } disabled:opacity-50`}>
                                                        {isAssimilating ? (
                                                            <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Processing...</>
                                                        ) : dryRun ? (
                                                            <><BeakerIcon className="w-4 h-4" /> Run Simulation</>
                                                        ) : (
                                                            <><BoltIcon className="w-4 h-4" /> Execute Live Enrollment</>
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${autoEnrollResults.isDryRun ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-500/30' : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/30'}`}>
                                                    {autoEnrollResults.isDryRun ? <BeakerIcon className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" /> : <CheckCircleIcon className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />}
                                                    <div>
                                                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${autoEnrollResults.isDryRun ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                                                            {autoEnrollResults.isDryRun ? 'Simulation Results (Dry Run)' : 'Sequence Commited'}
                                                        </p>
                                                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                                                            {autoEnrollResults.message}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 ml-2">Allocation Matrix Status</p>
                                                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
                                                        {(autoEnrollResults.allocations || autoEnrollResults.stats).map((alloc, idx) => (
                                                            <div key={idx} className="bg-slate-50 dark:bg-dark-950 p-4 rounded-[1.2rem] border border-slate-200 dark:border-dark-800 flex justify-between items-center">
                                                                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Sec {alloc.name}</span>
                                                                <span className="text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full">{alloc.count} Subjects</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-slate-100 dark:border-dark-800 flex gap-4">
                                                    {autoEnrollResults.isDryRun && (
                                                        <button onClick={() => { setDryRun(false); setAutoEnrollResults(null); }} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors italic">
                                                            Commit Changes
                                                        </button>
                                                    )}
                                                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-dark-700 transition-colors">
                                                        Close Report
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

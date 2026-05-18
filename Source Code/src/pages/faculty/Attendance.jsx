import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function Attendance() {
    const { user, token } = useAuthStore();
    const [courses, setCourses] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSection, setSelectedSection] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

    const [attendanceData, setAttendanceData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    useEffect(() => {
        const fetchContext = async () => {
            try {
                setCourses([]);
                setSections([]);
            } catch (error) {
                console.error("Failed to load attendance context");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchContext();
        }
    }, [user]);

    useEffect(() => {
        if (selectedCourse && selectedSection) {
            setLoading(true);
            setStudents([]);
            setAttendanceData({});
            setLoading(false);
        } else {
            setStudents([]);
        }
    }, [selectedCourse, selectedSection]);

    const handleMarkAll = (status) => {
        const updated = {};
        students.forEach(s => {
            updated[s._id] = status;
        });
        setAttendanceData(updated);
    };

    const handleToggleStatus = (studentId) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : prev[studentId] === 'Absent' ? 'Late' : 'Present'
        }));
    };

    const submitAttendance = async () => {
        setSubmitting(true);
        setStatusMessage(null);
        try {
            setStatusMessage({ type: 'error', text: 'Attendance API not integrated.' });
        } catch (error) {
            setStatusMessage({ type: 'error', text: 'Failed to synchronize attendance ledger.' });
        } finally {
            setSubmitting(false);
            // Clear message after 3 seconds
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };

    // Derived Stats
    const totalPresent = Object.values(attendanceData).filter(s => s === 'Present').length;
    const totalAbsent = Object.values(attendanceData).filter(s => s === 'Absent').length;
    const totalLate = Object.values(attendanceData).filter(s => s === 'Late').length;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'bg-emerald-500 text-white shadow-emerald-500/30';
            case 'Absent': return 'bg-rose-500 text-white shadow-rose-500/30';
            case 'Late': return 'bg-amber-500 text-white shadow-amber-500/30';
            default: return 'bg-slate-200 text-slate-500';
        }
    };

    if (loading && !selectedCourse) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 md:p-8 lg:p-12 max-w-[1700px] mx-auto min-h-screen pt-20 md:pt-24 font-sans bg-slate-50 dark:bg-dark-950"
        >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
                <div className="w-full xl:w-auto">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                        Attendance <span className="text-violet-600">Ledger</span>
                    </h1>
                    <p className="text-violet-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 flex items-center gap-2 italic">
                        <span className="w-2.5 h-2.5 bg-violet-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.3)]"></span>
                        Biometric Synchronization • Node Tracking Active
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-dark-900/50 backdrop-blur-xl p-3 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 shadow-2xl">
                    <div className="px-6 py-2 border-r border-slate-100 dark:border-dark-800">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Date Vector</p>
                        <input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="bg-transparent text-slate-900 dark:text-white font-black text-sm outline-none uppercase"
                        />
                    </div>
                    <div className="px-6 py-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Presence</p>
                        <p className="text-xl font-black text-emerald-500 italic">{totalPresent} <span className="text-[10px] text-slate-400">NODES</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-8 md:p-12 shadow-3xl border border-slate-50 dark:border-dark-800">
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-4 text-slate-900 dark:text-white mb-10">
                            Sector Configuration
                        </h2>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 italic">Assigned Sector</label>
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => { setSelectedCourse(e.target.value); setSelectedSection(''); }}
                                    className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-violet-500/30 rounded-2xl px-6 py-5 text-slate-900 dark:text-white font-black text-xs outline-none transition-all uppercase tracking-widest italic"
                                >
                                    <option value="">SELECT SECTOR</option>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 italic">Logic Node (Section)</label>
                                <select
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value)}
                                    disabled={!selectedCourse}
                                    className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-violet-500/30 rounded-2xl px-6 py-5 text-slate-900 dark:text-white font-black text-xs outline-none transition-all uppercase tracking-widest italic disabled:opacity-50"
                                >
                                    <option value="">SELECT NODE</option>
                                    {sections.filter(s => s.courseId === selectedCourse).map(s => (
                                        <option key={s._id} value={s._id}>Section {s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-6 border-t border-slate-50 dark:border-dark-800">
                                <div className="grid grid-cols-3 gap-3 mb-8">
                                    <button onClick={() => handleMarkAll('Present')} className="py-4 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all italic">All Present</button>
                                    <button onClick={() => handleMarkAll('Absent')} className="py-4 bg-rose-500/10 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all italic">All Absent</button>
                                    <button onClick={() => handleMarkAll('Late')} className="py-4 bg-amber-500/10 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all italic">All Late</button>
                                </div>

                                <button
                                    onClick={submitAttendance}
                                    disabled={submitting || !selectedCourse || !selectedSection}
                                    className="w-full py-6 bg-violet-600 hover:bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-violet-600/30 transition-all italic flex items-center justify-center gap-4 disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    {submitting ? 'SYNCHRONIZING...' : 'COMMIT TO LEDGER'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-dark-900 rounded-[3.5rem] p-8 md:p-12 shadow-3xl border border-slate-50 dark:border-dark-800 h-full min-h-[600px]">
                        {!selectedCourse || !selectedSection ? (
                            <div className="h-full flex flex-col items-center justify-center text-center py-20">
                                <div className="w-24 h-24 bg-slate-50 dark:bg-dark-950 rounded-full flex items-center justify-center mb-8 border border-slate-100 dark:border-dark-800">
                                    <span className="text-4xl">📡</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-300 dark:text-dark-700 uppercase tracking-[0.2em] italic mb-4">Awaiting Sector Lock</h3>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest max-w-xs leading-relaxed italic">
                                    Select a course and section to initialize the student biometric matrix.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {students.map((student, idx) => (
                                    <motion.div
                                        key={student._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.02 }}
                                        onClick={() => handleToggleStatus(student._id)}
                                        className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent hover:border-violet-500/30 cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white dark:bg-dark-900 rounded-2xl flex items-center justify-center font-black text-slate-400 group-hover:text-violet-600 transition-colors italic border border-slate-100 dark:border-dark-800 shadow-sm overflow-hidden">
                                                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{student.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {student.rollNumber || 'UNSET'}</p>
                                            </div>
                                        </div>
                                        <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shadow-lg ${getStatusColor(attendanceData[student._id])}`}>
                                            {attendanceData[student._id] || 'UNSET'}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

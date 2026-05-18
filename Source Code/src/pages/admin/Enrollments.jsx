import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function Enrollments() {
    const [enrollments, setEnrollments] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [sections, setSections] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter and Modal State
    const [filterSection, setFilterSection] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        studentId: '',
        semesterId: '',
        sectionId: ''
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            const [semRes, studRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/semesters/current`, { headers }),
                axios.get(`${API_BASE_URL}/users?role=student`, { headers })
            ]);

            setSemesters(semRes.data.data || []);
            setStudents(studRes.data.data || []);

            if (semRes.data.data?.length > 0) {
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
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/sections/semester/${semId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setSections(response.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchEnrollments = async (secId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/enrollments/section/${secId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setEnrollments(response.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSectionChange = (id) => {
        setFilterSection(id);
        if (id !== 'all') {
            fetchEnrollments(id);
        }
    };

    const handleEnroll = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            await axios.post(`${API_BASE_URL}/enrollments`, formData, { headers });

            setIsModalOpen(false);
            if (filterSection !== 'all') fetchEnrollments(filterSection);
            // Optionally refresh section stats if needed
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-dark-900">
                <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Enrollments</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-3 flex items-center gap-2">
                        Student Matrix & Section Mapping
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <select
                        value={filterSection}
                        onChange={(e) => handleSectionChange(e.target.value)}
                        className="px-6 py-4 bg-white dark:bg-dark-800 rounded-2xl text-[10px] font-black uppercase tracking-widest border-none shadow-lg shadow-slate-200/50 focus:ring-4 ring-violet-500/10 cursor-pointer"
                    >
                        <option value="all">Filter Section Node</option>
                        {sections.map(s => <option key={s._id} value={s._id}>Sec {s.name} ({s.semesterId?.programId?.code})</option>)}
                    </select>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex-shrink-0 bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-violet-500/30 transition-all hover:scale-105"
                    >
                        + Matrix Enrollment
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-[3rem] shadow-xl overflow-hidden border border-slate-50 dark:border-dark-700">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-dark-900/50 border-b border-slate-100 dark:border-dark-700">
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Section Node</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Academic Context</th>
                            <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-dark-700">
                        {enrollments.map((en, idx) => (
                            <motion.tr
                                key={en._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="hover:bg-violet-50/30 transition-colors"
                            >
                                <td className="px-10 py-6">
                                    <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">{en.studentId?.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold tracking-widest">{en.studentId?.email}</p>
                                </td>
                                <td className="px-10 py-6">
                                    <span className="px-4 py-2 bg-slate-100 dark:bg-dark-900 rounded-xl text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                                        Section {en.sectionId?.name}
                                    </span>
                                </td>
                                <td className="px-10 py-6">
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tighter">
                                        Sem {en.semesterId?.semesterNumber} - {en.semesterId?.programId?.name}
                                    </p>
                                </td>
                                <td className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {new Date(en.createdAt).toLocaleDateString()}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                {enrollments.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center justify-center text-slate-400">
                        <p className="font-black uppercase tracking-widest text-xs">Zero Matrix Nodes Detected</p>
                        <p className="text-[10px] mt-2 font-bold px-4">Select a section filter or proceed with a new student placement.</p>
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
                            className="bg-white dark:bg-dark-800 rounded-[3rem] p-12 max-w-xl w-full shadow-2xl border-t-[12px] border-violet-600"
                        >
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">Matrix Placement</h2>

                            <form onSubmit={handleEnroll} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Identity (Student)</label>
                                    <select
                                        required
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                        className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-violet-500/10"
                                    >
                                        <option value="">Select Candidate Node</option>
                                        {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Cycle Context (Semester)</label>
                                    <select
                                        required
                                        value={formData.semesterId}
                                        onChange={(e) => {
                                            setFormData({ ...formData, semesterId: e.target.value, sectionId: '' });
                                            fetchSections(e.target.value);
                                        }}
                                        className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-violet-500/10"
                                    >
                                        <option value="">Select Target Cycle</option>
                                        {semesters.map(s => <option key={s._id} value={s._id}>Sem {s.semesterNumber} - {s.programId?.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Output Node (Section)</label>
                                    <select
                                        required
                                        value={formData.sectionId}
                                        onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                                        className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-violet-500/10"
                                        disabled={!formData.semesterId}
                                    >
                                        <option value="">Select Section Outlet</option>
                                        {sections.map(s => (
                                            <option key={s._id} value={s._id} disabled={s.enrolledCount >= s.capacity}>
                                                Sec {s.name} (Available: {s.capacity - s.enrolledCount})
                                            </option>
                                        ))}
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
                                        className="flex-[2] bg-violet-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-500/20 hover:bg-violet-700 transition"
                                    >
                                        Commit Placement
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

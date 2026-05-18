import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

export default function HODCourses() {
    const { user, token } = useAuthStore();
    const [courses, setCourses] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [formData, setFormData] = useState({
        _id: '',
        title: '',
        code: '',
        credits: 3,
        semesterNumber: 1,
        programId: '',
        facultyIds: []
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const headers = { 'Authorization': `Bearer ${token}` };
            const deptId = user.department?._id || user.department;

            const [coursesRes, programsRes, facultyRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/courses`, { headers }),
                axios.get(`${API_BASE_URL}/programs/department/${deptId}`, { headers }),
                axios.get(`${API_BASE_URL}/users?role=faculty&department=${deptId}`, { headers })
            ]);

            const deptCourses = (coursesRes.data.data || []).filter(c =>
                c.department?._id === deptId || c.department === deptId
            );

            setCourses(deptCourses);
            setPrograms(programsRes.data.data || []);
            setFaculties(
                (facultyRes.data.data || []).map(f => ({
                    ...f,
                    displayName: f.name || `${f.firstName || ''} ${f.lastName || ''}`.trim()
                }))
            );
        } catch (err) {
            console.error(err);
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (mode, course = null) => {
        setModalMode(mode);
        if (mode === 'edit' && course) {
            setFormData({
                _id: course._id,
                title: course.title || course.name,
                code: course.code,
                credits: course.credits,
                semesterNumber: course.semesterNumber || 1,
                programId: course.programId?._id || course.programId || '',
                facultyIds: course.facultyIds?.map(f => f._id || f) || []
            });
        } else {
            setFormData({
                _id: '',
                title: '',
                code: '',
                credits: 3,
                semesterNumber: 1,
                programId: programs.length > 0 ? programs[0]._id : '',
                facultyIds: []
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const deptId = user.department?._id || user.department;
            const payload = {
                ...formData,
                name: formData.title,
                department: deptId,
                semester: formData.semesterNumber
            };

            if (modalMode === 'add') {
                await axios.post(`${API_BASE_URL}/courses`, payload, { headers });
            } else {
                await axios.put(`${API_BASE_URL}/courses/${formData._id}`, payload, { headers });
            }
            setIsModalOpen(false);
            fetchInitialData();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this course?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/courses/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            fetchInitialData();
        } catch (err) {
            alert(err.response?.data?.message || err.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
                <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Curriculum Catalog</h1>
                    <p className="text-teal-600 font-bold uppercase tracking-widest text-[10px] mt-3">
                        Course Deployment Oversight • Assigned Faculty Analysis
                    </p>
                </div>
                <button onClick={() => openModal('add')} className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-teal-500/30 transition-all hover:scale-105">
                    + Build Course
                </button>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-xl text-rose-700 font-bold text-xs uppercase tracking-widest">
                    {typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course, idx) => (
                    <motion.div
                        key={course._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 shadow-xl border border-slate-50 dark:border-dark-700 hover:border-teal-500 transition-all flex flex-col group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-[5rem] -mr-8 -mt-8 group-hover:scale-110 transition-transform" />

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 px-4 py-2 rounded-2xl text-[10px] font-black uppercase">
                                {course.code}
                            </span>
                            <div className="flex gap-2">
                                <button onClick={() => openModal('edit', course)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-slate-400">✏️</button>
                                <button onClick={() => handleDelete(course._id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-500 rounded-lg transition-colors">🗑️</button>
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 uppercase leading-tight line-clamp-2 relative z-10">{course.title || course.name}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 dark:border-dark-700 pb-4 relative z-10">
                            Sem {course.semesterNumber || '1'} • {course.credits || 0} Credits
                        </p>

                        <div className="flex-grow space-y-4 relative z-10">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Assigned Faculty Nodes</p>
                            {course.facultyIds?.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {course.facultyIds.map((f) => (
                                        <span key={f._id || f} className="bg-slate-100 dark:bg-dark-900 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                            {f.name || `${f.firstName || ''} ${f.lastName || ''}`.trim() || f}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-2xl w-fit">
                                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">No Faculty Assigned</p>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 dark:border-dark-700 relative z-10">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                <span className="text-slate-400 tracking-widest">Program Context</span>
                                <span className="text-teal-600">{course.programId?.code || 'GENERIC'}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {courses.length === 0 && (
                    <div className="col-span-full py-20 bg-slate-50 dark:bg-dark-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-dark-700 flex flex-col items-center justify-center text-slate-400">
                        <p className="font-black uppercase tracking-widest text-xs">Curriculum Empty</p>
                        <p className="text-[10px] mt-2 font-bold px-4 text-center">No courses are linked to your department node.</p>
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
                            className="bg-white dark:bg-dark-800 rounded-[3rem] p-12 max-w-xl w-full shadow-2xl border-t-[12px] border-teal-600 my-8"
                        >
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">
                                {modalMode === 'add' ? 'Build Course' : 'Update Course'}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Course Title</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. Advanced Data Structures"
                                            className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-teal-500/10 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Course Code</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            placeholder="e.g. CS101"
                                            className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-teal-500/10 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Assigned Credits</label>
                                        <input
                                            required
                                            type="number"
                                            min="1" max="10"
                                            value={formData.credits}
                                            onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                                            className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-teal-500/10 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Target Semester</label>
                                        <input
                                            required
                                            type="number"
                                            min="1" max="12"
                                            value={formData.semesterNumber}
                                            onChange={(e) => setFormData({ ...formData, semesterNumber: parseInt(e.target.value) })}
                                            className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-teal-500/10 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Program Context</label>
                                        <select
                                            required
                                            value={formData.programId}
                                            onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                                            className="w-full px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-teal-500/10 text-slate-900 dark:text-white"
                                        >
                                            <option value="">Select Protocol...</option>
                                            {programs.map(p => (
                                                <option key={p._id} value={p._id}>{p.name} ({p.code})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Assign Faculty Nodes (Hold Ctrl/Cmd to multi-select)</label>
                                        <select
                                            multiple
                                            value={formData.facultyIds}
                                            onChange={(e) => {
                                                const options = [...e.target.selectedOptions];
                                                const values = options.map(opt => opt.value);
                                                setFormData({ ...formData, facultyIds: values });
                                            }}
                                            className="w-full h-32 px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-teal-500/10 text-slate-900 dark:text-white"
                                        >
                                            {faculties.map(f => (
                                                <option key={f._id} value={f._id}>{f.displayName || f.name} - {f.email}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-dark-700">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700 transition">
                                        Discard
                                    </button>
                                    <button type="submit" className="flex-[2] bg-teal-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-500/20 hover:bg-teal-700 transition">
                                        {modalMode === 'add' ? 'Initialize Course' : 'Commit Changes'}
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

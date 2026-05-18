import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import labManualService from '../../services/api/labManualService';
import courseService from '../../services/api/courseService';
import {
    BeakerIcon,
    DocumentTextIcon,
    PlusIcon,
    EyeIcon,
    TrashIcon,
    AcademicCapIcon,
    CheckCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

export default function LabManuals() {
    const navigate = useNavigate();
    const [labs, setLabs] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ difficulty: '', labType: '' });
    const [assignModal, setAssignModal] = useState(null);
    const [assignData, setAssignData] = useState({ courseIds: [], dueDate: '', status: 'Published' });

    useEffect(() => {
        fetchLabs();
        fetchCourses();
    }, [filter]);

    const fetchCourses = async () => {
        try {
            const response = await courseService.getAllCourses();
            setCourses(response.data || []);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    const fetchLabs = async () => {
        try {
            setLoading(true);
            const response = await labManualService.getAllLabManuals(filter);
            console.log(' Labs fetched:', response.data);
            setLabs(response.data || []);
        } catch (error) {
            console.error('Failed to fetch lab manuals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this lab manual?')) return;
        
        try {
            await labManualService.deleteLabManual(id);
            fetchLabs();
        } catch (error) {
            console.error('Failed to delete lab:', error);
            alert('Failed to delete lab manual');
        }
    };

    const openAssignModal = (lab) => {
        setAssignModal(lab);
        setAssignData({
            courseIds: lab.assignedTo?.map(c => c._id || c) || [],
            dueDate: lab.dueDate ? new Date(lab.dueDate).toISOString().split('T')[0] : '',
            status: lab.status || 'Published'
        });
    };

    const handleAssign = async () => {
        try {
            await labManualService.assignLabToCourses(assignModal._id, assignData);
            setAssignModal(null);
            fetchLabs();
            alert('Lab assigned successfully!');
        } catch (error) {
            console.error('Failed to assign lab:', error);
            alert('Failed to assign lab');
        }
    };

    const toggleCourse = (courseId) => {
        setAssignData(prev => ({
            ...prev,
            courseIds: prev.courseIds.includes(courseId)
                ? prev.courseIds.filter(id => id !== courseId)
                : [...prev.courseIds, courseId]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-8 max-w-7xl mx-auto min-h-screen"
        >
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                    Lab <span className="text-indigo-600">Manuals</span>
                </h1>
                <p className="text-indigo-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-3 flex items-center gap-2">
                    <BeakerIcon className="w-4 h-4" />
                    AI-Generated Comprehensive Lab Guides
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => navigate('/faculty/ultimate-lab-generator')}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    Generate New Labs
                </button>

                <select
                    value={filter.difficulty}
                    onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
                    className="px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                >
                    <option value="">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>

                <select
                    value={filter.labType}
                    onChange={(e) => setFilter({ ...filter, labType: e.target.value })}
                    className="px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                >
                    <option value="">All Types</option>
                    <option value="Programming">Programming</option>
                    <option value="Simulation">Simulation</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Research">Research</option>
                </select>
            </div>

            {/* Lab Cards */}
            {labs.length === 0 ? (
                <div className="text-center py-20">
                    <BeakerIcon className="w-20 h-20 text-slate-300 dark:text-dark-700 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-bold">No lab manuals found</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Click "Generate New Labs" to create your first lab</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {labs.map((lab) => (
                        <motion.div
                            key={lab._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-dark-900 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-dark-800 hover:border-indigo-500 transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                                            Lab {lab.labNumber}
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                                            lab.difficulty === 'Easy' ? 'bg-green-50 text-green-600 dark:bg-green-900/30' :
                                            lab.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30' :
                                            'bg-red-50 text-red-600 dark:bg-red-900/30'
                                        }`}>
                                            {lab.difficulty}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 line-clamp-2">
                                        {lab.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                        {lab.aim}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2 mb-4 flex-wrap">
                                <span className="text-[10px] font-bold bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                                    {lab.labType}
                                </span>
                                {lab.isAiGenerated && (
                                    <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-600 px-2 py-1 rounded">
                                        AI Generated
                                    </span>
                                )}
                                {lab.assignedTo && lab.assignedTo.length > 0 && (
                                    <span className="text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-1 rounded">
                                        Assigned to {lab.assignedTo.length} course(s)
                                    </span>
                                )}
                                <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                    lab.status === 'Published' 
                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                                        : 'bg-gray-100 dark:bg-gray-900/30 text-gray-600'
                                }`}>
                                    {lab.status}
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/faculty/lab-manuals/${lab._id}`)}
                                    className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-1"
                                >
                                    <EyeIcon className="w-4 h-4" />
                                    View
                                </button>
                                <button
                                    onClick={() => openAssignModal(lab)}
                                    className="bg-green-50 dark:bg-green-900/30 text-green-600 px-3 py-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-all text-xs font-bold"
                                >
                                    Assign
                                </button>
                                <button
                                    onClick={() => handleDelete(lab._id)}
                                    className="bg-red-50 dark:bg-red-900/30 text-red-600 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Assign Modal */}
            <AnimatePresence>
                {assignModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setAssignModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-dark-900 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                    Assign Lab to Courses
                                </h2>
                                <button
                                    onClick={() => setAssignModal(null)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                    Lab: <span className="font-bold text-slate-900 dark:text-white">{assignModal.title}</span>
                                </p>
                            </div>

                            {/* Status */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={assignData.status}
                                    onChange={(e) => setAssignData({ ...assignData, status: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white"
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Published">Published</option>
                                </select>
                            </div>

                            {/* Due Date */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Due Date (Optional)
                                </label>
                                <input
                                    type="date"
                                    value={assignData.dueDate}
                                    onChange={(e) => setAssignData({ ...assignData, dueDate: e.target.value })}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-950 text-slate-900 dark:text-white"
                                />
                            </div>

                            {/* Course Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                                    Assign to Courses
                                </label>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {courses.length === 0 ? (
                                        <p className="text-sm text-slate-500">No courses available</p>
                                    ) : (
                                        courses.map(course => (
                                            <label
                                                key={course._id}
                                                className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200 dark:border-dark-800 hover:border-indigo-500 cursor-pointer transition-all"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={assignData.courseIds.includes(course._id)}
                                                    onChange={() => toggleCourse(course._id)}
                                                    className="w-5 h-5 text-indigo-600 rounded"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">
                                                        {course.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500">{course.code}</p>
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleAssign}
                                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircleIcon className="w-5 h-5" />
                                    Assign Lab
                                </button>
                                <button
                                    onClick={() => setAssignModal(null)}
                                    className="px-6 bg-slate-200 dark:bg-dark-800 text-slate-700 dark:text-slate-300 py-3 rounded-lg font-bold hover:bg-slate-300 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

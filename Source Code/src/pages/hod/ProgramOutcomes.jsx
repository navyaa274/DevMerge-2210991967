import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function ProgramOutcomes() {
    const { user, token } = useAuthStore();
    const [pos, setPos] = useState([]);
    const [psos, setPsos] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pos');

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);

    const [expandedItem, setExpandedItem] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [itemToMap, setItemToMap] = useState(null);
    const [mappingData, setMappingData] = useState({ courseId: '', mappingLevel: 'Medium' });

    const [newPO, setNewPO] = useState({
        code: '',
        description: '',
        type: 'PO',
        bloomLevel: 'Apply',
        program: '',
        weightage: 1,
    });

    useEffect(() => {
        if (user) {
            fetchOutcomes();
            fetchCourses();
            setNewPO(prev => ({ ...prev, program: user.program || user.department || '' }));
        }
    }, [user]);

    const fetchOutcomes = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const programId = user?.program || user?.department || 'default';

            const res = await axios.get(
                `${API_BASE_URL}/program-outcomes/program/${programId}/all`,
                { headers }
            );
            setPos(res.data.pos || []);
            setPsos(res.data.psos || []);
        } catch (err) {
            console.error('Error fetching outcomes:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourses(res.data.data || []);
        } catch (err) {
            console.error('Error fetching courses:', err);
        }
    };

    const handleCreate = async () => {
        try {
            await axios.post(
                `${API_BASE_URL}/program-outcomes/create`,
                newPO,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowCreateModal(false);
            setNewPO({
                code: '',
                description: '',
                type: 'PO',
                bloomLevel: 'Apply',
                program: user?.program || user?.department || '',
                weightage: 1
            });
            fetchOutcomes();
        } catch (err) {
            alert('Create failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleUpdate = async () => {
        try {
            await axios.put(
                `${API_BASE_URL}/program-outcomes/${editingItem._id}`,
                editingItem,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowEditModal(false);
            fetchOutcomes();
        } catch (err) {
            alert('Update failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to deactivate this outcome?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/program-outcomes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchOutcomes();
        } catch (err) {
            alert('Delete failed');
        }
    };

    const handleMapCourse = async () => {
        if (!mappingData.courseId) return alert('Select a course');
        try {
            await axios.post(
                `${API_BASE_URL}/program-outcomes/${itemToMap._id}/map-course`,
                mappingData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setShowMapModal(false);
            setMappingData({ courseId: '', mappingLevel: 'Medium' });
            fetchOutcomes();
        } catch (err) {
            alert('Mapping failed');
        }
    };

    const getBloomColor = (level) => {
        const colors = {
            Remember: 'bg-gray-100 text-gray-700',
            Understand: 'bg-blue-100 text-blue-700',
            Apply: 'bg-emerald-100 text-emerald-700',
            Analyze: 'bg-amber-100 text-amber-700',
            Evaluate: 'bg-purple-100 text-purple-700',
            Create: 'bg-rose-100 text-rose-700',
        };
        return colors[level] || 'bg-gray-100 text-gray-700';
    };

    const currentItems = activeTab === 'pos' ? pos : psos;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50 dark:bg-dark-900 px-4 py-8 md:p-8 lg:p-12 pt-20 md:pt-24 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 md:mb-16 gap-6">
                    <div className="w-full sm:w-auto">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                            Outcome <span className="text-violet-600">Framework</span>
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[9px] md:text-[10px] mt-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            OBE Intelligence Hub · {pos.length + psos.length} Nodes
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full sm:w-auto px-8 py-4 bg-violet-600 text-white rounded-[1.5rem] md:rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-xl shadow-violet-500/20 transform hover:-translate-y-1"
                    >
                        + Initialize Node
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                    {[
                        { label: 'Program Outcomes', value: pos.length, color: 'violet', icon: '🎯' },
                        { label: 'Program Specific', value: psos.length, color: 'indigo', icon: '🚀' },
                        { label: 'Avg Attainment', value: `${(pos.concat(psos).reduce((s, p) => s + (p.attainmentLevel || 0), 0) / Math.max(1, pos.length + psos.length)).toFixed(2)}`, color: 'emerald', icon: '📊' },
                        { label: 'Mapped Nodes', value: new Set(pos.concat(psos).flatMap(p => (p.mappedCourses || []).map(c => c.courseId))).size, color: 'sky', icon: '🔗' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-dark-800 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-dark-700 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-3xl md:text-4xl group-hover:scale-125 transition-transform">{stat.icon}</div>
                            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                            <p className={`text-3xl md:text-4xl font-black text-${stat.color}-600 tracking-tighter italic leading-none`}>{stat.value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-wrap p-1.5 bg-white dark:bg-dark-800 rounded-[2rem] md:rounded-[2.5rem] w-full sm:w-fit mb-10 border border-slate-100 dark:border-dark-700 shadow-sm gap-1">
                    {[
                        { id: 'pos', label: `POs (${pos.length})` },
                        { id: 'psos', label: `PSOs (${psos.length})` },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 sm:flex-none px-6 md:px-10 py-3 md:py-4 rounded-[1.5rem] md:rounded-[2rem] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Outcomes List */}
                <div className="grid grid-cols-1 gap-4 md:gap-6">
                    <AnimatePresence mode="popLayout">
                        {currentItems.length > 0 ? currentItems.map((item, i) => (
                            <motion.div
                                key={item._id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-dark-800 rounded-[2.5rem] md:rounded-[3.5rem] shadow-lg border border-slate-100 dark:border-dark-700 overflow-hidden group hover:shadow-2xl hover:shadow-violet-500/5 transition-all"
                            >
                                <div className="p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 md:gap-8">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8 flex-1 w-full lg:w-auto">
                                        <div className="w-16 h-16 md:w-20 md:h-20 bg-violet-600 text-white rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center font-black text-lg md:text-xl italic shadow-2xl shadow-violet-600/30 group-hover:rotate-6 transition-transform shrink-0">
                                            {item.code}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-3">
                                                <span className={`px-4 py-1.5 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest ${getBloomColor(item.bloomLevel)}`}>
                                                    {item.bloomLevel}
                                                </span>
                                                <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-dark-900 px-3 py-1 rounded-full border border-slate-100 dark:border-dark-800">
                                                    Impact: {item.weightage}x
                                                </span>
                                            </div>
                                            <p className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight italic uppercase tracking-tighter">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between lg:justify-end w-full lg:w-auto gap-4 md:gap-8 pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-50 dark:border-dark-700">
                                        <div className="text-center px-4 md:px-8 border-r border-slate-100 dark:border-dark-700 lg:min-w-[120px]">
                                            <p className="text-2xl md:text-4xl font-black text-violet-600 italic">{(item.attainmentLevel || 0).toFixed(1)}</p>
                                            <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Attainment</p>
                                        </div>

                                        <div className="flex gap-2">
                                            {[
                                                { icon: '🔗', color: 'sky', action: () => { setItemToMap(item); setShowMapModal(true); } },
                                                { icon: '✏️', color: 'emerald', action: () => { setEditingItem(item); setShowEditModal(true); } },
                                                { icon: '🗑️', color: 'rose', action: () => handleDelete(item._id) }
                                            ].map((btn, i) => (
                                                <button
                                                    key={i}
                                                    onClick={btn.action}
                                                    className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-${btn.color}-50 dark:bg-${btn.color}-900/20 text-${btn.color}-600 rounded-xl md:rounded-2xl hover:bg-${btn.color}-600 hover:text-white transition-all transform hover:-translate-y-1`}
                                                >
                                                    {btn.icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Mapped Courses Drawer */}
                                {item.mappedCourses?.length > 0 && (
                                    <div className="px-6 md:px-8 pb-6 md:pb-8 flex flex-wrap gap-2 md:gap-3">
                                        {item.mappedCourses.map((mc, idx) => (
                                            <div key={idx} className="px-3 md:px-4 py-1.5 md:py-2 bg-slate-50 dark:bg-dark-950 rounded-lg md:rounded-xl border border-slate-100 dark:border-dark-800 flex items-center gap-2 md:gap-3 transition-colors hover:border-violet-500/30">
                                                <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">
                                                    {courses.find(c => c._id === mc.courseId)?.code || 'NODE'}
                                                </span>
                                                <span className={`w-1.5 md:w-2 h-1.5 md:h-2 rounded-full ${mc.mappingLevel === 'High' ? 'bg-emerald-500' : mc.mappingLevel === 'Medium' ? 'bg-amber-500' : 'bg-slate-300'} shadow-lg shadow-current/20`}></span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )) : (
                            <div className="bg-white dark:bg-dark-800 rounded-[3rem] md:rounded-[4rem] py-20 md:py-32 border-4 border-dashed border-slate-100 dark:border-dark-700 text-center px-6">
                                <p className="text-4xl md:text-6xl mb-8 opacity-30 grayscale saturate-0">🛰️</p>
                                <p className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-4 italic">No Matrix Nodes Detected</p>
                                <p className="text-[9px] md:text-[10px] font-bold text-slate-400/50 uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
                                    The outcome framework is currently uninitialized for this operational program.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* CREATE MODAL */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)}>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-violet-600/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🎯</div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Initialize Outcome</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">New Learning Node Cluster</p>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="flex gap-3 p-1.5 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-700">
                        {['PO', 'PSO'].map(t => (
                            <button key={t} onClick={() => setNewPO({ ...newPO, type: t })} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newPO.type === t ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Node Reference Code</label>
                        <input type="text" value={newPO.code} onChange={e => setNewPO({ ...newPO, code: e.target.value })} placeholder="E.G. PO1, PSO2" className="w-full bg-slate-50 dark:bg-dark-900 p-4 rounded-2xl border border-slate-100 dark:border-dark-700 text-sm font-black outline-none focus:ring-4 ring-violet-500/10 dark:text-white uppercase placeholder:text-slate-300" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Behavioral Statement</label>
                        <textarea value={newPO.description} onChange={e => setNewPO({ ...newPO, description: e.target.value })} placeholder="What should the learner achieve?" rows={3} className="w-full bg-slate-50 dark:bg-dark-900 p-4 rounded-2xl border border-slate-100 dark:border-dark-700 text-sm font-black outline-none resize-none focus:ring-4 ring-violet-500/10 dark:text-white placeholder:text-slate-300" />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Cognitive Stack</label>
                            <select value={newPO.bloomLevel} onChange={e => setNewPO({ ...newPO, bloomLevel: e.target.value })} className="w-full bg-slate-50 dark:bg-dark-900 p-4 rounded-2xl border border-slate-100 dark:border-dark-700 text-[10px] font-black uppercase tracking-widest outline-none dark:text-white cursor-pointer">
                                {['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Impact Weight</label>
                            <input type="number" value={newPO.weightage} onChange={e => setNewPO({ ...newPO, weightage: e.target.value })} placeholder="1.0" className="w-full bg-slate-50 dark:bg-dark-900 p-4 rounded-2xl border border-slate-100 dark:border-dark-700 text-sm font-black outline-none dark:text-white" />
                        </div>
                    </div>

                    <button onClick={handleCreate} disabled={!newPO.code || !newPO.description} className="w-full py-5 bg-violet-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-violet-700 transition-all transform hover:-translate-y-1 disabled:opacity-50 mt-4 h-16 flex items-center justify-center gap-2">
                        Initialize Node <span className="text-xl">→</span>
                    </button>
                </div>
            </Modal>

            {/* EDIT MODAL */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-600/10 rounded-2xl flex items-center justify-center text-2xl">✏️</div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Refine Node</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Optimize Outcome Logic</p>
                    </div>
                </div>
                {editingItem && (
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Reference Code</label>
                            <input type="text" value={editingItem.code} onChange={e => setEditingItem({ ...editingItem, code: e.target.value })} className="w-full bg-slate-50 dark:bg-dark-900 p-4 rounded-2xl border border-slate-100 dark:border-dark-700 text-sm font-black outline-none dark:text-white uppercase" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Outcome Description</label>
                            <textarea value={editingItem.description} onChange={e => setEditingItem({ ...editingItem, description: e.target.value })} rows={4} className="w-full bg-slate-50 dark:bg-dark-900 p-4 rounded-2xl border border-slate-100 dark:border-dark-700 text-sm font-black outline-none dark:text-white" />
                        </div>
                        <button onClick={handleUpdate} className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-emerald-700 transition-all transform hover:-translate-y-1 mt-4 h-16 flex items-center justify-center gap-2">
                            Commit Optimization <span className="text-xl">→</span>
                        </button>
                    </div>
                )}
            </Modal>

            {/* MAPPING MODAL */}
            <Modal show={showMapModal} onClose={() => setShowMapModal(false)}>
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-sky-600/10 rounded-2xl flex items-center justify-center text-2xl">🔗</div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">Node Mapping</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Establish Curriculum Links</p>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Target Course Cluster</label>
                        <select value={mappingData.courseId} onChange={e => setMappingData({ ...mappingData, courseId: e.target.value })} className="w-full bg-slate-50 dark:bg-dark-900 p-4 rounded-2xl border border-slate-100 dark:border-dark-700 text-[10px] font-black uppercase tracking-widest outline-none dark:text-white cursor-pointer">
                            <option value="">Select Target Node...</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.name}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Correspondence Intensity</label>
                        <div className="flex gap-3 p-1.5 bg-slate-50 dark:bg-dark-900 rounded-2xl border border-slate-100 dark:border-dark-700">
                            {['Low', 'Medium', 'High'].map(l => (
                                <button key={l} onClick={() => setMappingData({ ...mappingData, mappingLevel: l })} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mappingData.mappingLevel === l ? 'bg-sky-600 text-white shadow-xl shadow-sky-600/20' : 'text-slate-400'}`}>{l}</button>
                            ))}
                        </div>
                    </div>

                    <button onClick={handleMapCourse} className="w-full py-5 bg-sky-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-sky-700 transition-all transform hover:-translate-y-1 mt-4 h-16 flex items-center justify-center gap-2">
                        Integrate Node Link <span className="text-xl">→</span>
                    </button>
                </div>
            </Modal>
        </motion.div>
    );
}

function Modal({ show, onClose, children }) {
    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="bg-white dark:bg-dark-950 w-full max-w-lg rounded-[2.5rem] p-10 shadow-[0_32px_128px_-12px_rgba(0,0,0,0.3)] relative z-10 overflow-hidden border border-slate-100 dark:border-dark-800"
                    >
                        <div className="absolute top-0 right-0 p-8">
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-dark-900 text-slate-400 hover:text-slate-600 transition-colors">×</button>
                        </div>
                        {children}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

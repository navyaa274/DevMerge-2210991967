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
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Departments() {
  const { token } = useAuthStore();
  const [departments, setDepartments] = useState([]);
  const [university, setUniversity] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({ _id: '', name: '', code: '', description: '', hodId: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const [univRes, deptRes, userRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/university`, { headers }),
        axios.get(`${API_BASE_URL}/departments`, { headers }),
        axios.get(`${API_BASE_URL}/users?role=hod`, { headers })
      ]);

      setUniversity(univRes.data.data);
      setDepartments(deptRes.data.data || []);
      setFaculties(
        (userRes.data.data || []).map(f => ({
          ...f,
          displayName: f.name || `${f.firstName || ''} ${f.lastName || ''}`.trim()
        }))
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, dept = null) => {
    setModalMode(mode);
    if (mode === 'edit' && dept) {
      setFormData({
        _id: dept._id,
        name: dept.name,
        code: dept.code,
        description: dept.description || '',
        hodId: dept.hodId?._id || ''
      });
    } else {
      setFormData({ _id: '', name: '', code: '', description: '', hodId: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const payload = { ...formData, universityId: university._id };

      if (modalMode === 'add') {
        await axios.post(`${API_BASE_URL}/departments`, payload, { headers });
      } else {
        await axios.put(`${API_BASE_URL}/departments/${formData._id}`, payload, { headers });
      }

      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this department?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/departments/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-dark-950">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-6 font-black text-indigo-600 uppercase tracking-[0.4em] text-[10px]">Accessing Foundation Layer...</p>
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
            Academic <span className="text-indigo-600">Departments</span>
          </h1>
          <p className="text-indigo-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 flex items-center gap-2 italic">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
            Structural Root: {university?.name || 'System Nodes'}
          </p>
        </div>
        <button
          onClick={() => openModal('add')}
          className="w-full xl:w-auto bg-indigo-600 hover:bg-slate-900 text-white px-10 py-5 rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] md:text-xs shadow-2xl shadow-indigo-600/20 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 italic"
        >
          <PlusIcon className="w-5 h-5" />
          Provision New Division
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 p-6 bg-rose-50 dark:bg-rose-950/20 border-l-8 border-rose-500 rounded-[2rem] text-rose-700 dark:text-rose-400 font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-4"
        >
          <InformationCircleIcon className="w-6 h-6" />
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10">
        {departments.map((dept, idx) => (
          <motion.div
            key={dept._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group relative bg-white dark:bg-dark-900 rounded-[3rem] md:rounded-[4rem] p-8 md:p-10 shadow-2xl border border-slate-50 dark:border-dark-800 hover:border-indigo-500 transition-all overflow-hidden flex flex-col h-full"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-bl-[5rem] -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-700" />

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-center mb-10">
                <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/30 italic">
                  Node: {dept.code}
                </span>
                <div className="flex gap-3">
                  <button
                    onClick={() => openModal('edit', dept)}
                    className="p-3 bg-slate-50 dark:bg-dark-950 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl transition-all hover:scale-110 shadow-sm"
                    title="Edit Dept"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept._id)}
                    className="p-3 bg-slate-50 dark:bg-dark-950 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all hover:scale-110 shadow-sm"
                    title="Delete Dept"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight uppercase italic tracking-tighter line-clamp-2">{dept.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-tight mb-auto line-clamp-3 italic opacity-80">
                {dept.description || 'Primary academic division sustaining core curricular activities and pedagogical standards.'}
              </p>

              <div className="mt-10 pt-8 border-t border-slate-50 dark:border-dark-800 flex items-center gap-5 group/hod bg-slate-50/50 dark:bg-dark-950/30 -mx-4 px-4 py-4 rounded-[2rem] transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center text-xl shadow-xl shadow-indigo-600/20 group-hover/hod:rotate-12 transition-transform italic font-black shrink-0">
                  {(dept.hodName || dept.hodId?.name || 'H').charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Administrative Head</p>
                  <p className="text-[11px] md:text-xs font-black text-slate-900 dark:text-white uppercase italic truncate">
                    {dept.hodName || dept.hodId?.name || 'Unassigned Node'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {departments.length === 0 && (
          <div className="col-span-full py-20 md:py-32 bg-slate-50 dark:bg-dark-950/50 rounded-[4rem] border-4 border-dashed border-slate-100 dark:border-dark-800 flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 bg-slate-100 dark:bg-dark-900 rounded-full flex items-center justify-center mb-8 text-4xl">🌫️</div>
            <p className="font-black uppercase tracking-[0.4em] text-sm text-slate-400 italic">Foundation Layer Empty</p>
            <p className="text-[10px] mt-4 font-bold text-slate-500 uppercase tracking-widest max-w-sm leading-relaxed"> No structural units detected in the current institutional matrix. Initialize your first academic division above.</p>
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
              className="bg-white dark:bg-dark-900 rounded-[3rem] md:rounded-[4rem] p-8 md:p-14 max-w-2xl w-full shadow-2xl border-t-[15px] md:border-t-[20px] border-indigo-600 my-auto"
            >
              <div className="flex justify-between items-start mb-10 md:mb-12">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none">
                    {modalMode === 'add' ? 'Provision' : 'Update'} <span className="text-indigo-600">Division</span>
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 flex items-center gap-2 italic">
                    <AcademicCapIcon className="w-4 h-4" />
                    Structural Configuration Node
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
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2 italic">Department Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. COMPUTER SCIENCE"
                      className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent text-sm font-black focus:ring-4 ring-indigo-500/10 focus:border-indigo-500/30 transition-all uppercase placeholder:opacity-30 placeholder:italic"
                    />
                  </div>
                  <div className="relative group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2 italic">Unique Matrix Code</label>
                    <input
                      required
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="E.G. CS-01"
                      className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent text-sm font-black focus:ring-4 ring-indigo-500/10 focus:border-indigo-500/30 transition-all uppercase placeholder:opacity-30 placeholder:italic"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2 italic">Assign Administrative Head (HOD)</label>
                  <select
                    value={formData.hodId}
                    onChange={(e) => setFormData({ ...formData, hodId: e.target.value })}
                    className="w-full px-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent text-sm font-black focus:ring-4 ring-indigo-500/10 focus:border-indigo-500/30 transition-all uppercase italic appearance-none cursor-pointer"
                  >
                    <option value="" className="italic">SELECT HOD CANDIDATE NODE</option>
                    {faculties.map(f => (
                      <option key={f._id} value={f._id} className="font-black italic uppercase">{f.displayName || f.name} — {f.email}</option>
                    ))}
                  </select>
                </div>

                <div className="relative group">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2 italic">Pedagogical Mission Statement</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="BRIEF OVERVIEW OF THE DEPARTMENT'S CORE FOCUS AND RESEARCH GOALS..."
                    rows="4"
                    className="w-full px-8 py-6 rounded-[2.5rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent text-sm font-black focus:ring-4 ring-indigo-500/10 focus:border-indigo-500/30 transition-all resize-none uppercase placeholder:opacity-30 placeholder:italic leading-relaxed"
                  />
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
                    className="flex-[2] bg-indigo-600 text-white py-6 rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-indigo-600/30 hover:bg-slate-900 transition-all transform hover:-translate-y-1 italic"
                  >
                    {modalMode === 'add' ? 'Initialize Structural Unit' : 'Commit Configuration'}
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

export default function Semesters() {
  const { token } = useAuthStore();
  const [semesters, setSemesters] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [filterProg, setFilterProg] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    programId: '',
    academicYearId: '',
    semesterNumber: 1,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const [progRes, yearRes, semRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/programs`, { headers }),
        axios.get(`${API_BASE_URL}/academic-years/active`, { headers }),
        axios.get(`${API_BASE_URL}/semesters/current`, { headers })
      ]);

      setPrograms(progRes.data.data || []);
      setActiveYear(yearRes.data.data);
      setSemesters(semRes.data.data || []);

      if (yearRes.data.data) {
        setFormData(prev => ({ ...prev, academicYearId: yearRes.data.data._id }));
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      await axios.post(`${API_BASE_URL}/semesters`, formData, { headers });

      setIsModalOpen(false);
      fetchInitialData();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const filteredSemesters = filterProg === 'all'
    ? semesters
    : semesters.filter(s => s.programId?._id === filterProg);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-dark-900">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Semesters</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-3 flex items-center gap-2">
            Active Cycles for {activeYear?.year || 'Unknown Year'}
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <select
            value={filterProg}
            onChange={(e) => setFilterProg(e.target.value)}
            className="px-4 md:px-6 py-3 md:py-4 bg-white dark:bg-dark-800 rounded-2xl text-[10px] font-black uppercase tracking-widest border-none shadow-lg shadow-slate-200/50 focus:ring-4 ring-blue-500/10 cursor-pointer shrink-0"
          >
            <option value="all">Filter Program</option>
            {programs.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-lg shadow-blue-500/30 transition-all hover:scale-105 shrink-0"
          >
            + Create Cycle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredSemesters.map((sem, idx) => (
          <motion.div
            key={sem._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-dark-800 p-6 rounded-[2rem] border border-slate-100 dark:border-dark-700 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0">
                {sem.semesterNumber}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Semester</p>
                <p className="text-sm font-black text-slate-800 dark:text-white uppercase truncate">{sem.programId?.name}</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-dark-700">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-400 uppercase tracking-widest">Start</span>
                <span className="text-slate-700 dark:text-slate-300 uppercase">{sem.startDate ? new Date(sem.startDate).toLocaleDateString() : 'TBD'}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-400 uppercase tracking-widest">End</span>
                <span className="text-slate-700 dark:text-slate-300 uppercase">{sem.endDate ? new Date(sem.endDate).toLocaleDateString() : 'TBD'}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredSemesters.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
            <p className="font-black uppercase tracking-widest text-xs px-4 text-center">Zero Cycles Detected</p>
            <p className="text-[10px] mt-2 font-bold px-4 text-center">Initialize your first program semester for the active year.</p>
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
              className="bg-white dark:bg-dark-800 rounded-[3rem] p-6 md:p-12 max-w-xl w-full shadow-2xl border-t-[12px] border-blue-600 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">Initialize Cycle</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Target Program</label>
                  <select
                    required
                    value={formData.programId}
                    onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                    className="w-full px-4 md:px-6 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-blue-500/10"
                  >
                    <option value="">Select Target Degree</option>
                    {programs.map(p => <option key={p._id} value={p._id}>{p.name} ({p.code})</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Sem Number</label>
                    <input
                      required
                      type="number"
                      min="1" max="15"
                      value={formData.semesterNumber}
                      onChange={(e) => setFormData({ ...formData, semesterNumber: e.target.value })}
                      className="w-full px-4 md:px-6 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-blue-500/10"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Active Year</label>
                    <input
                      disabled
                      type="text"
                      value={activeYear?.year || 'NONE'}
                      className="w-full px-4 md:px-6 py-4 rounded-[1.5rem] bg-slate-50 dark:bg-dark-900/50 border-none text-sm font-black text-slate-400 text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Start Boundary</label>
                    <input
                      required
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 md:px-6 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-blue-500/10"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">End Boundary</label>
                    <input
                      required
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 md:px-6 py-4 rounded-[1.5rem] bg-slate-100 dark:bg-dark-900 border-none text-sm font-bold focus:ring-4 ring-blue-500/10"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition"
                  >
                    Commit Cycle
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

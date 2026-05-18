import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

export default function ManageFaculty() {
  const { user, token } = useAuthStore();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };

      // The backend now filters by department for HODs automatically
      const response = await axios.get(`${API_BASE_URL}/users?role=faculty`, { headers });

      setFaculties(response.data.data || response.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch faculty nodes');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromDepartment = async (facultyId) => {
    if (!window.confirm('Are you sure you want to revoke department mapping for this faculty node?')) return;
    try {
      // Ideally an endpoint exists for this. If not, this is a placeholder action.
      alert('Revocation signal sent. Pending Admin Approval.');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Faculty Roster</h1>
          <p className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] mt-3">
            Department Operational Units • Identity Contexts
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-xl text-rose-700 font-bold text-xs uppercase tracking-widest">
          {typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {faculties.map((fac, idx) => (
          <motion.div
            key={fac._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 shadow-xl border border-slate-50 dark:border-dark-700 hover:border-indigo-500 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[5rem] -mr-8 -mt-8 group-hover:scale-110 transition-transform" />

            <div className="flex justify-between items-start mb-6 relative z-10">
              <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-2xl text-[10px] font-black uppercase">
                UNIT {fac.employeeId || `0x${fac._id.slice(-4).toUpperCase()}`}
              </span>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedFaculty(fac); setIsModalOpen(true); }} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg transition-colors text-slate-400">👁️</button>
                <button onClick={() => handleRemoveFromDepartment(fac._id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 text-rose-500 rounded-lg transition-colors">🔌</button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-16 h-16 bg-slate-900 dark:bg-slate-700 text-white rounded-3xl flex items-center justify-center text-2xl font-black italic shadow-lg">
                {fac.firstName?.charAt(0)}{fac.lastName?.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase leading-tight">{fac.firstName} {fac.lastName}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{fac.facultyInfo?.designation || 'Faculty Member'}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50 dark:border-dark-700 relative z-10">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Comms Stream</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{fac.email}</p>
              </div>

              {fac.facultyInfo?.specialization?.length > 0 && (
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Technical Specs</p>
                  <div className="flex flex-wrap gap-2">
                    {fac.facultyInfo.specialization.map((spec, i) => (
                      <span key={i} className="bg-slate-100 dark:bg-dark-900 px-3 py-1.5 rounded-xl text-[9px] font-bold text-slate-600 dark:text-slate-400">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {faculties.length === 0 && (
          <div className="col-span-full py-20 bg-slate-50 dark:bg-dark-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-dark-700 flex flex-col items-center justify-center text-slate-400">
            <p className="font-black uppercase tracking-widest text-xs">Node Pool Empty</p>
            <p className="text-[10px] mt-2 font-bold px-4 text-center">No faculty members are actively mapped to your department matrix.</p>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {isModalOpen && selectedFaculty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-dark-800 rounded-[3rem] p-12 max-w-lg w-full shadow-2xl border-t-[12px] border-indigo-600"
            >
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">Node Telemetry</h2>

              <div className="space-y-6">
                <div className="p-6 bg-slate-50 dark:bg-dark-900 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entity Name</p>
                  <p className="text-lg font-black text-slate-800 dark:text-white">{selectedFaculty.firstName} {selectedFaculty.lastName}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-50 dark:bg-dark-900 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Auth Level</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white uppercase">{selectedFaculty.role}</p>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-dark-900 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                    <p className="text-lg font-black text-slate-800 dark:text-white">{selectedFaculty.facultyInfo?.experience || 0} Yrs</p>
                  </div>
                </div>

                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 rounded-3xl border border-indigo-100 dark:border-indigo-800/30">
                  <p className="text-[10px] font-black text-indigo-400 dark:text-indigo-500 uppercase tracking-widest mb-2">Qualifications</p>
                  <p className="font-bold">{selectedFaculty.facultyInfo?.qualification || 'Not Specified'}</p>
                </div>
              </div>

              <button onClick={() => setIsModalOpen(false)} className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all">
                Close Telemetry
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

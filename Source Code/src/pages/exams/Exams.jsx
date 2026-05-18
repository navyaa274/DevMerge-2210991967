import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import API_BASE_URL from '../../config/api';

export default function Exams() {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/exams/student`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setExams(res.data || []);
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [token]);

  const getStatus = (start, end) => {
    const now = new Date();
    const st = new Date(start);
    const en = new Date(end);
    if (now < st) return 'Upcoming';
    if (now > en) return 'Ended';
    return 'Live';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 dark:bg-dark-900 p-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Assessment Portal</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-3 flex items-center gap-2">
              Internal Development Sandbox
            </p>
          </div>
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20">
            Open Access Mode
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {exams.map((exam, idx) => {
            const status = getStatus(exam.startTime, exam.endTime);
            return (
              <motion.div
                key={exam._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="glass-panel overflow-hidden rounded-[2.5rem] bg-white dark:bg-dark-800 border-l-[16px] border-indigo-600 shadow-2xl group"
              >
                <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">{exam.examType} Segment</span>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${status === 'Live' ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-gray-100 text-gray-500'
                        }`}>{status}</span>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4 group-hover:text-indigo-600 transition-colors">{exam.title}</h3>
                    <p className="text-gray-500 font-bold text-xs uppercase tracking-widest leading-relaxed">{exam.description || 'Secure assessment module.'}</p>

                    <div className="flex gap-10 mt-8">
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Time Dimension</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{exam.duration} Minutes</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Schedule Vector</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{new Date(exam.startTime).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex flex-col items-center">
                    <div className="mb-6 hidden md:block opacity-10 group-hover:opacity-100 transition-opacity">
                      <div className="w-20 h-20 rounded-full border-4 border-dashed border-indigo-600 animate-spin-slow flex items-center justify-center">
                        <span className="text-2xl">🛡️</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/exams/${exam._id}`)}
                      disabled={status === 'Ended'}
                      className={`w-full md:w-auto px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-95 ${status === 'Ended'
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : status === 'Live'
                            ? 'bg-emerald-600 text-white shadow-emerald-600/30 hover:bg-emerald-700 animate-pulse'
                            : 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-700'
                        }`}>
                      {status === 'Ended' ? 'Exam Ended' : status === 'Live' ? '▶ Enter Exam Now' : 'Initiate Synchronization'}
                    </button>
                    {status === 'Live' && (
                      <p className="mt-4 text-[9px] font-black text-emerald-600 uppercase tracking-widest">Entry Key Valid</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {exams.length === 0 && !loading && (
          <div className="text-center py-20 glass-panel rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-dark-700">
            <div className="text-7xl mb-6 opacity-20 filter grayscale">📋</div>
            <p className="text-gray-400 font-black uppercase tracking-[0.3em]">No Assessment Profiles Synchronized</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

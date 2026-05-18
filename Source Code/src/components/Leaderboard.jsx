import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import studentService from '../services/api/studentService';

export default function Leaderboard({ type = 'global', courseId = null }) {
  const { token } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState({ entries: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await studentService.getLeaderboard(type, 10, courseId ? { courseId } : undefined);
        setLeaderboard({ entries: res?.data || [] });
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [type, courseId, token]);

  if (loading) return (
    <div className="glass-panel rounded-2xl p-8 flex justify-center items-center h-64 border border-white/40 dark:border-dark-700">
      <div className="flex gap-2">
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce animation-delay-200"></div>
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce animation-delay-400"></div>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel bg-white/60 dark:bg-dark-800/60 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/40 dark:border-dark-700">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-dark-600">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <span>🏆</span> {type === 'global' ? 'Global Top Coders' : 'Course Leaderboard'}
        </h2>
        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
          Live Rankings
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs">
              <th className="px-6 py-3 bg-gray-50/50 dark:bg-dark-900/50 rounded-l-xl">Rank</th>
              <th className="px-6 py-3 bg-gray-50/50 dark:bg-dark-900/50">Developer</th>
              <th className="px-6 py-3 bg-gray-50/50 dark:bg-dark-900/50">DevMerge Score</th>
              <th className="px-6 py-3 bg-gray-50/50 dark:bg-dark-900/50">Problems Solved</th>
              <th className="px-6 py-3 bg-gray-50/50 dark:bg-dark-900/50 rounded-r-xl">Last Code Commit</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {(leaderboard?.entries || []).map((entry, idx) => (
                <motion.tr
                  key={entry._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-dark-800 shadow-sm hover:shadow-md transition-all group"
                >
                  <td className="px-6 py-4 rounded-l-xl border-y border-l border-gray-100 dark:border-dark-700">
                    <div className={`w-8 h-8 flex items-center justify-center rounded-full font-extrabold text-lg 
                      ${entry.rank === 1 ? 'bg-yellow-100 text-yellow-600 shadow-yellow-200 shadow-inner' :
                        entry.rank === 2 ? 'bg-gray-200 text-gray-600 shadow-gray-300 shadow-inner' :
                          entry.rank === 3 ? 'bg-amber-100 text-amber-700 shadow-amber-200 shadow-inner' :
                            'text-gray-500'}`}
                    >
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 dark:border-dark-700 font-bold text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs shadow-md">
                        {entry.student?.name?.charAt(0)}
                      </div>
                      {entry.student?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 dark:border-dark-700">
                    <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-lg">
                      {entry.score.toLocaleString()} XP
                    </span>
                  </td>
                  <td className="px-6 py-4 border-y border-gray-100 dark:border-dark-700">
                    <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-bold">
                      {entry.problemsSolved}
                    </span>
                  </td>
                  <td className="px-6 py-4 rounded-r-xl border-y border-r border-gray-100 dark:border-dark-700 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {new Date(entry.lastSubmission).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

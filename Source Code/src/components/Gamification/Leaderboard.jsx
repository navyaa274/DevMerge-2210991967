import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import studentService from '../../services/api/studentService';

export default function Leaderboard() {
  const { token } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [token]);

  const fetchLeaderboard = useCallback(async () => {
    if (!token) { setLeaderboard([]); setLoading(false); return; }

    try {
      const response = await studentService.getLeaderboard({ global: true, limit: 10 });
      // Handle the nested response structure: { data: { leaderboard: [...], userRank: 4, totalParticipants: 156 } }
      setLeaderboard(response?.data?.leaderboard || response?.data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const displayData = useMemo(() => (leaderboard || []).slice(0, 5), [leaderboard]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500 text-sm">Loading...</div>;
  }

  if (!displayData.length) {
    return <div className="text-center py-8 text-gray-400 text-xs font-black uppercase tracking-widest">No leaderboard data</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
        <RocketLaunchIcon className="w-6 h-6 text-indigo-600" />
        Global Leaderboard
      </h3>
      <div className="space-y-3">
        {(displayData || []).map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-100 dark:border-dark-700 hover:border-indigo-300 transition-colors">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {entry.rank || idx + 1}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{entry.user?.name || entry.student?.name || 'User'}</p>
                <p className="text-xs text-slate-400">{entry.stats?.problemsSolved || entry.problemsSolved || 0} problems</p>
              </div>
            </div>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0 ml-2">{entry.stats?.xp || entry.score || 0} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { BoltIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import studentService from '../../services/api/studentService';

export default function Points({ userId }) {
  const { token } = useAuthStore();
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPoints();
  }, [userId, token]);

  const fetchPoints = useCallback(async () => {
    if (!token) { setPoints(null); setLoading(false); return; }

    try {
      const response = await studentService.getUserPoints(userId);
      if (response?.data) {
        setPoints(response.data);
      }
    } catch (error) {
      console.error('Error fetching points:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  const pointsData = useMemo(() => points || { totalPoints: 0, experiencePoints: 0, level: 1, pointsBreakdown: {} }, [points]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500 text-sm">Loading...</div>;
  }

  if (!points) {
    return <div className="text-center py-8 text-gray-400 text-xs font-black uppercase tracking-widest">No points data</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
        <BoltIcon className="w-6 h-6 text-indigo-600" />
        Progression Level
      </h3>
      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-dark-700 dark:to-dark-600 rounded-xl border border-indigo-100 dark:border-dark-500 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-300 uppercase font-bold tracking-wider mb-1">Current XP</p>
            <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{pointsData.experiencePoints || 0}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-600 dark:text-slate-300 uppercase font-bold tracking-wider mb-1">Tier</p>
            <p className="text-lg font-black text-indigo-500">{pointsData.tier || 'Bronze'}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 bg-slate-50 dark:bg-dark-900 rounded-lg border border-slate-100 dark:border-dark-700">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Level</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{pointsData.level || 1}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-dark-900 rounded-lg border border-slate-100 dark:border-dark-700">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Tests</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{pointsData.pointsBreakdown?.contestsWon || 0}</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-dark-900 rounded-lg border border-slate-100 dark:border-dark-700">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Labs</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{pointsData.pointsBreakdown?.problemsSolved || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

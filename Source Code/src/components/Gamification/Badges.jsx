import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import studentService from '../../services/api/studentService';

export default function Badges({ userId }) {
  const { token } = useAuthStore();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, [userId, token]);

  const fetchBadges = useCallback(async () => {
    if (!token) { setBadges([]); setLoading(false); return; }

    try {
      const data = await studentService.getAchievements(userId);
      if (Array.isArray(data)) {
        setBadges(data);
      } else if (data?.data) {
        setBadges(data.data);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  const displayBadges = useMemo(() => badges.slice(0, 6), [badges]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500 text-sm">Loading...</div>;
  }

  if (!displayBadges.length) {
    return <div className="text-center py-8 text-gray-400 text-xs font-black uppercase tracking-widest">No badges yet</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
        <AcademicCapIcon className="w-6 h-6 text-indigo-600" />
        Badges Earned
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {displayBadges.map((badge, idx) => (
          <div key={idx} className="flex flex-col items-center p-4 bg-slate-50 dark:bg-dark-900 rounded-xl border border-slate-100 dark:border-dark-700 hover:border-indigo-300 transition-colors">
            <div className="text-3xl mb-2">{badge.icon || '🏅'}</div>
            <p className="text-xs font-bold text-slate-900 dark:text-white text-center line-clamp-2">{badge.name || 'Badge'}</p>
            <p className="text-[10px] text-slate-400 text-center mt-1 line-clamp-1">{badge.description || ''}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

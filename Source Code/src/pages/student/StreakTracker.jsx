import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

export default function StreakTracker() {
  const { user, token } = useAuthStore();
  const [streak, setStreak] = useState(null);
  const [topStreaks, setTopStreaks] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [streakRes, topStreaksRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/streaks/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: null })),

        axios.get(`${API_BASE_URL}/streaks/leaderboard/top`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),

        axios.get(`${API_BASE_URL}/streaks/${user.id}/history`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      setStreak(streakRes.data);
      setTopStreaks(topStreaksRes.data);
      setActivityHistory(historyRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/streaks/${user.id}/update`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStreak(response.data);
      fetchData(); // Refresh all data
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isActiveDay = (date) => {
    return activityHistory.some(activity => {
      const activityDate = new Date(activity.date);
      return activityDate.toDateString() === date.toDateString();
    });
  };

  const getStreakLevel = (days) => {
    if (days >= 100) return { level: 'Legendary', color: 'purple', icon: '👑' };
    if (days >= 50) return { level: 'Master', color: 'yellow', icon: '⭐' };
    if (days >= 30) return { level: 'Expert', color: 'blue', icon: '💎' };
    if (days >= 14) return { level: 'Advanced', color: 'green', icon: '🔥' };
    if (days >= 7) return { level: 'Intermediate', color: 'orange', icon: '🌟' };
    return { level: 'Beginner', color: 'gray', icon: '🌱' };
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(selectedMonth);
    const days = [];
    const today = new Date();

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isActive = isActiveDay(date);
      const isToday = date.toDateString() === today.toDateString();
      const isFuture = date > today;

      days.push(
        <div
          key={day}
          className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${isFuture
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isActive
                ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            } ${isToday ? 'ring-2 ring-indigo-600' : ''}`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading streak data...</p>
        </div>
      </div>
    );
  }

  const streakLevel = getStreakLevel(streak?.currentStreak || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Streak Tracker</h1>
          <p className="text-gray-600">Keep your learning streak alive by solving problems daily</p>
        </div>

        {/* Main Stats */}
        {streak && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-orange-100 text-sm mb-1">Current Streak</p>
                  <p className="text-4xl font-bold">{streak.currentStreak}</p>
                  <p className="text-orange-100 text-sm">days</p>
                </div>
                <div className="text-6xl">🔥</div>
              </div>
              <div className="mt-4 pt-4 border-t border-orange-400">
                <p className="text-xs text-orange-100">
                  Level: <span className="font-bold">{streakLevel.level}</span> {streakLevel.icon}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-yellow-100 text-sm mb-1">Longest Streak</p>
                  <p className="text-4xl font-bold">{streak.longestStreak}</p>
                  <p className="text-yellow-100 text-sm">days</p>
                </div>
                <div className="text-6xl">⭐</div>
              </div>
              <div className="mt-4 pt-4 border-t border-yellow-400">
                <p className="text-xs text-yellow-100">Personal best record</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Total Active Days</p>
                  <p className="text-4xl font-bold">{streak.totalDaysActive || 0}</p>
                  <p className="text-blue-100 text-sm">days</p>
                </div>
                <div className="text-6xl">📅</div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-400">
                <p className="text-xs text-blue-100">Lifetime activity</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
              <div className="text-center mb-4">
                <p className="text-gray-600 text-sm mb-2">Last Activity</p>
                <p className="text-lg font-bold text-gray-900">
                  {streak.lastActivityDate
                    ? new Date(streak.lastActivityDate).toLocaleDateString()
                    : 'No activity yet'}
                </p>
              </div>
              {streak?.lastActivityDate && new Date(streak.lastActivityDate).toDateString() === new Date().toDateString() ? (
                <div className="w-full px-4 py-3 bg-indigo-100 text-indigo-700 rounded-lg font-bold text-center border-2 border-indigo-200">
                  Today's Activity Recorded ✅
                </div>
              ) : (
                <button
                  onClick={updateStreak}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-md hover:shadow-lg"
                >
                  Mark Today Active
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Activity Calendar</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1)))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="font-medium text-gray-900 min-w-[120px] text-center">
                    {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1)))}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="mb-4">
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-600">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {renderCalendar()}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded"></div>
                  <span className="text-sm text-gray-600">Active Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-50 rounded border border-gray-200"></div>
                  <span className="text-sm text-gray-600">Inactive Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-50 rounded ring-2 ring-indigo-600"></div>
                  <span className="text-sm text-gray-600">Today</span>
                </div>
              </div>
            </div>

            {/* Streak Milestones */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-8">
              <h2 className="text-xl font-bold mb-4">Streak Milestones</h2>
              <div className="space-y-3">
                {[
                  { days: 7, label: 'Week Warrior', icon: '🌟', color: 'orange' },
                  { days: 14, label: 'Two Week Champion', icon: '🔥', color: 'green' },
                  { days: 30, label: 'Monthly Master', icon: '💎', color: 'blue' },
                  { days: 50, label: 'Streak Superstar', icon: '⭐', color: 'yellow' },
                  { days: 100, label: 'Century Legend', icon: '👑', color: 'purple' }
                ].map((milestone) => {
                  const achieved = (streak?.longestStreak || 0) >= milestone.days;
                  return (
                    <div
                      key={milestone.days}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 ${achieved
                          ? `border-${milestone.color}-500 bg-${milestone.color}-50`
                          : 'border-gray-200 bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`text-3xl ${!achieved && 'grayscale opacity-50'}`}>
                          {milestone.icon}
                        </div>
                        <div>
                          <p className={`font-medium ${achieved ? 'text-gray-900' : 'text-gray-500'}`}>
                            {milestone.label}
                          </p>
                          <p className="text-sm text-gray-600">{milestone.days} day streak</p>
                        </div>
                      </div>
                      {achieved ? (
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Top Streaks</h2>
              <div className="space-y-3">
                {topStreaks.slice(0, 10).map((s, idx) => (
                  <div
                    key={s._id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition ${s.userId?._id === user.id
                        ? 'bg-indigo-50 border-2 border-indigo-500'
                        : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${idx === 0 ? 'bg-yellow-400 text-white' :
                        idx === 1 ? 'bg-gray-300 text-white' :
                          idx === 2 ? 'bg-orange-400 text-white' :
                            'bg-gray-200 text-gray-600'
                      }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {s.userId?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {s.userId?.email || ''}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-lg font-bold text-orange-600">{s.currentStreak}</p>
                      <p className="text-xs text-gray-500">days</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

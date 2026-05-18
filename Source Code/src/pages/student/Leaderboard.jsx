import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

function StudentLeaderboard() {
  const { user, token } = useAuthStore();
  const userName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Student';
  const userId = user?.id || user?._id;

  const [leaderboard, setLeaderboard] = useState([]);
  const [streakLeaders, setStreakLeaders] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('all-time');

  useEffect(() => {
    fetchData();
  }, [timeRange, userId]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (timeRange !== 'all-time') params.append('timeRange', timeRange);

      const headers = { Authorization: `Bearer ${token}` };
      const requests = [
        fetch(`${API_BASE_URL}/leaderboard/global?${params}`, { headers }),
        fetch(`${API_BASE_URL}/streaks/leaderboard/top`, { headers })
      ];

      if (userId) {
        requests.push(fetch(`${API_BASE_URL}/leaderboard/rank/${userId}`, { headers }));
      }

      const results = await Promise.allSettled(requests);

      // Handle Global Leaderboard
      if (results[0].status === 'fulfilled' && results[0].value.ok) {
        const data = await results[0].value.json();
        setLeaderboard(data.data || []);
      } else {
        setError('Failed to load leaderboard data.');
      }

      // Handle Streak Leaders
      if (results[1].status === 'fulfilled' && results[1].value.ok) {
        const streakData = await results[1].value.json();
        setStreakLeaders(streakData.slice(0, 5) || []);
      }

      // Handle User Rank
      if (userId && results[2] && results[2].status === 'fulfilled' && results[2].value.ok) {
        const rankData = await results[2].value.json();
        setMyRank(rankData);
      }
    } catch (err) {
      setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return 'text-amber-500';
    if (rank === 2) return 'text-slate-400';
    if (rank === 3) return 'text-amber-700';
    return 'text-gray-400';
  };

  const podiumOrder = [1, 0, 2]; // Silver, Gold, Bronze columns
  const topThree = podiumOrder.map(i => leaderboard[i]).filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 dark:bg-dark-900 p-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none italic">Hall of Fame</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Rankings Synchronized
            </p>
          </div>

          <div className="flex items-center gap-3 p-2 bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700">
            {['all-time', 'this-month', 'today'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {range === 'all-time' ? 'All Time' : range === 'this-month' ? 'This Month' : 'Today'}
              </button>
            ))}
          </div>
        </div>

        {/* My Rank Banner */}
        {myRank && (
          <div className="mb-10 p-6 bg-indigo-600 rounded-[2rem] text-white flex flex-col sm:flex-row justify-between items-center gap-4 shadow-2xl shadow-indigo-600/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center font-black text-lg uppercase">
                {userName.charAt(0)}
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-70">Your Standing</p>
                <p className="font-black text-xl uppercase tracking-tighter">{userName}</p>
              </div>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">Global Rank</p>
                <p className="text-3xl font-black">#{myRank.rank}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">Problems Solved</p>
                <p className="text-3xl font-black">{myRank.problemsSolved}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mb-1">Score</p>
                <p className="text-3xl font-black">{myRank.score}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl font-bold text-sm">{typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}</div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Synchronizing Rankings...</p>
          </div>
        ) : (
          <>
            {/* Podium Top 3 */}
            {leaderboard.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end">
                {topThree.map((pod, i) => {
                  const rank = podiumOrder[i] + 1;
                  const isCurrentUser = pod.student?._id === userId;
                  return (
                    <motion.div
                      key={pod.student?._id || i}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className={`glass-panel p-8 rounded-[3rem] bg-white dark:bg-dark-800 border-2 flex flex-col items-center shadow-2xl relative ${rank === 1 ? 'border-amber-400 h-[380px] z-10' :
                        rank === 2 ? 'border-slate-300 h-[330px]' : 'border-amber-700/30 h-[310px]'
                        } ${isCurrentUser ? 'ring-4 ring-indigo-500 ring-offset-2' : ''}`}
                    >
                      {isCurrentUser && (
                        <span className="absolute -top-3 bg-indigo-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest">You</span>
                      )}
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-5 shadow-xl ${rank === 1 ? 'bg-amber-100 ring-8 ring-amber-400/20' :
                        rank === 2 ? 'bg-slate-100 ring-8 ring-slate-200/50' :
                          'bg-amber-50 ring-8 ring-amber-700/10'
                        }`}>
                        {getMedalIcon(rank)}
                      </div>
                      <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter text-center leading-tight">{pod.student?.name || 'Unknown'}</h3>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-2">{pod.score} XP</p>

                      <div className="mt-auto grid grid-cols-2 gap-4 w-full text-center pt-6 border-t border-gray-100 dark:border-dark-700">
                        <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Solved</p>
                          <p className="text-sm font-black text-gray-900 dark:text-white">{pod.problemsSolved}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Rank</p>
                          <p className={`text-sm font-black ${getRankStyle(rank)}`}>#{rank}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Streak Warriors section */}
            {streakLeaders.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Streak Warriors</h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-dark-700"></div>
                </div>
                <div className="flex flex-wrap gap-4">
                  {streakLeaders.map((s, idx) => (
                    <motion.div
                      key={s._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white dark:bg-dark-800 p-4 rounded-3xl border border-gray-100 dark:border-dark-700 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${idx === 0 ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 dark:bg-dark-700 text-gray-400'}`}>
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter">{s.userId?.name || 'Unknown'}</p>
                        <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1">
                          <span className="animate-pulse">🔥</span> {s.currentStreak} Day Streak
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Full Rankings Table */}
            <div className="glass-panel overflow-hidden rounded-[2.5rem] bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-2xl">
              <table className="w-full">
                <thead className="bg-gray-50/50 dark:bg-dark-900/50 border-b border-gray-100 dark:border-dark-700">
                  <tr>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Rank</th>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Contributor</th>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Problems Solved</th>
                    <th className="px-10 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-700/50">
                  {leaderboard.length > 0 ? leaderboard.map((entry, index) => {
                    const rank = index + 1;
                    const isCurrentUser = entry.student?._id === userId;
                    return (
                      <motion.tr
                        key={entry.student?._id || index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(index * 0.03, 0.5) }}
                        className={`group transition-colors ${isCurrentUser ? 'bg-indigo-50/80 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-dark-900/40'}`}
                      >
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-2">
                            {getMedalIcon(rank) ? (
                              <span className="text-xl">{getMedalIcon(rank)}</span>
                            ) : (
                              <span className={`text-lg font-black italic tracking-tighter ${getRankStyle(rank)}`}>
                                {rank < 10 ? `0${rank}` : rank}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-inner ${isCurrentUser ? 'bg-indigo-600 text-white' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'}`}>
                              {(entry.student?.name || 'U').charAt(0)}
                            </div>
                            <div>
                              <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">
                                {entry.student?.name || 'Unknown'}
                              </span>
                              {isCurrentUser && <span className="ml-2 text-[8px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">You</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <span className="text-sm font-black text-gray-700 dark:text-gray-300">{entry.problemsSolved}</span>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <div className="h-1.5 w-24 bg-gray-100 dark:bg-dark-900 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (entry.score / (leaderboard[0]?.score || 1)) * 100)}%` }}></div>
                            </div>
                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{entry.score} XP</span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="4" className="py-20 text-center">
                        <div className="text-5xl mb-4 opacity-20">🏆</div>
                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No rankings yet</p>
                        <p className="text-gray-300 text-xs mt-2">Solve problems to appear on the leaderboard!</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default StudentLeaderboard;

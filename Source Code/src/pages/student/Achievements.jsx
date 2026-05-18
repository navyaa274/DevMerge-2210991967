import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../../config/api';

export default function Achievements() {
  const { user, token } = useAuthStore();
  const [achievements, setAchievements] = useState([]);
  const [allAchievements, setAllAchievements] = useState([]);
  const [userPoints, setUserPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked

  const fetchData = async () => {
    if (!token || !user?.id) return;
    try {
      const [achievementsRes, allAchievementsRes, pointsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/achievements/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),

        axios.get(`${API_BASE_URL}/achievements`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),

        axios.get(`${API_BASE_URL}/points/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: null }))
      ]);

      setAchievements(achievementsRes.data);
      setAllAchievements(allAchievementsRes.data);
      setUserPoints(pointsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds for "live" feel
    return () => clearInterval(interval);
  }, [token, user?.id]);

  const getFilteredAchievements = () => {
    const unlockedIds = new Set(achievements.map(a => a.type));

    if (filter === 'unlocked') {
      return achievements;
    } else if (filter === 'locked') {
      return allAchievements.filter(a => !unlockedIds.has(a.type)).map(a => ({ ...a, locked: true }));
    }

    // Merge unlocked and locked achievements
    const merged = [...achievements];
    allAchievements.forEach(a => {
      if (!unlockedIds.has(a.type)) {
        merged.push({ ...a, locked: true });
      }
    });
    return merged;
  };

  const getLevelProgress = () => {
    if (!userPoints) return 0;
    const currentLevelXP = (userPoints.level - 1) * 1000;
    const nextLevelXP = userPoints.level * 1000;
    const progress = ((userPoints.experiencePoints - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Synchronizing Progress...</p>
        </div>
      </div>
    );
  }

  const filteredAchievements = getFilteredAchievements();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 dark:bg-dark-900 p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none mb-3">Honors & Merit</h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Synchronization Active
            </p>
          </div>
          <div className="flex bg-white dark:bg-dark-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700">
            {['all', 'unlocked', 'locked'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Level & Points Overview */}
        {userPoints && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <motion.div whileHover={{ y: -5 }} className="glass-panel p-8 rounded-[2rem] shadow-xl bg-white dark:bg-dark-800 border-b-8 border-indigo-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 text-5xl opacity-5 group-hover:scale-125 transition-transform">💎</div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Neural Credits</p>
              <p className="text-4xl font-black text-indigo-700 dark:text-indigo-400 tracking-tighter leading-none">{userPoints.totalPoints}</p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="glass-panel p-8 rounded-[2rem] shadow-xl bg-white dark:bg-dark-800 border-b-8 border-purple-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 text-5xl opacity-5 group-hover:scale-125 transition-transform">⚡</div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Synapse Level</p>
              <p className="text-4xl font-black text-purple-700 dark:text-purple-400 tracking-tighter leading-none">{userPoints.level}</p>
              <div className="mt-4 bg-gray-100 dark:bg-dark-900 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getLevelProgress()}%` }}
                  className="bg-purple-500 h-full"
                ></motion.div>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="glass-panel p-8 rounded-[2rem] shadow-xl bg-white dark:bg-dark-800 border-b-8 border-emerald-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 text-5xl opacity-5 group-hover:scale-125 transition-transform">🏆</div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Milestones Unlocked</p>
              <p className="text-4xl font-black text-emerald-700 dark:text-emerald-400 tracking-tighter leading-none">{achievements.length}</p>
              <p className="text-[8px] font-black text-gray-400 uppercase mt-2 tracking-widest">Of {allAchievements.length} Protocol Items</p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="glass-panel p-8 rounded-[2rem] shadow-xl bg-white dark:bg-dark-800 border-b-8 border-amber-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 text-5xl opacity-5 group-hover:scale-125 transition-transform">🛰️</div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Global Network Rank</p>
              <p className="text-4xl font-black text-amber-700 dark:text-amber-400 tracking-tighter leading-none">#{userPoints.rank || '??'}</p>
            </motion.div>
          </div>
        )}

        {/* Experience Breakdown */}
        {userPoints?.pointsBreakdown && (
          <div className="glass-panel rounded-[2.5rem] shadow-xl p-10 bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 mb-12">
            <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em] mb-8">Skill Vector Distribution</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
              {[
                { label: 'Problem Sets', value: userPoints.pointsBreakdown.problemsSolved, icon: '💻', color: 'blue' },
                { label: 'Contest Victories', value: userPoints.pointsBreakdown.contestsWon, icon: '🏆', color: 'purple' },
                { label: 'Peer Reviews', value: userPoints.pointsBreakdown.helpfulReviews, icon: '🛡️', color: 'emerald' },
                { label: 'Mentorship', value: userPoints.pointsBreakdown.mentorshipPoints, icon: '🎓', color: 'amber' },
                { label: 'Honors', value: userPoints.pointsBreakdown.achievementPoints, icon: '🎖️', color: 'rose' }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center p-6 bg-gray-50/50 dark:bg-dark-900/50 rounded-3xl border border-transparent hover:border-indigo-500/20 transition-all group">
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">{stat.label}</p>
                  <p className={`text-xl font-black text-${stat.color}-600 dark:text-${stat.color}-400`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <AnimatePresence>
            {filteredAchievements.map((achievement, idx) => (
              <motion.div
                key={achievement.type}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className={`group relative p-10 rounded-[3rem] border-2 transition-all duration-500 overflow-hidden shadow-2xl ${achievement.locked
                    ? 'bg-white/50 dark:bg-dark-800/50 border-gray-100 dark:border-dark-700 grayscale opacity-40'
                    : 'bg-white dark:bg-dark-800 border-indigo-500/30 dark:border-indigo-500/20 hover:border-indigo-500 shadow-indigo-500/5'
                  }`}
              >
                {!achievement.locked && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                )}

                <div className="flex justify-between items-start mb-8">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-500 block">{achievement.icon}</span>
                  {!achievement.locked && (
                    <span className="bg-indigo-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-600/30">
                      +{achievement.points} CR
                    </span>
                  )}
                  {achievement.locked && <span className="text-2xl opacity-40">🔒</span>}
                </div>

                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight mb-3">
                  {achievement.title}
                </h3>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                  {achievement.description}
                </p>

                {achievement.locked ? (
                  <div className="p-4 bg-gray-50 dark:bg-dark-900 rounded-2xl border border-gray-100 dark:border-dark-700">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Authorization Link: LOCKED</p>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-gray-500 tracking-tight">{achievement.requirement}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    Synchronized {new Date(achievement.unlockedAt || Date.now()).toLocaleDateString()}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

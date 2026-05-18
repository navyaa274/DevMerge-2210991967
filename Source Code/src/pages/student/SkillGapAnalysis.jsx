import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function SkillGapAnalysis() {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [suggestedLabs, setSuggestedLabs] = useState([]);
  const [stats, setStats] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSkillGapAnalysis();
    fetchSuggestedLabs();
    fetchStudentStats();
  }, []);

  const fetchStudentStats = async () => {
    try {
      if (!user?.id) return;
      const response = await axios.get(
        `${API_BASE_URL}/analytics/student/${user.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchSkillGapAnalysis = async () => {
    // ... (rest of the fetching logic)
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/analytics/skill-gap`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setAnalysis(response.data.data || null);
    } catch (err) {
      setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Unknown error occurred');
      setAnalysis(null);
    } finally {
      if (suggestedLabs.length > 0) setLoading(false);
    }
  };

  const fetchSuggestedLabs = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/labs/suggested`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setSuggestedLabs(response.data.data || []);
    } catch (err) {
      console.error('Error fetching labs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchLab = (slug) => {
    if (slug) {
      navigate(`/problems/${slug}`);
    } else {
      navigate('/problems');
    }
  };

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    // Mimic deep scanning process
    await new Promise(resolve => setTimeout(resolve, 2000));
    await Promise.all([
      fetchSkillGapAnalysis(),
      fetchSuggestedLabs(),
      fetchStudentStats()
    ]);
    setAnalyzing(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-black text-indigo-900 dark:text-indigo-400 uppercase tracking-widest text-xs">Scanning Skills...</p>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 dark:bg-dark-900 p-8"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Skill Gap Analysis</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-1">AI-Powered Deficiency Mapping</p>
          </div>
          <button
            onClick={runAIAnalysis}
            disabled={analyzing}
            className="w-full md:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>
                <span>🧠</span> Run Deep AI Scan
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 text-rose-700 dark:text-rose-400 font-bold text-sm">
            Please check your internet connection or try again later.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Overall Proficiency', value: `${analysis?.overallScore}%`, color: 'text-indigo-600', icon: '🎯' },
                { label: 'Strongest Topic', value: analysis?.strongestTopic, color: 'text-emerald-600', icon: '⚡' },
                { label: 'Weakest Topic', value: analysis?.weakestTopic, color: 'text-rose-600', icon: '⚠️' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-panel p-6 rounded-2xl shadow-md border border-white/20 dark:border-dark-700 bg-white dark:bg-dark-800"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{stat.icon}</span>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                  </div>
                  <p className={`text-2xl font-black tracking-tighter uppercase ${stat.color}`}>{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Proficiency Breakdown */}
            <div className="glass-panel p-8 rounded-3xl shadow-lg border border-white/20 dark:border-dark-700 bg-white/60 dark:bg-dark-800/60 backdrop-blur-md">
              <h2 className="text-xl font-black mb-10 flex items-center gap-2 dark:text-white uppercase tracking-tighter">
                <span>📊</span> Cumulative Knowledge Map
              </h2>
              <div className="space-y-10">
                {analysis?.topicProficiency?.map((topic, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{topic.name}</span>
                      <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{topic.score}%</span>
                    </div>
                    <div className="h-4 w-full bg-gray-100 dark:bg-dark-900 rounded-full overflow-hidden border border-gray-200 dark:border-dark-700 p-1">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.score}%` }}
                        transition={{ duration: 1.5, delay: idx * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r shadow-lg ${topic.score < 30 ? 'from-rose-500 to-pink-600' :
                          topic.score < 60 ? 'from-indigo-500 to-purple-600' :
                            'from-emerald-500 to-teal-600'
                          }`}
                      >
                        <div className="w-full h-full opacity-10 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px]"></div>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="glass-panel p-8 rounded-3xl shadow-xl border-l-[12px] border-indigo-600 bg-white dark:bg-dark-800">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                <span className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">🧠</span>
                Personalized Learning Directives
              </h3>
              <div className="space-y-6">
                {analysis?.recommendations?.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 hover:border-indigo-300 transition-colors group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest text-xs mb-1">{rec.title}</p>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{rec.description}</p>
                      </div>
                      <button
                        onClick={() => handleLaunchLab(rec.problemSlug)}
                        className="text-indigo-600 hover:text-indigo-800 font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform"
                      >
                        Launch Lab →
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            <div className="glass-panel p-8 rounded-3xl shadow-lg border border-indigo-600 bg-indigo-600 text-white relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 text-[12rem] opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">📉</div>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-6 relative z-10">Global Percentile</h3>
              <div className="flex items-end gap-3 mb-4 relative z-10">
                <span className="text-7xl font-black tracking-tighter">{stats?.percentile || 0}%</span>
                <span className="text-sm font-bold uppercase mb-4 opacity-80 decoration-indigo-400 underline decoration-4 underline-offset-4">
                  {stats?.percentile > 90 ? 'Elite' : stats?.percentile > 70 ? 'Top Tier' : 'Rising'}
                </span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 leading-loose relative z-10">
                You are currently performing better than {stats?.percentile || 0}% of students registered on the platform globally.
              </p>
            </div>

            <div className="glass-panel p-8 rounded-3xl shadow-lg border border-white/20 dark:border-dark-700 bg-white/60 dark:bg-dark-800/60 backdrop-blur-md">
              <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center justify-between">
                <span>Suggested Practice</span>
                <span className="text-xl">📅</span>
              </h3>
              <div className="space-y-4">
                {suggestedLabs.length > 0 ? (
                  suggestedLabs.map((lab, idx) => (
                    <div key={idx} className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-dark-700 hover:shadow-md transition-all">
                      <div>
                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tighter">{lab.title}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          {lab.difficulty} Lab • {lab.topics[0] || 'Logic'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleLaunchLab(lab.slug)}
                        className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center font-black hover:bg-indigo-600 hover:text-white transition-colors"
                      >
                        →
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 opacity-40">
                    <p className="text-[10px] font-black uppercase tracking-widest">No local labs match gap</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/student/labs')}
                className="w-full mt-8 py-4 border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2"
              >
                <span>🧪</span> Explore All Dedicated Labs
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

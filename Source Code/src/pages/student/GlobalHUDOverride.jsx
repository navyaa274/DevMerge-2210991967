import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { SparklesIcon, BellIcon, FireIcon, MapIcon, TrophyIcon, BoltIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import labService from '../../services/api/labService';
import studentService from '../../services/api/studentService';
import recommendationService from '../../services/api/recommendationService';
import apiClient from '../../services/api/apiClient';
import { Link } from 'react-router-dom';

export default function GlobalHUDOverride() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [suggestedLabs, setSuggestedLabs] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [points, setPoints] = useState({ xp: 0, level: 0, tier: 'Bronze' });
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState(null);

  const initials = useMemo(() => {
    const n = user?.name || user?.firstName || '';
    return n ? n[0].toUpperCase() : 'U';
  }, [user]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const tasks = [];
        if (user?.id) {
          tasks.push(apiClient.get(`/notifications/${user.id}`));
          tasks.push(studentService.getSubmissions());
          tasks.push(studentService.getUserPoints(user.id));
        } else {
          tasks.push(Promise.resolve({ data: [] }));
          tasks.push(Promise.resolve({ success: true, data: [] }));
          tasks.push(Promise.resolve({ success: true, xp: 0, level: 0, tier: 'Bronze' }));
        }
        tasks.push(labService.getSuggestedLabs());
        tasks.push(recommendationService.getProblems(6));
        const res = await Promise.allSettled(tasks);
        if (!mounted) return;
        const notifRes = res[0]?.status === 'fulfilled' ? res[0].value : { data: [] };
        const subsRes = res[1]?.status === 'fulfilled' ? res[1].value : { data: [] };
        const ptsRes = res[2]?.status === 'fulfilled' ? res[2].value : null;
        const labsRes = res[3]?.status === 'fulfilled' ? res[3].value : { data: [] };
        const probsRes = res[4]?.status === 'fulfilled' ? res[4].value : { data: [] };
        setNotifications(Array.isArray(notifRes?.data) ? notifRes.data : notifRes?.data?.data || []);
        setSubmissions(Array.isArray(subsRes?.data) ? subsRes.data : subsRes?.data?.submissions || []);
        if (ptsRes?.success) setPoints({ xp: ptsRes.xp || 0, level: ptsRes.level || 0, tier: ptsRes.tier || 'Bronze' });
        setSuggestedLabs(labsRes?.data || labsRes?.data?.data || []);
        setProblems(probsRes?.data || []);
      } catch (e) {
        setError('Failed to load HUD data');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-950 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-24 bg-white/60 dark:bg-dark-900/60 rounded-[3rem]"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-44 bg-white/60 dark:bg-dark-900/60 rounded-3xl"></div>
              <div className="h-44 bg-white/60 dark:bg-dark-900/60 rounded-3xl"></div>
              <div className="h-44 bg-white/60 dark:bg-dark-900/60 rounded-3xl"></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-96 bg-white/60 dark:bg-dark-900/60 rounded-3xl"></div>
              <div className="h-96 bg-white/60 dark:bg-dark-900/60 rounded-3xl"></div>
              <div className="h-96 bg-white/60 dark:bg-dark-900/60 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-8 md:p-12 border border-gray-100 dark:border-dark-800 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.1)] dark:shadow-none">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-2xl font-black">
                {initials}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">Global HUD</h1>
                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-gray-400">Unified student status and quick actions</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/student/ai-tutor" className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <BoltIcon className="w-4 h-4" />
                AI Tutor
              </Link>
              <Link to="/student/labs" className="px-5 py-3 bg-gray-900 hover:bg-black text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <FireIcon className="w-4 h-4" />
                Labs
              </Link>
            </div>
          </div>
          {error && <div className="mt-6 text-rose-600 text-xs font-black uppercase tracking-widest">{typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}</div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-6 bg-gray-50 dark:bg-dark-800 rounded-3xl border border-gray-100 dark:border-dark-700">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">Experience Points</p>
              <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{points.xp}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Level {points.level}</span>
                <span className="px-2 py-1 text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-md">{points.tier}</span>
              </div>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-dark-800 rounded-3xl border border-gray-100 dark:border-dark-700">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">Recent Notifications</p>
              <div className="mt-3 space-y-3">
                {(notifications || []).slice(0, 3).map((n) => (
                  <div key={n._id || n.id} className="flex items-start gap-3">
                    <BellIcon className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{n.title || 'Notification'}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">{n.message}</p>
                    </div>
                  </div>
                ))}
                {(!notifications || notifications.length === 0) && (
                  <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">No notifications</div>
                )}
              </div>
              <Link to="/student/notifications" className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                View All
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-dark-800 rounded-3xl border border-gray-100 dark:border-dark-700">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400">Quick Recommendations</p>
              <div className="mt-3 space-y-3">
                {(problems || []).slice(0, 3).map((p) => (
                  <div key={p._id || p.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="w-5 h-5 text-amber-500" />
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{p.title || 'Problem'}</p>
                    </div>
                    <Link to={`/problems/${p._id || p.id}`} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Solve</Link>
                  </div>
                ))}
                {(!problems || problems.length === 0) && (
                  <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">No recommendations</div>
                )}
              </div>
              <Link to="/student/recommendations" className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                Explore
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-8 border border-gray-100 dark:border-dark-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapIcon className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Suggested Labs</h2>
                </div>
                <Link to="/student/labs" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">View All</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(suggestedLabs || []).slice(0, 4).map((lab, idx) => (
                  <motion.div key={(lab._id || lab.slug || idx) + '_lab'} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="p-6 rounded-2xl border border-gray-100 dark:border-dark-700 bg-gray-50 dark:bg-dark-800">
                    <p className="text-xs font-black text-gray-900 dark:text-gray-200">{lab.title || 'Lab'}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{lab.difficulty || 'Medium'}</span>
                      <Link to={`/student/labs/${lab.slug || lab._id || ''}`} className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Open</Link>
                    </div>
                  </motion.div>
                ))}
                {(!suggestedLabs || suggestedLabs.length === 0) && (
                  <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">No labs suggested</div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-8 border border-gray-100 dark:border-dark-800">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <TrophyIcon className="w-6 h-6 text-amber-500" />
                  <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Recent Submissions</h2>
                </div>
                <Link to="/student/submissions" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">View All</Link>
              </div>
              <div className="space-y-3">
                {(submissions || []).slice(0, 6).map((s) => (
                  <div key={s._id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-dark-700">
                    <div>
                      <p className="text-xs font-black text-gray-900 dark:text-gray-200">{s.problem?.title || s.problemTitle || 'Problem'}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{s.language || 'Unknown'} • {new Date(s.submittedAt).toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${s.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-dark-800 dark:text-slate-400'}`}>
                      {s.status}
                    </span>
                  </div>
                ))}
                {(!submissions || submissions.length === 0) && (
                  <div className="text-[11px] font-black uppercase tracking-widest text-gray-400">No submissions yet</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-8 border border-gray-100 dark:border-dark-800">
              <div className="flex items-center gap-3 mb-4">
                <BellIcon className="w-6 h-6 text-indigo-600" />
                <h3 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">Activity Center</h3>
              </div>
              <ul className="space-y-3">
                {(notifications || []).slice(0, 6).map((n) => (
                  <li key={n._id || n.id} className="flex items-start gap-3">
                    <span className="mt-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{n.title || 'Notification'}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">{n.message}</p>
                    </div>
                  </li>
                ))}
                {(!notifications || notifications.length === 0) && (
                  <li className="text-[11px] font-black uppercase tracking-widest text-gray-400">All quiet</li>
                )}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-[3rem] p-8 border border-indigo-500/20">
              <h3 className="text-xl font-black tracking-tight">Keep your streak alive</h3>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-90 mt-1">Solve one problem today</p>
              <div className="mt-6 flex gap-3">
                <Link to="/student/recommendations" className="px-5 py-3 bg-white text-indigo-700 rounded-2xl text-xs font-black uppercase tracking-widest">Recommendations</Link>
                <Link to="/student/code-editor" className="px-5 py-3 bg-black/20 hover:bg-black/30 rounded-2xl text-xs font-black uppercase tracking-widest">Open Code Editor</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

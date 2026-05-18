import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import weaknessService from '../../services/api/weaknessService';
import apiClient from '../../services/api/apiClient';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  FingerPrintIcon,
  LightBulbIcon,
  BeakerIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  MapIcon
} from '@heroicons/react/24/outline';

const WeaknessAnalysis = () => {
  const { user } = useAuthStore();
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [improvement, setImprovement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('current');

  const userName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Student';
  const userId = user?.id || user?._id;

  useEffect(() => {
    // Try to fetch courses, but don't block loading
    fetchCourses();
    // Set a timeout to stop loading after 5 seconds
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (selectedCourse && userId) {
      refreshData();
    }
  }, [selectedCourse, userId]);

  const fetchCourses = async () => {
    try {
      // Using apiClient directly for generic course listing
      const response = await apiClient.get('/courses');
      const fetchedCourses = response.data.data || response.data.courses || [];
      setCourses(fetchedCourses);
      if (fetchedCourses.length > 0) {
        setSelectedCourse(fetchedCourses[0]._id);
      } else {
        // If no courses, set loading to false
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Set loading to false even if courses fail
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      if (!userId || !selectedCourse) return;
      setLoading(true);

      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 8000)
      );

      const [diagRes, histRes, imprRes] = await Promise.allSettled([
        Promise.race([
          weaknessService.getDiagnosis(userId, selectedCourse),
          timeoutPromise
        ]),
        Promise.race([
          weaknessService.getHistory(userId, selectedCourse),
          timeoutPromise
        ]),
        Promise.race([
          weaknessService.getImprovement(userId, selectedCourse),
          timeoutPromise
        ])
      ]);

      if (diagRes.status === 'fulfilled') {
        setAnalysis(diagRes.value.analysis || diagRes.value.data?.analysis || diagRes.value.data || null);
      } else {
        console.error('Diagnosis error:', diagRes.reason);
        setAnalysis(null);
      }

      if (histRes.status === 'fulfilled') {
        const historyData = histRes.value.history || histRes.value.data?.history || histRes.value.data || [];
        setHistory(historyData);
      }

      if (imprRes.status === 'fulfilled') {
        const imprData = imprRes.value.improvement || imprRes.value.data?.improvement || imprRes.value.data || null;
        setImprovement(imprData);
      }
    } catch (error) {
      console.error('Error refreshing analysis data:', error);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-900/50';
      case 'High': return 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50';
      case 'Medium': return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50';
      case 'Low': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/50';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 border-t-2 border-b-2 border-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <FingerPrintIcon className="w-10 h-10 text-indigo-400 animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="p-12 max-w-[1700px] mx-auto min-h-screen font-sans overflow-x-hidden"
    >
      {/* Background Decorations */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[150px] rounded-full animate-pulse"></div>
      </div>

      {/* Header Diagnostic */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-24 gap-12">
        <div>
          <motion.h1 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-[0.2em] uppercase leading-none italic flex items-center gap-8"
          >
            COGNITIVE <span className="text-indigo-500">DIAGNOSIS</span>
          </motion.h1>
          <p className="text-indigo-400 font-bold uppercase tracking-[0.5em] text-[11px] mt-10 flex items-center gap-4 italic">
            <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.8)]"></span>
            ANALYSIS LAYER: ACTIVE • VECTOR CORE: {userName?.toUpperCase()}
          </p>
        </div>

        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="flex items-center gap-6 bg-slate-950/40 backdrop-blur-3xl p-4 rounded-[3rem] shadow-3xl border border-white/10"
        >
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-xs font-black uppercase tracking-[0.3em] text-white pr-12 italic cursor-pointer"
          >
            {courses.map((course) => (
              <option key={course._id} value={course._id} className="bg-slate-900">{course.name?.toUpperCase()}</option>
            ))}
          </select>
          <button 
            onClick={refreshData} 
            className="p-5 bg-white text-black rounded-2xl hover:bg-indigo-600 hover:text-white hover:rotate-180 transition-all duration-700 shadow-2xl"
          >
            <ArrowPathIcon className="w-6 h-6" />
          </button>
        </motion.div>
      </div>

      {!analysis ? (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-950/40 backdrop-blur-3xl rounded-[5rem] p-32 text-center shadow-3xl border border-white/10"
        >
          <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center text-7xl mx-auto mb-12 shadow-inner border border-white/5 grayscale opacity-30">🧩</div>
          <h2 className="text-5xl font-black text-white uppercase tracking-tighter mb-6 italic">NO ACTIVE DIAGNOSTICS</h2>
          <p className="max-w-2xl mx-auto text-slate-500 font-bold uppercase tracking-[0.4em] text-[11px] leading-loose italic">
            DIAGNOSTIC DATASETS REQUIRE A THRESHOLD OF COMPLETED ASSESSMENTS. ENGAGE WITH ACTIVE NODES TO GENERATE COGNITIVE PROFILING.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-12">
          {/* Tabs Command Bar */}
          <div className="flex gap-6 p-3 bg-slate-950/40 backdrop-blur-3xl rounded-[3rem] shadow-3xl border border-white/10 max-w-fit overflow-hidden">
            {[
              { id: 'current', label: 'DIAGNOSIS LIST', icon: <BeakerIcon className="w-6 h-6" /> },
              { id: 'improvement', label: 'VECTOR PATH', icon: <ChartBarIcon className="w-6 h-6" /> },
              { id: 'recommendations', label: 'AI OPTIMIZATION', icon: <LightBulbIcon className="w-6 h-6" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-4 transition-all italic relative overflow-hidden group ${activeTab === tab.id
                  ? 'text-white'
                  : 'text-slate-500 hover:text-indigo-400'
                  }`}
              >
                <span className="relative z-10 flex items-center gap-4">
                  {tab.icon}
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'current' && (
              <motion.div 
                key="current"
                initial={{ opacity: 0, y: 50 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -50 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 mb-12">
                  {[
                    { label: 'WEAKNESS DENSITY', value: `${analysis.overallWeaknessScore?.toFixed(1)}%`, color: 'rose' },
                    { label: 'HIGH-RISK TOPICS', value: analysis.criticalTopicsCount, color: 'orange' },
                    { label: 'AVERAGE VECTOR', value: `${analysis.performanceSummary?.averageScore?.toFixed(1)}%`, color: 'indigo' },
                    { label: 'ACTIVE INTERVENTIONS', value: analysis.interventionRequired ? 'ACTIVE' : 'NOMINAL', color: analysis.interventionRequired ? 'rose' : 'emerald' },
                  ].map((stat, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.05, y: -10 }}
                      className="bg-slate-950/40 backdrop-blur-3xl p-10 rounded-[4rem] shadow-3xl border border-white/10"
                    >
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 italic">{stat.label}</p>
                      <p className={`text-5xl font-black text-white tracking-tighter italic ${stat.value === 'ACTIVE' ? 'animate-pulse text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]' : ''}`}>
                        {stat.value}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {analysis.interventionRequired && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-rose-600 rounded-[4.5rem] p-16 text-white shadow-[0_0_50px_rgba(225,29,72,0.3)] mb-12 flex flex-col xl:flex-row items-center gap-16 border border-white/20 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/10 rounded-full -mr-40 -mt-40 blur-[100px] animate-pulse"></div>
                    <div className="w-28 h-28 bg-white/20 rounded-[2.5rem] flex items-center justify-center text-6xl shadow-inner border border-white/10 animate-bounce relative z-10">⚠️</div>
                    <div className="flex-1 relative z-10 text-center xl:text-left">
                      <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 italic">CRITICAL INTERVENTION PROTOCOL</h3>
                      <p className="text-lg font-bold uppercase tracking-[0.2em] opacity-90 decoration-white decoration-4 underline-offset-8 underline">
                        RECOMMENDATION: {analysis.interventionType?.toUpperCase()}
                      </p>
                    </div>
                    <button className="bg-white text-rose-600 px-16 py-8 rounded-[2rem] font-black uppercase text-xs tracking-[0.4em] shadow-3xl hover:scale-105 transition-all relative z-10 border border-white/20 italic">
                      INITIALIZE REMEDIATION
                    </button>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {analysis.weakTopics?.map((topic, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02, y: -10 }}
                      className={`bg-slate-950/40 backdrop-blur-3xl rounded-[4rem] p-12 shadow-3xl border-l-[16px] border-t border-r border-b border-white/10 ${getSeverityStyles(topic.severity)} relative overflow-hidden group`}
                    >
                      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-all text-9xl italic font-black pointer-events-none uppercase">
                        {topic.severity?.slice(0, 1)}
                      </div>

                      <div className="flex justify-between items-start mb-12 relative z-10">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-4 opacity-60 italic">{topic.category?.toUpperCase()}</p>
                          <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-tight group-hover:text-indigo-400 transition-colors">{topic.topic}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-6xl font-black tracking-tighter italic leading-none text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{topic.weaknessScore?.toFixed(0)}%</p>
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-4 opacity-80">{topic.severity?.toUpperCase()} RISK</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-8 mb-12 relative z-10">
                        {[
                          { l: 'ATTEMPT', v: topic.questionsAttempted },
                          { l: 'CORRECT', v: topic.questionsCorrect, c: 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]' },
                          { l: 'INCORRECT', v: topic.questionsIncorrect, c: 'text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.3)]' },
                        ].map((m, i) => (
                          <div key={i} className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] text-center border border-white/5 group-hover:bg-white/10 transition-colors">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">{m.l}</p>
                            <p className={`text-3xl font-black italic ${m.c || 'text-white'}`}>{m.v}</p>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4 relative z-10">
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 border-b border-white/10 pb-4 mb-6 italic">DIAGNOSTIC RECOMMENDATIONS</p>
                        {topic.recommendations?.slice(0, 3).map((rec, i) => (
                          <motion.div 
                            key={i} 
                            whileHover={{ x: 10 }}
                            className="flex gap-4 text-xs font-bold text-slate-400 uppercase italic leading-relaxed tracking-widest"
                          >
                            <ChevronRightIcon className="w-5 h-5 text-indigo-500 shrink-0" />
                            <span>{rec}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'improvement' && (
              <motion.div 
                key="improvement"
                initial={{ opacity: 0, x: 50 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -50 }} 
                className="space-y-12"
              >
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="bg-slate-950/60 backdrop-blur-3xl rounded-[5rem] p-16 text-white shadow-3xl flex flex-col xl:flex-row items-center gap-16 border border-white/10 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-500/5 rounded-full -mr-40 -mt-40 blur-[120px] animate-pulse"></div>
                  <div className="text-center xl:text-left relative z-10">
                    <h2 className="text-5xl font-black uppercase tracking-tighter mb-6 italic">IMPROVEMENT VECTOR</h2>
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-400 italic">CURRENT PHASE ELEVATION: {improvement?.improvementPercentage?.toFixed(1)}%</p>
                  </div>
                  <div className="flex-1 flex justify-center gap-24 relative z-10">
                    <div className="text-center group">
                      <p className="text-7xl font-black italic opacity-50 group-hover:opacity-100 transition-opacity tracking-tighter">{improvement?.initialScore?.toFixed(1)}%</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-4 italic">BASELINE</p>
                    </div>
                    <div className="flex items-center text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                      <ArrowPathIcon className="w-12 h-12 animate-spin-slow" />
                    </div>
                    <div className="text-center group">
                      <p className="text-7xl font-black italic text-emerald-400 tracking-tighter drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">{improvement?.currentScore?.toFixed(1)}%</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mt-4 italic">CURRENT ELEVATION</p>
                    </div>
                  </div>
                </motion.div>

                {/* Visual Vector Path */}
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-950/40 backdrop-blur-3xl rounded-[4rem] p-16 shadow-3xl border border-white/10 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-transparent"></div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-16 flex items-center justify-between leading-none">
                    TEMPORAL PERFORMANCE VECTOR
                    <span className="text-[11px] bg-indigo-500/10 text-indigo-400 px-8 py-3 rounded-full uppercase tracking-[0.4em] border border-indigo-500/20 italic">PROGRESS TRACE</span>
                  </h3>
                  <div className="h-[450px] w-full">
                    {history && history.length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history.map(h => ({
                          date: new Date(h.date).toLocaleDateString(),
                          score: h.overallScore
                        }))}>
                          <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                          <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b', letterSpacing: '0.2em' }}
                            dy={20}
                          />
                          <YAxis
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b' }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#020617',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '1.5rem',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 'black',
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                              padding: '1.5rem',
                              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#6366f1"
                            strokeWidth={6}
                            fillOpacity={1}
                            fill="url(#colorScore)"
                            animationDuration={2000}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[3rem] bg-white/5">
                        <div className="text-6xl mb-8 grayscale opacity-20">📈</div>
                        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-600 italic">INSUFFICIENT TEMPORAL DATA TO GENERATE VECTOR TRACE</p>
                      </div>
                    )}
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <motion.div 
                    whileHover={{ y: -10 }}
                    className="bg-slate-950/40 backdrop-blur-3xl rounded-[4rem] p-12 shadow-3xl border border-white/10 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent"></div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-12 border-b border-white/10 pb-6 flex items-center justify-between leading-none">
                      RESOLVED GAPS
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-6 py-2 rounded-full uppercase tracking-[0.3em] border border-emerald-500/20 italic">ELEVATION SUCCESS</span>
                    </h3>
                    <div className="space-y-6">
                      {improvement?.topicsImproved?.length > 0 ? improvement.topicsImproved.map((topic, i) => (
                        <motion.div 
                          key={i} 
                          whileHover={{ x: 10 }}
                          className="flex items-center justify-between p-8 bg-emerald-500/5 backdrop-blur-xl rounded-[2.5rem] border border-emerald-500/10 hover:border-emerald-500/30 transition-all"
                        >
                          <span className="font-black text-xs uppercase tracking-widest text-emerald-400 italic">{topic.topic}</span>
                          <span className="font-black text-2xl text-emerald-400 italic tracking-tighter">+{topic.improvement?.toFixed(1)}%</span>
                        </motion.div>
                      )) : (
                        <p className="text-center py-12 text-slate-600 font-black uppercase tracking-[0.3em] text-[10px] italic">NO RESOLVED GAPS IDENTIFIED IN THIS CYCLE.</p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div 
                    whileHover={{ y: -10 }}
                    className="bg-slate-950/40 backdrop-blur-3xl rounded-[4rem] p-12 shadow-3xl border border-white/10 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-transparent"></div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-12 border-b border-white/10 pb-6 flex items-center justify-between leading-none">
                      REGRESSED GAPS
                      <span className="text-[10px] bg-rose-500/10 text-rose-400 px-6 py-2 rounded-full uppercase tracking-[0.3em] border border-rose-500/20 italic">ACTION REQUIRED</span>
                    </h3>
                    <div className="space-y-6">
                      {improvement?.topicsDeclined?.length > 0 ? improvement.topicsDeclined.map((topic, i) => (
                        <motion.div 
                          key={i} 
                          whileHover={{ x: -10 }}
                          className="flex items-center justify-between p-8 bg-rose-500/5 backdrop-blur-xl rounded-[2.5rem] border border-rose-500/10 hover:border-rose-500/30 transition-all"
                        >
                          <span className="font-black text-xs uppercase tracking-widest text-rose-400 italic">{topic.topic}</span>
                          <span className="font-black text-2xl text-rose-400 italic tracking-tighter">-{topic.decline?.toFixed(1)}%</span>
                        </motion.div>
                      )) : (
                        <p className="text-center py-12 text-slate-600 font-black uppercase tracking-[0.3em] text-[10px] italic">NO REGRESSIONS DETECTED IN CURRENT VECTOR.</p>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'recommendations' && analysis.aiRecommendations && (
              <motion.div 
                key="recommendations"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                className="space-y-12"
              >
                <motion.div 
                  initial={{ y: 50 }}
                  animate={{ y: 0 }}
                  className="bg-gradient-to-br from-indigo-600 via-indigo-900 to-black rounded-[5rem] p-16 md:p-24 text-white shadow-3xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-white/10 rounded-full -mr-40 -mt-40 blur-[150px] animate-pulse"></div>
                  <div className="relative z-10">
                    <div className="flex flex-col xl:flex-row items-center gap-12 mb-20">
                      <div className="w-28 h-28 bg-white/10 rounded-[3rem] flex items-center justify-center text-6xl shadow-inner border border-white/10 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] group-hover:rotate-12 transition-transform">💡</div>
                      <div className="text-center xl:text-left">
                        <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter italic mb-4">NEURAL OPTIMIZATION PLAN</h2>
                        <p className="text-[11px] font-black uppercase tracking-[0.6em] text-indigo-300 italic">CONFIDENCE ALIGNMENT: {analysis.aiRecommendations.confidenceLevel}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                      <motion.div 
                        whileHover={{ y: -10 }}
                        className="bg-white/5 backdrop-blur-2xl rounded-[4rem] p-12 border border-white/10 shadow-2xl hover:bg-white/10 transition-colors"
                      >
                        <h3 className="text-2xl font-black uppercase mb-10 italic flex items-center gap-4 leading-none text-white">
                          <MapIcon className="w-8 h-8 text-indigo-400" />
                          PRIMARY FOCUS AREAS
                        </h3>
                        <div className="flex flex-wrap gap-4">
                          {analysis.aiRecommendations.focusAreas?.map((area, i) => (
                            <span key={i} className="px-8 py-4 bg-white/10 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] border border-white/10 text-white italic hover:bg-indigo-600 hover:border-indigo-400 transition-all cursor-default">
                              {area}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                      <motion.div 
                        whileHover={{ y: -10 }}
                        className="bg-white/5 backdrop-blur-2xl rounded-[4rem] p-12 border border-white/10 shadow-2xl hover:bg-white/10 transition-colors"
                      >
                        <h3 className="text-2xl font-black uppercase mb-10 italic flex items-center gap-4 leading-none text-white">
                          <ArrowPathIcon className="w-8 h-8 text-indigo-400" />
                          PRACTICE STRATEGY
                        </h3>
                        <p className="text-sm font-bold uppercase tracking-widest italic text-slate-300 leading-loose">
                          {analysis.aiRecommendations.practiceStrategy}
                        </p>
                        <div className="mt-12 pt-10 border-t border-white/10 flex justify-between items-center">
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300 italic">EST. TIME TO RESOLUTION</p>
                          <p className="text-4xl font-black italic text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{analysis.aiRecommendations.estimatedTimeToImprove}H</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-slate-950/40 backdrop-blur-3xl rounded-[5rem] p-16 md:p-24 shadow-3xl border border-white/10 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-transparent"></div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-16 flex items-center gap-6 leading-none">
                    <ChevronRightIcon className="w-10 h-10 text-indigo-500" />
                    INTEGRATED STUDY PATH
                  </h3>
                  <div className="p-16 bg-white/5 backdrop-blur-xl rounded-[4rem] border-2 border-dashed border-white/10 group-hover:border-indigo-500/50 transition-colors">
                    <pre className="whitespace-pre-wrap font-mono text-xs md:text-sm leading-[2.5] text-slate-400 font-bold uppercase tracking-widest selection:bg-indigo-500/30 italic">
                      {analysis.aiRecommendations.studyPlan}
                    </pre>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default WeaknessAnalysis;




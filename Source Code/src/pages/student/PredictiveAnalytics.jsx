import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import {
  RocketLaunchIcon,
  SignalIcon,
  ChartBarIcon,
  BoltIcon,
  PuzzlePieceIcon,
  TrophyIcon,
  ExclamationCircleIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import API_BASE_URL from '../../config/api';
import toast from '../../utils/toast';
import ImprovementVector from '../../components/student/ImprovementVector';
import WeaknessDensity from '../../components/student/WeaknessDensity';

const METRIC_ICON_STYLE = {
  rose: 'bg-rose-500/10 text-rose-600',
  emerald: 'bg-emerald-500/10 text-emerald-600',
  blue: 'bg-blue-500/10 text-blue-600',
  indigo: 'bg-indigo-500/10 text-indigo-600'
};

const clampPercent = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  if (n <= 1) return Math.round(Math.max(0, Math.min(1, n)) * 100);
  return Math.round(Math.max(0, Math.min(100, n)));
};

const safeText = (value, fallback = 'N/A') => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value);
};

const PredictiveAnalytics = () => {
  const { user, token } = useAuthStore();
  const userId = user?.id || user?._id;
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    fetchPrediction();
  }, []);

  const fetchPrediction = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/predictive-analytics/performance/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrediction(response.data);
    } catch (error) {
      console.error('Error fetching prediction:', error);
      toast.error('Unable to load predictive analytics right now.');
    } finally {
      setLoading(false);
    }
  };

  const handlePathOptimization = async () => {
    setOptimizing(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/predictive-analytics/optimize-path`,
        { studentId: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Path optimization initialized.');
        await fetchPrediction();
      }
    } catch (error) {
      console.error('Error optimizing path:', error);
      const errorMsg = error.response?.data?.error || 'Path optimization failed.';
      toast.error(errorMsg);
    } finally {
      setOptimizing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!prediction || !prediction.success) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="bg-rose-50 border border-rose-200 p-10 rounded-[3rem] text-center max-w-lg">
          <ExclamationCircleIcon className="w-16 h-16 text-rose-500 mx-auto mb-6" />
          <h3 className="text-xl font-black uppercase text-rose-900 mb-2">Forecasting Offline</h3>
          <p className="text-sm font-bold text-rose-700 uppercase tracking-widest opacity-70">
            Insufficient data to generate a confidence-based prediction.
          </p>
        </div>
      </div>
    );
  }

  const { prediction: pred = {}, metrics = {}, recommendations = [] } = prediction;
  const confidencePercent = clampPercent(pred.confidence);
  const overallScorePercent = clampPercent(pred.overallScore);
  const examScorePercent = clampPercent(pred.predictedExamScore);
  const nextProblemPercent = clampPercent(pred.nextProblemSuccess);

  const metricCards = [
    { l: 'Submissions', v: safeText(metrics.totalSubmissions, '0'), i: <FireIcon />, c: 'rose' },
    { l: 'Success Rate', v: `${clampPercent(metrics.successRate)}%`, i: <TrophyIcon />, c: 'emerald' },
    { l: 'Consistency', v: `${clampPercent(metrics.consistencyScore)}%`, i: <BoltIcon />, c: 'blue' },
    { l: 'Activity', v: `${clampPercent(metrics.activityScore)}%`, i: <SignalIcon />, c: 'indigo' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto min-h-screen font-sans relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-800 opacity-[0.05]"></div>
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic flex items-center gap-4">
              <RocketLaunchIcon className="w-12 h-12 text-indigo-600" />
              Future Probability
            </h1>
            <p className="text-indigo-600 font-bold uppercase tracking-[0.4em] text-[10px] mt-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
              Forecasting Node: ACTIVE | Confidence Alignment: {confidencePercent}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-[4rem] p-12 text-white shadow-3xl h-full border-t-[16px] border-indigo-600 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-1000" />

              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12 border-b border-white/10 pb-4 italic">
                Overall Vector Prediction
              </h2>

              <div className="text-center py-10 relative z-10">
                <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-8xl font-black tracking-tighter italic mb-6">
                  {overallScorePercent}%
                </motion.p>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-10">Projected Performance Index</p>

                <div className="inline-block bg-white/10 px-8 py-4 rounded-[2rem] border border-white/5 backdrop-blur-md">
                  <span className="text-xs font-black uppercase tracking-widest italic">{safeText(pred.level, 'unknown').replace('-', ' ')} status</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white dark:bg-dark-800 rounded-[3rem] p-10 shadow-2xl border border-slate-50 dark:border-dark-700">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
                    <SignalIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tighter text-slate-400">Next Assessment</h3>
                    <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Score Probability</p>
                  </div>
                </div>
                <p className="text-6xl font-black tracking-tighter italic text-blue-600 mb-4">{examScorePercent}%</p>
              </div>

              <div className="bg-white dark:bg-dark-800 rounded-[3rem] p-10 shadow-2xl border border-slate-50 dark:border-dark-700">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                    <PuzzlePieceIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tighter text-slate-400">Problem Logic</h3>
                    <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">First-Try Success</p>
                  </div>
                </div>
                <p className="text-6xl font-black tracking-tighter italic text-emerald-600 mb-4">{nextProblemPercent}%</p>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-[4rem] p-12 shadow-2xl border border-slate-50 dark:border-dark-700">
              <h3 className="text-xl font-black uppercase tracking-tighter italic mb-10 border-b pb-6 flex items-center justify-between">
                Metrical Intelligence
                <ChartBarIcon className="w-7 h-7 text-indigo-600" />
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {metricCards.map((m, i) => (
                  <div key={i} className="text-center group">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform ${METRIC_ICON_STYLE[m.c]}`}>
                      {m.i}
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tighter">{m.v}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-2">{m.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* New Improvement Vector Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mb-10">
          <ImprovementVector
            baseline={65.0}
            current={overallScorePercent}
            elevation={overallScorePercent - 65.0}
          />
          <WeaknessDensity
            density={pred.conceptDriftScore ? pred.conceptDriftScore * 100 : 0.0}
            riskTopics={recommendations.filter(r => r.priority === 'high').map(r => ({ name: r.type.toUpperCase(), impact: Math.round(pred.conceptDriftScore * 100 || 15) }))}
            activeInterventions={recommendations.filter(r => r.priority === 'high').length}
            status={pred.conceptDriftScore > 0.1 ? 'AT-RISK' : 'NOMINAL'}
          />
        </div>

        <div>
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-[4rem] p-12 text-white shadow-3xl relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-32 -mb-32 blur-3xl" />
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center text-5xl italic font-black">AI</div>
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-3 italic">Autonomous Success Strategy</h3>
                <div className="space-y-4">
                  {(recommendations || []).slice(0, 2).map((rec, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className={`w-2 h-2 rounded-full mt-1.5 ${rec.priority === 'high' ? 'bg-rose-500' : 'bg-indigo-400'}`} />
                      <p className="text-sm font-bold uppercase tracking-tight opacity-80 italic leading-relaxed">{safeText(rec.message)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={handlePathOptimization}
                disabled={optimizing}
                className="bg-indigo-600 px-10 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn overflow-hidden relative"
              >
                <span className="relative z-10">{optimizing ? 'Optimizing...' : 'Initialize Path Optimization'}</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PredictiveAnalytics;

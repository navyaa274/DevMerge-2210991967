import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../services/api/apiClient';
import {
  ShieldExclamationIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ExclamationTriangleIcon,
  CpuChipIcon,
  ChartBarSquareIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  XCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function PlagiarismReports() {
  const { user } = useAuthStore();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [expandedReport, setExpandedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [filterSeverity]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/plagiarism?severity=${filterSeverity}`);
      setReports(response.data.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Matrix synchronization failed. Unable to fetch structural anomaly reports.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityStyles = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
      case 'high': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
      case 'medium': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 90) return 'text-rose-500';
    if (percentage >= 70) return 'text-amber-500';
    if (percentage >= 50) return 'text-indigo-400';
    return 'text-emerald-400';
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(244,63,94,0.4)]"></div>
        <p className="mt-6 text-rose-500 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Running Structural Analysis...</p>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50 dark:bg-dark-950 p-8 pt-20">
      <div className="max-w-[1600px] mx-auto">
        {/* HUD Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1.5 bg-rose-600 font-black text-white text-[9px] uppercase tracking-[0.3em] rounded-full shadow-lg shadow-rose-500/30 italic">
                Security Protocol
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-200 dark:bg-dark-900 px-4 py-1.5 rounded-full flex items-center gap-2">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                AI Judge Active
              </span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic flex items-center gap-4">
              Plagiarism <span className="text-rose-500">Engine</span>
            </h1>
            <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px] mt-4 max-w-xl">
              Continuous AST structural analysis and semantic validation across all student artifacts.
            </p>
          </div>

          <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden flex items-center gap-6 min-w-[320px] border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px] -mt-10 -mr-10"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 relative z-10">
              <ShieldExclamationIcon className="w-8 h-8" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Critical Alerts</p>
              <p className="text-3xl font-black text-white tracking-tighter italic leading-none">{reports.filter(r => r.severity === 'critical' || r.severity === 'high').length}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-rose-50 dark:bg-rose-500/10 border-2 border-rose-200 dark:border-rose-500/20 rounded-[2rem] flex items-start gap-4 shadow-xl">
            <ExclamationTriangleIcon className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-rose-900 dark:text-rose-400 mb-1">System Error</p>
              <p className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-widest">{error}</p>
            </div>
          </div>
        )}

        {/* Tactical Filter Bar */}
        <div className="flex bg-white dark:bg-dark-900 p-2 rounded-[2rem] max-w-fit mb-10 shadow-xl border border-slate-100 dark:border-dark-800 overflow-x-auto">
          {['all', 'low', 'medium', 'high', 'critical'].map(severity => (
            <button
              key={severity}
              onClick={() => setFilterSeverity(severity)}
              className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${filterSeverity === severity
                  ? severity === 'critical' ? 'bg-rose-600 text-white shadow-[0_10px_30px_rgba(244,63,94,0.3)]'
                    : severity === 'high' ? 'bg-amber-600 text-white shadow-[0_10px_30px_rgba(245,158,11,0.3)]'
                      : 'bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)]'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
            >
              {severity === 'all' && <MagnifyingGlassIcon className="w-4 h-4" />}
              {severity !== 'all' && <div className={`w-2 h-2 rounded-full ${severity === 'critical' ? 'bg-rose-500' : severity === 'high' ? 'bg-amber-500' : severity === 'medium' ? 'bg-indigo-400' : 'bg-emerald-400'}`}></div>}
              {severity}
            </button>
          ))}
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20">
          <div className="lg:col-span-12 space-y-6">
            {reports.length === 0 ? (
              <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-20 flex flex-col items-center justify-center text-center shadow-2xl border-2 border-dashed border-slate-200 dark:border-dark-800">
                <ShieldExclamationIcon className="w-24 h-24 text-slate-300 dark:text-dark-700 mb-8" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-2">Zero Anomalies Detected</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] max-w-md">The structural integrity of all submissions remains intact for the current filter paramters.</p>
              </div>
            ) : (
              reports.map((report, idx) => (
                <motion.div
                  key={report._id || idx}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 shadow-xl border-l-[12px] relative overflow-hidden transition-all ${report.severity === 'critical' ? 'border-l-rose-500' :
                      report.severity === 'high' ? 'border-l-amber-500' :
                        report.severity === 'medium' ? 'border-l-indigo-500' : 'border-l-emerald-500'
                    } dark:border-y-dark-800 dark:border-r-dark-800 border-y-slate-100 border-r-slate-100 group`}
                >
                  {/* Matrix Background Effect */}
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-9xl pointer-events-none scale-150 rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-transform duration-1000">🤖</div>

                  {/* Report Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start mb-8 relative z-10 gap-6">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                            {report.submission1?.studentName || "Subject Alpha"}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-dark-950 px-3 py-1 rounded-full px-2">VS</span>
                          <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                            {report.submission2?.studentName || "Subject Bravo"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl">
                          <DocumentTextIcon className="w-4 h-4" /> Node: {report.problemTitle || "Unidentified Task"}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2">
                      <span className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border ${getSeverityStyles(report.severity || 'high')}`}>
                        {report.severity?.toUpperCase() || 'HIGH RISK'} LEVEL
                      </span>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className={`text-4xl font-black italic tracking-tighter leading-none ${getMatchColor(report.similarityPercentage || 87)}`}>
                          {report.similarityPercentage || 87}%
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Match Vector</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Explanation Box */}
                  <div className="bg-slate-50 dark:bg-dark-950 rounded-[2rem] p-6 md:p-8 mb-8 relative z-10 border border-slate-200 dark:border-dark-800">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-3 text-indigo-600 dark:text-indigo-400 italic">
                      <CpuChipIcon className="w-5 h-5" /> AI Judge Synthesis
                    </h4>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                      {report.explanation || "The semantic structure, loop constructs, and variable naming patterns are highly identical indicating a likely copy. Variables have been renamed, but the AST (Abstract Syntax Tree) is 87% similar."}
                    </p>
                  </div>

                  {/* Expandable Code Comparison */}
                  <div className="relative z-10">
                    <button
                      onClick={() => setExpandedReport(expandedReport === idx ? null : idx)}
                      className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-full p-4 bg-slate-50 dark:bg-dark-950 rounded-2xl justify-center border border-slate-100 dark:border-dark-800"
                    >
                      <CodeBracketIcon className="w-4 h-4" />
                      {expandedReport === idx ? 'Collapse Artifact Inspection' : 'Inspect Code Artifacts'}
                      <ChevronDownIcon className={`w-4 h-4 transition-transform ${expandedReport === idx ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {expandedReport === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 rounded-[2.5rem] p-6 shadow-inner border-t border-slate-800">
                            {/* Submission 1 */}
                            <div>
                              <div className="flex justify-between items-center mb-4 px-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Subject Alpha Payload</span>
                                <span className="text-[8px] font-black px-2 py-1 bg-white/10 text-white rounded-md uppercase tracking-widest">AST Node 1</span>
                              </div>
                              <pre className="bg-black/60 text-slate-300 p-6 rounded-3xl text-xs overflow-auto max-h-[400px] shadow-inner font-mono leading-loose border border-white/5 custom-scrollbar">
                                {report.submission1?.code || "function twoSum(nums, target) {\n  for(let i=0; i<nums.length; i++) {\n    for(let j=i+1; j<nums.length; j++) {\n      if(nums[i] + nums[j] === target) {\n        return [i, j];\n      }\n    }\n  }\n}"}
                              </pre>
                            </div>

                            {/* Submission 2 */}
                            <div>
                              <div className="flex justify-between items-center mb-4 px-2">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Subject Bravo Payload</span>
                                <span className="text-[8px] font-black px-2 py-1 bg-white/10 text-white rounded-md uppercase tracking-widest">AST Node 2</span>
                              </div>
                              <pre className="bg-black/60 text-slate-300 p-6 rounded-3xl text-xs overflow-auto max-h-[400px] shadow-inner font-mono leading-loose border border-white/5 custom-scrollbar">
                                {report.submission2?.code || "function solveTwo(arr, tg) {\n  for(let a=0; a<arr.length; a++) {\n    for(let b=a+1; b<arr.length; b++) {\n      if(arr[a] + arr[b] === tg) {\n        return [a, b];\n      }\n    }\n  }\n}"}
                              </pre>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-dark-800 relative z-10">
                    <button className="flex-1 px-8 py-5 bg-slate-900 dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white dark:text-slate-900 dark:hover:text-white rounded-[1.5rem] text-[10px] font-black shadow-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 italic">
                      <ChartBarSquareIcon className="w-5 h-5" /> Generate Deep Report
                    </button>
                    <button className="flex-1 px-8 py-5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-600 border border-rose-200 dark:border-rose-500/20 text-rose-600 hover:text-white rounded-[1.5rem] text-[10px] font-black shadow-lg transition-all uppercase tracking-widest flex items-center justify-center gap-2 italic">
                      <ExclamationTriangleIcon className="w-5 h-5" /> Flag Subjects For Review
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import submissionService from '../../services/api/submissionService';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useAuthStore } from '../../store/authStore';
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  CodeBracketIcon,
  AcademicCapIcon,
  FunnelIcon,
  ArchiveBoxIcon,
  GlobeAltIcon,
  EyeIcon,
  HandThumbUpIcon
} from '@heroicons/react/24/outline';

export default function Submissions() {
  const { token } = useAuthStore();
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [peerSolutions, setPeerSolutions] = useState([]);
  const [viewingSolutionsFor, setViewingSolutionsFor] = useState(null);
  const [loadingPeer, setLoadingPeer] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await submissionService.getSubmissions({ filter });
      setSubmissions(data.submissions || data.data || []);
    } catch (error) {
      console.error('Submission sync failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublic = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/submissions/${id}/public`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSubmissions();
    } catch (error) {
      alert('Failed to update visibility: ' + (typeof error.response?.data?.message === 'string' ? error.response?.data?.message : error.response?.data?.message?.toString() || typeof error.message === 'string' ? error.message : error?.toString() || 'Unknown error occurred'));
    }
  };

  const fetchPeerSolutions = async (problemId) => {
    try {
      setLoadingPeer(true);
      setViewingSolutionsFor(problemId);
      const res = await axios.get(`${API_BASE_URL}/submissions/problem/${problemId}/solutions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPeerSolutions(res.data.data);
    } catch (error) {
      alert(typeof error.response?.data?.message === 'string' ? error.response?.data?.message : error.response?.data?.message?.toString() || 'Failed to fetch peer solutions');
      setViewingSolutionsFor(null);
    } finally {
      setLoadingPeer(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      Accepted: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircleIcon, label: 'Verified Success' },
      Pending: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: ClockIcon, label: 'Evaluation in Progress' },
      'Wrong Answer': { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: XCircleIcon, label: 'Assertion Failure' },
      Graded: { color: 'text-indigo-500', bg: 'bg-indigo-500/10', icon: ChartBarIcon, label: 'Faculty Appraised' }
    };
    return configs[status] || { color: 'text-slate-400', bg: 'bg-slate-400/10', icon: ClockIcon, label: status || 'Node Standby' };
  };

  const filterTabs = [
    { id: 'all', label: 'Complete Archive' },
    { id: 'Accepted', label: 'Verified' },
    { id: 'Pending', label: 'Queued' },
    { id: 'Wrong Answer', label: 'Failed' },
    { id: 'Graded', label: 'Graded' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 border-t-2 border-b-2 border-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          />
          <p className="mt-8 font-black text-indigo-400 uppercase tracking-[0.5em] text-[10px] animate-pulse italic">ACCESSING SUBMISSION LEDGER...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-8 md:p-16 lg:p-24 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Background Decorations */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[150px] rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-[1700px] mx-auto">
        <div className="mb-24">
          <motion.h1 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-8xl md:text-9xl font-black text-white tracking-[0.2em] uppercase leading-none italic"
          >
            SUBMISSION <span className="text-indigo-500">LEDGER</span>
          </motion.h1>
          <p className="text-indigo-400 font-bold uppercase tracking-[0.5em] text-[11px] mt-10 flex items-center gap-4">
            <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.8)]"></span>
            PERFORMANCE HISTORY // LOGICAL ASSERTIONS // PEER KNOWLEDGE HUB
          </p>
        </div>

        {/* Filter Navigation */}
        <div className="bg-slate-950/40 backdrop-blur-3xl rounded-[3rem] shadow-3xl mb-20 p-4 border border-white/10 overflow-hidden">
          <div className="flex flex-wrap gap-4">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all relative overflow-hidden group italic ${filter === tab.id
                  ? 'text-white'
                  : 'text-slate-500 hover:text-indigo-400'
                  }`}
              >
                <span className="relative z-10">{tab.label}</span>
                {filter === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.4)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {!filter === tab.id && (
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <AnimatePresence mode="popLayout">
            {submissions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="col-span-full py-48 bg-slate-950/40 backdrop-blur-2xl rounded-[5rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 text-center shadow-3xl"
              >
                <div className="text-9xl mb-12 grayscale opacity-20">📥</div>
                <p className="font-black uppercase tracking-[0.5em] text-xl text-white mb-4 italic">LEDGER UNPOPULATED</p>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40 italic">NO ACTIVITY DETECTED FOR THE SELECTED SYNCHRONIZATION FILTER.</p>
              </motion.div>
            ) : (
              submissions.map((submission, idx) => {
                const config = getStatusConfig(submission.status);
                const StatusIcon = config.icon;

                return (
                  <motion.div
                    layout
                    key={submission._id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -15, scale: 1.01 }}
                    className="bg-slate-950/40 backdrop-blur-3xl rounded-[4rem] p-12 shadow-3xl border border-white/10 group relative overflow-hidden flex flex-col"
                  >
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-150 transition-all text-[12rem] italic font-black pointer-events-none uppercase">
                      {submission.status?.toUpperCase().slice(0, 3)}
                    </div>

                    <div className="flex items-start justify-between mb-12 relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                          <CodeBracketIcon className="w-6 h-6 text-indigo-500" />
                          <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] italic">
                            {submission.course?.code || 'GEN-01'} // {submission.language || 'BINARY'} // {submission.status === 'Accepted' ? 'GOLD_LEVEL' : 'SYS_TRACE'}
                          </p>
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase leading-tight italic tracking-tighter group-hover:text-indigo-400 transition-colors">
                          {submission.assignment?.title || submission.problem?.title || 'SYSTEM PROTOCOL'}
                        </h3>
                      </div>
                      <div className={`flex items-center gap-3 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl border border-white/10 backdrop-blur-xl italic ${config.bg} ${config.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {config.label}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                      <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 italic">TEMPORAL NODE</p>
                        <p className="text-[11px] font-black text-white uppercase tracking-tighter italic">
                          {new Date(submission.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>

                      {submission.grade !== undefined && (
                        <div className="bg-indigo-500/10 backdrop-blur-xl p-6 rounded-[2rem] border border-indigo-500/20">
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2 italic">VALUATION</p>
                          <p className="text-2xl font-black text-indigo-400 italic tracking-tighter leading-none">
                            {submission.grade} <span className="text-[10px] opacity-40">/ {submission.maxGrade || 100}</span>
                          </p>
                        </div>
                      )}

                      {submission.status === 'Accepted' && (
                        <button
                          onClick={() => togglePublic(submission._id)}
                          className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center justify-center backdrop-blur-xl ${submission.isPublic ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/10' : 'bg-white/5 border-white/10 text-slate-500'}`}
                        >
                          <GlobeAltIcon className="w-5 h-5 mb-2" />
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] italic">{submission.isPublic ? 'PUBLIC' : 'PRIVATE'}</p>
                        </button>
                      )}

                      {submission.status === 'Accepted' && (
                        <button
                          onClick={() => fetchPeerSolutions(submission.problem?._id || submission.problem)}
                          className="p-6 bg-indigo-500/10 border-indigo-500/20 text-indigo-400 rounded-[2rem] border hover:bg-indigo-600 hover:text-white transition-all flex flex-col items-center justify-center backdrop-blur-xl group/btn"
                        >
                          <EyeIcon className="w-5 h-5 mb-2 group-hover/btn:scale-125 transition-transform" />
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-center italic">STUDY PEERS</p>
                        </button>
                      )}
                    </div>

                    {submission.feedback && (
                      <div className="bg-indigo-950/30 backdrop-blur-3xl rounded-[3rem] p-10 mb-12 border border-indigo-500/20 relative group-hover:bg-indigo-900/40 transition-colors">
                        <AcademicCapIcon className="absolute right-8 top-8 w-12 h-12 opacity-10 text-indigo-400 group-hover:scale-125 transition-transform" />
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4 italic flex items-center gap-3">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                          NEURAL FEEDBACK BLOCK
                        </p>
                        <p className="text-sm font-bold text-slate-400 italic leading-relaxed uppercase tracking-widest">"{submission.feedback}"</p>
                      </div>
                    )}

                    <div className="mt-auto flex gap-6 pt-10 border-t border-white/10">
                      <button className="flex-1 py-8 bg-white text-black rounded-[2.5rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-3xl hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-[1.02] italic border border-white/20">
                        VIEW CODE TRACE
                      </button>

                      {submission.fileUrl && (
                        <a
                          href={submission.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-10 flex items-center justify-center bg-white/5 text-white border border-white/10 rounded-[2.5rem] hover:bg-indigo-600 hover:text-white transition-all shadow-2xl group/dl"
                        >
                          <DocumentArrowDownIcon className="w-6 h-6 group-hover/dl:translate-y-1 transition-transform" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Peer Solutions Modal */}
        <AnimatePresence>
          {viewingSolutionsFor && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setViewingSolutionsFor(null)}
                className="absolute inset-0 bg-[#020617]/95 backdrop-blur-2xl"
              />
              <motion.div
                initial={{ scale: 0.9, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 50, opacity: 0 }}
                className="relative bg-slate-950/60 backdrop-blur-3xl w-full max-w-6xl rounded-[5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden max-h-[90vh] flex flex-col p-16"
              >
                <div className="mb-16 flex justify-between items-start">
                  <div>
                    <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter">PEER SOLUTIONS HUB</h2>
                    <p className="text-indigo-400 font-bold text-[11px] uppercase tracking-[0.5em] mt-6 flex items-center gap-4 italic">
                      <span className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
                      COLLECTIVE INTELLIGENCE // OPTIMIZATION PATTERNS
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingSolutionsFor(null)}
                    className="p-6 bg-white/5 text-white rounded-[2rem] hover:bg-rose-600 hover:text-white transition-all border border-white/10 group/close shadow-2xl"
                  >
                    <XCircleIcon className="w-8 h-8 group-hover/close:rotate-90 transition-transform" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-10 pr-6 custom-scrollbar">
                  {loadingPeer ? (
                    <div className="py-32 text-center text-indigo-400 font-black uppercase tracking-[0.5em] text-sm animate-pulse italic">SYNCING HIGH-QUALITY SOLUTIONS...</div>
                  ) : peerSolutions.length === 0 ? (
                    <div className="py-32 text-center text-slate-500 font-bold italic uppercase tracking-[0.3em] text-lg">NO PUBLIC SOLUTIONS FOUND FOR THIS PROBLEM YET. BE THE FIRST TO SHARE!</div>
                  ) : (
                    peerSolutions.map((sol, i) => (
                      <div key={i} className="bg-white/5 backdrop-blur-xl rounded-[4rem] p-12 border border-white/5 group hover:border-indigo-500/30 transition-all shadow-2xl">
                        <div className="flex justify-between items-center mb-10">
                          <div className="flex items-center gap-8">
                            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white font-black uppercase text-3xl shadow-3xl shadow-indigo-600/30 border border-white/10 italic">
                              {sol.student?.name?.charAt(0) || 'D'}
                            </div>
                            <div>
                              <p className="font-black text-white uppercase text-xl tracking-tighter italic mb-1">{sol.student?.name}</p>
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">{sol.language} // {new Date(sol.submittedAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-10">
                            <div className="text-right">
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 italic">IMPACT</p>
                              <div className="flex items-center gap-3 text-indigo-400 font-black text-xl italic drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                                <HandThumbUpIcon className="w-6 h-6" />
                                {sol.likes?.length || 0}
                              </div>
                            </div>
                            <button className="px-10 py-5 bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-[1.5rem] hover:bg-indigo-600 hover:text-white transition-all italic border border-white/20 shadow-2xl">
                              ANALYZE CODE
                            </button>
                          </div>
                        </div>
                        <div className="bg-black/40 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/5 shadow-inner">
                          <pre className="text-xs font-mono text-slate-400 overflow-x-auto selection:bg-indigo-500/30">
                            <code className="italic">{sol.code.split('\n').slice(0, 5).join('\n') + '\n... [FULL CODE LOCKED IN VIEW MODE]'}</code>
                          </pre>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

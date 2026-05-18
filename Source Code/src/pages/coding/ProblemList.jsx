import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import problemService from '../../services/api/problemService';
import {
  SparklesIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CommandLineIcon,
  BoltIcon,
  CubeIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

export default function ProblemList() {
  const { token } = useAuthStore();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course');

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ difficulty: '', topic: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const params = {};
        if (filter.difficulty) params.difficulty = filter.difficulty;
        if (filter.topic) params.topic = filter.topic;
        if (courseId) params.course = courseId;

        const response = await problemService.getProblems(params);
        setProblems(response.data || []);
      } catch (error) {
        console.error('Error fetching problems:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [filter, courseId]);

  const filteredProblems = problems.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.topics?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-slate-950">
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
        <CommandLineIcon className="absolute inset-0 m-auto w-10 h-10 text-indigo-400" />
      </div>
      <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Initializing Algorithm Vault...</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-950 p-6 md:p-12 lg:p-20 text-white selection:bg-indigo-500/30"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-1.5 bg-indigo-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 italic">Competitive Core</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none italic mb-4">
              Algorithm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Vault</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl font-medium leading-relaxed italic border-l-2 border-slate-800 pl-6">
              Master the competitive landscape with production-grade challenges.
              Synchronize your cognitive models with complex data structures.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/50 backdrop-blur-xl border border-white/5 p-4 rounded-[2.5rem]">
            <div className="bg-indigo-500/10 p-4 rounded-2xl">
              <CircleStackIcon className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="pr-10">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Global Challenges</p>
              <p className="text-2xl font-black text-white italic">{problems.length}</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          <div className="lg:col-span-2 relative group">
            <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="SCAN CHALLENGE DATA..."
              className="w-full bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-[2rem] py-6 pl-16 pr-8 text-xs font-black uppercase tracking-widest italic focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-700"
            />
          </div>
          <div className="relative group">
            <AdjustmentsHorizontalIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600" />
            <select
              value={filter.difficulty}
              onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
              className="w-full bg-slate-900/80 backdrop-blur-md border border-white/5 rounded-[2rem] py-6 pl-16 pr-10 text-xs font-black uppercase tracking-widest italic focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
            >
              <option value="">Intensity: All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex gap-4 mb-20 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          {['Arrays', 'Strings', 'DP', 'Graphs', 'Trees', 'Backtracking', 'Hash Map'].map((tag, i) => (
            <button
              key={i}
              onClick={() => setFilter({ ...filter, topic: filter.topic === tag ? '' : tag })}
              className={`whitespace-nowrap px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic border ${filter.topic === tag
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-2xl shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-500 border-white/5 hover:border-indigo-500/30'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Problems List */}
        <div className="grid grid-cols-1 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProblems.length > 0 ? filteredProblems.map((problem, idx) => (
              <motion.div
                key={problem._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={`/problems/${problem._id}`} className="block group">
                  <div className="relative bg-slate-900 border border-white/5 p-8 md:p-12 rounded-[3rem] transition-all duration-500 hover:border-indigo-500/40 hover:-translate-y-2 group-hover:bg-slate-900/80 overflow-hidden">
                    {/* Background Icon */}
                    <div className="absolute -bottom-10 -right-10 text-[12rem] opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-700 pointer-events-none group-hover:rotate-12 group-hover:scale-110">
                      <CommandLineIcon className="w-64 h-64" />
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-6">
                          <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic border-2 ${problem.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            }`}>
                            {problem.difficulty}
                          </span>

                          {problem.isAiGenerated && (
                            <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl">
                              <SparklesIcon className="w-3 h-3 text-indigo-400" />
                              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">AI Core Generated</span>
                            </div>
                          )}

                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-auto italic">Success Rate: {problem.acceptanceRate || 0}%</span>
                        </div>

                        <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter group-hover:text-indigo-400 transition-colors leading-none mb-6">
                          {problem.title}
                        </h3>

                        <div className="flex flex-wrap gap-2">
                          {problem.topics?.map(topic => (
                            <span key={topic} className="bg-slate-800/50 text-slate-400 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5 group-hover:border-indigo-500/20 italic">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-8 group/link">
                        <div className="text-right hidden xl:block">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Simulation</p>
                          <p className="text-sm font-black text-white uppercase italic tracking-tighter">Status Ready</p>
                        </div>
                        <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-500 group-active:scale-90">
                          <ArrowRightIcon className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )) : (
              <div className="text-center py-40 bg-slate-900/30 rounded-[4rem] border-2 border-dashed border-white/5">
                <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CommandLineIcon className="w-10 h-10 text-slate-600" />
                </div>
                <h4 className="text-2xl font-black uppercase italic text-slate-600 mb-2 underline decoration-indigo-500/50 underline-offset-8">No Challenges Found</h4>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Synchronize filters or check neural connection</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

const ArrowRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);

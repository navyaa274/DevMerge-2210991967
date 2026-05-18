import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import recommendationService from '../../services/api/recommendationService';
import {
  SparklesIcon,
  AcademicCapIcon,
  MapIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  StarIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const Recommendations = () => {
  const [activeTab, setActiveTab] = useState('problems');
  const [problems, setProblems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'problems') {
        const res = await recommendationService.getProblems(20);
        setProblems(res.recommendations || []);
      } else if (activeTab === 'courses') {
        const res = await recommendationService.getCourses(10);
        setCourses(res.recommendations || []);
      } else if (activeTab === 'paths') {
        const res = await recommendationService.getLearningPaths();
        setLearningPaths(res.learningPaths || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await recommendationService.refresh();
      await fetchData();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic flex items-center gap-3"
            >
              <SparklesIcon className="w-10 h-10 text-indigo-500 animate-pulse" />
              NEURAL ENGINE
            </motion.h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-2 ml-1">
              AI Personalized Intelligence Layer
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="group flex items-center gap-3 bg-white dark:bg-slate-800 px-6 py-3 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 transition-all active:scale-95"
          >
            <ArrowPathIcon className={`w-5 h-5 text-indigo-500 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Recalibrate</span>
          </button>
        </header>

        {/* Custom Tab Switcher */}
        <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-[2rem] w-fit mb-12 backdrop-blur-sm border border-slate-200 dark:border-slate-700">
          {[
            { id: 'problems', label: 'Nodes', icon: <FireIcon className="w-5 h-5" /> },
            { id: 'courses', label: 'Syllabus', icon: <AcademicCapIcon className="w-5 h-5" /> },
            { id: 'paths', label: 'Trajectories', icon: <MapIcon className="w-5 h-5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xl scale-105'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24"
            >
              <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-6 text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Processing Personal Context...</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {activeTab === 'problems' && problems.map((problem) => (
                <motion.div
                  key={problem._id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="group bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col h-full overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors"></div>

                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${problem.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-600' :
                        problem.difficulty === 'medium' ? 'bg-amber-100 text-amber-600' :
                          'bg-rose-100 text-rose-600'
                      }`}>
                      {problem.difficulty}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <StarIcon className="w-4 h-4 fill-current" />
                      <span className="text-[10px] font-black">{Math.round(problem.recommendationScore)}% Match</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-4 group-hover:text-indigo-600 transition-colors">
                    {problem.title}
                  </h3>

                  <p className="text-sm text-slate-500 font-medium mb-8 flex-grow line-clamp-3">
                    {problem.description || "Experimental node requiring algorithmic resolution and logic parsing."}
                  </p>

                  {problem.reason && (
                    <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-start gap-3">
                      <SparklesIcon className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">{problem.reason}</p>
                    </div>
                  )}

                  <Link
                    to={`/problems/${problem._id}`}
                    className="flex items-center justify-center gap-3 w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all"
                  >
                    Execute Node
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}

              {activeTab === 'courses' && courses.map((course) => (
                <motion.div
                  key={course._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-slate-800 rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col h-full"
                >
                  <div className="flex justify-between items-center mb-8">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{course.department}</p>
                    <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-2xl">
                      <span className="text-[10px] font-black uppercase text-slate-500">Sem {course.semester}</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-4">{course.name}</h3>
                  <p className="text-sm text-slate-500 font-medium mb-8 flex-grow">{course.description?.substring(0, 120)}...</p>

                  <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-50 dark:border-slate-700">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enrollment Vector</p>
                      <p className="text-lg font-black italic">{course.enrolledStudents?.length || 0} Learners</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Match Prob.</p>
                      <p className="text-lg font-black italic text-indigo-600">{Math.round(course.recommendationScore)}%</p>
                    </div>
                  </div>

                  <Link
                    to={`/courses/${course._id}`}
                    className="flex items-center justify-center gap-3 w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-indigo-500/20"
                  >
                    Initialize Curriculum
                    <ChevronRightIcon className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}

              {activeTab === 'paths' && learningPaths.map((path, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-slate-900 text-white rounded-[4rem] p-12 shadow-3xl relative overflow-hidden group col-span-1 md:col-span-1 lg:col-span-1"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/40 transition-all duration-700"></div>

                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-10">
                      <div className="bg-white/10 p-4 rounded-[2rem] border border-white/10 backdrop-blur-md">
                        <MapIcon className="w-8 h-8 text-indigo-400" />
                      </div>
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 ${path.priority === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'
                        }`}>
                        {path.priority} priority
                      </span>
                    </div>

                    <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-4">{path.category?.replace('-', ' ')}</h3>
                    <div className="flex items-center gap-4 text-slate-400 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                      <span className="text-[10px] font-black uppercase whitespace-nowrap">{path.currentLevel}</span>
                      <ChevronRightIcon className="w-4 h-4 shrink-0" />
                      <span className="text-[10px] font-black uppercase whitespace-nowrap text-indigo-400">{path.targetLevel}</span>
                      <span className="text-[10px] font-black uppercase whitespace-nowrap ml-auto">⏱️ {path.estimatedTime}</span>
                    </div>

                    <Link
                      to={`/learning-paths?category=${path.category}`}
                      className="mt-auto flex items-center justify-center gap-3 w-full bg-white text-slate-900 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                    >
                      Boot Path
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && ((activeTab === 'problems' && problems.length === 0) || (activeTab === 'courses' && courses.length === 0) || (activeTab === 'paths' && learningPaths.length === 0)) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-32 bg-white dark:bg-slate-800 rounded-[4rem] shadow-2xl border border-slate-100 dark:border-slate-700"
            >
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">🧩</div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-4">Neural Data Insufficient</h2>
              <p className="max-w-md mx-auto text-slate-500 font-bold uppercase tracking-widest text-[10px] leading-loose">
                Engage with more platform nodes to generate a comprehensive behavioral vector for personalized recommendations.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Recommendations;

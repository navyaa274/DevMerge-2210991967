import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  SparklesIcon,
  BookOpenIcon,
  InformationCircleIcon,
  AcademicCapIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  Bars3BottomLeftIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';
import { useNavigate, Link } from 'react-router-dom';

export default function CreateCourse() {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    semester: '',
    credits: 3
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/courses`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        navigate('/faculty/courses');
      }, 2000);
    } catch (error) {
      console.error('Error creating course:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-6 py-12 md:p-12 lg:p-16 max-w-[1400px] mx-auto min-h-screen pt-24 md:pt-32 font-sans bg-slate-50 dark:bg-[#020617]"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 lg:mb-24 gap-12">
        <div className="max-w-3xl">
          <Link to="/faculty/courses" className="inline-flex items-center gap-3 text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em] mb-10 hover:text-indigo-600 transition-all italic group bg-white dark:bg-slate-900/50 px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
            <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
            Return to Intelligence Command
          </Link>
          <div className="flex items-center gap-4 mb-6">
            <span className="px-5 py-2 bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em] border border-indigo-500/20 rounded-full flex items-center gap-3 italic">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
              Sector Provisioning Protocol
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.85] italic">
            Sector <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-500/30 decoration-[12px] underline-offset-[12px]">Initialization</span>
          </h1>
          <p className="text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.3em] text-[11px] mt-10 flex items-center gap-3 italic bg-indigo-500/5 px-6 py-2.5 rounded-full border border-indigo-500/10 w-fit">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(79,70,229,0.6)]"></span>
            Defining New Pedagogy Vector
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
        <div className="lg:col-span-12 xl:col-span-8">
          {/* Form Card */}
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-2xl rounded-[3.5rem] md:rounded-[4.5rem] p-10 md:p-16 lg:p-24 shadow-3xl border border-slate-200 dark:border-slate-800 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-bl-[8rem] -mr-16 -mt-16 group-hover:scale-110 group-hover:bg-indigo-600/10 transition-all duration-1000 pointer-events-none" />

            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-16 flex items-center gap-6">
              <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-sm">
                <BookOpenIcon className="w-10 h-10 text-indigo-500" />
              </div>
              Curricular Node Profile
            </h2>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="mb-16 p-10 bg-emerald-500/10 border-l-[12px] border-emerald-500 rounded-[3rem] text-emerald-600 dark:text-emerald-400 font-black text-sm uppercase tracking-[0.3em] shadow-2xl flex items-center gap-8 italic shadow-emerald-500/10 backdrop-blur-xl border border-emerald-500/20"
                >
                  <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg animate-bounce">
                    <SparklesIcon className="w-8 h-8 text-white" />
                  </div>
                  Sector Provisioning Successful. Synchronizing Matrix...
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="space-y-5">
                <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em] px-8 italic">Operational Title</label>
                <div className="relative group/input">
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 group-focus-within/input:scale-110 transition-all duration-500 pointer-events-none">
                    <Bars3BottomLeftIcon className="w-8 h-8" />
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="E.G. ADVANCED NEURAL NETWORKS"
                    className="w-full pl-24 pr-12 py-8 rounded-[3rem] bg-slate-50 dark:bg-slate-950/50 border-4 border-slate-100 dark:border-slate-800 focus:border-indigo-500/50 text-xl font-black text-slate-900 dark:text-white transition-all duration-500 focus:ring-[20px] ring-indigo-500/5 placeholder:opacity-20 placeholder:italic italic uppercase tracking-tight shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-5">
                <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em] px-8 italic">Pedagogical Description</label>
                <div className="relative group/input">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="DEFINE THE SECTOR MISSION SCOPE, LEARNING OUTCOMES, AND CORE DOMAIN KNOWLEDGE..."
                    rows="6"
                    className="w-full px-12 py-12 rounded-[3.5rem] bg-slate-50 dark:bg-slate-950/50 border-4 border-slate-100 dark:border-slate-800 focus:border-indigo-500/50 text-base md:text-lg font-black text-slate-900 dark:text-white transition-all duration-500 focus:ring-[20px] ring-indigo-500/5 placeholder:opacity-20 placeholder:italic italic uppercase tracking-tight leading-relaxed resize-none shadow-inner"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-5">
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em] px-8 italic">Identifier Node (Code)</label>
                  <div className="relative group/input">
                    <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-500 group-focus-within/input:scale-110 transition-all duration-500 pointer-events-none">
                      <FingerPrintIcon className="w-8 h-8" />
                    </div>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="E.G. AI-402"
                      className="w-full pl-24 pr-12 py-8 rounded-[3rem] bg-slate-50 dark:bg-slate-950/50 border-4 border-slate-100 dark:border-slate-800 focus:border-indigo-500/50 text-xl font-black text-slate-900 dark:text-white transition-all duration-500 focus:ring-[20px] ring-indigo-500/5 placeholder:opacity-20 placeholder:italic italic uppercase tracking-tight shadow-inner"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-5">
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em] px-8 italic">Temporal Semesters</label>
                  <input
                    type="text"
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    placeholder="FALL 2024 / NODE-02"
                    className="w-full px-12 py-8 rounded-[3rem] bg-slate-50 dark:bg-slate-950/50 border-4 border-slate-100 dark:border-slate-800 focus:border-indigo-500/50 text-xl font-black text-slate-900 dark:text-white transition-all duration-500 focus:ring-[20px] ring-indigo-500/5 placeholder:opacity-20 placeholder:italic italic uppercase tracking-tight text-center shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.4em] px-8 italic">Academic Weight (Credits)</label>
                <div className="flex items-center gap-6">
                  {[1, 2, 3, 4].map(num => (
                    <motion.button
                      key={num}
                      type="button"
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({ ...formData, credits: num })}
                      className={`flex-1 py-8 rounded-[2rem] md:rounded-[2.5rem] text-3xl font-black transition-all duration-500 border-4 italic shadow-sm ${formData.credits === num ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_20px_50px_rgba(79,70,229,0.4)]' : 'bg-white dark:bg-slate-950/50 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-indigo-500/30'}`}
                    >
                      {num}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-16 py-10 bg-indigo-600 hover:bg-slate-950 text-white rounded-[3rem] md:rounded-[4.5rem] font-black uppercase tracking-[0.5em] text-xs md:text-sm shadow-[0_30px_60px_rgba(79,70,229,0.5)] transition-all duration-500 flex items-center justify-center gap-6 italic disabled:opacity-50 group/submit border-2 border-transparent hover:border-indigo-500/30"
              >
                {loading ? (
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Initialize Curricular Node
                    <div className="p-2 bg-white/20 rounded-xl group-hover/submit:rotate-90 transition-transform">
                      <PlusIcon className="w-8 h-8" />
                    </div>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Side Guidance */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-12">
          <div className="bg-slate-950 rounded-[3.5rem] md:rounded-[4.5rem] p-12 md:p-16 text-white relative overflow-hidden group border border-white/5 shadow-3xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:scale-150 transition-all duration-1000"></div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-12 flex items-center gap-5">
              <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                <InformationCircleIcon className="w-8 h-8 text-indigo-400" />
              </div>
              Matrix Protocol
            </h3>
            <ul className="space-y-10">
              {[
                'IDENTIFIERS MUST BE GLOBALLY UNIQUE WITHIN THE FACULTY SECTOR.',
                'MISSION STATEMENTS DEFINE THE AI PEDAGOGY COPILOT PARAMETERS.',
                'WEIGHTING INFLUENCES THE SEMESTER LOAD CALCULATION ENGINE.',
                'TEMPORAL LOCKS ARE APPLIED AFTER SECTOR INITIALIZATION.'
              ].map((text, i) => (
                <li key={i} className="flex gap-6 items-start group/li">
                  <span className="w-8 h-8 flex-shrink-0 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center text-[11px] font-black italic mt-1 group-hover/li:bg-indigo-600 group-hover/li:text-white transition-all duration-500 border border-indigo-500/30">{i + 1}</span>
                  <p className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200 uppercase tracking-[0.2em] leading-relaxed italic transition-colors duration-500">{text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-950 rounded-[3.5rem] md:rounded-[4.5rem] p-12 md:p-16 text-white shadow-3xl relative overflow-hidden group border border-white/5">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] group-hover:scale-150 transition-all duration-1000"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="p-5 bg-white/10 rounded-[2rem] backdrop-blur-xl border border-white/10 mb-8 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
                <SparklesIcon className="w-16 h-16 text-indigo-300" />
              </div>
              <p className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-6">AI Ready Sector</p>
              <p className="text-[11px] md:text-xs font-bold text-indigo-100 uppercase tracking-[0.3em] leading-relaxed opacity-80 italic">Initializing this node activates the Copilot Intelligence Layer for this specific course ID.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>

  );
}

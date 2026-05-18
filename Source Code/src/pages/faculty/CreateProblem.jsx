import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import {
  PlusIcon,
  SparklesIcon,
  CodeBracketIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CpuChipIcon,
  BeakerIcon,
  EyeSlashIcon,
  TrashIcon,
  VariableIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

export default function CreateProblem() {
  const { token } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Medium',
    topics: [],
    constraints: '',
    examples: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', output: '', isHidden: false }],
    timeLimit: 1000,
    memoryLimit: 256
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleArrayChange = (index, field, value, arrayName) => {
    const newArray = [...formData[arrayName]];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData({ ...formData, [arrayName]: newArray });
  };

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { input: '', output: '', explanation: '' }]
    });
  };

  const removeExample = (idx) => {
    if (formData.examples.length <= 1) return;
    setFormData({
      ...formData,
      examples: formData.examples.filter((_, i) => i !== idx)
    });
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: '', output: '', isHidden: false }]
    });
  };

  const removeTestCase = (idx) => {
    if (formData.testCases.length <= 1) return;
    setFormData({
      ...formData,
      testCases: formData.testCases.filter((_, i) => i !== idx)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE_URL}/problems`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        difficulty: 'Medium',
        topics: [],
        constraints: '',
        examples: [{ input: '', output: '', explanation: '' }],
        testCases: [{ input: '', output: '', isHidden: false }],
        timeLimit: 1000,
        memoryLimit: 256
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 py-8 md:p-8 lg:p-12 max-w-[1400px] mx-auto min-h-screen pt-24 md:pt-32 font-sans"
    >
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-12 lg:mb-20 gap-8">
        <div className="w-full xl:w-auto">
          <Link to="/faculty/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 hover:text-indigo-600 transition-colors italic group">
            <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Return to Intelligence Command
          </Link>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
            Algorithmic <span className="text-indigo-600">Forge</span>
          </h1>
          <p className="text-indigo-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-4 flex items-center gap-2 italic">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.3)]"></span>
            Initializing New Logic Protocol
          </p>
        </div>

        <div className="flex gap-4">
          {['Easy', 'Medium', 'Hard'].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => setFormData({ ...formData, difficulty: d })}
              className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.difficulty === d ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 ring-4 ring-indigo-500/10' : 'bg-white dark:bg-dark-900 text-slate-400 border border-slate-100 dark:border-dark-800'}`}
            >
              {d} NODE
            </button>
          ))}
        </div>
      </div>

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-8 bg-emerald-50 dark:bg-emerald-950/20 border-l-8 border-emerald-500 rounded-3xl text-emerald-700 dark:text-emerald-400 font-black text-sm uppercase tracking-widest flex items-center gap-6 italic shadow-xl"
        >
          <SparklesIcon className="w-8 h-8 flex-shrink-0 animate-bounce" />
          SYSTEM_SUCCESS: LOGIC NODE INITIALIZED AND SYNCHRONIZED TO GLOBAL MATRIX
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 p-8 bg-rose-50 dark:bg-rose-950/20 border-l-8 border-rose-500 rounded-3xl text-rose-700 dark:text-rose-400 font-black text-sm uppercase tracking-widest flex items-center gap-6 italic shadow-xl"
        >
          <ExclamationTriangleIcon className="w-8 h-8 flex-shrink-0" />
          SYSTEM_FAIL: {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12 md:space-y-20">
        {/* Primary Profile Section */}
        <div className="bg-white dark:bg-dark-900 rounded-[3.5rem] md:rounded-[4.5rem] p-8 md:p-14 lg:p-20 shadow-3xl border border-slate-50 dark:border-dark-800 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-bl-[8rem] -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />

          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-16 flex items-center gap-5">
            <CodeBracketIcon className="w-10 h-10 text-indigo-600" /> Protocol Metadata
          </h2>

          <div className="space-y-12">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-6 italic">Problem Identifier (Title)</label>
              <div className="relative group/input">
                <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors pointer-events-none">
                  <VariableIcon className="w-7 h-7" />
                </div>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="E.G. BINARY SEARCH OPTIMIZATION VECTOR"
                  className="w-full pl-20 pr-10 py-8 rounded-[2.5rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-indigo-500/30 text-xl font-black text-slate-900 dark:text-white transition-all focus:ring-8 ring-indigo-500/5 placeholder:opacity-20 placeholder:italic italic uppercase tracking-tight"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-6 italic">Problem Architecture (Description)</label>
              <div className="relative group/input">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="DESCRIBE THE ALGORITHMIC CHALLENGE, OBJECTIVES, AND CORE LOGIC REQUIREMENTS..."
                  rows="8"
                  className="w-full px-10 py-10 rounded-[3rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-indigo-500/30 text-base font-black text-slate-900 dark:text-white transition-all focus:ring-8 ring-indigo-500/5 placeholder:opacity-20 placeholder:italic italic uppercase tracking-tight leading-relaxed resize-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-6 italic">Constraints</label>
                <input
                  type="text"
                  name="constraints"
                  value={formData.constraints}
                  onChange={handleChange}
                  placeholder="1 <= N <= 10^5"
                  className="w-full px-10 py-6 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-indigo-500/30 text-sm font-black text-slate-900 dark:text-white transition-all focus:ring-8 ring-indigo-500/5 italic text-center"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-6 italic">Time Limit (MS)</label>
                <div className="relative">
                  <ClockIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                  <input
                    type="number"
                    name="timeLimit"
                    value={formData.timeLimit}
                    onChange={handleChange}
                    className="w-full pl-16 pr-10 py-6 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-indigo-500/30 text-sm font-black text-slate-900 dark:text-white transition-all focus:ring-8 ring-indigo-500/5 italic text-center"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-6 italic">Memory Limit (MB)</label>
                <div className="relative">
                  <CpuChipIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                  <input
                    type="number"
                    name="memoryLimit"
                    value={formData.memoryLimit}
                    onChange={handleChange}
                    className="w-full pl-16 pr-10 py-6 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-indigo-500/30 text-sm font-black text-slate-900 dark:text-white transition-all focus:ring-8 ring-indigo-500/5 italic text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Examples Section */}
        <div className="space-y-10">
          <div className="flex justify-between items-center px-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-5">
              <LightBulbIcon className="w-10 h-10 text-amber-500" /> Scenario Examples
            </h2>
            <button
              type="button"
              onClick={addExample}
              className="bg-white dark:bg-dark-900 p-5 rounded-3xl shadow-xl border border-slate-100 dark:border-dark-800 text-indigo-600 hover:scale-110 transition-all group"
            >
              <PlusIcon className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            <AnimatePresence>
              {formData.examples.map((ex, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white dark:bg-dark-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border border-slate-50 dark:border-dark-800 relative group/card"
                >
                  <button
                    type="button"
                    onClick={() => removeExample(idx)}
                    className="absolute top-8 right-8 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover/card:opacity-100"
                  >
                    <TrashIcon className="w-6 h-6" />
                  </button>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-10 italic"># EXAMPLE VECTOR 0{idx + 1}</p>

                  <div className="space-y-8">
                    <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-2xl border border-slate-100 dark:border-dark-800">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block">Input Node</label>
                      <input
                        type="text"
                        value={ex.input}
                        onChange={(e) => handleArrayChange(idx, 'input', e.target.value, 'examples')}
                        placeholder="Standard input string/integer..."
                        className="w-full bg-transparent text-sm font-mono text-indigo-600 outline-none placeholder:opacity-20 italic font-bold"
                      />
                    </div>
                    <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-2xl border border-slate-100 dark:border-dark-800">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 block">Output Node</label>
                      <input
                        type="text"
                        value={ex.output}
                        onChange={(e) => handleArrayChange(idx, 'output', e.target.value, 'examples')}
                        placeholder="Expected result format..."
                        className="w-full bg-transparent text-sm font-mono text-emerald-600 outline-none placeholder:opacity-20 italic font-bold"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] block px-2">Logic Explanation</label>
                      <textarea
                        value={ex.explanation}
                        onChange={(e) => handleArrayChange(idx, 'explanation', e.target.value, 'examples')}
                        placeholder="Explain why this input leads to this output..."
                        rows="3"
                        className="w-full px-6 py-6 rounded-2xl bg-slate-50 dark:bg-dark-950 border border-transparent focus:border-indigo-500/20 text-xs font-bold text-slate-500 outline-none resize-none italic"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Test Cases Section */}
        <div className="space-y-10">
          <div className="flex justify-between items-center px-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-5">
              <BeakerIcon className="w-10 h-10 text-emerald-500" /> Evaluation Matrix
            </h2>
            <button
              type="button"
              onClick={addTestCase}
              className="bg-slate-900 p-5 rounded-3xl shadow-xl text-white hover:scale-110 transition-all group"
            >
              <PlusIcon className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <div className="space-y-6">
            <AnimatePresence>
              {formData.testCases.map((tc, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white dark:bg-dark-900 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl border border-slate-50 dark:border-dark-800 flex flex-col md:flex-row items-center gap-10 relative group/tc"
                >
                  <div className="absolute top-6 left-6 text-[8px] font-black text-slate-200 uppercase tracking-widest italic group-hover/tc:text-indigo-200 transition-colors">T_CASE_0{idx + 1}</div>

                  <div className="grow grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-2xl border border-slate-100 dark:border-dark-800">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 block">System Input</label>
                      <input
                        type="text"
                        value={tc.input}
                        onChange={(e) => handleArrayChange(idx, 'input', e.target.value, 'testCases')}
                        className="w-full bg-transparent text-sm font-mono text-slate-900 dark:text-white outline-none italic font-bold uppercase tracking-widest"
                      />
                    </div>
                    <div className="bg-slate-50 dark:bg-dark-950 p-6 rounded-2xl border border-slate-100 dark:border-dark-800">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 block">Expected Output</label>
                      <input
                        type="text"
                        value={tc.output}
                        onChange={(e) => handleArrayChange(idx, 'output', e.target.value, 'testCases')}
                        className="w-full bg-transparent text-sm font-mono text-slate-900 dark:text-white outline-none italic font-bold uppercase tracking-widest"
                      />
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center gap-4 shrink-0 w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 dark:border-dark-800 px-6">
                    <button
                      type="button"
                      onClick={() => handleArrayChange(idx, 'isHidden', !tc.isHidden, 'testCases')}
                      className={`flex-1 md:w-full p-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${tc.isHidden ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 dark:bg-dark-950 text-slate-300'}`}
                    >
                      <EyeSlashIcon className="w-5 h-5" />
                      <span className="text-[8px] font-black uppercase tracking-widest italic">{tc.isHidden ? 'HIDDEN_ACTIVE' : 'VISIBILITY_OFF'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTestCase(idx)}
                      className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Global Submit Action */}
        <div className="pt-20 pb-32 flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-24 py-10 bg-indigo-600 hover:bg-slate-900 text-white rounded-[3rem] md:rounded-[4rem] font-black uppercase tracking-[0.5em] text-sm md:text-base shadow-[0_20px_80px_-15px_rgba(79,70,229,0.5)] transition-all transform hover:-translate-y-4 flex items-center justify-center gap-8 italic group/forge"
          >
            {loading ? (
              <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                FORGE ALGORITHMIC NODE
                <SparklesIcon className="w-10 h-10 group-hover/forge:rotate-180 transition-transform duration-700" />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

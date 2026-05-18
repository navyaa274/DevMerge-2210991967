import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-dark-900 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_100%)] relative overflow-hidden py-12 md:py-24">
      {/* Background Matrix Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-40"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59,130,246,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 md:mb-24"
        >
          <p className="text-blue-600 dark:text-blue-500 font-bold tracking-widest uppercase text-[10px] md:text-sm mb-4">The Neural Infrastructure</p>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
            About <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-500">DevMerge</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-blue-500/5 border border-slate-100 dark:border-dark-700 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-[100px] -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-dark-900 text-blue-600 flex items-center justify-center text-2xl font-black mb-8 border border-blue-100 dark:border-dark-700">👁️</div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Vision Protocol</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed text-sm md:text-base">
              To revolutionize computer science education by providing a unified, cybernetic platform that fuses continuous assessment, integrated development environments, and real-time collaborative matrices into one seamless experience.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-indigo-500/5 border border-slate-100 dark:border-dark-700 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-[100px] -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-dark-900 text-indigo-600 flex items-center justify-center text-2xl font-black mb-8 border border-indigo-100 dark:border-dark-700">🎯</div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Mission Objective</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed text-sm md:text-base">
              Establish a hyper-connected nexus that empowers students and faculty with the highest fidelity tools. Bridge the gap between static theoretical knowledge and high-performance, practical coding synthesis.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-8 lg:mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900 text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2)_0%,transparent_70%)] opacity-50"></div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-8 relative z-10 flex items-center gap-4">
              <span className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl">⚡</span> Stack Architecture
            </h2>
            <ul className="space-y-4 relative z-10">
              {['React Ecosystem & Tailwind UI', 'Node.js & Express API', 'MongoDB Data Clustering', 'Real-time WebSocket Comms', 'Secure JWT Authorization'].map((tech, i) => (
                <li key={i} className="flex items-center gap-4 text-sm font-bold text-slate-300">
                  <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-blue-400">0{i + 1}</div>
                  {tech}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-rose-500/5 border border-slate-100 dark:border-dark-700"
          >
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
              <span className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-900/20 flex items-center justify-center text-xl">🛡️</span> Security Protocols
            </h2>
            <ul className="space-y-4">
              {['End-to-end payload encryption', 'Strict API Rate-Limiting Nodes', 'Role-based network access', 'Cloud redundancy matrices', 'Data integrity monitoring'].map((sec, i) => (
                <li key={i} className="flex items-center gap-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-rose-500 mt-0.5 animate-pulse"></div>
                  {sec}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

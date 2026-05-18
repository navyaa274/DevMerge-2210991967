import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import {
  CpuChipIcon,
  AcademicCapIcon,
  UserGroupIcon,
  SparklesIcon,
  ArrowRightIcon,
  CodeBracketIcon,
  CommandLineIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const dashboardPath = user.role === 'super_admin' ? '/super-admin/dashboard' : `/${user.role}/dashboard`;
      navigate(dashboardPath);
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 overflow-hidden relative font-sans">

      {/* Immersive Background Nodes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-800 opacity-[0.05] dark:opacity-[0.1]"></div>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.15, 0.05],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600 rounded-full blur-[180px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-dark-950/50 dark:to-dark-950"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-32 pb-20 md:pt-48 md:pb-32 lg:pt-56 lg:pb-40 text-center max-w-[1700px] mx-auto">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/50 dark:bg-dark-900/50 backdrop-blur-xl rounded-full border border-slate-200 dark:border-dark-800 mb-10 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-indigo-500/30 transition-colors group">
            <SparklesIcon className="w-5 h-5 text-indigo-600 animate-pulse" />
            <span className="text-[10px] md:text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.3em] italic group-hover:tracking-[0.4em] transition-all">Next-Gen Intelligence Matrix • v2.0 Live</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-[0.9] text-center mb-10">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 animate-gradient-x">LEARN.</span> <span className="text-slate-200 dark:text-dark-800">CODE.</span> <br />
            COLLABORATE.
          </h1>

          <p className="text-lg md:text-2xl lg:text-3xl text-slate-500 dark:text-slate-400 mb-14 max-w-3xl mx-auto font-bold uppercase tracking-tight italic leading-snug opacity-80">
            The definitive neural infrastructure for institutional coding excellence. Engineered for elite performance, predictive analytics, and seamless collaboration.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {user ? (
              <Link to={user.role === 'super_admin' ? '/super-admin/dashboard' : `/${user.role}/dashboard`} className="w-full sm:w-auto px-12 py-6 bg-slate-900 text-white dark:bg-white dark:text-dark-950 rounded-[2rem] md:rounded-[3rem] font-black uppercase tracking-[0.2em] text-xs md:text-sm shadow-3xl shadow-slate-900/20 dark:shadow-white/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 italic group">
                Enter Dashboard Control
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="w-full sm:w-auto px-12 py-6 bg-indigo-600 text-white rounded-[2rem] md:rounded-[3rem] font-black uppercase tracking-[0.2em] text-xs md:text-sm shadow-3xl shadow-indigo-600/30 hover:bg-slate-900 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 italic group">
                  Initialize Terminal
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
                <Link to="/login" className="w-full sm:w-auto px-12 py-6 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl text-slate-900 dark:text-white rounded-[2rem] md:rounded-[3rem] font-black uppercase tracking-[0.2em] text-xs md:text-sm shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-800 transition-all italic">
                  Node Authentication
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Feature Grids */}
      <section className="relative z-10 px-6 py-20 lg:py-40 max-w-[1700px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {[
            {
              icon: <CommandLineIcon />,
              title: "Neural Sandbox",
              text: "Advanced algorithm terminal with real-time complexity analysis and automated testing matrices.",
              color: "indigo"
            },
            {
              icon: <AcademicCapIcon />,
              title: "AI Pedagogics",
              text: "Predictive curriculum flow and automated cognitive load evaluation for personalized learning paths.",
              color: "violet"
            },
            {
              icon: <UserGroupIcon />,
              title: "Collective Synergies",
              text: "High-level networking with multi-cursor collaboration vectors and global institutional leaderboards.",
              color: "emerald"
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -15 }}
              className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-2xl p-10 md:p-14 rounded-[3.5rem] md:rounded-[4.5rem] shadow-3xl border border-white/20 dark:border-dark-800 relative group overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${feature.color}-600/5 rounded-bl-[5rem] -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-700`}></div>

              <div className={`p-5 bg-${feature.color}-50 dark:bg-${feature.color}-900/20 text-${feature.color}-600 rounded-[1.5rem] md:rounded-[2rem] w-fit mb-10 group-hover:rotate-12 transition-transform shadow-xl shadow-${feature.color}-500/10`}>
                {React.cloneElement(feature.icon, { className: "w-8 h-8 md:w-10 md:h-10" })}
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter italic">{feature.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-bold leading-relaxed uppercase tracking-tight italic opacity-80">
                {feature.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Global Impact Matrix (Stats) */}
      <section className="relative z-10 py-32 md:py-48 px-6 bg-slate-900 dark:bg-dark-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.15)_0%,transparent_70%)]"></div>
        <div className="max-w-[1700px] mx-auto relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter italic leading-none mb-6">Global Institutional <span className="text-indigo-500">Reach</span></h2>
            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.5em] italic">System Performance Metrix • Real-Time Uplink</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-20 text-center">
            {[
              { label: "Active Network Nodes", val: "10K+", color: "from-blue-400 to-indigo-500" },
              { label: "Vector Logic Nodes", val: "850+", color: "from-emerald-400 to-teal-500" },
              { label: "Placement Success Engined", val: "99.2%", color: "from-violet-400 to-fuchsia-500" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative group"
              >
                <div className="text-6xl md:text-7xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r italic tracking-tighter leading-none mb-8 filter drop-shadow-2xl" style={{ backgroundImage: `linear-gradient(to right, ${stat.color})` }}>
                  {stat.val}
                </div>
                <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] italic mb-2">{stat.label}</p>
                <div className="w-12 h-1 bg-white/10 mx-auto rounded-full group-hover:w-24 transition-all duration-500"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Decorative Footer Uplink */}
      <div className="relative py-20 px-6 text-center border-t border-slate-100 dark:border-dark-900 bg-white/50 dark:bg-transparent backdrop-blur-xl">
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
          <div className="flex items-center gap-3">
            <GlobeAltIcon className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">NEURAL NETWORKS</span>
          </div>
          <div className="flex items-center gap-3">
            <CodeBracketIcon className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">QUANTUM LOGIC</span>
          </div>
          <div className="flex items-center gap-3">
            <CpuChipIcon className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">AI COPROCESSORS</span>
          </div>
        </div>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.6em] mt-16 italic opacity-50 underline decoration-dotted underline-offset-8">Designed for Institutional Excellence · DevMerge © 2026</p>
      </div>
    </div>
  );
}

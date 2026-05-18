import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Initializing Node Verification Protocol...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.post(`${API_BASE_URL}/auth/verify-email`, { token });
        setStatus('success');
        setMessage('Network Identity Validated. Your access vector is now active.');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification Protocol Failure. Structural integrity compromised.');
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Unidentified Verification Vector. Request Aborted.');
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-4 relative overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -90, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600 rounded-full blur-[120px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full relative z-10"
      >
        {/* Logo/Brand Area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-500/30 mb-6 group hover:rotate-12 transition-transform duration-500">
            <ShieldCheckIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
            Dev<span className="text-indigo-600">Merge</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 italic">
            Identity Synchronization
          </p>
        </div>

        {/* Verification Card */}
        <div className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-3xl border border-white/20 dark:border-dark-800 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[4rem] pointer-events-none"></div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-8 flex items-center gap-3">
            <SparklesIcon className="w-6 h-6 text-indigo-600" /> Protocol Status
          </h2>

          <div className="text-center space-y-8">
            {status === 'verifying' && (
              <div className="py-10">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-8 shadow-lg"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse italic">{message}</p>
              </div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-6"
              >
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <CheckCircleIcon className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-3">
                  Identity Verified
                </h3>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed italic max-w-xs mx-auto mb-8">
                  {message} Redirecting to secure uplink...
                </p>
                <div className="w-full bg-slate-100 dark:bg-dark-950 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3 }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                  <ExclamationCircleIcon className="w-10 h-10 text-rose-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-3">
                  Verification Failure
                </h3>
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest leading-relaxed italic max-w-xs mx-auto mb-10">
                  {message}
                </p>
                <Link
                  to="/register"
                  className="w-full bg-indigo-600 hover:bg-slate-900 text-white py-5 md:py-6 rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-2xl shadow-indigo-600/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 group/btn italic"
                >
                  Back to Registration
                  <ArrowRightIcon className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        {/* System Status Display (for aesthetic) */}
        <div className="mt-12 flex justify-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Mainframe: Nominal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Layer: Identity</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

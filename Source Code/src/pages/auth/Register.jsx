import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { motion } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  SparklesIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Password synchronization failure');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, formData);
      login(response.data.data.user, response.data.data.tokens.authToken);

      const roleRoutes = {
        student: '/student/dashboard',
        faculty: '/faculty/dashboard',
        admin: '/admin/dashboard',
        super_admin: '/super-admin/dashboard'
      };
      navigate(roleRoutes[response.data.data.user.role] || '/');
    } catch (err) {
      const errorMessage = err.response?.data?.errors
        ? err.response.data.errors.map(e => e.message).join(' | ')
        : err.response?.data?.message || 'Registration failure';
      setError(typeof errorMessage === 'string' ? errorMessage : errorMessage?.toString() || 'Registration failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950 p-4 relative overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, -45, 0],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600 rounded-full blur-[150px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 45, 0],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 rounded-full blur-[120px] pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full relative z-10 py-10"
      >
        {/* Logo/Brand Area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-[2.5rem] shadow-2xl shadow-emerald-500/30 mb-6 group hover:rotate-12 transition-transform duration-500">
            <SparklesIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
            Dev<span className="text-emerald-600">Merge</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3 italic">
            Initialize New Instance
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-2xl p-8 md:p-14 rounded-[3.5rem] shadow-3xl border border-white/20 dark:border-dark-800 relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-bl-[4rem] pointer-events-none"></div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-10 flex items-center gap-4">
            <UserIcon className="w-7 h-7 text-emerald-600" /> Instance Setup
          </h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-10 p-5 bg-rose-50 dark:bg-rose-950/20 border-l-8 border-rose-500 rounded-2xl text-rose-700 dark:text-rose-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-4 italic shadow-lg"
            >
              <ExclamationCircleIcon className="w-6 h-6 flex-shrink-0" />
              {typeof error === 'string' ? error : error?.toString() || 'Unknown error occurred'}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">First Identification</label>
                <div className="relative group/input">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-emerald-600 transition-colors">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="E.G. JOHN"
                    className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-emerald-500/30 text-sm font-black text-slate-900 dark:text-white transition-all focus:ring-4 ring-emerald-500/10 placeholder:opacity-30 placeholder:italic italic uppercase"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Surname Node</label>
                <div className="relative group/input">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-emerald-600 transition-colors">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="E.G. DOE"
                    className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-emerald-500/30 text-sm font-black text-slate-900 dark:text-white transition-all focus:ring-4 ring-emerald-500/10 placeholder:opacity-30 placeholder:italic italic uppercase"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Primary Network Address</label>
              <div className="relative group/input">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-emerald-600 transition-colors">
                  <EnvelopeIcon className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="EMAIL@UNIVERSITY-DOMAIN.NET"
                  className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-emerald-500/30 text-sm font-black text-slate-900 dark:text-white transition-all focus:ring-4 ring-emerald-500/10 placeholder:opacity-30 placeholder:italic italic"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Access Cipher</label>
                <div className="relative group/input">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-emerald-600 transition-colors">
                    <LockClosedIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-emerald-500/30 text-sm font-black text-slate-900 dark:text-white transition-all focus:ring-4 ring-emerald-500/10 placeholder:opacity-30 placeholder:italic italic"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Cipher Confirmation</label>
                <div className="relative group/input">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-emerald-600 transition-colors">
                    <ShieldCheckIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-emerald-500/30 text-sm font-black text-slate-900 dark:text-white transition-all focus:ring-4 ring-emerald-500/10 placeholder:opacity-30 placeholder:italic italic"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Institutional Vector</label>
              <div className="relative group/input">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-emerald-600 transition-colors pointer-events-none">
                  <AcademicCapIcon className="w-5 h-5" />
                </div>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-emerald-500/30 text-sm font-black text-slate-900 dark:text-white transition-all focus:ring-4 ring-emerald-500/10 cursor-pointer appearance-none italic tracking-widest uppercase font-sans"
                >
                  <option value="student" className="font-black italic uppercase">Student / Node</option>
                  <option value="faculty" className="font-black italic uppercase">Senior Academic / Faculty</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 px-2">
              <input type="checkbox" required className="w-4 h-4 rounded border-slate-200 text-emerald-600 focus:ring-emerald-500 cursor-pointer" id="agree" />
              <label htmlFor="agree" className="text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600 transition-colors italic leading-relaxed">
                I authorize structural node initialization and adhere to the <span className="text-emerald-600 underline underline-offset-4 decoration-dotted">Matrix Protocols</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-slate-900 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-2xl shadow-emerald-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 group/btn italic disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Provision Account Instance
                  <ArrowRightIcon className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-slate-100 dark:border-dark-800 text-center relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
              Already Synced?
              <Link to="/login" className="ml-2 text-emerald-600 hover:text-emerald-700 underline decoration-dotted underline-offset-4">Authenticate Primary Node →</Link>
            </p>
          </div>
        </div>

        {/* Global Security Markers */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-12 opacity-40">
          <div className="flex items-center gap-2">
            <LockClosedIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">RSA-4096 ENCRYPTION</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">ISO-27001 COMPLIANT</span>
          </div>
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">AI-VERIFIED INTEGRITY</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

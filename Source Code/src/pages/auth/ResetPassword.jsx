import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { motion } from 'framer-motion';
import {
    LockClosedIcon,
    ArrowRightIcon,
    ShieldCheckIcon,
    ExclamationCircleIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Cipher synchronization failure');
            return;
        }

        setLoading(true);

        try {
            await axios.post(`${API_BASE_URL}/auth/reset-password`, {
                token,
                password: formData.password
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(typeof err.response?.data?.message === 'string' ? err.response?.data?.message : err.response?.data?.message?.toString() || 'Failed to sync new access cipher');
        } finally {
            setLoading(false);
        }
    };

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
                        Neural Encryption Reset
                    </p>
                </div>

                {/* Reset Password Card */}
                <div className="bg-white/80 dark:bg-dark-900/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-3xl border border-white/20 dark:border-dark-800 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-bl-[4rem] pointer-events-none"></div>

                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-8 flex items-center gap-3">
                        <LockClosedIcon className="w-6 h-6 text-indigo-600" /> Cipher Update
                    </h2>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-8 p-4 bg-rose-50 dark:bg-rose-950/20 border-l-4 border-rose-500 rounded-xl text-rose-700 dark:text-rose-400 font-black text-[9px] uppercase tracking-widest flex items-center gap-3"
                        >
                            <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
                            {typeof error === 'string' ? error : error?.toString() || 'Unknown error occurred'}
                        </motion.div>
                    )}

                    {success ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                                Cipher Re-initialized
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed italic">
                                Your new access cipher has been successfully integrated into the neural matrix. Redirecting to uplink interface...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">New Access Cipher</label>
                                <div className="relative group/input">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors">
                                        <LockClosedIcon className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-16 pr-8 py-5 rounded-[1.5rem] md:rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-indigo-500/30 text-sm font-black text-slate-900 dark:text-white transition-all focus:ring-4 ring-indigo-500/10 placeholder:opacity-30 placeholder:italic italic"
                                        placeholder="••••••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">Confirm New Cipher</label>
                                <div className="relative group/input">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/input:text-indigo-600 transition-colors">
                                        <ShieldCheckIcon className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="w-full pl-16 pr-8 py-5 rounded-[1.5rem] md:rounded-[2rem] bg-slate-50 dark:bg-dark-950 border-2 border-transparent focus:border-indigo-500/30 text-sm font-black text-slate-900 dark:text-white transition-all focus:ring-4 ring-indigo-500/10 placeholder:opacity-30 placeholder:italic italic"
                                        placeholder="••••••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-slate-900 text-white py-5 md:py-6 rounded-[1.5rem] md:rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-2xl shadow-indigo-600/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 group/btn italic disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Update Access Cipher
                                        <ArrowRightIcon className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="mt-10 pt-8 border-t border-slate-100 dark:border-dark-800 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                            Abort Reset Operation?
                            <Link to="/login" className="ml-2 text-indigo-600 hover:text-indigo-700 underline decoration-dotted underline-offset-4">Cancel Procedure →</Link>
                        </p>
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
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Encryption: AES-256</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

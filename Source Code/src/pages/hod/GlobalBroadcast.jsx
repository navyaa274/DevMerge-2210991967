import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MegaphoneIcon, ExclamationTriangleIcon, SignalIcon, ShieldExclamationIcon, UsersIcon } from '@heroicons/react/24/outline';
import facultyService from '../../services/api/facultyService';
import toast from '../../utils/toast';

export default function GlobalBroadcast() {
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('critical');
    const [target, setTarget] = useState('all');
    const [isTransmitting, setIsTransmitting] = useState(false);
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState({
        studentsOnline: 0,
        facultyOnline: 0,
        labsRunning: 0,
        totalStudents: 1200,
        totalFaculty: 50,
        totalPossibleLabs: 500
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await facultyService.getBroadcastStats();
                if (res.success) {
                    setStats(res.data);
                }
            } catch (err) {
                console.warn("Telemetry offline:", err);
            }
        };

        const fetchHistory = async () => {
            try {
                const res = await facultyService.getBroadcastHistory();
                if (res.success) {
                    setHistory(res.data);
                }
            } catch (err) {
                console.warn("History offline:", err);
            }
        };

        fetchStats();
        fetchHistory();
        const interval = setInterval(() => {
            fetchStats();
            fetchHistory();
        }, 10000); // Pulse every 10s
        return () => clearInterval(interval);
    }, []);

    const handleBroadcast = async (e) => {
        e.preventDefault();
        setIsTransmitting(true);

        try {
            const res = await facultyService.deployGlobalBroadcast({ message, severity, target });
            if (res.success) {
                setMessage('');
                toast.success('Transmission successfully relayed to core routing nodes.');

                // Refresh history immediately
                const histRes = await facultyService.getBroadcastHistory();
                if (histRes.success) setHistory(histRes.data);
            }
        } catch (error) {
            console.error("Broadcast override failed:", error);
            toast.error(error.message || 'Transmission override failed. Check uplink.');
        } finally {
            setIsTransmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 md:p-8 lg:p-12 max-w-[1200px] mx-auto min-h-screen pt-20 md:pt-24 font-sans"
        >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
                <div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                        Global <span className={`${severity === 'critical' ? 'text-rose-600' : severity === 'warning' ? 'text-amber-500' : 'text-indigo-500'} transition-colors duration-500`}>Broadcast</span>
                    </h1>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs">
                        System-Wide Emergency Override & Push Notifications
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                <div className="lg:col-span-4 space-y-8">
                    {/* Telemetry Panel */}
                    <div className="bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-3xl border border-slate-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-8 relative z-10 flex items-center gap-3">
                            <SignalIcon className="w-6 h-6 text-indigo-500" /> Active Nodes
                        </h3>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">
                                    <span>Students Online</span>
                                    <span className="text-emerald-400">{stats.studentsOnline.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                                        style={{ width: `${Math.min((stats.studentsOnline / stats.totalStudents) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">
                                    <span>Faculty Online</span>
                                    <span className="text-indigo-400">{stats.facultyOnline.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all duration-1000"
                                        style={{ width: `${Math.min((stats.facultyOnline / stats.totalFaculty) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">
                                    <span>Labs Running</span>
                                    <span className="text-amber-400">{stats.labsRunning.toLocaleString()}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-1000"
                                        style={{ width: `${Math.min((stats.labsRunning / stats.totalPossibleLabs) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <form onSubmit={handleBroadcast} className="bg-white dark:bg-dark-900 rounded-[3rem] p-8 md:p-12 shadow-3xl border border-slate-50 dark:border-dark-800 relative z-10">

                        <div className="flex flex-wrap gap-4 mb-10">
                            <label className={`flex-1 min-w-[120px] cursor-pointer rounded-2xl border-2 p-4 transition-all flex flex-col items-center gap-2 ${severity === 'critical' ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400' : 'border-slate-100 dark:border-dark-800 text-slate-400 hover:border-slate-300'}`}>
                                <input type="radio" name="severity" value="critical" className="hidden" checked={severity === 'critical'} onChange={() => setSeverity('critical')} />
                                <ShieldExclamationIcon className="w-8 h-8" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center">Critical (Red Alert)</span>
                            </label>

                            <label className={`flex-1 min-w-[120px] cursor-pointer rounded-2xl border-2 p-4 transition-all flex flex-col items-center gap-2 ${severity === 'warning' ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400' : 'border-slate-100 dark:border-dark-800 text-slate-400 hover:border-slate-300'}`}>
                                <input type="radio" name="severity" value="warning" className="hidden" checked={severity === 'warning'} onChange={() => setSeverity('warning')} />
                                <ExclamationTriangleIcon className="w-8 h-8" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center">Warning (Amber)</span>
                            </label>

                            <label className={`flex-1 min-w-[120px] cursor-pointer rounded-2xl border-2 p-4 transition-all flex flex-col items-center gap-2 ${severity === 'info' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-slate-100 dark:border-dark-800 text-slate-400 hover:border-slate-300'}`}>
                                <input type="radio" name="severity" value="info" className="hidden" checked={severity === 'info'} onChange={() => setSeverity('info')} />
                                <MegaphoneIcon className="w-8 h-8" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-center">Info (Standard)</span>
                            </label>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 italic">Override Target</label>
                                <div className="flex bg-slate-100 dark:bg-slate-950 rounded-2xl p-1 border border-slate-200 dark:border-slate-800">
                                    <button type="button" onClick={() => setTarget('all')} className={`flex-1 py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${target === 'all' ? 'bg-white dark:bg-dark-900 shadow-md text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>All Connected Terminals</button>
                                    <button type="button" onClick={() => setTarget('students')} className={`flex-1 py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${target === 'students' ? 'bg-white dark:bg-dark-900 shadow-md text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>Students Only</button>
                                    <button type="button" onClick={() => setTarget('faculty')} className={`flex-1 py-3 px-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${target === 'faculty' ? 'bg-white dark:bg-dark-900 shadow-md text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>Faculty Only</button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 italic">Broadcast Payload</label>
                                <textarea
                                    rows="5"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Enter directive to push to all nodes..."
                                    className={`w-full bg-slate-50 dark:bg-dark-950 border-2 rounded-[2rem] px-6 py-5 text-slate-900 dark:text-white font-medium outline-none transition-colors shadow-inner resize-none
                                        ${severity === 'critical' ? 'border-rose-100 dark:border-rose-900 focus:border-rose-500' :
                                            severity === 'warning' ? 'border-amber-100 dark:border-amber-900 focus:border-amber-500' :
                                                'border-slate-200 dark:border-dark-800 focus:border-indigo-500'}
                                    `}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isTransmitting}
                                className={`w-full py-6 rounded-[2rem] font-black uppercase text-sm md:text-base tracking-[0.3em] flex items-center justify-center gap-3 italic transition-all shadow-2xl relative overflow-hidden
                                    ${isTransmitting
                                        ? 'bg-slate-300 dark:bg-dark-800 text-slate-500 cursor-not-allowed'
                                        : severity === 'critical' ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_30px_rgba(225,29,72,0.4)]' :
                                            severity === 'warning' ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-[0_0_30px_rgba(245,158,11,0.4)]' :
                                                'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)]'
                                    }
                                `}
                            >
                                {isTransmitting ? (
                                    <>
                                        <SignalIcon className="w-6 h-6 animate-pulse" /> Transmitting Directive...
                                    </>
                                ) : (
                                    <>
                                        <MegaphoneIcon className="w-6 h-6" /> Force Override
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Simulated Transmission Overlay (HOD Preview) */}
            <AnimatePresence>
                {isTransmitting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-50 pointer-events-none mix-blend-overlay ${severity === 'critical' ? 'bg-rose-600/20' : severity === 'warning' ? 'bg-amber-500/20' : 'bg-indigo-500/20'} animate-pulse`}
                    />
                )}
            </AnimatePresence>

            {/* Transmission History */}
            <div className="mt-20 lg:mt-32">
                <div className="flex items-center gap-4 mb-10">
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Transmission History</h2>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {history.length > 0 ? (
                        history.map((item, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={item._id}
                                className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-[2rem] p-6 flex flex-col md:flex-row gap-6 items-start md:items-center shadow-xl hover:shadow-2xl transition-all"
                            >
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.severity === 'critical' ? 'bg-rose-500/10 text-rose-600' :
                                        item.severity === 'warning' ? 'bg-amber-500/10 text-amber-600' :
                                            'bg-indigo-500/10 text-indigo-600'
                                    }`}>
                                    <SignalIcon className="w-6 h-6" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-1">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${item.severity === 'critical' ? 'bg-rose-600 text-white' :
                                                item.severity === 'warning' ? 'bg-amber-500 text-white' :
                                                    'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}>
                                            {item.severity}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </span>
                                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full">
                                            Role: {item.target}
                                        </span>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                                        {item.message}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end shrink-0 pl-12 border-l border-slate-100 dark:border-slate-800 hidden md:flex">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Authenticated Relay</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white italic">
                                        {item.sender?.name || 'Authorized HOD'}
                                    </span>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-slate-50 dark:bg-dark-950 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-dark-800">
                            <p className="text-slate-400 font-black uppercase tracking-widest italic">No transmissions found in core buffer</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}




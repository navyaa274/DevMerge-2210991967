import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BoltIcon,
    ArrowPathIcon,
    FireIcon,
    TrophyIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    RocketLaunchIcon
} from '@heroicons/react/24/outline';
import facultyService from '../../services/api/facultyService';
import toast from '../../utils/toast';

export default function GamificationOverride() {
    const [loading, setLoading] = useState(true);
    const [multiplier, setMultiplier] = useState(1.0);
    const [duration, setDuration] = useState(24);
    const [activeQuests, setActiveQuests] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);

    // Zero-Day Quest Form
    const [questForm, setQuestForm] = useState({
        title: '',
        description: '',
        difficulty: 'Medium',
        baseXp: 500,
        timeLimitMinutes: 120,
        multiplier: 2.0,
        colorTheme: 'indigo',
        tags: 'algorithm, debugging'
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await facultyService.getGamificationConfig();
            if (res.success) {
                setMultiplier(res.data.config.globalXpMultiplier);
                setActiveQuests(res.data.activeQuests);
            }
        } catch (err) {
            console.error("Failed to fetch gamification config:", err);
            toast.error("Telemetry link unstable. Re-calibrating...");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateMultiplier = async () => {
        setIsUpdating(true);
        try {
            const res = await facultyService.updateGamificationMultiplier({
                multiplier,
                durationHours: duration
            });
            if (res.success) {
                toast.success(`Global XP Multiplier set to ${multiplier}x for ${duration} hours.`);
            }
        } catch (err) {
            toast.error("Override rejected by student matrices.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeployQuest = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const payload = {
                ...questForm,
                tags: questForm.tags.split(',').map(t => t.trim())
            };
            const res = await facultyService.deployZeroDayQuest(payload);
            if (res.success) {
                toast.success("Zero-Day Quest deployed to student nodes!");
                setQuestForm({
                    title: '',
                    description: '',
                    difficulty: 'Medium',
                    baseXp: 500,
                    timeLimitMinutes: 120,
                    multiplier: 2.0,
                    colorTheme: 'indigo',
                    tags: 'algorithm, debugging'
                });
                fetchConfig();
            }
        } catch (err) {
            toast.error("Quest deployment failed check.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <BoltIcon className="w-12 h-12 text-yellow-500" />
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-6 py-12 md:p-12 lg:p-16 max-w-[1600px] mx-auto min-h-screen font-sans"
        >
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
                <div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                        Variable <span className="text-yellow-500">Overrides</span>
                    </h1>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">
                        Institutional Gamification & Incentive Engine
                    </p>
                </div>
                <div className="flex gap-4">
                    <button onClick={fetchConfig} className="p-4 rounded-2xl bg-white dark:bg-dark-800 shadow-xl text-slate-400 hover:text-indigo-500 transition-all border border-slate-100 dark:border-dark-700">
                        <ArrowPathIcon className="w-6 h-6" />
                    </button>
                    <div className="px-6 py-4 rounded-2xl bg-indigo-600 text-white flex items-center gap-3 shadow-2xl shadow-indigo-500/20">
                        <ShieldCheckIcon className="w-6 h-6" />
                        <span className="font-black uppercase tracking-widest text-[10px]">Matrix: Stable</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Global Multiplier Panel */}
                <div className="xl:col-span-1 space-y-10">
                    <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-10 shadow-3xl border border-slate-50 dark:border-dark-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-yellow-500/10 blur-[80px] rounded-full group-hover:bg-yellow-500/20 transition-all"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-600">
                                    <FireIcon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Global XP Boost</h3>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                                        <span>Multiplier Magnitude</span>
                                        <span className="text-yellow-500">{multiplier}x</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="5"
                                        step="0.1"
                                        value={multiplier}
                                        onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                                        className="w-full accent-yellow-500 h-2 bg-slate-100 dark:bg-dark-800 rounded-full appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between mt-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span>1.0x (Standard)</span>
                                        <span>5.0x (Hyper)</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">Persistence Duration (Hours)</label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {[1, 6, 24, 48].map(h => (
                                            <button
                                                key={h}
                                                onClick={() => setDuration(h)}
                                                className={`py-3 rounded-xl font-black text-xs transition-all ${duration === h ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg' : 'bg-slate-50 dark:bg-dark-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-700'}`}
                                            >
                                                {h}H
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleUpdateMultiplier}
                                    disabled={isUpdating}
                                    className="w-full py-5 rounded-2xl bg-yellow-500 text-slate-900 font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-yellow-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    Engage Global Boost
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 dark:bg-black rounded-[3rem] p-10 border border-slate-800 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.1),transparent)] flex items-center justify-center opacity-50">
                            <div className="w-[300px] h-[300px] border border-white/5 rounded-full animate-ping"></div>
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <ClockIcon className="w-6 h-6 text-indigo-400" />
                                <h4 className="text-sm font-black uppercase tracking-widest italic">Temporal Status</h4>
                            </div>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
                                Current active multipliers reflect real-time engagement incentives assigned by the department head. Multipliers stack with Zero-Day Quests.
                            </p>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 block mb-2">Active Efficiency</span>
                                <span className="text-4xl font-black italic tracking-tighter">{(multiplier * 10).toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Zero-Day Quest Deployment */}
                <div className="xl:col-span-2">
                    <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-10 md:p-14 shadow-3xl border border-slate-50 dark:border-dark-800">
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600">
                                    <RocketLaunchIcon className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Deploy Zero-Day Quest</h3>
                            </div>
                        </div>

                        <form onSubmit={handleDeployQuest} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Quest Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Operation: Memory Leak"
                                        value={questForm.title}
                                        onChange={e => setQuestForm({ ...questForm, title: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-dark-800 border border-transparent focus:border-indigo-500/30 dark:focus:border-indigo-500/20 text-slate-900 dark:text-white font-bold transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Internal Description</label>
                                    <textarea
                                        required
                                        rows="4"
                                        placeholder="Define the objective for student nodes..."
                                        value={questForm.description}
                                        onChange={e => setQuestForm({ ...questForm, description: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-dark-800 border border-transparent focus:border-indigo-500/30 text-slate-900 dark:text-white font-bold transition-all resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Difficulty</label>
                                        <select
                                            value={questForm.difficulty}
                                            onChange={e => setQuestForm({ ...questForm, difficulty: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-dark-800 border border-transparent text-slate-900 dark:text-white font-bold transition-all appearance-none"
                                        >
                                            <option>Easy</option>
                                            <option>Medium</option>
                                            <option>Hard</option>
                                            <option>Expert</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Color Theme</label>
                                        <select
                                            value={questForm.colorTheme}
                                            onChange={e => setQuestForm({ ...questForm, colorTheme: e.target.value })}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-dark-800 border border-transparent text-slate-900 dark:text-white font-bold transition-all appearance-none"
                                        >
                                            <option value="rose">Red Alert</option>
                                            <option value="amber">Warm Warning</option>
                                            <option value="emerald">Green Stability</option>
                                            <option value="indigo">Core Blue</option>
                                            <option value="violet">Violet Shift</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Base XP Award</label>
                                        <input
                                            type="number"
                                            required
                                            value={questForm.baseXp}
                                            onChange={e => setQuestForm({ ...questForm, baseXp: parseInt(e.target.value) })}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-dark-800 border border-transparent text-slate-900 dark:text-white font-bold transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Quest Multiplier</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            required
                                            value={questForm.multiplier}
                                            onChange={e => setQuestForm({ ...questForm, multiplier: parseFloat(e.target.value) })}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-dark-800 border border-transparent text-slate-900 dark:text-white font-bold transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Time Limit (Minutes)</label>
                                    <input
                                        type="number"
                                        required
                                        value={questForm.timeLimitMinutes}
                                        onChange={e => setQuestForm({ ...questForm, timeLimitMinutes: parseInt(e.target.value) })}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-dark-800 border border-transparent text-slate-900 dark:text-white font-bold transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Tags (Comma separated)</label>
                                    <input
                                        type="text"
                                        value={questForm.tags}
                                        onChange={e => setQuestForm({ ...questForm, tags: e.target.value })}
                                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-dark-800 border border-transparent text-slate-900 dark:text-white font-bold"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="w-full py-6 rounded-3xl bg-rose-600 text-white font-black uppercase tracking-[0.3em] text-sm shadow-2xl shadow-rose-600/30 hover:scale-[1.02] transition-all disabled:opacity-50"
                                >
                                    Initiate Deployment
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Active Quests List */}
                    <div className="mt-16">
                        <div className="flex items-center gap-4 mb-10">
                            <h4 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Live Zero-Day Directives</h4>
                            <div className="h-px flex-1 bg-slate-100 dark:bg-dark-800"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeQuests.length > 0 ? (
                                activeQuests.map((quest, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={quest._id}
                                        className={`bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 border-l-8 border-slate-100 dark:border-dark-800 shadow-xl flex items-center gap-6 group hover:translate-x-2 transition-all cursor-default overflow-hidden relative
                                            ${quest.colorTheme === 'rose' ? 'border-l-rose-500' :
                                                quest.colorTheme === 'amber' ? 'border-l-amber-500' :
                                                    quest.colorTheme === 'emerald' ? 'border-l-emerald-500' :
                                                        quest.colorTheme === 'indigo' ? 'border-l-indigo-500' :
                                                            'border-l-violet-500'}
                                        `}
                                    >
                                        <div className={`p-4 rounded-2xl shrink-0 
                                            ${quest.colorTheme === 'rose' ? 'bg-rose-500/10 text-rose-600' :
                                                quest.colorTheme === 'amber' ? 'bg-amber-500/10 text-amber-600' :
                                                    quest.colorTheme === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' :
                                                        quest.colorTheme === 'indigo' ? 'bg-indigo-500/10 text-indigo-600' :
                                                            'bg-violet-500/10 text-violet-600'}
                                        `}>
                                            <BoltIcon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h5 className="font-black text-slate-900 dark:text-white uppercase tracking-tight italic text-lg leading-tight mb-1">{quest.title}</h5>
                                            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                <span>Difficulty: {quest.difficulty}</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                <span className="text-yellow-500">{quest.baseXp * quest.multiplier} Potential XP</span>
                                            </div>
                                        </div>
                                        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-slate-50 dark:from-white/5 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-10 h-10 rounded-full bg-white dark:bg-dark-800 shadow-lg flex items-center justify-center text-slate-400">
                                                <TrophyIcon className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-2 py-16 bg-slate-50/50 dark:bg-dark-950/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-dark-800 flex flex-col items-center justify-center text-center">
                                    <ExclamationTriangleIcon className="w-10 h-10 text-slate-300 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">No active Zero-Day Directives found in buffer</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import labService from '../../services/api/labService';
import {
    BeakerIcon,
    DocumentArrowUpIcon,
    SparklesIcon,
    ArrowRightIcon,
    AdjustmentsHorizontalIcon,
    MagnifyingGlassIcon,
    CpuChipIcon,
    FireIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function Labs() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const shouldShowGenerator = searchParams.get('generate') === 'true';

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [labs, setLabs] = useState([]);
    const [filterTopic, setFilterTopic] = useState('All');
    const [filterDifficulty, setFilterDifficulty] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Generator State
    const [genConfig, setGenConfig] = useState({
        topic: 'Data Structures',
        difficulty: 'Medium'
    });

    const topics = ['All', 'Data Structures', 'Algorithms', 'Graph', 'Dynamic Programming', 'Database', 'Logic', 'Recursion', 'Bit Manipulation'];
    const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

    useEffect(() => {
        fetchLabs();
    }, []);

    const fetchLabs = async () => {
        try {
            setLoading(true);
            const res = await labService.getLabs();
            setLabs(res.data || []);
        } catch (err) {
            console.error('Error fetching labs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        try {
            setGenerating(true);
            const res = await labService.generateLab(genConfig);
            if (res.success && res.labId) {
                navigate(`/student/labs/${res.labId}`);
            } else {
                // Refresh list if it was background generated
                await fetchLabs();
                setGenerating(false);
            }
        } catch (err) {
            console.error('Generation failed:', err);
            setGenerating(false);
        }
    };

    const filteredLabs = labs.filter(lab => {
        const matchesTopic = filterTopic === 'All' || (lab.topics || []).includes(filterTopic);
        const matchesDifficulty = filterDifficulty === 'All' || lab.difficulty === filterDifficulty;
        const matchesSearch = lab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lab.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTopic && matchesDifficulty && matchesSearch;
    });

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-screen bg-[#020617]">
            <div className="relative w-32 h-32 mb-12">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-t-2 border-b-2 border-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                />
                <BeakerIcon className="absolute inset-0 m-auto w-12 h-12 text-indigo-400 animate-pulse" />
            </div>
            <p className="text-indigo-400 font-black uppercase tracking-[0.5em] text-[10px] italic animate-pulse">SYNCHRONIZING NEURAL LABS...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] p-8 md:p-16 lg:p-24 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Background Decorations */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/5 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-600/5 blur-[150px] rounded-full animate-pulse transition-all duration-1000"></div>
            </div>

            {/* Header */}
            <header className="max-w-[1700px] mx-auto mb-32 flex flex-col xl:flex-row xl:items-end justify-between gap-12">
                <div>
                    <motion.div 
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-4 mb-8"
                    >
                        <div className="w-16 h-2 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">NEURAL LEARNING CORE</span>
                    </motion.div>
                    <motion.h1 
                        initial={{ x: -100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="text-8xl md:text-9xl font-black uppercase tracking-[0.2em] leading-none italic mb-8"
                    >
                        VIRTUAL <span className="text-indigo-500">LABS</span>
                    </motion.h1>
                    <p className="text-slate-500 text-sm max-w-2xl font-bold leading-relaxed italic border-l-4 border-indigo-500/30 pl-8 uppercase tracking-widest">
                        Experience the frontier of algorithmic design in our high-fidelity simulation environment.
                        Solve production-grade problems and earn Neural XP.
                    </p>
                </div>

                <motion.div 
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-6"
                >
                    <div className="bg-slate-950/50 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-6 flex items-center gap-6 shadow-3xl">
                        <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                            <CpuChipIcon className="w-8 h-8 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]" />
                        </div>
                        <div className="pr-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic mb-1">SYSTEM STATUS</p>
                            <p className="text-sm font-black text-emerald-400 uppercase italic tracking-tighter">ALL SYSTEMS NOMINAL</p>
                        </div>
                    </div>
                </motion.div>
            </header>

            {/* Generator Section */}
            <AnimatePresence>
                {(shouldShowGenerator || labs.length === 0) && (
                    <motion.section
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="max-w-[1700px] mx-auto mb-32"
                    >
                        <div className="relative group">
                            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-[5rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
                            <div className="relative bg-slate-950/60 backdrop-blur-3xl border border-white/10 p-12 md:p-24 rounded-[5rem] overflow-hidden shadow-3xl">
                                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/5 blur-[120px] -z-10 animate-pulse"></div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                                    <div>
                                        <div className="flex items-center gap-4 mb-8">
                                            <SparklesIcon className="w-8 h-8 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]" />
                                            <span className="text-[11px] font-black text-amber-400 uppercase tracking-[0.4em] italic">AI CORE ACTIVATED</span>
                                        </div>
                                        <h2 className="text-6xl md:text-7xl font-black uppercase tracking-tighter italic mb-10 leading-none">
                                            SYNTHESIZE <br /> NEW <span className="text-indigo-500">CHALLENGE</span>
                                        </h2>
                                        <p className="text-slate-500 text-sm italic font-bold mb-16 leading-relaxed uppercase tracking-widest max-w-xl">
                                            Our neural engine will harvest metadata from production environments to generate a custom-tailored simulation specific to your cognitive profile.
                                        </p>

                                        <div className="space-y-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div>
                                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 block pl-4 italic">ARCHITECTURE</label>
                                                    <select
                                                        value={genConfig.topic}
                                                        onChange={(e) => setGenConfig({ ...genConfig, topic: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-6 px-8 text-xs font-black focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer appearance-none uppercase italic tracking-widest text-white backdrop-blur-xl"
                                                    >
                                                        {topics.filter(t => t !== 'All').map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 block pl-4 italic">INTENSITY</label>
                                                    <select
                                                        value={genConfig.difficulty}
                                                        onChange={(e) => setGenConfig({ ...genConfig, difficulty: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-6 px-8 text-xs font-black focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer appearance-none uppercase italic tracking-widest text-white backdrop-blur-xl"
                                                    >
                                                        {difficulties.filter(d => d !== 'All').map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                                                    </select>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleGenerate}
                                                disabled={generating}
                                                className="w-full bg-white text-black hover:bg-indigo-600 hover:text-white py-8 rounded-[2rem] font-black uppercase text-xs tracking-[0.5em] shadow-3xl flex items-center justify-center gap-6 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 group italic border border-white/20"
                                            >
                                                {generating ? (
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-6 h-6 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                                                        SYNTHESIZING ENVIRONMENT...
                                                    </div>
                                                ) : (
                                                    <>
                                                        INITIALIZE CORE SYNTHESIS
                                                        <ArrowRightIcon className="w-6 h-6 group-hover:translate-x-3 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="hidden lg:block relative">
                                        <div className="aspect-square bg-white/5 backdrop-blur-3xl rounded-[5rem] border border-white/10 flex items-center justify-center relative overflow-hidden shadow-inner">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent"></div>
                                            <div className="relative z-10 text-center">
                                                <div className="relative mb-12 text-indigo-500 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                                                    <BeakerIcon className="w-32 h-32 mx-auto animate-pulse" />
                                                    <FireIcon className="w-16 h-16 absolute -top-6 -right-6 text-orange-500 animate-bounce" />
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="w-48 h-1.5 bg-white/10 rounded-full mx-auto"></div>
                                                    <div className="w-64 h-1.5 bg-white/10 rounded-full mx-auto"></div>
                                                    <div className="w-32 h-1.5 bg-white/10 rounded-full mx-auto"></div>
                                                </div>
                                            </div>
                                            {/* Abstract lines */}
                                            {[...Array(8)].map((_, i) => (
                                                <div key={i} className={`absolute w-full h-[1px] bg-white/10 rotate-${i * 20} -z-10`}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Filter Bar */}
            <section className="max-w-[1700px] mx-auto mb-20">
                <div className="flex flex-col lg:flex-row gap-10 items-center">
                    <div className="relative flex-1 group w-full">
                        <MagnifyingGlassIcon className="absolute left-10 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="SCAN LAB INFRASTRUCTURE..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] py-8 pl-24 pr-12 text-xs font-black placeholder:text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all uppercase tracking-[0.4em] italic text-white"
                        />
                    </div>

                    <div className="flex gap-6 w-full lg:w-auto">
                        <div className="relative group flex-1 lg:min-w-[250px]">
                            <AdjustmentsHorizontalIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
                            <select
                                value={filterTopic}
                                onChange={e => setFilterTopic(e.target.value)}
                                className="bg-slate-950/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] py-8 pl-20 pr-12 text-xs font-black focus:ring-2 focus:ring-indigo-500 transition-all appearance-none uppercase tracking-[0.3em] italic cursor-pointer w-full text-white"
                            >
                                {topics.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                            </select>
                        </div>
                        <div className="relative group flex-1 lg:min-w-[250px]">
                            <FireIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
                            <select
                                value={filterDifficulty}
                                onChange={e => setFilterDifficulty(e.target.value)}
                                className="bg-slate-950/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] py-8 pl-20 pr-12 text-xs font-black focus:ring-2 focus:ring-indigo-500 transition-all appearance-none uppercase tracking-[0.3em] italic cursor-pointer w-full text-white"
                            >
                                {difficulties.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Labs Grid */}
            <section className="max-w-[1700px] mx-auto">
                {filteredLabs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {filteredLabs.map((lab, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={lab._id}
                                className="group relative"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-[4rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                                <div className="relative bg-slate-950/40 backdrop-blur-2xl border border-white/10 rounded-[4rem] p-12 h-full flex flex-col justify-between overflow-hidden transition-all duration-500 group-hover:border-indigo-500/50 group-hover:-translate-y-4 shadow-3xl">
                                    {/* AI Indicator */}
                                    {lab.isAiGenerated && (
                                        <div className="absolute top-0 right-0 py-3 px-8 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.3em] italic rounded-bl-[2rem] z-10 flex items-center gap-3 shadow-2xl border-l border-b border-white/10">
                                            <SparklesIcon className="w-4 h-4" /> AI GENERATED
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex flex-wrap gap-3 mb-8">
                                            {(lab.topics || []).slice(0, 3).map(t => (
                                                <span key={t} className="text-[9px] font-black text-slate-400 bg-white/5 px-4 py-2 rounded-xl uppercase tracking-widest italic border border-white/5">{t}</span>
                                            ))}
                                        </div>
                                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-6 group-hover:text-indigo-400 transition-colors leading-tight">{lab.title}</h3>
                                        <p className="text-slate-500 text-xs font-bold leading-relaxed italic mb-12 line-clamp-3 group-hover:text-slate-400 transition-colors uppercase tracking-widest">{lab.description}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-10 border-t border-white/10">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] ${lab.difficulty === 'Easy' ? 'bg-emerald-500 shadow-emerald-500/50' : lab.difficulty === 'Medium' ? 'bg-orange-500 shadow-orange-500/50' : 'bg-rose-500 shadow-rose-500/50'}`} />
                                            <span className={`text-[11px] font-black uppercase tracking-[0.2em] italic ${lab.difficulty === 'Easy' ? 'text-emerald-400' : lab.difficulty === 'Medium' ? 'text-orange-400' : 'text-rose-400'}`}>
                                                {lab.difficulty}
                                            </span>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => navigate(`/student/labs/${lab._id}`)}
                                                className="bg-white text-black hover:bg-indigo-600 hover:text-white px-10 py-4 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.3em] italic transition-all active:scale-95 shadow-2xl border border-white/20"
                                            >
                                                INITIALIZE
                                            </button>
                                            <button
                                                onClick={() => navigate(`/student/labs/${lab._id}/submit`)}
                                                className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white p-4 rounded-[1.2rem] transition-all border border-white/5"
                                                title="Quick Submit"
                                            >
                                                <DocumentArrowUpIcon className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center py-64 bg-slate-950/40 backdrop-blur-2xl rounded-[5rem] border-2 border-dashed border-white/10"
                    >
                        <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-12 border border-white/10">
                            <BeakerIcon className="w-16 h-16 text-slate-700 grayscale" />
                        </div>
                        <h4 className="text-4xl font-black uppercase italic text-slate-600 mb-4 tracking-tighter">NO SIMULATIONS FOUND</h4>
                        <p className="text-slate-700 text-sm font-black uppercase tracking-[0.5em] italic">ADJUST NEURAL FILERS OR SYNTHESIZE A NEW CORE</p>
                    </motion.div>
                )}
            </section>
        </div>
    );
}
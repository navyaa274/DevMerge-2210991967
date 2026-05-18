import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../services/api/apiClient';
import {
    SparklesIcon,
    CubeTransparentIcon,
    BoltIcon,
    Bars3CenterLeftIcon,
    BeakerIcon,
    CpuChipIcon,
    CodeBracketIcon,
    QueueListIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function UltimateProblemGenerator() {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        course: 'BTech_CSE',
        semester: 3,
        subject: 'Data Structures',
        topic: 'Arrays',
        bloomsLevel: 'Apply',
        questionType: 'Coding',
        problemMode: 'Practice',
        difficulty: 'Medium',
        realWorldContext: true
    });
    const [generatedProblem, setGeneratedProblem] = useState(null);
    const [options, setOptions] = useState(null);
    const [batchMode, setBatchMode] = useState(false);
    const [batchTopics, setBatchTopics] = useState('');

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const res = await apiClient.get('/ultimate-problem-generator/config-options');
            setOptions(res.data.data);
        } catch (error) {
            console.error('Fetch options error:', error);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setGeneratedProblem(null);

        try {
            const res = await apiClient.post('/ultimate-problem-generator/generate', config);
            setGeneratedProblem(res.data.data);
        } catch (error) {
            console.error('Generation error:', error);
            alert('Failed to synthesize problem. Node error or timeout.');
        } finally {
            setLoading(false);
        }
    };

    const handleBatchGenerate = async () => {
        const topics = batchTopics.split('\n').filter(t => t.trim());
        if (topics.length === 0) {
            alert('Please enter topics (one per line)');
            return;
        }

        setLoading(true);

        try {
            const configs = topics.map(topic => ({
                ...config,
                topic: topic.trim()
            }));

            const res = await apiClient.post('/ultimate-problem-generator/batch', { configs });
            alert(`✅ Successfully synthesized ${res.data.data.length} assessment vectors!`);
            setBatchTopics('');
        } catch (error) {
            console.error('Batch generation error:', error);
            alert('Failed to run batch synthesis.');
        } finally {
            setLoading(false);
        }
    };

    if (!options) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex justify-center items-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(79,70,229,0.4)]"></div>
                    <p className="mt-6 text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">Initializing Neural Forge...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-950 p-8 pt-20">
            <div className="max-w-[1600px] mx-auto">
                {/* HUD Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-4 py-1.5 bg-indigo-600 font-black text-white text-[9px] uppercase tracking-[0.3em] rounded-full shadow-lg shadow-indigo-500/30 italic">
                                Faculty Terminal
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-200 dark:bg-dark-900 px-4 py-1.5 rounded-full flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                AI Core Active
                            </span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic flex items-center gap-4">
                            Ultimate <span className="text-indigo-500">Generator</span>
                        </h1>
                        <p className="font-bold text-slate-500 uppercase tracking-widest text-[10px] mt-4 max-w-xl">
                            Synthesize hyper-contextualized academic assessments using the centralized Llama orchestration node.
                        </p>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden flex items-center gap-6 min-w-[320px] border border-slate-800">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] -mt-10 -mr-10"></div>
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 relative z-10">
                            <CubeTransparentIcon className="w-8 h-8" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Compute Infrastructure</p>
                            <p className="text-xl font-black text-white tracking-tighter italic leading-none">Matrix Enigma v4</p>
                        </div>
                    </div>
                </div>

                {/* Mode Selector */}
                <div className="flex bg-white dark:bg-dark-900 p-2 rounded-[2rem] max-w-fit mb-10 shadow-xl border border-slate-100 dark:border-dark-800">
                    <button
                        onClick={() => setBatchMode(false)}
                        className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${!batchMode
                                ? 'bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)]'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                    >
                        <BoltIcon className="w-4 h-4" /> Single Generation
                    </button>
                    <button
                        onClick={() => setBatchMode(true)}
                        className={`px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${batchMode
                                ? 'bg-indigo-600 text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)]'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                    >
                        <QueueListIcon className="w-4 h-4" /> Batch Processing
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Control Panel */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-10 shadow-2xl border border-slate-100 dark:border-dark-800 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110"></div>

                            <h2 className="text-xl font-black uppercase tracking-tighter italic mb-8 flex items-center gap-3 relative z-10 text-slate-900 dark:text-white">
                                <Bars3CenterLeftIcon className="w-6 h-6 text-indigo-500" /> Synthesis Parameters
                            </h2>

                            {!batchMode ? (
                                <div className="space-y-6 relative z-10">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Sector</label>
                                            <select
                                                value={config.course}
                                                onChange={(e) => setConfig({ ...config, course: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                            >
                                                {options.courses.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Phase</label>
                                            <select
                                                value={config.semester}
                                                onChange={(e) => setConfig({ ...config, semester: parseInt(e.target.value) })}
                                                className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                            >
                                                {options.semesters.map(s => <option key={s} value={s}>Phase {s}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Domain</label>
                                        <input
                                            type="text"
                                            value={config.subject}
                                            onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="e.g., Data Structures"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Target Node</label>
                                        <input
                                            type="text"
                                            value={config.topic}
                                            onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                            placeholder="e.g., Binary Trees"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-dark-800">
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Cognitive Load</label>
                                            <select
                                                value={config.bloomsLevel}
                                                onChange={(e) => setConfig({ ...config, bloomsLevel: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                            >
                                                {options.bloomsLevels.map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Architecture</label>
                                            <select
                                                value={config.questionType}
                                                onChange={(e) => setConfig({ ...config, questionType: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                            >
                                                {options.questionTypes.map(q => <option key={q} value={q}>{q}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Protocol</label>
                                            <select
                                                value={config.problemMode}
                                                onChange={(e) => setConfig({ ...config, problemMode: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                            >
                                                {options.problemModes.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-2">Resistance</label>
                                            <select
                                                value={config.difficulty}
                                                onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
                                            >
                                                {options.difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-4 bg-slate-50 dark:bg-dark-950 p-4 rounded-2xl border-2 border-slate-100 dark:border-dark-800 cursor-pointer hover:border-indigo-500 transition-colors mt-6">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={config.realWorldContext}
                                                onChange={(e) => setConfig({ ...config, realWorldContext: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-10 h-6 bg-slate-300 dark:bg-dark-700 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                                            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mb-1 leading-none">Context Injection</p>
                                            <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none">Ground in industry logic</p>
                                        </div>
                                    </label>

                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading}
                                        className="w-full mt-8 px-6 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_15px_30px_rgba(79,70,229,0.3)] hover:shadow-[0_20px_40px_rgba(79,70,229,0.4)] hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 flex justify-center items-center gap-2 italic"
                                    >
                                        {loading ? (
                                            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Engaging AI...</>
                                        ) : (
                                            <><SparklesIcon className="w-5 h-5" /> Synthesize Architecture</>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6 relative z-10">
                                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
                                        <BeakerIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 leading-relaxed">
                                            List distinct target nodes (one per line) to process multiple concepts algorithmically.
                                        </p>
                                    </div>
                                    <textarea
                                        value={batchTopics}
                                        onChange={(e) => setBatchTopics(e.target.value)}
                                        placeholder={`Arrays\nLinked Lists\nBinary Trees`}
                                        rows={12}
                                        className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-3xl p-6 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors custom-scrollbar"
                                    />
                                    <button
                                        onClick={handleBatchGenerate}
                                        disabled={loading}
                                        className="w-full px-6 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-2xl hover:-translate-y-1 disabled:opacity-50 flex justify-center items-center gap-2 italic"
                                    >
                                        {loading ? 'Processing Array...' : 'Run Batch Protocol'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Output Console */}
                    <div className="lg:col-span-8">
                        <div className="bg-slate-900 rounded-[3.5rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] min-h-[800px] border-t-[12px] border-indigo-600 relative overflow-hidden flex flex-col group">
                            <div className="absolute top-0 right-0 p-12 opacity-5 scale-[2] rotate-12 group-hover:rotate-0 transition-transform duration-[3s] pointer-events-none">
                                <CpuChipIcon className="w-96 h-96 text-white" />
                            </div>

                            <div className="flex justify-between items-center border-b border-white/5 pb-8 mb-8 relative z-10">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                                    <CodeBracketIcon className="w-8 h-8 text-indigo-400" />
                                    Output Terminal
                                </h2>
                                <div className="flex gap-2">
                                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                </div>
                            </div>

                            {loading && (
                                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                                    <div className="w-24 h-24 mb-8 relative">
                                        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                                        <div className="w-full h-full border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                    </div>
                                    <p className="text-indigo-400 font-mono text-xs uppercase tracking-[0.3em] font-bold">Constructing Logic Pipeline...</p>
                                    <div className="mt-8 space-y-3 font-mono text-[9px] text-slate-500 uppercase tracking-widest max-w-sm text-center">
                                        <p className="animate-pulse">Loading Context Parameters... [OK]</p>
                                        <p className="animate-pulse delay-75">Cross-referencing Bloom's Taxonomy... [ACTIVE]</p>
                                        <p className="animate-pulse delay-150">Generating Edge Cases...</p>
                                    </div>
                                </div>
                            )}

                            {!loading && !generatedProblem && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 relative z-10">
                                    <CubeTransparentIcon className="w-32 h-32 text-slate-600 mb-8" />
                                    <h3 className="text-xl font-black text-white uppercase tracking-widest italic mb-2">Terminal Idle</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] max-w-sm">Provide configurations on the left node to initiate synthesis sequence.</p>
                                </div>
                            )}

                            {!loading && generatedProblem && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 space-y-8 pb-8">
                                    {/* Component Header Bar */}
                                    <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-3xl backdrop-blur-md">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-1">Generated Output</p>
                                                <h3 className="text-3xl font-black text-white leading-tight">{generatedProblem.problem.title}</h3>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="bg-black/40 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{generatedProblem.metadata.bloomsLevel}</span>
                                                <span className="bg-black/40 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{generatedProblem.problem.difficulty}</span>
                                                <span className="bg-black/40 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{generatedProblem.metadata.questionType}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                                            <span className="w-1 h-4 bg-indigo-500 rounded"></span> Task Description
                                        </h4>
                                        <p className="text-sm font-medium text-slate-300 leading-loose bg-white/5 p-8 rounded-[2rem] border border-white/5 font-mono shadow-inner whitespace-pre-wrap">
                                            {generatedProblem.problem.description}
                                        </p>
                                    </div>

                                    {generatedProblem.problem.examples?.length > 0 && (
                                        <div>
                                            <h4 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                                                <span className="w-1 h-4 bg-emerald-500 rounded"></span> Test Cases
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {generatedProblem.problem.examples.map((ex, i) => (
                                                    <div key={i} className="bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-[2rem]">
                                                        <div className="mb-4">
                                                            <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest block mb-2">Input Matrix</span>
                                                            <code className="text-white text-xs font-mono break-all">{ex.input}</code>
                                                        </div>
                                                        <div className="mb-4">
                                                            <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest block mb-2">Expected Output</span>
                                                            <code className="text-white text-xs font-mono break-all">{ex.output}</code>
                                                        </div>
                                                        {ex.explanation && (
                                                            <div>
                                                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-1">Logic Trace</span>
                                                                <p className="text-[10px] text-slate-400 leading-relaxed font-mono">{ex.explanation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                                                    <span className="w-1 h-4 bg-amber-500 rounded"></span> Expected Complexity
                                                </h4>
                                                <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem] flex items-center justify-between shadow-inner">
                                                    <div>
                                                        <p className="text-[9px] font-black text-amber-500/70 uppercase tracking-widest mb-1">Temporal (Time)</p>
                                                        <code className="text-amber-400 font-mono text-lg font-black">{generatedProblem.metadata.expectedTimeComplexity}</code>
                                                    </div>
                                                    <div className="h-10 w-px bg-amber-500/20"></div>
                                                    <div className="text-right">
                                                        <p className="text-[9px] font-black text-amber-500/70 uppercase tracking-widest mb-1">Spatial (Space)</p>
                                                        <code className="text-amber-400 font-mono text-lg font-black">{generatedProblem.metadata.expectedSpaceComplexity}</code>
                                                    </div>
                                                </div>
                                            </div>

                                            {generatedProblem.commonMistakes?.length > 0 && (
                                                <div>
                                                    <h4 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                                                        <span className="w-1 h-4 bg-rose-500 rounded"></span> Neural Pitfalls
                                                    </h4>
                                                    <div className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-[2rem] space-y-3">
                                                        {generatedProblem.commonMistakes.map((mistake, i) => (
                                                            <div key={i} className="flex gap-3 text-sm text-slate-300 items-start">
                                                                <span className="text-rose-500 font-black mt-0.5">⊗</span>
                                                                <span className="font-mono text-[10px] leading-relaxed opacity-80">{mistake}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {generatedProblem.hints?.length > 0 && (
                                            <div>
                                                <h4 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                                                    <span className="w-1 h-4 bg-blue-500 rounded"></span> Logic Hints
                                                </h4>
                                                <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-[2rem] space-y-4">
                                                    {generatedProblem.hints.map((hint, i) => (
                                                        <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2 border-b border-white/5 pb-2">Hint {i + 1}</p>
                                                            <p className="text-xs text-slate-300 font-mono leading-relaxed">{hint}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/10 mt-auto">
                                        <button
                                            onClick={() => window.open(`/problems/${generatedProblem.problem._id}`, '_blank')}
                                            className="flex-1 bg-white text-slate-900 px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3 italic"
                                        >
                                            View Active Node <ArrowRightIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={handleGenerate}
                                            className="flex-1 bg-white/10 text-white border border-white/20 px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all italic"
                                        >
                                            Re-Synthesize Algorithm
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

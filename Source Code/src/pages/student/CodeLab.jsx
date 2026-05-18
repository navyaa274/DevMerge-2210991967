import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import codeLabService from '../../services/api/codeLabService';
import CodeEditor from '../../components/CodeEditor/CodeEditor';
import OutputPanel from '../../components/CodeEditor/OutputPanel';
import FileExplorer from '../../components/CodeEditor/FileExplorer';
import {
    PlayIcon,
    BugAntIcon,
    CloudArrowUpIcon,
    ChevronLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    BookOpenIcon,
    BeakerIcon,
    LightBulbIcon,
    CircleStackIcon,
    CodeBracketIcon,
    CommandLineIcon
} from '@heroicons/react/24/outline';

export default function CodeLab() {
    const { labId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [lab, setLab] = useState(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isDebugging, setIsDebugging] = useState(false);
    const [breakpoints, setBreakpoints] = useState([]);
    const [theme, setTheme] = useState('dark');
    const [testResults, setTestResults] = useState([]);
    const [activeTab, setActiveTab] = useState('instructions');
    const [mobileView, setMobileView] = useState('problem'); // 'problem', 'editor', 'console'
    const [files, setFiles] = useState([]);
    const [activeFile, setActiveFile] = useState(null);
    const editorRef = useRef(null);

    const inferLanguage = (filename) => {
        if (!filename) return 'javascript';
        const ext = filename.split('.').pop().toLowerCase();
        if (ext === 'js') return 'javascript';
        if (ext === 'ts') return 'typescript';
        if (ext === 'py') return 'python';
        if (ext === 'java') return 'java';
        if (ext === 'cpp' || ext === 'cc' || ext === 'cxx') return 'cpp';
        if (ext === 'c') return 'c';
        if (ext === 'go') return 'go';
        if (ext === 'rs') return 'rust';
        if (ext === 'php') return 'php';
        if (ext === 'rb') return 'ruby';
        if (ext === 'swift') return 'swift';
        if (ext === 'kt') return 'kotlin';
        if (ext === 'scala') return 'scala';
        if (ext === 'sql') return 'sql';
        if (ext === 'sh') return 'bash';
        if (ext === 'html') return 'html';
        if (ext === 'css') return 'css';
        if (ext === 'json') return 'json';
        if (ext === 'xml') return 'xml';
        if (ext === 'yaml' || ext === 'yml') return 'yaml';
        if (ext === 'md') return 'markdown';
        return 'javascript';
    };

    useEffect(() => {
        fetchLabDetails();
    }, [labId]);

    const fetchLabDetails = async () => {
        try {
            const [dataRes, historyRes] = await Promise.all([
                codeLabService.getLabDetails(labId),
                codeLabService.getLabHistory(labId)
            ]);

            const labData = dataRes.data || dataRes;
            setLab(labData);

            const session = historyRes?.data || {};

            if (Array.isArray(labData.files) && labData.files.length > 0) {
                setFiles(labData.files);
                const first = labData.files[0];
                setActiveFile(first);
                setLanguage(inferLanguage(first.name));
                setCode(session.currentCode || first.content || '');
            } else {
                const effectiveLang = session.currentLanguage || language;
                if (session.currentLanguage) setLanguage(session.currentLanguage);
                if (session.currentCode) {
                    setCode(session.currentCode);
                } else {
                    const starterCodeObj = labData.starterCode || {};
                    const initialCode = starterCodeObj[effectiveLang] || starterCodeObj.javascript || '// Write your solution here';
                    setCode(initialCode);
                }
            }
        } catch (err) {
            console.error('Error fetching lab:', err);
            setLab({
                title: 'Code Lab',
                description: 'Welcome to the code lab',
                starterCode: { javascript: '// Write your solution here' },
                examples: [],
                testCases: []
            });
            setCode('// Write your solution here');
        }
    };

    const handleCodeChange = (newCode) => {
        setCode(newCode);
        if (activeFile) {
            setFiles(prev => prev.map(f => f.name === activeFile.name ? { ...f, content: newCode } : f));
        }
    };
    const handleFileCreate = (name) => {
        const exists = files.some(f => f.name === name);
        if (exists) return;
        const newFile = { name, content: '' };
        const next = [...files, newFile];
        setFiles(next);
        setActiveFile(newFile);
        setLanguage(inferLanguage(name));
        setCode('');
    };
    const handleFileDelete = (name) => {
        const next = files.filter(f => f.name !== name);
        setFiles(next);
        if (activeFile?.name === name) {
            const first = next[0];
            setActiveFile(first || null);
            if (first) {
                setLanguage(inferLanguage(first.name));
                setCode(first.content || '');
            } else {
                setLanguage('javascript');
                setCode('');
            }
        }
    };

    const handleRunCode = async () => {
        setIsRunning(true);
        setOutput('Initializing execution environment...');
        if (window.innerWidth < 1024) setMobileView('console');

        try {
            codeLabService.saveLab(labId, { code, language, fileName: activeFile?.name || 'solution' }).catch(() => {});

            const res = await codeLabService.executeCode({ code, language, labId });
            const result = res.output || res;
            setOutput(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
        } catch (err) {
            console.error('Full error object:', err);
            const errorMsg = err?.formattedMessage || err?.message || (typeof err === 'string' ? err : 'Unknown error occurred');
            setOutput(`Runtime Error: ${errorMsg}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleRunTests = async () => {
        setIsRunning(true);
        setActiveTab('tests');
        if (window.innerWidth < 1024) setMobileView('problem');
        setTestResults([]);

        try {
            codeLabService.saveLab(labId, { code, language, fileName: activeFile?.name || 'solution' }).catch(() => {});

            if (!lab?.testCases || lab.testCases.length === 0) {
                setOutput('No test cases available for this lab');
                if (window.innerWidth < 1024) setMobileView('console');
                setIsRunning(false);
                return;
            }

            const results = [];
            for (const testCase of lab.testCases) {
                try {
                    const res = await codeLabService.executeCode({
                        code,
                        language,
                        labId,
                        input: testCase.input
                    });
                    const output = res.output || res;
                    const passed = output.trim() === testCase.output.trim();
                    results.push({
                        input: testCase.input,
                        expected: testCase.output,
                        actual: output,
                        passed,
                        isHidden: testCase.isHidden
                    });
                } catch (err) {
                    results.push({
                        input: testCase.input,
                        expected: testCase.output,
                        actual: `Error: ${typeof err.message === 'string' ? err.message : err?.toString() || 'Unknown error occurred'}`,
                        passed: false,
                        isHidden: testCase.isHidden
                    });
                }
            }
            setTestResults(results);
            const passedCount = results.filter(r => r.passed).length;
            setOutput(`Test Results: ${passedCount}/${results.length} passed`);
        } catch (err) {
            setOutput(`Error running tests: ${typeof err.message === 'string' ? err.message : err?.toString() || 'Unknown error occurred'}`);
            if (window.innerWidth < 1024) setMobileView('console');
        } finally {
            setIsRunning(false);
        }
    };

    const handleDebug = () => setIsDebugging(!isDebugging);

    const handleSaveFile = async () => {
        try {
            await codeLabService.saveLab(labId, {
                code,
                language,
                fileName: 'solution'
            });
        } catch (err) {
            console.error('Error saving file:', err);
        }
    };

    if (!lab) {
        return (
            <div className="h-screen bg-slate-950 flex flex-col items-center justify-center font-sans">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(79,70,229,0.3)]"></div>
                <p className="mt-8 text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] italic">Initializing Neural Sandbox...</p>
            </div>
        );
    }

    const passedTests = testResults.filter(r => r.passed).length;
    const totalTests = testResults.length;

    return (
        <div className="h-screen bg-slate-950 flex flex-col overflow-hidden font-sans text-slate-200">
            {/* Header - Unified Action Bar */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between shadow-2xl relative z-50 gap-4 md:gap-0 shrink-0">
                <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-8">
                    <button
                        onClick={() => navigate('/student/labs')}
                        className="group flex items-center gap-2 text-slate-400 hover:text-white transition-all bg-white/5 px-3 md:px-4 py-2 rounded-xl border border-white/5"
                    >
                        <ChevronLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Abort Sequence</span>
                    </button>

                    <div className="flex-1 min-w-0 md:min-w-[200px]">
                        <div className="flex items-center gap-3">
                            <h1 className="text-base md:text-xl font-black text-white uppercase italic tracking-tighter truncate leading-none">{lab.title}</h1>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 md:px-3 py-1 rounded-lg border border-indigo-500/20 italic">
                                <CircleStackIcon className="w-3 h-3 hidden sm:block" /> Node Logic
                            </span>
                            <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest px-2 md:px-3 py-1 rounded-lg border italic ${lab.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                lab.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}>
                                {lab.difficulty}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center w-full md:w-auto overflow-x-auto no-scrollbar gap-2 md:gap-4 pb-1 md:pb-0">
                    <button
                        onClick={() => navigate(`/student/labs/${labId}/submit`)}
                        className="px-4 md:px-6 py-2 md:py-3 bg-emerald-600 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500"
                    >
                        Submit
                    </button>
                        <div className="hidden md:flex items-center gap-2">
                            {files && files.length > 0 && activeFile && (
                                <span className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-white/5 text-slate-300 rounded-lg border border-white/10">
                                    {activeFile.name}
                                </span>
                            )}
                        </div>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-white/5 text-white px-4 md:px-6 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest outline-none border border-white/10 cursor-pointer hover:bg-white/10 transition-colors italic shrink-0 focus:ring-2 ring-indigo-500/30"
                    >
                        {['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust'].map(lang => (
                            <option key={lang} value={lang} className="bg-slate-900">{lang}</option>
                        ))}
                    </select>

                    <div className="h-8 w-[1px] bg-white/10 mx-1 md:mx-2 hidden sm:block shrink-0"></div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleSaveFile}
                            className="p-2 md:p-3 bg-white/5 text-slate-400 rounded-xl hover:text-white hover:bg-white/10 transition-all border border-white/5"
                            title="Save Artifact"
                        >
                            <CloudArrowUpIcon className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleDebug}
                            className={`p-2 md:p-3 rounded-xl transition-all border ${isDebugging
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border-white/5'
                                }`}
                            title="Debug Sequence"
                        >
                            <BugAntIcon className="w-5 h-5" />
                        </button>

                        <button
                            onClick={handleRunCode}
                            disabled={isRunning}
                            className="px-4 md:px-6 py-2 md:py-3 bg-indigo-600 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:bg-indigo-500 flex items-center gap-2 italic disabled:opacity-50 transition-all"
                        >
                            {isRunning ? (
                                <div className="w-3 md:w-4 h-3 md:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <PlayIcon className="w-4 h-4" />
                            )}
                            <span className="hidden sm:inline">Execute</span>
                        </button>

                        <button
                            onClick={handleRunTests}
                            disabled={isRunning || !lab?.testCases?.length}
                            className="px-4 md:px-6 py-2 md:py-3 bg-emerald-600 text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-500 flex items-center gap-2 italic disabled:opacity-50 transition-all"
                        >
                            <BeakerIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">Matrix Run</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation Tabs */}
            <div className="md:hidden flex bg-slate-900 border-b border-white/5 shrink-0">
                <button
                    onClick={() => setMobileView('problem')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 italic transition-colors ${mobileView === 'problem' ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <BookOpenIcon className="w-4 h-4" /> Protocol
                </button>
                <button
                    onClick={() => setMobileView('editor')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 italic transition-colors ${mobileView === 'editor' ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <CodeBracketIcon className="w-4 h-4" /> Editor
                </button>
                <button
                    onClick={() => setMobileView('console')}
                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 italic transition-colors ${mobileView === 'console' ? 'bg-indigo-600/20 text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <CommandLineIcon className="w-4 h-4" /> Console
                </button>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Left Panel: Instructions/Tests (Visible on MD, or if mobileView === 'problem') */}
                <div className={`
                    ${mobileView === 'problem' ? 'flex' : 'hidden'} md:flex 
                    flex-col w-full md:w-[350px] lg:w-[400px] xl:w-[450px] bg-slate-900/50 backdrop-blur-2xl border-r border-white/5 shadow-2xl z-40 shrink-0
                `}>
                    <div className="flex border-b border-white/5 bg-slate-900">
                        <button
                            onClick={() => setActiveTab('instructions')}
                            className={`flex-1 px-4 py-3 xl:py-4 text-[9px] xl:text-[10px] font-black uppercase tracking-widest transition-all italic ${activeTab === 'instructions'
                                ? 'bg-white/5 text-indigo-400 border-b-2 border-indigo-500'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                        >
                            <BookOpenIcon className="w-4 h-4 inline mr-2" /> Briefing
                        </button>
                        <button
                            onClick={() => setActiveTab('examples')}
                            className={`flex-1 px-4 py-3 xl:py-4 text-[9px] xl:text-[10px] font-black uppercase tracking-widest transition-all italic ${activeTab === 'examples'
                                ? 'bg-white/5 text-indigo-400 border-b-2 border-indigo-500'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                        >
                            <LightBulbIcon className="w-4 h-4 inline mr-2" /> Vectors
                        </button>
                        <button
                            onClick={() => setActiveTab('tests')}
                            className={`flex-1 px-4 py-3 xl:py-4 text-[9px] xl:text-[10px] font-black uppercase tracking-widest transition-all italic ${activeTab === 'tests'
                                ? 'bg-white/5 text-indigo-400 border-b-2 border-indigo-500'
                                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                        >
                            <BeakerIcon className="w-4 h-4 inline mr-2" /> Matrix
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'instructions' && (
                                    <div className="space-y-8">
                                        <div>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4 italic flex items-center gap-2">
                                                <BookOpenIcon className="w-4 h-4" /> Core Directive
                                            </h3>
                                            <div className="prose prose-sm prose-invert text-slate-300 leading-relaxed max-w-none custom-scrollbar">
                                                <ReactMarkdown>{lab.description}</ReactMarkdown>
                                            </div>
                                        </div>

                                        {lab.vivaQuestions && lab.vivaQuestions.length > 0 && (
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-400 mb-3 italic">Viva Questions</h3>
                                                <ul className="space-y-2">
                                                    {lab.vivaQuestions.map((q, i) => (
                                                        <li key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                                                            {typeof q === 'string' ? q : q.question}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {lab.rubric && (
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400 mb-3 italic">Grading Rubric</h3>
                                                <div className="space-y-2">
                                                    {Array.isArray(lab.rubric) ? lab.rubric.map((r, i) => (
                                                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                                            <span className="text-xs text-slate-300">{r.criteria || r.name || 'Criteria'}</span>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{r.weight || r.points || ''}</span>
                                                        </div>
                                                    )) : (
                                                        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                                                            {JSON.stringify(lab.rubric)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {lab.objectives && (
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-3 italic">Objectives</h3>
                                                <ul className="space-y-2">
                                                    {(Array.isArray(lab.objectives) ? lab.objectives : [lab.objectives]).map((obj, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-xs text-slate-300">
                                                            <span className="mt-1 w-2 h-2 rounded-full bg-emerald-400/70"></span>
                                                            <span>{obj}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {lab.steps && lab.steps.length > 0 && (
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400 mb-3 italic">Checklist</h3>
                                                <div className="space-y-2">
                                                    {lab.steps.map((step, i) => (
                                                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                                            <div className="w-6 h-6 flex items-center justify-center rounded-lg bg-sky-500/20 text-sky-300 text-[10px] font-black">{i + 1}</div>
                                                            <p className="text-xs text-slate-300">{typeof step === 'string' ? step : step.instruction || step.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {lab.constraints && (
                                            <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400 mb-3 italic">Hardware Constraints</h3>
                                                <p className="text-xs text-slate-300 font-mono leading-relaxed bg-black/40 p-3 rounded-xl">{lab.constraints}</p>
                                            </div>
                                        )}

                                        {lab.topics && lab.topics.length > 0 && (
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-3 italic">Associated Nodes</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {lab.topics.map((topic, idx) => (
                                                        <span key={idx} className="text-[9px] font-black bg-indigo-500/10 text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-500/20 uppercase tracking-widest italic">
                                                            {topic}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'examples' && (
                                    <div className="space-y-6">
                                        {lab.examples && lab.examples.length > 0 ? (
                                            lab.examples.map((example, idx) => (
                                                <div key={idx} className="bg-white/5 rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-4 font-black text-6xl text-white/5 italic select-none pointer-events-none group-hover:scale-110 transition-transform">0{idx + 1}</div>
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-4 italic">Scenario Vector_{idx + 1}</h4>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Input Payload</span>
                                                            <pre className="bg-black/60 p-4 rounded-xl text-xs text-emerald-400 overflow-x-auto border border-white/5 custom-scrollbar">{example.input}</pre>
                                                        </div>
                                                        <div>
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Expected Output Node</span>
                                                            <pre className="bg-black/60 p-4 rounded-xl text-xs text-indigo-300 overflow-x-auto border border-white/5 custom-scrollbar">{example.output}</pre>
                                                        </div>
                                                        {example.explanation && (
                                                            <div>
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1 block">Logic Synthesis</span>
                                                                <p className="text-xs text-slate-300 leading-relaxed bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10">{example.explanation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-12 opacity-50">
                                                <LightBulbIcon className="w-12 h-12 mx-auto mb-4" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Zero Scenario Vectors Found</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'tests' && (
                                    <div className="space-y-6">
                                        {testResults.length > 0 && (
                                            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                                                <div className="flex items-end justify-between mb-4">
                                                    <div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Matrix Resolution</span>
                                                        <span className={`text-2xl font-black italic tracking-tighter leading-none ${passedTests === totalTests ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                            {passedTests}/{totalTests}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Nodes Secured</span>
                                                </div>
                                                <div className="w-full bg-black/50 rounded-full h-2 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(passedTests / totalTests) * 100}%` }}
                                                        className={`h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]`}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            {testResults.map((result, idx) => (
                                                <div key={idx} className={`rounded-xl p-5 border group relative overflow-hidden ${result.passed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                                                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-current opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                                    <div className="flex items-center gap-3 mb-4">
                                                        {result.passed ? (
                                                            <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                                                        ) : (
                                                            <XCircleIcon className="w-5 h-5 text-rose-500" />
                                                        )}
                                                        <span className={`text-[10px] font-black uppercase tracking-widest italic ${result.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                            Evaluator_0{idx + 1}
                                                        </span>
                                                        {result.isHidden && <span className="text-[8px] font-black bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md uppercase tracking-widest ml-auto">(Classified)</span>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                                            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">In Payload</div>
                                                            <div className="text-xs text-slate-300 font-mono truncate">{result.input}</div>
                                                        </div>
                                                        {!result.passed && (
                                                            <>
                                                                <div className="bg-black/40 p-3 rounded-lg border border-white/5">
                                                                    <div className="text-[8px] font-black text-emerald-500/50 uppercase tracking-widest mb-1">Expected Node</div>
                                                                    <div className="text-xs text-emerald-400 font-mono truncate">{result.expected}</div>
                                                                </div>
                                                                <div className="bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                                                                    <div className="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-1">Actual Return</div>
                                                                    <div className="text-xs text-rose-400 font-mono overflow-x-auto custom-scrollbar">{result.actual}</div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                            {testResults.length === 0 && (
                                                <div className="text-center py-12 opacity-50">
                                                    <BeakerIcon className="w-12 h-12 mx-auto mb-4" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Execute Matrix Run To Evaluate</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Center/Right Panel: Files, Editor & Console */}
                <div className={`
                    ${mobileView === 'editor' || mobileView === 'console' ? 'flex' : 'hidden'} md:flex 
                    flex-1 flex-col overflow-hidden relative bg-[#09090b] z-30
                `}>
                    <div className="flex-1 overflow-hidden relative flex">
                        {files && files.length > 0 && (
                            <div className="w-56 border-r border-slate-800 bg-slate-900/60 hidden lg:block">
                                <FileExplorer
                                    files={files}
                                    activeFile={activeFile}
                                    onFileSelect={(file) => {
                                        setActiveFile(file);
                                        setLanguage(inferLanguage(file.name));
                                        setCode(file.content || '');
                                    }}
                                    onFileCreate={handleFileCreate}
                                    onFileDelete={handleFileDelete}
                                />
                            </div>
                        )}
                        <div className={`flex-1 overflow-hidden relative ${mobileView === 'console' ? 'hidden md:block' : 'block'}`}>
                        <div className="absolute top-0 right-0 z-10 px-4 py-2 pointer-events-none opacity-20">
                            <CodeBracketIcon className="w-16 h-16 text-white" />
                        </div>
                        <CodeEditor
                            ref={editorRef}
                            code={code}
                            language={language}
                            theme={theme}
                            onChange={handleCodeChange}
                            collaborators={[]}
                            isDebugging={isDebugging}
                            breakpoints={breakpoints}
                            onBreakpointToggle={(line) => {
                                setBreakpoints(prev =>
                                    prev.includes(line) ? prev.filter(l => l !== line) : [...prev, line]
                                );
                            }}
                        />
                        </div>
                    </div>

                    <div className={`
                        ${mobileView === 'console' ? 'flex-1 border-t-0' : 'h-[35vh] md:h-64 border-t border-slate-800'} 
                        ${mobileView === 'editor' ? 'hidden md:block' : 'block'}
                        bg-slate-950 relative z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] flex flex-col shrink-0
                    `}>
                        <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between bg-slate-900/50 backdrop-blur-md shrink-0">
                            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 italic flex items-center gap-2">
                                <CommandLineIcon className="w-4 h-4" /> System Console
                            </span>
                        </div>
                        <div className="flex-1 overflow-hidden relative">
                            {/* Inner scrolling within OutputPanel */}
                            <OutputPanel output={output} isRunning={isRunning} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

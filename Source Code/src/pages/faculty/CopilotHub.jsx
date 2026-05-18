import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import copilotService from '../../services/api/copilotService';
import courseService from '../../services/api/courseService';
import {
    SparklesIcon,
    DocumentTextIcon,
    BeakerIcon,
    QueueListIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ClockIcon,
    AcademicCapIcon,
    ChevronLeftIcon,
    CircleStackIcon,
    CpuChipIcon,
    CommandLineIcon
} from '@heroicons/react/24/outline';

export default function CopilotHub() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeJob, setActiveJob] = useState(null);
    const [jobStatus, setJobStatus] = useState(null);
    const [generatedContent, setGeneratedContent] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
        topic: '',
        difficulty: 'Medium',
        bloomLevel: 'Apply',
        count: 5,
        type: 'Assignment',
        unitId: '1',
        totalMarks: 100,
        durationMinutes: 60,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 7 days from now
    });

    const [isPublishing, setIsPublishing] = useState(false);

    const publishAssignment = async () => {
        if (!generatedContent || !courseId) return;
        
        try {
            setIsPublishing(true);
            const payload = {
                courseId,
                title: generatedContent.assignmentTitle,
                description: `AI-Generated Assignment for Unit ${formData.unitId}. Focus: ${formData.bloomLevel}`,
                questions: generatedContent.questions,
                totalMarks: formData.totalMarks,
                dueDate: formData.dueDate
            };

            const res = await copilotService.publishAssignment(payload);
            if (res.success) {
                alert('Assignment approved and published to students successfully!');
                setGeneratedContent(null);
                setJobStatus(null);
                setActiveJob(null);
            }
        } catch (error) {
            console.error('Failed to publish assignment:', error);
            alert('Failed to publish assignment. Check console for details.');
        } finally {
            setIsPublishing(false);
        }
    };

    useEffect(() => {
        console.log('🚀 CopilotHub mounting, courseId:', courseId);
        if (courseId) {
            fetchCourseData();
        } else {
            fetchAllCourses();
        }
    }, [courseId]);

    const fetchAllCourses = async () => {
        try {
            setLoading(true);
            const res = await courseService.getAllCourses();
            setCourses(res.data || []);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            console.time('⏱️ Course Data Fetch');
            const res = await courseService.getCourseDetails(courseId);
            console.timeEnd('⏱️ Course Data Fetch');
            setCourse(res.data);
        } catch (error) {
            console.error('Course node sync failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let interval;
        if (activeJob) {
            interval = setInterval(async () => {
                try {
                    const res = await copilotService.getJobStatus(activeJob);
                    const statusData = res.data;
                    setJobStatus(statusData);
                    if (statusData.status === 'completed' || statusData.status === 'failed') {
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error('Status stream interrupted:', error);
                    clearInterval(interval);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [activeJob]);

    const triggerGeneration = async (tool) => {
        setActiveJob(null);
        setJobStatus(null);
        setGeneratedContent(null);
        setIsGenerating(true);

        console.log('=== GENERATION DEBUG ===');
        console.log('Tool:', tool);
        console.log('CourseId from URL:', courseId);
        console.log('Form Data:', formData);

        // Validate required fields
        if (!courseId) {
            console.error('❌ Course ID is missing from URL params');
            alert('Course ID is required. Please navigate from a valid course page.');
            return;
        }

        if (!formData.unitId || formData.unitId.trim() === '') {
            console.error('❌ Unit ID is empty');
            alert('Please enter a Unit Number');
            return;
        }

        if (tool === 'assignment' && (!formData.totalMarks || formData.totalMarks <= 0)) {
            console.error('❌ Total Marks invalid:', formData.totalMarks);
            alert('Please enter valid Total Marks (greater than 0)');
            return;
        }

        if (tool === 'lecture' && (!formData.durationMinutes || formData.durationMinutes <= 0)) {
            console.error('❌ Duration invalid:', formData.durationMinutes);
            alert('Please enter valid Duration in minutes (greater than 0)');
            return;
        }

        try {
            // Map form data to backend requirements
            const payload = {
                courseId,
                unitId: formData.unitId.trim(),
                bloomLevel: formData.bloomLevel,
                useQueue: true
            };

            // Add tool-specific required fields
            if (tool === 'assignment') {
                payload.totalMarks = parseInt(formData.totalMarks);
                payload.type = formData.type || 'Theory';
            } else if (tool === 'lecture') {
                payload.durationMinutes = parseInt(formData.durationMinutes);
                payload.bloomFocus = formData.bloomLevel;
            }

            console.log('✅ Sending payload:', JSON.stringify(payload, null, 2));
            const res = await copilotService.triggerGeneration(tool, payload);
            console.log('✅ Response:', res);

            setIsGenerating(false);

            // Check if response has the expected structure
            if (res && res.data) {
                if (res.data.jobId) {
                    setActiveJob(res.data.jobId);
                } else if (res.data.data) {
                    // Direct response without job queue
                    console.log('✅ Direct generation result:', res.data.data);
                    setGeneratedContent(res.data.data);
                    setJobStatus({ status: 'completed', result: res.data.data, progress: 100 });
                }
            } else {
                console.warn('⚠️ Unexpected response structure:', res);
            }
        } catch (error) {
            setIsGenerating(false);
            console.error('❌ Generation request rejected:', error);
            console.error('❌ Error response:', error.response);
            console.error('❌ Error data:', error.response?.data);
            console.error('❌ Error message:', error.message);

            const errorMsg = typeof error.response?.data?.message === 'string' ? error.response?.data?.message : 
                error.response?.data?.message?.toString() || 
                typeof error.response?.data?.error === 'string' ? error.response?.data?.error : 
                error.response?.data?.error?.toString() || 
                typeof error.message === 'string' ? error.message : 
                error?.toString() || 'Unknown error';

            alert(`Generation failed: ${errorMsg}\n\nCheck console for details.`);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-950 flex items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(79,70,229,0.4)]"></div>
                <p className="mt-6 text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">Initializing Copilot Matrix Ecosystem...</p>
            </div>
        </div>
    );

    // Show course selector if no courseId
    if (!courseId) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 max-w-[1200px] mx-auto min-h-screen pt-16">
                <div className="mb-12">
                    <button
                        onClick={() => navigate('/faculty/dashboard')}
                        className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all bg-white dark:bg-dark-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-dark-800 mb-6"
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Dashboard</span>
                    </button>
                    <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                        Select <span className="text-indigo-600">Course</span>
                    </h1>
                    <p className="text-indigo-600 font-bold uppercase tracking-[0.4em] text-[10px] mt-6">
                        Choose a course to access AI Copilot tools
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No courses found</p>
                            <p className="text-slate-500 text-xs mt-2">Create a course first to use AI Copilot</p>
                        </div>
                    ) : (
                        courses.map((c) => (
                            <button
                                key={c._id}
                                onClick={() => navigate(`/faculty/copilot/${c._id}`)}
                                className="group bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-dark-800 hover:border-indigo-500 transition-all transform hover:-translate-y-2 text-left"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                                        <AcademicCapIcon className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-dark-950 px-3 py-1.5 rounded-full">
                                        {c.code}
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                                    {c.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {c.description || 'No description available'}
                                </p>
                                <div className="mt-6 flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                                    <span>Launch Copilot</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 max-w-[1600px] mx-auto min-h-screen pt-16">
            {/* Super Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-12">
                <div>
                    <button
                        onClick={() => navigate('/faculty/dashboard')}
                        className="group flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all bg-white dark:bg-dark-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-dark-800 mb-6"
                    >
                        <ChevronLeftIcon className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Terminal</span>
                    </button>
                    <h1 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic select-none">
                        Copilot <span className="text-indigo-600">Ecosystem</span>
                    </h1>
                    <p className="text-indigo-600 font-bold uppercase tracking-[0.4em] text-[10px] mt-6 flex items-center gap-3">
                        <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.5)]"></span>
                        Logic Feed: {course?.title} // CID: {course?.code}
                    </p>
                </div>

                <div className="bg-slate-900 px-10 py-6 rounded-[3rem] shadow-3xl flex items-center gap-8 relative border-t-4 border-indigo-500 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-2xl relative z-10">
                        <CpuChipIcon className="w-10 h-10 animate-pulse text-indigo-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Compute Environment</p>
                        <p className="text-2xl font-black text-white leading-none italic">Groq Llama-3.3-70B</p>
                        <div className="flex items-center gap-2 mt-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                            Protocol: GROQ_API_ACTIVE // Latency: 12ms
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Configuration Matrix */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-white dark:bg-dark-900 rounded-[3.5rem] p-12 shadow-3xl border border-slate-50 dark:border-dark-800">
                        <h2 className="text-xl font-black mb-10 dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                            <CircleStackIcon className="w-6 h-6 text-indigo-600" />
                            Configuration Matrix
                        </h2>

                        <div className="space-y-8">
                            {/* Topic Input */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">Topic Vector</label>
                                <input
                                    type="text"
                                    value={formData.topic}
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                    placeholder="e.g., Arrays and Linked Lists"
                                    className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-[1.5rem] px-8 py-5 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all shadow-inner"
                                />
                            </div>

                            {/* Difficulty and Bloom Level */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">Difficulty Level</label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-[1.5rem] px-6 py-5 text-sm font-medium text-slate-900 dark:text-white outline-none appearance-none cursor-pointer focus:border-indigo-500 transition-all"
                                    >
                                        <option value="Low_Spec">Easy</option>
                                        <option value="Mid_Range">Medium</option>
                                        <option value="High_Hardness">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">Bloom's Level</label>
                                    <select
                                        value={formData.bloomLevel}
                                        onChange={(e) => setFormData({ ...formData, bloomLevel: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-[1.5rem] px-6 py-5 text-sm font-medium text-slate-900 dark:text-white outline-none appearance-none cursor-pointer focus:border-indigo-500 transition-all"
                                    >
                                        <option value="Recall">Remember</option>
                                        <option value="Logic">Understand</option>
                                        <option value="Application">Apply</option>
                                        <option value="Analysis">Analyze</option>
                                        <option value="Synthesis">Create</option>
                                    </select>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-slate-200 dark:border-dark-800 my-6"></div>

                            {/* Assignment Parameters */}
                            <div>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-6 ml-4">Assignment Parameters</p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">Unit Number</label>
                                        <input
                                            type="text"
                                            value={formData.unitId}
                                            onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                                            placeholder="e.g., 1"
                                            className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-[1.5rem] px-6 py-5 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">Total Marks</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={formData.totalMarks}
                                            onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value ? parseInt(e.target.value) : 100 })}
                                            placeholder="e.g., 100"
                                            className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-[1.5rem] px-6 py-5 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">Due Date</label>
                                        <input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-[1.5rem] px-6 py-5 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Lecture Parameters */}
                            <div>
                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-6 ml-4">Lecture Parameters</p>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 ml-4">Duration (minutes)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.durationMinutes}
                                        onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value ? parseInt(e.target.value) : 60 })}
                                        placeholder="e.g., 60"
                                        className="w-full bg-slate-50 dark:bg-dark-950 border-2 border-slate-100 dark:border-dark-800 rounded-[1.5rem] px-6 py-5 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-8 flex flex-col gap-6">
                                <button
                                    onClick={() => triggerGeneration('assignment')}
                                    className="group bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-8 rounded-[2.5rem] shadow-2xl hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-2 flex items-center justify-between border-b-8 border-indigo-700 dark:border-slate-200 hover:border-indigo-800"
                                >
                                    <div className="text-left">
                                        <p className="text-xs font-black uppercase italic tracking-widest leading-none mb-2">Synthesize Assignment</p>
                                        <p className="text-[10px] opacity-60 font-black tracking-widest">Ground in Subject Outcomes</p>
                                    </div>
                                    <DocumentTextIcon className="w-10 h-10 opacity-30 group-hover:opacity-100 transition-opacity" />
                                </button>

                                <button
                                    onClick={() => triggerGeneration('lecture')}
                                    className="group bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-2xl hover:bg-slate-900 transition-all transform hover:-translate-y-2 flex items-center justify-between border-b-8 border-indigo-800 hover:border-indigo-900"
                                >
                                    <div className="text-left">
                                        <p className="text-xs font-black uppercase italic tracking-widest leading-none mb-2">Artifact Generation</p>
                                        <p className="text-[10px] opacity-60 font-black tracking-widest">Lecture Notes & Slides</p>
                                    </div>
                                    <AcademicCapIcon className="w-10 h-10 opacity-30 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Processing Console */}
                <div className="lg:col-span-8 flex flex-col gap-10">
                    <div className="bg-slate-900 rounded-[4rem] p-12 min-h-[600px] flex flex-col shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative border-t-[20px] border-indigo-600 overflow-hidden group">
                        <div className="absolute top-0 right-10 p-12 opacity-5 scale-150 rotate-12 group-hover:scale-[2] transition-transform duration-[3s]">
                            <QueueListIcon className="w-96 h-96 text-white" />
                        </div>

                        <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-10 relative z-20">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic flex items-center gap-4">
                                    <CommandLineIcon className="w-8 h-8 text-indigo-400" />
                                    Background Evaluation Console
                                </h2>
                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-2">Active Task Stream: {activeJob || 'LISTENING...'}</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"></span>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest bg-indigo-600/30 px-5 py-2.5 rounded-full border border-indigo-500/50">
                                    Node: LLM_UPLINK_0
                                </span>
                            </div>
                        </div>

                        {!activeJob && !generatedContent && !isGenerating ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-20 relative z-20">
                                <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-10 border border-white/5 group-hover:rotate-6 transition-transform">
                                    <BeakerIcon className="w-16 h-16 text-slate-700" />
                                </div>
                                <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-sm italic mb-4">Core Processor Idle</p>
                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest max-w-lg leading-relaxed opacity-60 px-12">
                                    Initiate an architectural synthesis task from the command array to engage the institutional neural processing cluster.
                                </p>
                            </div>
                        ) : isGenerating ? (
                            <div className="flex-1 space-y-12 relative z-20">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end mb-4">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] italic mb-1">AI Generation in Progress</p>
                                        <p className="text-white font-black text-3xl italic tracking-tighter animate-pulse">...</p>
                                    </div>
                                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/10 shadow-inner">
                                        <motion.div
                                            animate={{ width: ['0%', '100%'] }}
                                            transition={{ duration: 15, repeat: Infinity }}
                                            className="h-full bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                                        />
                                    </div>
                                </div>

                                <div className="bg-black/60 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10 font-mono text-xs text-indigo-200 h-[350px] overflow-y-auto whitespace-pre-wrap custom-scrollbar group-hover:border-indigo-500/20 transition-colors">
                                    <div className="space-y-4 font-bold uppercase tracking-widest text-[10px] opacity-80">
                                        <p className="flex items-center gap-3"> Establishing Groq Matrix Connection... <span className="text-emerald-500">[OK]</span></p>
                                        <p className="flex items-center gap-3"> Retrieval System Initialization... <span className="text-emerald-500">[OK]</span></p>
                                        <p className="flex items-center gap-3 animate-pulse"> Accessing Course Context for {course?.code}... <span className="text-indigo-400">[ACTIVE]</span></p>
                                        <p className="opacity-60 animate-pulse"> &gt; Loading Syllabus Artifacts...</p>
                                        <p className="opacity-60 animate-pulse"> &gt; Querying Groq Cloud LLM (llama3.3-70b)...</p>
                                        <p className="opacity-60 animate-pulse"> &gt; Generating Structured Content...</p>
                                        <p className="flex items-center gap-3 opacity-40 animate-pulse"> Synthesizing Questions...</p>
                                        <p className="flex items-center gap-3 opacity-40 animate-pulse"> Validating JSON Output...</p>
                                        <p className="text-indigo-400 mt-8 animate-pulse">⏳ This typically takes 10-15 seconds...</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 space-y-12 relative z-20">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end mb-4">
                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] italic mb-1">Packet Consolidation Progress</p>
                                        <p className="text-white font-black text-3xl italic tracking-tighter">{jobStatus?.progress || 0}%</p>
                                    </div>
                                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/10 shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${jobStatus?.progress || 10}%` }}
                                            transition={{ type: "spring", bounce: 0.2, duration: 1 }}
                                            className="h-full bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                                        />
                                    </div>
                                </div>

                                <div className="bg-black/60 backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10 font-mono text-xs text-indigo-200 h-[350px] overflow-y-auto whitespace-pre-wrap custom-scrollbar group-hover:border-indigo-500/20 transition-colors">
                                    {jobStatus?.status === 'completed' ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400">
                                            <p className="mb-4 text-emerald-500/50">::: ARCHITECTURE SYNC SUCCESS :::</p>
                                            <p className="mb-4 font-black">SYNOPSIS: DATA_PACKET_VERIFIED</p>
                                            <p className="mb-2">Course Ref: {courseId}</p>
                                            <p className="mb-2">Segment Density: {Math.round(JSON.stringify(jobStatus.result).length / 1024)} KB</p>
                                            <p className="mb-8">Timestamp: {new Date().toISOString()}</p>

                                            <div className="mt-12 p-10 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 backdrop-blur-xl">
                                                <p className="text-white font-black text-lg mb-6 italic tracking-tight uppercase">
                                                    {generatedContent?.assignmentTitle || 'Assignment Generated'}
                                                </p>

                                                {generatedContent?.questions && (
                                                    <div className="space-y-4 mb-6">
                                                        {generatedContent.questions.map((q, idx) => (
                                                            <div key={idx} className="bg-white/5 p-4 rounded-xl border border-emerald-500/10">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <p className="text-white font-bold text-sm">Q{idx + 1}. {q.question}</p>
                                                                    <span className="text-emerald-400 font-black text-xs ml-4">{q.marks} marks</span>
                                                                </div>
                                                                <div className="flex gap-2 text-[9px] text-slate-400">
                                                                    <span className="bg-indigo-500/20 px-2 py-1 rounded">{q.bloomLevel}</span>
                                                                    {q.coMapping?.map((co, i) => (
                                                                        <span key={i} className="bg-emerald-500/20 px-2 py-1 rounded">{co}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={publishAssignment}
                                                        disabled={isPublishing}
                                                        className={`flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-500 shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 italic flex items-center justify-center gap-2 ${isPublishing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {isPublishing ? (
                                                            <>
                                                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                                                Syncing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircleIcon className="w-4 h-4" />
                                                                Approve & Publish
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            console.log('📋 Full Assignment Data:', JSON.stringify(generatedContent, null, 2));
                                                            navigator.clipboard.writeText(JSON.stringify(generatedContent, null, 2));
                                                            alert('Assignment JSON copied to clipboard!');
                                                        }}
                                                        className="px-6 bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500 shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 italic"
                                                    >
                                                        JSON
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setGeneratedContent(null);
                                                            setJobStatus(null);
                                                        }}
                                                        className="px-8 bg-white/5 text-emerald-500 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all border border-emerald-500/20 italic"
                                                    >
                                                        Reset
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : jobStatus?.status === 'failed' ? (
                                        <div className="text-rose-500">
                                            <p className="mb-6 font-black text-sm italic">::: CRITICAL INTERRUPT DETECTED :::</p>
                                            <p className="bg-rose-500/10 p-6 rounded-2xl border border-rose-500/20 font-bold leading-relaxed">
                                                {jobStatus.error || 'The institutional node experienced a logic crash or timed out during the grounding phase.'}
                                            </p>
                                            <button
                                                onClick={() => triggerGeneration(formData.type.toLowerCase())}
                                                className="mt-8 px-8 py-3 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 transition-all"
                                            >
                                                Re-initialize Link
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 font-bold uppercase tracking-widest text-[10px] opacity-80">
                                            <p className="flex items-center gap-3"> Establishing Matrix Connection... <span className="text-emerald-500">[OK]</span></p>
                                            <p className="flex items-center gap-3"> Retrieval System Initialization... <span className="text-emerald-500">[OK]</span></p>
                                            <p className="flex items-center gap-3 animate-pulse"> Accessing Course Context for {course?.code}... <span className="text-indigo-400">[PENDING]</span></p>
                                            <p className="opacity-40"> &gt; Loading Syllabus Artifacts...</p>
                                            <p className="opacity-40"> &gt; Resolving Topic Complexity Metrics...</p>
                                            <p className="opacity-40"> &gt; Grounding in Institutional Guidelines...</p>
                                            <p className="flex items-center gap-3 opacity-20"> Synthesizing Structured Logic Output...</p>
                                            <p className="flex items-center gap-3 opacity-20"> Validating Against Bloom's Protocol...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mt-auto flex justify-between items-center px-6 pt-10 border-t border-white/5 relative z-20">
                            <div className="flex items-center gap-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Groq_Cloud_Burst</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Redis_Queue_Live</span>
                                </div>
                            </div>
                            <span className="text-[8px] font-black font-mono text-slate-600 tracking-tighter bg-white/5 px-4 py-1.5 rounded-full">TASK_REF: {activeJob || 'LISTENING_MODE'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

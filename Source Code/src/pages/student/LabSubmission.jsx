import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function LabSubmission() {
    const { labId } = useParams();
    const { user, token } = useAuthStore();
    const navigate = useNavigate();
    const [lab, setLab] = useState(null);
    const [code, setCode] = useState('');
    const [vivaAnswers, setVivaAnswers] = useState({});
    const [labReport, setLabReport] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [mySubmissions, setMySubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('submit');

    useEffect(() => {
        fetchLabData();
    }, [labId]);

    const fetchLabData = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [labRes, subsRes] = await Promise.allSettled([
                axios.get(`${API_BASE_URL}/code-lab/${labId}`, { headers }),
                axios.get(`${API_BASE_URL}/lab-submissions?lab=${labId}`, { headers })
            ]);

            if (labRes.status === 'fulfilled') setLab(labRes.value.data.data || labRes.value.data);
            if (subsRes.status === 'fulfilled') setMySubmissions(Array.isArray(subsRes.value.data) ? subsRes.value.data : subsRes.value.data.data || []);
        } catch (err) {
            console.error('Error loading lab:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVivaAnswer = (question, answer) => {
        setVivaAnswers(prev => ({ ...prev, [question]: answer }));
    };

    const handleSubmit = async () => {
        if (!code.trim()) {
            alert('Please write your code before submitting.');
            return;
        }
        setSubmitting(true);
        try {
            await axios.post(
                `${API_BASE_URL}/lab-submissions`,
                {
                    lab: labId,
                    submissionData: {
                        code,
                        labReport,
                        vivaAnswers,
                        language: lab?.language || 'javascript',
                    }
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Lab submitted successfully!');
            fetchLabData();
            setActiveTab('history');
        } catch (err) {
            console.error('Submission error:', err);
            alert('Failed to submit lab: ' + (err.response?.data?.message || err.message));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full animate-ping"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50 dark:bg-dark-900 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <Link to="/student/labs" className="text-xs font-black text-violet-600 uppercase tracking-widest hover:underline mb-2 inline-block">← Back to Labs</Link>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                            {lab?.title || 'Lab Submission'}
                        </h1>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {lab?.difficulty || 'Medium'} · {lab?.topics?.join(', ') || 'General'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${mySubmissions.length > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                            }`}>
                            {mySubmissions.length > 0 ? `${mySubmissions.length} Submitted` : 'Not Submitted'}
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8">
                    {[
                        { id: 'submit', label: '📝 Submit', icon: '' },
                        { id: 'manual', label: '📖 Lab Manual', icon: '' },
                        { id: 'history', label: `📊 History (${mySubmissions.length})`, icon: '' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                                    : 'bg-white dark:bg-dark-800 text-slate-400 border border-slate-100 dark:border-dark-700 hover:text-violet-600'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Submit Tab */}
                {activeTab === 'submit' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Code Editor */}
                            <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-8 shadow-lg border border-slate-100 dark:border-dark-700">
                                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 flex items-center gap-2">
                                    💻 Your Code
                                </h2>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    rows={18}
                                    placeholder="// Write your lab code here..."
                                    className="w-full bg-gray-900 text-gray-100 font-mono text-sm p-6 rounded-2xl border-none outline-none resize-none"
                                    style={{ tabSize: 4 }}
                                />
                            </div>

                            {/* Lab Report */}
                            <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-8 shadow-lg border border-slate-100 dark:border-dark-700">
                                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 flex items-center gap-2">
                                    📋 Lab Report
                                </h2>
                                <textarea
                                    value={labReport}
                                    onChange={(e) => setLabReport(e.target.value)}
                                    rows={6}
                                    placeholder="Describe your approach, observations, and conclusions..."
                                    className="w-full bg-slate-50 dark:bg-dark-900 text-slate-900 dark:text-white text-sm p-6 rounded-2xl border border-slate-100 dark:border-dark-700 outline-none resize-none focus:ring-2 ring-violet-500/20"
                                />
                            </div>
                        </div>

                        {/* Sidebar: Viva + Submit */}
                        <div className="space-y-6">
                            {/* Viva Questions */}
                            {lab?.vivaQuestions && lab.vivaQuestions.length > 0 && (
                                <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-8 shadow-lg border border-slate-100 dark:border-dark-700">
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                                        🎤 Viva Questions
                                    </h2>
                                    <div className="space-y-5">
                                        {lab.vivaQuestions.map((q, i) => (
                                            <div key={i}>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                    Q{i + 1}: {typeof q === 'string' ? q : q.question}
                                                </p>
                                                <textarea
                                                    value={vivaAnswers[i] || ''}
                                                    onChange={(e) => handleVivaAnswer(i, e.target.value)}
                                                    rows={2}
                                                    placeholder="Your answer..."
                                                    className="w-full bg-slate-50 dark:bg-dark-900 text-sm p-3 rounded-xl border border-slate-100 dark:border-dark-700 outline-none resize-none dark:text-white"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-xl shadow-violet-500/20">
                                <h3 className="text-lg font-black uppercase tracking-tighter mb-3">Ready to Submit?</h3>
                                <p className="text-xs font-bold opacity-80 leading-relaxed mb-6 uppercase tracking-tight">
                                    Ensure your code runs correctly and all viva questions are answered before submitting.
                                </p>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !code.trim()}
                                    className="w-full py-4 bg-white text-violet-600 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-violet-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        '🚀 Submit Lab'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lab Manual Tab */}
                {activeTab === 'manual' && (
                    <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-10 shadow-lg border border-slate-100 dark:border-dark-700">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">Lab Manual</h2>
                        {lab?.description ? (
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{lab.description}</p>
                                {lab?.objectives && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3">Objectives</h3>
                                        <ul className="space-y-2">
                                            {(Array.isArray(lab.objectives) ? lab.objectives : [lab.objectives]).map((obj, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="text-violet-600 font-bold mt-0.5">•</span> {obj}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {lab?.steps && lab.steps.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-3">Steps</h3>
                                        <div className="space-y-3">
                                            {lab.steps.map((step, i) => (
                                                <div key={i} className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-dark-900 rounded-xl">
                                                    <div className="w-8 h-8 bg-violet-600 text-white rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0">{i + 1}</div>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">{typeof step === 'string' ? step : step.instruction || step.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic">No lab manual available.</p>
                        )}
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="space-y-4">
                        {mySubmissions.length > 0 ? mySubmissions.map((sub, i) => (
                            <motion.div
                                key={sub._id || i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white dark:bg-dark-800 rounded-[2rem] p-8 shadow-lg border border-slate-100 dark:border-dark-700"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-violet-600 text-white rounded-xl flex items-center justify-center font-black text-sm">
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                                Submission #{mySubmissions.length - i}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(sub.createdAt || sub.submittedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.grade ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                                        }`}>
                                        {sub.grade ? `Graded: ${sub.grade}` : 'Pending Review'}
                                    </span>
                                </div>
                                {sub.submissionData?.code && (
                                    <pre className="bg-gray-900 text-gray-100 font-mono text-xs p-4 rounded-xl overflow-x-auto max-h-40 mt-3">{sub.submissionData.code.slice(0, 500)}{sub.submissionData.code.length > 500 ? '...' : ''}</pre>
                                )}
                                {sub.feedback && (
                                    <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-200 dark:border-indigo-800/30">
                                        <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">📝 Faculty Feedback: {sub.feedback}</p>
                                    </div>
                                )}
                            </motion.div>
                        )) : (
                            <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-16 shadow-lg border border-slate-100 dark:border-dark-700 text-center">
                                <div className="text-5xl mb-4">📭</div>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No submissions yet</p>
                                <button onClick={() => setActiveTab('submit')} className="mt-4 px-6 py-3 bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest">
                                    Make First Submission →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

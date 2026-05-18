import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function UltimateLabGenerator() {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState({
        course: 'BTech_CSE',
        semester: 3,
        subject: 'Data Structures',
        topic: 'Linked Lists',
        labType: 'Programming',
        difficulty: 'Medium',
        labNumber: 1
    });
    const [generatedLab, setGeneratedLab] = useState(null);
    const [options, setOptions] = useState(null);
    const [seriesMode, setSeriesMode] = useState(false);
    const [seriesTopics, setSeriesTopics] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchOptions();
    }, []);

    const fetchOptions = async () => {
        try {
            const res = await axios.get(
                `${API_BASE_URL}/ultimate-lab-generator/config-options`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOptions(res.data.data);
        } catch (error) {
            console.error('Fetch options error:', error);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setGeneratedLab(null);

        try {
            const res = await axios.post(
                `${API_BASE_URL}/ultimate-lab-generator/generate`,
                config,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setGeneratedLab(res.data.data);
            setActiveTab('overview');
        } catch (error) {
            console.error('Generation error:', error);
            alert('Failed to generate lab: ' + (typeof error.response?.data?.message === 'string' ? error.response?.data?.message : error.response?.data?.message?.toString() || typeof error.message === 'string' ? error.message : error?.toString() || 'Unknown error occurred'));
        } finally {
            setLoading(false);
        }
    };

    const handleSeriesGenerate = async () => {
        const topics = seriesTopics.split('\n').filter(t => t.trim());
        if (topics.length === 0) {
            alert('Please enter topics (one per line)');
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(
                `${API_BASE_URL}/ultimate-lab-generator/series`,
                {
                    ...config,
                    topics: topics.map(t => t.trim())
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert(`Successfully generated ${res.data.data.length} lab manuals!`);
            setSeriesTopics('');
        } catch (error) {
            console.error('Series generation error:', error);
            alert('Failed to generate series: ' + (typeof error.response?.data?.message === 'string' ? error.response?.data?.message : error.response?.data?.message?.toString() || typeof error.message === 'string' ? error.message : error?.toString() || 'Unknown error occurred'));
        } finally {
            setLoading(false);
        }
    };

    if (!options) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex items-center justify-center">
                <div className="text-gray-600 dark:text-gray-400">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                        🧪 Ultimate Lab Generator
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Generate comprehensive lab manuals with CO/PO mapping, viva questions, and multi-language code
                    </p>
                </div>

                {/* Mode Toggle */}
                <div className="mb-6 flex gap-4">
                    <button
                        onClick={() => setSeriesMode(false)}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${
                            !seriesMode
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        Single Lab
                    </button>
                    <button
                        onClick={() => setSeriesMode(true)}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${
                            seriesMode
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        Lab Series
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Configuration Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 shadow-lg sticky top-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                Configuration
                            </h2>

                            {!seriesMode ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Course
                                        </label>
                                        <select
                                            value={config.course}
                                            onChange={(e) => setConfig({ ...config, course: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                                        >
                                            {options.courses.map(c => (
                                                <option key={c} value={c}>{c.replace('_', ' ')}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Semester
                                        </label>
                                        <select
                                            value={config.semester}
                                            onChange={(e) => setConfig({ ...config, semester: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                                        >
                                            {options.semesters.map(s => (
                                                <option key={s} value={s}>Semester {s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            value={config.subject}
                                            onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                                            placeholder="e.g., Data Structures"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Topic
                                        </label>
                                        <input
                                            type="text"
                                            value={config.topic}
                                            onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                                            placeholder="e.g., Linked Lists"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Lab Type
                                        </label>
                                        <select
                                            value={config.labType}
                                            onChange={(e) => setConfig({ ...config, labType: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                                        >
                                            {options.labTypes.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Difficulty
                                        </label>
                                        <select
                                            value={config.difficulty}
                                            onChange={(e) => setConfig({ ...config, difficulty: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                                        >
                                            {options.difficulties.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Lab Number
                                        </label>
                                        <input
                                            type="number"
                                            value={config.labNumber}
                                            onChange={(e) => setConfig({ ...config, labNumber: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                                            min="1"
                                        />
                                    </div>

                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading}
                                        className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Generating...' : '✨ Generate Lab Manual'}
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Enter topics (one per line) to generate a complete lab series
                                    </p>
                                    <textarea
                                        value={seriesTopics}
                                        onChange={(e) => setSeriesTopics(e.target.value)}
                                        placeholder="Linked Lists&#10;Stacks&#10;Queues&#10;Trees&#10;Graphs"
                                        rows={12}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-white font-mono text-sm"
                                    />
                                    <button
                                        onClick={handleSeriesGenerate}
                                        disabled={loading}
                                        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Generating Series...' : '🚀 Generate Lab Series'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg overflow-hidden">
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-gray-600 dark:text-gray-400">Generating comprehensive lab manual...</p>
                                </div>
                            )}

                            {!loading && !generatedLab && (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                    <div className="text-6xl mb-4">🧪</div>
                                    <p>Configure and generate a lab manual to see it here</p>
                                </div>
                            )}

                            {!loading && generatedLab && (
                                <div>
                                    {/* Tabs */}
                                    <div className="flex border-b border-gray-200 dark:border-dark-700 overflow-x-auto">
                                        {['overview', 'theory', 'code', 'viva', 'grading'].map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`px-6 py-4 font-bold text-sm whitespace-nowrap transition-all ${
                                                    activeTab === tab
                                                        ? 'border-b-2 border-indigo-600 text-indigo-600'
                                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                }`}
                                            >
                                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tab Content */}
                                    <div className="p-6 max-h-[800px] overflow-y-auto">
                                        {activeTab === 'overview' && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="space-y-6"
                                            >
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                                        Lab {generatedLab.labNumber}: {generatedLab.title}
                                                    </h3>
                                                    <div className="flex gap-2 mb-4">
                                                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
                                                            {generatedLab.labType}
                                                        </span>
                                                        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold">
                                                            {generatedLab.difficulty}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Aim</h4>
                                                    <p className="text-gray-700 dark:text-gray-300">{generatedLab.aim}</p>
                                                </div>

                                                {generatedLab.learningOutcomes && generatedLab.learningOutcomes.length > 0 && (
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Learning Outcomes</h4>
                                                        <ul className="list-disc list-inside space-y-1">
                                                            {generatedLab.learningOutcomes.map((outcome, i) => (
                                                                <li key={i} className="text-gray-700 dark:text-gray-300">{outcome}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {generatedLab.courseOutcomes && generatedLab.courseOutcomes.length > 0 && (
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Course Outcomes (CO)</h4>
                                                        <div className="space-y-2">
                                                            {generatedLab.courseOutcomes.map((co, i) => (
                                                                <div key={i} className="p-3 bg-slate-50 dark:bg-dark-700 rounded-lg">
                                                                    <span className="font-bold text-indigo-600">{co.code}:</span>
                                                                    <span className="text-gray-700 dark:text-gray-300 ml-2">{co.description}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {generatedLab.industrialApplication && (
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Industrial Application</h4>
                                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                            {generatedLab.industrialApplication}
                                                        </p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        {activeTab === 'theory' && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="space-y-6"
                                            >
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Theory</h4>
                                                    <div className="prose dark:prose-invert max-w-none">
                                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                                            {generatedLab.theory}
                                                        </p>
                                                    </div>
                                                </div>

                                                {generatedLab.algorithm && (
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Algorithm</h4>
                                                        <pre className="p-4 bg-slate-50 dark:bg-dark-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                            {generatedLab.algorithm}
                                                        </pre>
                                                    </div>
                                                )}

                                                {generatedLab.flowExplanation && (
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Flow Explanation</h4>
                                                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                            {generatedLab.flowExplanation}
                                                        </p>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        {activeTab === 'code' && generatedLab.code && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="space-y-6"
                                            >
                                                {Object.entries(generatedLab.code).map(([lang, code]) => (
                                                    code && (
                                                        <div key={lang}>
                                                            <h4 className="font-bold text-gray-900 dark:text-white mb-2 capitalize">
                                                                {lang} Code
                                                            </h4>
                                                            <pre className="p-4 bg-slate-900 text-gray-100 rounded-lg text-sm overflow-x-auto">
                                                                <code>{code}</code>
                                                            </pre>
                                                        </div>
                                                    )
                                                ))}

                                                {generatedLab.sampleOutput && (
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Sample Output</h4>
                                                        <pre className="p-4 bg-slate-50 dark:bg-dark-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                                            {generatedLab.sampleOutput}
                                                        </pre>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        {activeTab === 'viva' && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="space-y-4"
                                            >
                                                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Viva Questions</h4>
                                                {generatedLab.vivaQuestions && generatedLab.vivaQuestions.map((viva, i) => (
                                                    <div key={i} className="p-4 bg-slate-50 dark:bg-dark-700 rounded-lg">
                                                        <div className="flex items-start gap-3 mb-2">
                                                            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-xs font-bold">
                                                                {viva.difficulty}
                                                            </span>
                                                            <p className="flex-1 font-bold text-gray-900 dark:text-white">
                                                                Q{i + 1}: {viva.question}
                                                            </p>
                                                        </div>
                                                        <p className="text-gray-700 dark:text-gray-300 ml-16">
                                                            <strong>Answer:</strong> {viva.answer}
                                                        </p>
                                                    </div>
                                                ))}

                                                {generatedLab.commonMistakes && generatedLab.commonMistakes.length > 0 && (
                                                    <div className="mt-6">
                                                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Common Mistakes</h4>
                                                        {generatedLab.commonMistakes.map((mistake, i) => (
                                                            <div key={i} className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg mb-3">
                                                                <p className="font-bold text-red-600 dark:text-red-400 mb-1">
                                                                    {mistake.mistake}
                                                                </p>
                                                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                                                                    <strong>Why:</strong> {mistake.explanation}
                                                                </p>
                                                                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                                                    <strong>Solution:</strong> {mistake.solution}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}

                                        {activeTab === 'grading' && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="space-y-6"
                                            >
                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">Grading Rubric</h4>
                                                    <div className="space-y-3">
                                                        {Object.entries(generatedLab.gradingRubric || {}).map(([criterion, marks]) => (
                                                            <div key={criterion} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-dark-700 rounded-lg">
                                                                <span className="font-medium text-gray-900 dark:text-white capitalize">
                                                                    {criterion.replace(/([A-Z])/g, ' $1').trim()}
                                                                </span>
                                                                <span className="font-bold text-indigo-600">{marks} marks</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Estimated Time</h4>
                                                    <p className="text-gray-700 dark:text-gray-300">
                                                        {generatedLab.estimatedTime} minutes
                                                    </p>
                                                </div>

                                                {generatedLab.prerequisites && generatedLab.prerequisites.length > 0 && (
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 dark:text-white mb-2">Prerequisites</h4>
                                                        <ul className="list-disc list-inside space-y-1">
                                                            {generatedLab.prerequisites.map((prereq, i) => (
                                                                <li key={i} className="text-gray-700 dark:text-gray-300">{prereq}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="p-6 border-t border-gray-200 dark:border-dark-700 flex gap-4">
                                        <button
                                            onClick={handleGenerate}
                                            className="px-6 py-2 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg font-bold hover:bg-gray-300 dark:hover:bg-dark-600 transition-all"
                                        >
                                            Generate Another
                                        </button>
                                        <button
                                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all"
                                        >
                                            Download PDF
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

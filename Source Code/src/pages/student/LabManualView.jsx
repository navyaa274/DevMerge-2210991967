import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import labManualService from '../../services/api/labManualService';
import {
    ChevronLeftIcon,
    DocumentTextIcon,
    CodeBracketIcon,
    QuestionMarkCircleIcon,
    LightBulbIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function LabManualView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lab, setLab] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState('python');
    const [showAnswers, setShowAnswers] = useState({});

    useEffect(() => {
        fetchLab();
    }, [id]);

    const fetchLab = async () => {
        try {
            setLoading(true);
            const response = await labManualService.getLabManual(id);
            setLab(response.data);
            
            if (response.data?.code) {
                const availableLangs = Object.keys(response.data.code).filter(lang => response.data.code[lang]);
                if (availableLangs.length > 0) {
                    setSelectedLanguage(availableLangs[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch lab:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleAnswer = (idx) => {
        setShowAnswers(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!lab) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-500">Lab manual not found</p>
            </div>
        );
    }

    const availableLanguages = lab.code ? Object.keys(lab.code).filter(lang => lab.code[lang]) : [];

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-8 max-w-6xl mx-auto min-h-screen pb-20"
        >
            {/* Back Button */}
            <button
                onClick={() => navigate('/student/lab-manuals')}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 mb-6 font-bold text-sm"
            >
                <ChevronLeftIcon className="w-4 h-4" />
                Back to Lab Manuals
            </button>

            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 shadow-lg mb-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-black bg-white/20 px-3 py-1 rounded">
                        Lab {lab.labNumber}
                    </span>
                    <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded">
                        {lab.difficulty}
                    </span>
                    <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded">
                        {lab.labType}
                    </span>
                </div>
                <h1 className="text-4xl font-black mb-3">
                    {lab.title}
                </h1>
                <p className="text-indigo-100 text-lg">{lab.aim}</p>
            </div>

            {/* Learning Outcomes */}
            {lab.learningOutcomes && lab.learningOutcomes.length > 0 && (
                <div className="bg-white dark:bg-dark-900 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-dark-800 mb-6">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <CheckCircleIcon className="w-6 h-6 text-green-500" />
                        What You'll Learn
                    </h2>
                    <ul className="space-y-3">
                        {lab.learningOutcomes.map((outcome, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                                <span className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                                    {idx + 1}
                                </span>
                                <span>{outcome}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Theory */}
            <div className="bg-white dark:bg-dark-900 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-dark-800 mb-6">
                <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
                    Theory & Concepts
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {lab.theory}
                    </p>
                </div>
            </div>

            {/* Algorithm */}
            {lab.algorithm && (
                <div className="bg-white dark:bg-dark-900 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-dark-800 mb-6">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">Algorithm</h2>
                    <pre className="bg-slate-50 dark:bg-dark-950 p-4 rounded-xl overflow-x-auto text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono">
                        {lab.algorithm}
                    </pre>
                </div>
            )}

            {/* Code Implementation */}
            {availableLanguages.length > 0 && (
                <div className="bg-white dark:bg-dark-900 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-dark-800 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <CodeBracketIcon className="w-6 h-6 text-green-600" />
                            Code Implementation
                        </h2>
                        <div className="flex gap-2">
                            {availableLanguages.map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setSelectedLanguage(lang)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                        selectedLanguage === lang
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                    }`}
                                >
                                    {lang.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                    <pre className="bg-slate-900 text-green-400 p-6 rounded-xl overflow-x-auto text-sm font-mono">
                        <code>{lab.code[selectedLanguage]}</code>
                    </pre>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(lab.code[selectedLanguage]);
                            alert('Code copied to clipboard!');
                        }}
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-all"
                    >
                        Copy Code
                    </button>
                </div>
            )}

            {/* Sample Output */}
            {lab.sampleOutput && (
                <div className="bg-white dark:bg-dark-900 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-dark-800 mb-6">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">Sample Output</h2>
                    <pre className="bg-slate-50 dark:bg-dark-950 p-4 rounded-xl overflow-x-auto text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono">
                        {lab.sampleOutput}
                    </pre>
                </div>
            )}

            {/* Viva Questions */}
            {lab.vivaQuestions && lab.vivaQuestions.length > 0 && (
                <div className="bg-white dark:bg-dark-900 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-dark-800 mb-6">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <QuestionMarkCircleIcon className="w-6 h-6 text-purple-600" />
                        Viva Questions
                    </h2>
                    <div className="space-y-4">
                        {lab.vivaQuestions.map((viva, idx) => (
                            <div key={idx} className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/10 p-4 rounded-r-lg">
                                <p className="font-bold text-slate-900 dark:text-white mb-2">
                                    Q{idx + 1}. {viva.question}
                                </p>
                                {viva.answer && (
                                    <>
                                        <button
                                            onClick={() => toggleAnswer(idx)}
                                            className="text-xs font-bold text-purple-600 hover:text-purple-700 mb-2"
                                        >
                                            {showAnswers[idx] ? '▼ Hide Answer' : '▶ Show Answer'}
                                        </button>
                                        {showAnswers[idx] && (
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 pl-4 border-l-2 border-purple-300">
                                                {viva.answer}
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

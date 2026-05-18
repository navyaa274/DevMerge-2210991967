import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import labManualService from '../../services/api/labManualService';
import {
    ChevronLeftIcon,
    DocumentTextIcon,
    CodeBracketIcon,
    QuestionMarkCircleIcon,
    LightBulbIcon
} from '@heroicons/react/24/outline';

export default function LabManualDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lab, setLab] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState('python');

    useEffect(() => {
        fetchLab();
    }, [id]);

    const fetchLab = async () => {
        try {
            setLoading(true);
            const response = await labManualService.getLabManual(id);
            setLab(response.data);
            
            // Set first available language
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
            className="p-8 max-w-6xl mx-auto min-h-screen"
        >
            {/* Back Button */}
            <button
                onClick={() => navigate('/faculty/lab-manuals')}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 mb-6 font-bold text-sm"
            >
                <ChevronLeftIcon className="w-4 h-4" />
                Back to Lab Manuals
            </button>

            {/* Header */}
            <div className="bg-white dark:bg-dark-900 rounded-2xl p-8 shadow-lg border border-slate-100 dark:border-dark-800 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded">
                                Lab {lab.labNumber}
                            </span>
                            <span className={`text-xs font-bold px-3 py-1 rounded ${
                                lab.difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
                                lab.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                                'bg-red-50 text-red-600'
                            }`}>
                                {lab.difficulty}
                            </span>
                            <span className="text-xs font-bold bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded">
                                {lab.labType}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-3">
                            {lab.title}
                        </h1>
                    </div>
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl">
                    <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Aim</p>
                    <p className="text-slate-700 dark:text-slate-300">{lab.aim}</p>
                </div>
            </div>

            {/* Learning Outcomes */}
            {lab.learningOutcomes && lab.learningOutcomes.length > 0 && (
                <div className="bg-white dark:bg-dark-900 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-dark-800 mb-6">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <LightBulbIcon className="w-6 h-6 text-yellow-500" />
                        Learning Outcomes
                    </h2>
                    <ul className="space-y-2">
                        {lab.learningOutcomes.map((outcome, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                                <span className="text-indigo-600 font-bold">{idx + 1}.</span>
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
                    Theory
                </h2>
                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{lab.theory}</p>
                </div>
            </div>

            {/* Algorithm */}
            {lab.algorithm && (
                <div className="bg-white dark:bg-dark-900 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-dark-800 mb-6">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4">Algorithm</h2>
                    <pre className="bg-slate-50 dark:bg-dark-950 p-4 rounded-xl overflow-x-auto text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {lab.algorithm}
                    </pre>
                </div>
            )}

            {/* Code */}
            {availableLanguages.length > 0 && (
                <div className="bg-white dark:bg-dark-900 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-dark-800 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <CodeBracketIcon className="w-6 h-6 text-green-600" />
                            Implementation
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
                    <pre className="bg-slate-900 text-green-400 p-6 rounded-xl overflow-x-auto text-sm">
                        <code>{lab.code[selectedLanguage]}</code>
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
                            <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2">
                                <p className="font-bold text-slate-900 dark:text-white mb-2">
                                    Q{idx + 1}. {viva.question}
                                </p>
                                {viva.answer && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        <span className="font-bold text-purple-600">A:</span> {viva.answer}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import labManualService from '../../services/api/labManualService';
import {
    BeakerIcon,
    BookOpenIcon,
    ClockIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';

export default function StudentLabManuals() {
    const navigate = useNavigate();
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ difficulty: '' });

    useEffect(() => {
        fetchLabs();
    }, [filter]);

    const fetchLabs = async () => {
        try {
            setLoading(true);
            const response = await labManualService.getAllLabManuals({ 
                ...filter,
                status: 'Published' 
            });
            setLabs(response.data || []);
        } catch (error) {
            console.error('Failed to fetch lab manuals:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-8 max-w-7xl mx-auto min-h-screen"
        >
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                    Lab <span className="text-indigo-600">Manuals</span>
                </h1>
                <p className="text-indigo-600 font-bold uppercase tracking-[0.3em] text-[10px] mt-3 flex items-center gap-2">
                    <BeakerIcon className="w-4 h-4" />
                    Comprehensive Lab Guides & Tutorials
                </p>
            </div>

            {/* Filter */}
            <div className="flex gap-4 mb-8">
                <select
                    value={filter.difficulty}
                    onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
                    className="px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-slate-900 dark:text-white"
                >
                    <option value="">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                </select>
            </div>

            {/* Lab Cards */}
            {labs.length === 0 ? (
                <div className="text-center py-20">
                    <BeakerIcon className="w-20 h-20 text-slate-300 dark:text-dark-700 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-bold">No lab manuals available</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Check back later for new labs</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {labs.map((lab, idx) => (
                        <motion.div
                            key={lab._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => navigate(`/student/lab-manuals/${lab._id}`)}
                            className="bg-white dark:bg-dark-900 rounded-2xl p-6 shadow-lg border border-slate-100 dark:border-dark-800 hover:border-indigo-500 transition-all cursor-pointer group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                                            Lab {lab.labNumber}
                                        </span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                                            lab.difficulty === 'Easy' ? 'bg-green-50 text-green-600 dark:bg-green-900/30' :
                                            lab.difficulty === 'Medium' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30' :
                                            'bg-red-50 text-red-600 dark:bg-red-900/30'
                                        }`}>
                                            {lab.difficulty}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                        {lab.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-3">
                                        {lab.aim}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                                {lab.estimatedTime && (
                                    <div className="flex items-center gap-1">
                                        <ClockIcon className="w-4 h-4" />
                                        <span>{lab.estimatedTime} min</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <AcademicCapIcon className="w-4 h-4" />
                                    <span>{lab.labType}</span>
                                </div>
                            </div>

                            {lab.learningOutcomes && lab.learningOutcomes.length > 0 && (
                                <div className="bg-slate-50 dark:bg-dark-950 p-3 rounded-lg">
                                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                        You'll Learn
                                    </p>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
                                        {lab.learningOutcomes[0]}
                                    </p>
                                </div>
                            )}

                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                                    Start Lab →
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

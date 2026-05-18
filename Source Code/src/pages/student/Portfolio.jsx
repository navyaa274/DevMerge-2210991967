import React, { useRef, useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function StudentPortfolio() {
    const { user, token } = useAuthStore();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const portfolioRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, [user, token]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/analytics/student/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        setDownloading(true);
        try {
            const response = await axios.post(
                `${API_BASE_URL}/reports/portfolio/${user.id}`,
                {}, // Profile data is fetched on backend
                {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${user.name.replace(/\s+/g, '_')}_Portfolio.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading portfolio:', error);
            alert('Failed to generate professional portfolio. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600 font-medium">Crunching your achievements...</span>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gray-50 p-4 md:p-8"
        >
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Professional Portfolio</h1>
                        <p className="text-gray-500 mt-1 font-medium text-lg">Your verified academic and technical identity.</p>
                    </div>
                    <button
                        onClick={downloadPDF}
                        disabled={downloading}
                        className="group relative flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-1 active:scale-95 disabled:bg-indigo-300"
                    >
                        <svg className={`w-5 h-5 ${downloading ? 'animate-bounce' : 'group-hover:animate-pulse'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {downloading ? 'Forging PDF...' : 'Download Official Portfolio'}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar: Profile Info */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                            <div className="text-center">
                                <div className="w-32 h-32 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg mb-4 uppercase">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                                <p className="text-indigo-600 font-semibold mt-1">
                                    {user?.tagline || 'Future Software Engineer'}
                                </p>
                                <div className="flex justify-center gap-3 mt-4 text-gray-400">
                                    {user?.socialLinks?.github && (
                                        <a href={user.socialLinks.github} target="_blank" rel="noreferrer" className="hover:text-gray-900 transition">GitHub</a>
                                    )}
                                    {user?.socialLinks?.linkedin && (
                                        <a href={user.socialLinks.linkedin} target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition">LinkedIn</a>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-50">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Core Statistics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <p className="text-2xl font-bold text-gray-900">{stats?.problemsSolved || 0}</p>
                                        <p className="text-xs text-gray-500 font-medium lowercase">Solved</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <p className="text-2xl font-bold text-gray-900">{stats?.totalPoints || 0}</p>
                                        <p className="text-xs text-gray-500 font-medium lowercase">XP Earned</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Verified Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {(user?.skills?.length > 0 ? user.skills : stats?.topSkills || []).map((skill, i) => (
                                    <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100">
                                        {skill}
                                    </span>
                                ))}
                                {(!user?.skills?.length && !stats?.topSkills?.length) && (
                                    <p className="text-sm text-gray-400 italic">No skills verified yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Progress & Achievements */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Learning Trajectory</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-100">
                                    <p className="text-green-700 text-sm font-bold mb-1">Easy</p>
                                    <p className="text-3xl font-black text-green-900">{stats?.easyProblems || 0}</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100/50 border border-yellow-100">
                                    <p className="text-yellow-700 text-sm font-bold mb-1">Medium</p>
                                    <p className="text-3xl font-black text-yellow-900">{stats?.mediumProblems || 0}</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-100">
                                    <p className="text-red-700 text-sm font-bold mb-1">Hard</p>
                                    <p className="text-3xl font-black text-red-900">{stats?.hardProblems || 0}</p>
                                </div>
                            </div>
                            <div className="mt-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600 font-bold">Overall Acceptance</span>
                                    <span className="text-indigo-600 font-black">{stats?.acceptanceRate || 0}%</span>
                                </div>
                                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats?.acceptanceRate || 0}%` }}
                                        className="h-full bg-indigo-600"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Prestigious Badges</h3>
                                <div className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                                    {stats?.achievements?.length || 0} Earned
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {stats?.achievements && stats.achievements.length > 0 ? (
                                    stats.achievements.map((ach, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ scale: 1.05 }}
                                            className="group text-center cursor-help"
                                        >
                                            <div className="w-20 h-20 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center text-4xl shadow-sm group-hover:shadow-md transition-all">
                                                {ach.icon || '🏅'}
                                            </div>
                                            <p className="text-xs font-bold text-gray-700 mt-3 truncate">{ach.name}</p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-10 text-center text-gray-400 font-medium bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                        No prestigious badges yet. Solve more labs to unlock!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function AdminModeration() {
    const [flags, setFlags] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFlags = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/moderation/flags`, { headers: { Authorization: `Bearer ${token}` } });
            setFlags(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch flags:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlags();
    }, []);

    const handleAction = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/moderation/flags/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            fetchFlags();
        } catch (error) {
            console.error('Failed to update flag:', error);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Content Moderation</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span> Global Issue Escalations
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-10">
                <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-dark-800 shadow-xl border-t-8 border-amber-500">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Flagged Entities Queue</h2>
                        <div className="flex gap-4">
                            <button className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors hover:bg-emerald-200">Resolve All</button>
                        </div>
                    </div>

                    <table className="w-full text-left border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-3">Flag ID & Context</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Severity</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {flags.map((flag, i) => (
                                <motion.tr initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={flag.id} className="bg-gray-50 dark:bg-dark-900/50 rounded-xl hover:bg-white dark:hover:bg-dark-800 transition shadow-sm group">
                                    <td className="py-5 px-6">
                                        <p className="font-mono text-sm text-gray-900 dark:text-white font-black">{flag._id.slice(-6)}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{flag.context}</p>
                                    </td>
                                    <td className="py-5 px-6 text-xs font-bold text-indigo-600 dark:text-indigo-400">{flag.userId?.name || 'Unknown'}</td>
                                    <td className="py-5 px-6 text-xs text-gray-900 dark:text-white font-bold">{flag.type}</td>
                                    <td className="py-5 px-6">
                                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${flag.severity === 'Critical' ? 'bg-rose-500 text-white' : flag.severity === 'High' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'}`}>
                                            {flag.severity}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleAction(flag._id, 'Dismissed')} className="px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Dismiss</button>
                                            <button onClick={() => handleAction(flag._id, 'Resolved')} className="px-4 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">Ban</button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}

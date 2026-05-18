import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function DatabaseOps() {
    const [backups, setBackups] = useState([
        { id: 'bck_004', date: 'Today, 03:00 AM', size: '2.4 GB', status: 'Success', type: 'Automated' },
        { id: 'bck_003', date: 'Yesterday, 03:00 AM', size: '2.3 GB', status: 'Success', type: 'Automated' },
        { id: 'bck_002', date: 'Mon, 14:30 PM', size: '2.3 GB', status: 'Success', type: 'Manual' },
        { id: 'bck_001', date: 'Sun, 03:00 AM', size: '1.9 GB', status: 'Warning', type: 'Automated' }
    ]);
    const [isCreating, setIsCreating] = useState(false);
    const [dbStats, setDbStats] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE_URL}/superadmin/db-stats`, { headers: { Authorization: `Bearer ${token}` } });
                setDbStats(res.data);
            } catch (error) {
                console.error('Failed fetching DB stats:', error);
            }
        };
        fetchStats();
    }, []);

    const bytesToGB = (bytes) => (bytes / (1024 * 1024 * 1024)).toFixed(3);

    const createBackup = () => {
        setIsCreating(true);
        setTimeout(() => {
            setBackups([{ id: 'bck_005', date: 'Just now', size: '2.4 GB', status: 'Success', type: 'Manual' }, ...backups]);
            setIsCreating(false);
        }, 2000);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Database Ops</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> Storage Node Synchronization
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <div className="lg:col-span-3 space-y-10">
                    <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-dark-800 shadow-xl border-t-8 border-emerald-500">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Snapshot Registry</h2>
                            <button onClick={createBackup} disabled={isCreating} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
                                {isCreating ? 'Synchronizing...' : 'Take Manual Snapshot'}
                            </button>
                        </div>

                        <table className="w-full text-left border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <th className="px-6 py-3">Snapshot ID</th>
                                    <th className="px-6 py-3">Timestamp</th>
                                    <th className="px-6 py-3">Volume</th>
                                    <th className="px-6 py-3">Vector</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {backups.map((backup, i) => (
                                    <motion.tr initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={backup.id} className="bg-gray-50 dark:bg-dark-900/50 rounded-xl hover:bg-white dark:hover:bg-dark-800 transition shadow-sm">
                                        <td className="py-5 px-6 font-mono text-sm text-gray-900 dark:text-white font-black">{backup.id}</td>
                                        <td className="py-5 px-6 text-xs font-bold text-gray-500">{backup.date}</td>
                                        <td className="py-5 px-6 text-xs text-gray-400 font-bold">{backup.size}</td>
                                        <td className="py-5 px-6">
                                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${backup.status === 'Success' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                                {backup.status}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            <button className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 border-b border-transparent hover:border-emerald-600 transition-colors">Restore</button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-dark-800 shadow-xl border-l-[8px] border-blue-500">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Metrics Engine</h2>
                        <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-1">{dbStats ? bytesToGB(dbStats.dataSize + dbStats.indexSize) : '0.0'} GB</div>
                        <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-6 border-b border-gray-100 dark:border-dark-700 pb-6">Atlas Storage Consumed</p>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                    <span>Indexes</span><span>{dbStats ? bytesToGB(dbStats.indexSize) : '0.0'} GB</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-dark-900 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 w-1/3 h-full rounded-full" style={{ width: dbStats ? `${(dbStats.indexSize / (dbStats.dataSize + dbStats.indexSize)) * 100}%` : '33%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                    <span>Collections</span><span>{dbStats ? bytesToGB(dbStats.dataSize) : '0.0'} GB</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-dark-900 h-2 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 w-2/3 h-full rounded-full" style={{ width: dbStats ? `${(dbStats.dataSize / (dbStats.dataSize + dbStats.indexSize)) * 100}%` : '66%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-transform flex items-center justify-between">
                        <span>Rebuild Indexes</span>
                        <span className="text-lg">⚙️</span>
                    </button>
                    <button className="w-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 px-6 py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl transition-transform hover:bg-rose-100">
                        Shrink Storage
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

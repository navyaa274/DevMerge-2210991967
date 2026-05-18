import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheckIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    CommandLineIcon,
    UserCircleIcon,
    CalendarDaysIcon,
    SignalIcon
} from '@heroicons/react/24/outline';
import { ENDPOINTS } from '../../config/urls';
import apiClient from '../../services/api/apiClient';

export default function HODAuditLogs() {
    const { user } = useAuthStore();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ action: 'all', searchTerm: '' });
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAuditLogs();
    }, []);

    const fetchAuditLogs = async () => {
        try {
            setLoading(true);
            // Use the standardized public audit logs endpoint
            const response = await apiClient.get(ENDPOINTS.AUDIT_LOGS.PUBLIC);
            setLogs(response.data || response);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchAuditLogs();
    };

    const filteredLogs = logs.filter(log => {
        const matchesAction = filter.action === 'all' || log.action.toLowerCase().includes(filter.action.toLowerCase());
        const matchesSearch = log.description?.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
            log.userId?.toLowerCase().includes(filter.searchTerm.toLowerCase());
        return matchesAction && matchesSearch;
    });

    if (loading && !refreshing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 md:p-12 max-w-[1600px] mx-auto min-h-screen pt-24 font-sans"
        >
            {/* Header section */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-4 py-1.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">Security Node</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2 bg-slate-100 dark:bg-dark-900 px-4 py-1.5 rounded-full border border-slate-200 dark:border-dark-800">
                            <SignalIcon className="w-3 h-3 text-emerald-500 animate-pulse" />
                            Active Monitoring
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                        System <span className="text-emerald-600">Audit</span> Logs
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative group">
                        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search Logs..."
                            value={filter.searchTerm}
                            onChange={(e) => setFilter({ ...filter, searchTerm: e.target.value })}
                            className="pl-12 pr-6 py-4 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-2xl w-full sm:w-80 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className={`p-4 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-2xl text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-dark-800 transition-all shadow-sm group ${refreshing ? 'animate-pulse' : ''}`}
                    >
                        <ArrowPathIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Main Log Console */}
            <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-8 md:p-12 shadow-3xl border border-slate-50 dark:border-dark-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-9xl font-black italic pointer-events-none select-none uppercase tracking-tighter">Oversight</div>

                <div className="flex items-center gap-4 mb-10 border-b border-slate-100 dark:border-dark-800 pb-8">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                        <CommandLineIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Live Protocol Stream</h2>
                        <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Department Audit Instance</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode='popLayout'>
                        {filteredLogs.map((log, i) => (
                            <motion.div
                                key={log._id || i}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-50 dark:bg-dark-950/50 rounded-3xl border border-slate-100 dark:border-dark-800 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/0 to-emerald-600/0 group-hover:from-emerald-600/5 transition-all"></div>

                                <div className="flex items-start md:items-center gap-6 relative z-10 w-full md:w-auto">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg italic shrink-0 shadow-lg group-hover:rotate-6 transition-transform">
                                        {log.action?.charAt(0) || 'A'}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic truncate">{log.action}</p>
                                            <span className="px-3 py-1 bg-slate-200 dark:bg-dark-800 text-[8px] font-black text-slate-500 dark:text-slate-400 rounded-lg uppercase tracking-widest">{log.userId === 'system' ? 'System' : 'Admin'}</span>
                                        </div>
                                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide leading-relaxed">{log.description}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 mt-6 md:mt-0 relative z-10 shrink-0 w-full md:w-auto justify-between md:justify-end">
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1 flex items-center justify-end gap-2">
                                                <CalendarDaysIcon className="w-3 h-3 text-emerald-500" />
                                                {new Date(log.createdAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                                        {log.status === 'failure' ? '❌' : '✅'}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredLogs.length === 0 && (
                        <div className="py-32 text-center bg-slate-50 dark:bg-dark-950/50 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-dark-800">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6 opacity-50">
                                <CommandLineIcon className="w-10 h-10 text-slate-400" />
                            </div>
                            <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] italic">No Protocol Traces Found</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

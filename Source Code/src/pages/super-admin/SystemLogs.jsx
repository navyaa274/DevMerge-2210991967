import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import API_BASE_URL from '../../config/api';

function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [filterType, filterLevel]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/system/logs?type=${filterType}&level=${filterLevel}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setLogs(data.data || []);
    } catch (err) {
      setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'bg-rose-500 text-white shadow-rose-500/20';
      case 'warn': return 'bg-amber-500 text-white shadow-amber-500/20';
      case 'info': return 'bg-blue-500 text-white shadow-blue-500/20';
      case 'debug': return 'bg-purple-500 text-white shadow-purple-500/20';
      default: return 'bg-gray-500 text-white shadow-gray-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">System Streams</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping border border-purple-500"></span> Live Diagnostic Telemetry
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 rounded-2xl">
          <p className="font-bold text-rose-700 dark:text-rose-400 text-sm uppercase tracking-widest">{typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}</p>
        </div>
      )}

      {/* Control Surface */}
      <div className="glass-panel rounded-3xl shadow-xl p-8 mb-8 bg-white dark:bg-dark-800 border-t-8 border-purple-500 flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64">
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Event Vector
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-6 py-4 bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-dark-700 rounded-2xl text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-4 ring-purple-500/20 text-gray-900 dark:text-white cursor-pointer"
          >
            <option value="all">Global (All)</option>
            <option value="auth">Auth & Security</option>
            <option value="submission">Code Submissions</option>
            <option value="exam">Exam Platform</option>
            <option value="admin">Admin Operations</option>
            <option value="system">Core Infrastructure</option>
          </select>
        </div>

        <div className="w-full md:w-64">
          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
            Severity Level
          </label>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="w-full px-6 py-4 bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-dark-700 rounded-2xl text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-4 ring-purple-500/20 text-gray-900 dark:text-white cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="error">Critical Errors</option>
            <option value="warn">Warnings</option>
            <option value="info">Informational</option>
            <option value="debug">Debug Traces</option>
          </select>
        </div>

        <div className="flex-1 flex items-end justify-end">
          <button
            onClick={fetchLogs}
            className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2"
          >
            {loading ? <span className="animate-spin text-lg">⏳</span> : <span className="text-lg">🔄</span>} Sync Logs
          </button>
        </div>
      </div>

      {loading && logs.length === 0 ? (
        <div className="flex items-center justify-center p-12">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl shadow-2xl p-8 bg-white dark:bg-dark-800 overflow-x-auto">
          <table className="w-full text-left font-mono text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 font-sans uppercase tracking-[0.2em] px-6">
                <th className="px-6 py-2">Timestamp</th>
                <th className="px-6 py-2">Severity</th>
                <th className="px-6 py-2">Subsystem</th>
                <th className="px-6 py-2 w-1/2">Log Output</th>
                <th className="px-6 py-2">Client ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? logs.map((log, idx) => (
                <motion.tr
                  key={log._id || idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="bg-gray-50 dark:bg-dark-900/50 hover:bg-gray-100 dark:hover:bg-dark-700 transition shadow-sm rounded-xl"
                >
                  <td className="py-4 px-6 text-gray-500 dark:text-gray-400 text-xs rounded-l-xl">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black font-sans uppercase tracking-widest shadow-sm ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-500 dark:text-gray-400 text-xs">
                    [{log.type.toUpperCase()}]
                  </td>
                  <td className="py-4 px-6 text-gray-900 dark:text-gray-300 break-all text-xs">
                    {log.message}
                  </td>
                  <td className="py-4 px-6 text-gray-500 dark:text-gray-400 text-xs rounded-r-xl">
                    {log.userId || 'SYS_PROC'}
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-gray-400 font-black font-sans uppercase tracking-widest text-xs">
                    No registry hits found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}

export default SystemLogs;

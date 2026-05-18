import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState({ action: 'all', status: 'all' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const query = new URLSearchParams();
      if (filter.action !== 'all') query.append('action', filter.action);
      if (filter.status !== 'all') query.append('status', filter.status);

      const response = await axios.get(`${API_BASE_URL}/audit-logs?${query}`, { headers });
      setLogs(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Audit Logs</h1>

        <div className="mb-6 flex gap-4">
          <select
            value={filter.action}
            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
          </select>

          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">Action</th>
                <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">Resource</th>
                <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">IP Address</th>
                <th className="px-6 py-3 text-left text-sm font-medium dark:text-white">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm dark:text-white">{log.action}</td>
                  <td className="px-6 py-4 text-sm dark:text-white">{log.resource}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${log.status === 'success'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm dark:text-white">{log.ipAddress}</td>
                  <td className="px-6 py-4 text-sm dark:text-white">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PerformanceDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState('User');
  const [indexes, setIndexes] = useState([]);

  useEffect(() => {
    fetchPerformanceStats();
  }, []);

  const fetchPerformanceStats = async () => {
    try {
      const response = await axios.get('/api/performance/stats');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching performance stats:', error);
      setLoading(false);
    }
  };

  const fetchIndexes = async (model) => {
    try {
      const response = await axios.get(`/api/performance/indexes/${model}`);
      setIndexes(response.data.indexes || []);
    } catch (error) {
      console.error('Error fetching indexes:', error);
    }
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
    fetchIndexes(model);
  };

  const purgeCDNCache = async () => {
    try {
      await axios.post('/api/performance/cdn/purge', { paths: [] });
      alert('CDN cache purged successfully');
    } catch (error) {
      console.error('Error purging CDN cache:', error);
      alert('Failed to purge CDN cache');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading performance dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Performance Dashboard</h1>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* CDN Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">CDN</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-semibold ${stats?.cdn?.enabled ? 'text-green-600' : 'text-red-600'}`}>
                {stats?.cdn?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {stats?.cdn?.enabled && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">URL:</span>
                  <span className="text-sm truncate">{stats.cdn.cdnUrl}</span>
                </div>
                <button
                  onClick={purgeCDNCache}
                  className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Purge Cache
                </button>
              </>
            )}
          </div>
        </div>

        {/* Cache Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Cache</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-semibold ${stats?.cache?.enabled ? 'text-green-600' : 'text-red-600'}`}>
                {stats?.cache?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {stats?.cache?.enabled && (
              <div className="mt-2 text-sm">
                <div>Problems: {stats.cache.ttl.problems}s</div>
                <div>Leaderboard: {stats.cache.ttl.leaderboard}s</div>
                <div>Analytics: {stats.cache.ttl.analytics}s</div>
              </div>
            )}
          </div>
        </div>

        {/* Compression Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Compression</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-semibold ${stats?.compression?.enabled ? 'text-green-600' : 'text-red-600'}`}>
                {stats?.compression?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {stats?.compression?.enabled && (
              <div className="mt-2 text-sm">
                <div>Level: {stats.compression.level}</div>
                <div>Threshold: {stats.compression.threshold} bytes</div>
              </div>
            )}
          </div>
        </div>

        {/* WebSocket Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">WebSocket</h3>
          <div className="space-y-2">
            <div className="text-sm">
              <div>Batch Interval: {stats?.websocket?.batchInterval}ms</div>
              <div>Max Connections: {stats?.websocket?.maxConnections}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Indexes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Database Indexes</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Model:</label>
          <select
            value={selectedModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border rounded"
          >
            <option value="User">User</option>
            <option value="Problem">Problem</option>
            <option value="Submission">Submission</option>
            <option value="Course">Course</option>
            <option value="Assignment">Assignment</option>
            <option value="Exam">Exam</option>
          </select>
        </div>

        {indexes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keys</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unique</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {indexes.map((index, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{index.name}</td>
                    <td className="px-6 py-4 text-sm">{JSON.stringify(index.key)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {index.unique ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Select a model to view indexes</p>
        )}
      </div>
    </div>
  );
};

export default PerformanceDashboard;

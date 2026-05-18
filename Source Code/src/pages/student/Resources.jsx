import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [filter, setFilter] = useState({ type: 'all', difficulty: 'all' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, [filter]);

  const fetchResources = async () => {
    try {
      const query = new URLSearchParams();
      if (filter.type !== 'all') query.append('type', filter.type);
      if (filter.difficulty !== 'all') query.append('difficulty', filter.difficulty);

      const response = await axios.get(`/api/resources?${query}`);
      setResources(response.data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadResource = async (resourceId) => {
    try {
      await axios.get(`/api/resources/${resourceId}`);
      alert('Download started!');
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Learning Resources</h1>

        <div className="mb-6 flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">Type</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="tutorial">Tutorial</option>
              <option value="documentation">Documentation</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">Difficulty</label>
            <select
              value={filter.difficulty}
              onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {resources.map(resource => (
            <div key={resource._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold dark:text-white">{resource.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{resource.description}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                  {resource.type}
                </span>
              </div>

              <div className="flex gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <span>👁️ {resource.views} views</span>
                <span>⭐ {resource.rating.toFixed(1)}</span>
                <span>📥 {resource.downloads} downloads</span>
              </div>

              <div className="flex gap-2 flex-wrap mb-4">
                {resource.topics.map(topic => (
                  <span key={topic} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm">
                    {topic}
                  </span>
                ))}
              </div>

              <button
                onClick={() => downloadResource(resource._id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

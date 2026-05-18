import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config/api';

function DiscussionForums() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedThread, setSelectedThread] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/discussions`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch threads');
      const data = await response.json();
      setThreads(data || []);
    } catch (err) {
      setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateThread = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        'http://localhost:5000/api/forums/threads',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );
      if (!response.ok) throw new Error('Failed to create thread');

      setShowCreateForm(false);
      setFormData({ title: '', content: '', category: 'general' });
      fetchThreads();
    } catch (err) {
      setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Unknown error occurred');
    }
  };

  if (loading) return <div className="text-center py-12">Loading forums...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discussion Forums</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
          >
            {showCreateForm ? 'Cancel' : 'Start Discussion'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
            {typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}
          </div>
        )}

        {/* Create Thread Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Start New Discussion</h2>
            <form onSubmit={handleCreateThread} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Discussion title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="general">General</option>
                  <option value="coding">Coding Help</option>
                  <option value="course">Course Discussion</option>
                  <option value="exam">Exam Preparation</option>
                  <option value="projects">Projects</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleFormChange}
                  required
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Describe your discussion topic"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Create Discussion
              </button>
            </form>
          </div>
        )}

        {/* Threads List */}
        <div className="space-y-4">
          {threads.map(thread => (
            <div
              key={thread._id}
              onClick={() => setSelectedThread(thread)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg cursor-pointer transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {thread.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {thread.content}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-semibold">
                  {thread.category}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <div className="flex gap-6">
                  <span>👤 {thread.authorId?.name || 'Anonymous'}</span>
                  <span>💬 {thread.replies?.length || 0} replies</span>
                  <span>👁️ {thread.views || 0} views</span>
                </div>
                <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {threads.length === 0 && (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No discussions yet. Start one to get the conversation going!
          </div>
        )}
      </div>
    </div>
  );
}

export default DiscussionForums;

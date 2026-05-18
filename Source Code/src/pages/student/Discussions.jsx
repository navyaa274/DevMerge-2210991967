import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export default function Discussions() {
  const { user } = useAuthStore();
  const [discussions, setDiscussions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'general', tags: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      const response = await axios.get('/api/discussions');
      setDiscussions(response.data);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/discussions', formData);
      setShowForm(false);
      setFormData({ title: '', content: '', category: 'general', tags: [] });
      fetchDiscussions();
    } catch (error) {
      console.error('Error creating discussion:', error);
    }
  };

  const likeDiscussion = async (discussionId) => {
    try {
      await axios.post(`/api/discussions/${discussionId}/like`);
      fetchDiscussions();
    } catch (error) {
      console.error('Error liking discussion:', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold dark:text-white">Discussions</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : 'Start Discussion'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-white">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-white">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="6"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-white">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="general">General</option>
                <option value="problem">Problem</option>
                <option value="course">Course</option>
                <option value="exam">Exam</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Post Discussion
            </button>
          </form>
        )}

        <div className="space-y-4">
          {discussions.map(discussion => (
            <div
              key={discussion._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition"
              onClick={() => setSelectedDiscussion(discussion)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold dark:text-white">{discussion.title}</h3>
                {discussion.isSolved && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm font-medium">
                    ✓ Solved
                  </span>
                )}
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{discussion.content}</p>

              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>By {discussion.authorId?.name}</span>
                <div className="flex gap-4">
                  <span>👁️ {discussion.views}</span>
                  <span>💬 {discussion.replies?.length || 0}</span>
                  <span>❤️ {discussion.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedDiscussion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto p-6">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">{selectedDiscussion.title}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedDiscussion.content}</p>

              <div className="mb-4 flex gap-4">
                <button
                  onClick={() => likeDiscussion(selectedDiscussion._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  ❤️ Like ({selectedDiscussion.likes})
                </button>
              </div>

              <button
                onClick={() => setSelectedDiscussion(null)}
                className="w-full px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

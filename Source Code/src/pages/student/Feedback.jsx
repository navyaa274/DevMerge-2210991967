import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export default function Feedback() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({ type: 'general', title: '', description: '', rating: 5 });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/feedback', formData);
      setSubmitted(true);
      setFormData({ type: 'general', title: '', description: '', rating: 5 });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Send Feedback</h1>

        {submitted && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
            Thank you for your feedback!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 dark:text-white">Feedback Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="general">General</option>
              <option value="bug">Bug Report</option>
              <option value="feature_request">Feature Request</option>
              <option value="improvement">Improvement</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 dark:text-white">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 dark:text-white">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="6"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 dark:text-white">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className={`text-3xl ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}

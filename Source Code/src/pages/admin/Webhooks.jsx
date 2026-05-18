import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export default function Webhooks() {
  const { user } = useAuthStore();
  const [webhooks, setWebhooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', url: '', events: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await axios.get(`/api/webhooks/user/${user.id}`);
      setWebhooks(response.data);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/webhooks', formData);
      setShowForm(false);
      setFormData({ name: '', url: '', events: [] });
      fetchWebhooks();
    } catch (error) {
      console.error('Error creating webhook:', error);
    }
  };

  const deleteWebhook = async (webhookId) => {
    if (window.confirm('Delete this webhook?')) {
      try {
        await axios.delete(`/api/webhooks/${webhookId}`);
        fetchWebhooks();
      } catch (error) {
        console.error('Error deleting webhook:', error);
      }
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold dark:text-white">Webhooks</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : 'Create Webhook'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-white">Webhook Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-white">Webhook URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-white">Events</label>
              <div className="space-y-2">
                {['submission.created', 'exam.completed', 'assignment.graded', 'badge.earned'].map(event => (
                  <label key={event} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.events.includes(event)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, events: [...formData.events, event] });
                        } else {
                          setFormData({ ...formData, events: formData.events.filter(e => e !== event) });
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="dark:text-white">{event}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Create Webhook
            </button>
          </form>
        )}

        <div className="space-y-4">
          {webhooks.map(webhook => (
            <div key={webhook._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold dark:text-white">{webhook.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{webhook.url}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  webhook.isActive
                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}>
                  {webhook.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium mb-2 dark:text-white">Events:</p>
                <div className="flex flex-wrap gap-2">
                  {webhook.events.map(event => (
                    <span key={event} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => deleteWebhook(webhook._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

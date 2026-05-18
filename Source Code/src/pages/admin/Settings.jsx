import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export default function Settings() {
  const { user } = useAuthStore();
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(`/api/preferences/user/${user.id}`);
      setPreferences(response.data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`/api/preferences/user/${user.id}`, preferences);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Settings</h1>

        {preferences && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Appearance</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 dark:text-white">Theme</label>
                <select
                  value={preferences.theme}
                  onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Notifications</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.notifications?.email}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, email: e.target.checked }
                    })}
                    className="mr-2"
                  />
                  <span className="dark:text-white">Email Notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.notifications?.push}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, push: e.target.checked }
                    })}
                    className="mr-2"
                  />
                  <span className="dark:text-white">Push Notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.notifications?.sms}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      notifications: { ...preferences.notifications, sms: e.target.checked }
                    })}
                    className="mr-2"
                  />
                  <span className="dark:text-white">SMS Notifications</span>
                </label>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 dark:text-white">Privacy</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.privacy?.profilePublic}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      privacy: { ...preferences.privacy, profilePublic: e.target.checked }
                    })}
                    className="mr-2"
                  />
                  <span className="dark:text-white">Make Profile Public</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.privacy?.showStats}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      privacy: { ...preferences.privacy, showStats: e.target.checked }
                    })}
                    className="mr-2"
                  />
                  <span className="dark:text-white">Show Statistics</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.privacy?.allowMessages}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      privacy: { ...preferences.privacy, allowMessages: e.target.checked }
                    })}
                    className="mr-2"
                  />
                  <span className="dark:text-white">Allow Messages</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Save Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

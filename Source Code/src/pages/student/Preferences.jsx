import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function Preferences() {
  const { token, user: authUser } = useAuthStore();
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      assignments: true,
      grades: true,
      announcements: true,
      messages: true
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
      allowMessages: true
    },
    display: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY'
    },
    learning: {
      difficulty: 'medium',
      pace: 'normal',
      interests: [],
      goals: []
    }
  });

  const [profile, setProfile] = useState({
    tagline: '',
    skills: [],
    socialLinks: { linkedin: '', github: '', portfolio: '' }
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPreferences();
    fetchProfile();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/preferences`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.preferences) {
        setPreferences(response.data.preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setProfile({
          tagline: response.data.data.user.tagline || '',
          skills: response.data.data.user.skills || [],
          socialLinks: response.data.data.user.socialLinks || { linkedin: '', github: '', portfolio: '' }
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleNotificationChange = (key) => {
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [key]: !preferences.notifications[key]
      }
    });
  };

  const handlePrivacyChange = (key, value) => {
    setPreferences({
      ...preferences,
      privacy: {
        ...preferences.privacy,
        [key]: value
      }
    });
  };

  const handleDisplayChange = (key, value) => {
    setPreferences({
      ...preferences,
      display: {
        ...preferences.display,
        [key]: value
      }
    });
  };

  const handleLearningChange = (key, value) => {
    setPreferences({
      ...preferences,
      learning: {
        ...preferences.learning,
        [key]: value
      }
    });
  };

  const savePreferences = async () => {
    setLoading(true);
    setSuccess('');

    try {
      // 1. Save System Preferences
      const prefPromise = axios.put(
        `${API_BASE_URL}/preferences`,
        preferences,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Save Professional Identity (Phase 5 Item 20)
      const profilePromise = axios.put(
        `${API_BASE_URL}/users/profile`,
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await Promise.all([prefPromise, profilePromise]);

      setSuccess('All settings and professional identity saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Preferences</h1>

        {success && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* Professional Identity (Phase 5 Item 20) */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-6 text-indigo-700">Professional Identity</h2>
          <p className="text-gray-500 mb-6 -mt-4 text-sm font-medium">This information appears on your professional portfolio and certificates.</p>

          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2 uppercase text-xs tracking-wider">Professional Tagline</label>
              <input
                type="text"
                value={profile.tagline}
                onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                placeholder="e.g. Full Stack Developer | Competitive Programmer"
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition-all bg-gray-50/50"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2 uppercase text-xs tracking-wider">Technical Skills (Comma separated)</label>
              <input
                type="text"
                value={profile.skills.join(', ')}
                onChange={(e) => setProfile({ ...profile, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                placeholder="e.g. React, Node.js, Python, AWS"
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition-all bg-gray-50/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-bold mb-2 uppercase text-xs tracking-wider">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={profile.socialLinks.linkedin}
                  onChange={(e) => setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, linkedin: e.target.value }
                  })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition-all bg-gray-50/50"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-bold mb-2 uppercase text-xs tracking-wider">GitHub Profile URL</label>
                <input
                  type="url"
                  value={profile.socialLinks.github}
                  onChange={(e) => setProfile({
                    ...profile,
                    socialLinks: { ...profile.socialLinks, github: e.target.value }
                  })}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 transition-all bg-gray-50/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Notification Settings</h2>

          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-3">Notification Channels</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.email}
                    onChange={() => handleNotificationChange('email')}
                    className="mr-3"
                  />
                  <span>Email Notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.push}
                    onChange={() => handleNotificationChange('push')}
                    className="mr-3"
                  />
                  <span>Push Notifications</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                    className="mr-3"
                  />
                  <span>SMS Notifications</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Notification Types</h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.assignments}
                    onChange={() => handleNotificationChange('assignments')}
                    className="mr-3"
                  />
                  <span>New Assignments</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.grades}
                    onChange={() => handleNotificationChange('grades')}
                    className="mr-3"
                  />
                  <span>Grade Updates</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.announcements}
                    onChange={() => handleNotificationChange('announcements')}
                    className="mr-3"
                  />
                  <span>Announcements</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.notifications.messages}
                    onChange={() => handleNotificationChange('messages')}
                    className="mr-3"
                  />
                  <span>Direct Messages</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Privacy Settings</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Profile Visibility
              </label>
              <select
                value={preferences.privacy.profileVisibility}
                onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="public">Public</option>
                <option value="students">Students Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.privacy.showEmail}
                  onChange={(e) => handlePrivacyChange('showEmail', e.target.checked)}
                  className="mr-3"
                />
                <span>Show Email on Profile</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.privacy.showPhone}
                  onChange={(e) => handlePrivacyChange('showPhone', e.target.checked)}
                  className="mr-3"
                />
                <span>Show Phone on Profile</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.privacy.allowMessages}
                  onChange={(e) => handlePrivacyChange('allowMessages', e.target.checked)}
                  className="mr-3"
                />
                <span>Allow Direct Messages</span>
              </label>
            </div>
          </div>
        </div>

        {/* Display */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Display Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Theme</label>
              <select
                value={preferences.display.theme}
                onChange={(e) => handleDisplayChange('theme', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Language</label>
              <select
                value={preferences.display.language}
                onChange={(e) => handleDisplayChange('language', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Timezone</label>
              <select
                value={preferences.display.timezone}
                onChange={(e) => handleDisplayChange('timezone', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Date Format</label>
              <select
                value={preferences.display.dateFormat}
                onChange={(e) => handleDisplayChange('dateFormat', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Learning Preferences */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Learning Preferences</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Preferred Difficulty
              </label>
              <select
                value={preferences.learning.difficulty}
                onChange={(e) => handleLearningChange('difficulty', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="adaptive">Adaptive</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Learning Pace</label>
              <select
                value={preferences.learning.pace}
                onChange={(e) => handleLearningChange('pace', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={savePreferences}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1"
        >
          {loading ? 'Saving Changes...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}

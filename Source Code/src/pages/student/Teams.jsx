import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export default function Teams() {
  const { user } = useAuthStore();
  const [teams, setTeams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', isPublic: true });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/teams', formData);
      setShowForm(false);
      setFormData({ name: '', description: '', isPublic: true });
      fetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const joinTeam = async (teamId) => {
    try {
      await axios.post(`/api/teams/${teamId}/join`);
      fetchTeams();
    } catch (error) {
      console.error('Error joining team:', error);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold dark:text-white">Teams</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : 'Create Team'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-white">Team Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-white">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="4"
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium dark:text-white">Make Public</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Create Team
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <div key={team._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-2 dark:text-white">{team.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{team.description}</p>

              <div className="mb-4 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  👤 Leader: {team.leaderId?.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  👥 Members: {team.members?.length || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  🏆 Score: {team.totalScore}
                </p>
              </div>

              <button
                onClick={() => joinTeam(team._id)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Join Team
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function Integrations() {
  const { token } = useAuthStore();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const availableIntegrations = [
    { id: 'github', name: 'GitHub', icon: '🐙', description: 'Connect student repositories' },
    { id: 'slack', name: 'Slack', icon: '💬', description: 'Team communication' },
    { id: 'zoom', name: 'Zoom', icon: '📹', description: 'Virtual classrooms' },
    { id: 'google', name: 'Google Workspace', icon: '📧', description: 'Email and docs' },
    { id: 'canvas', name: 'Canvas LMS', icon: '🎨', description: 'Learning management' },
    { id: 'moodle', name: 'Moodle', icon: '📚', description: 'Course management' }
  ];

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/integrations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIntegrations(response.data.integrations || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (integrationId) => {
    const integration = integrations.find(i => i.id === integrationId);
    try {
      if (integration?.enabled) {
        await axios.delete(
          `${API_BASE_URL}/integrations/${integrationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_BASE_URL}/integrations`,
          { integrationId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchIntegrations();
    } catch (error) {
      console.error('Error toggling integration:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Integrations</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableIntegrations.map(integration => {
            const enabled = integrations.some(i => i.id === integration.id && i.enabled);
            return (
              <div key={integration.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{integration.icon}</div>
                  <button
                    onClick={() => toggleIntegration(integration.id)}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      enabled
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {enabled ? 'Connected' : 'Connect'}
                  </button>
                </div>
                <h3 className="font-bold text-lg mb-2">{integration.name}</h3>
                <p className="text-gray-600 text-sm">{integration.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

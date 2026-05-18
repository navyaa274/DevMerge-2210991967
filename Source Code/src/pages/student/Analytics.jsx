import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import AnalyticsCharts from '../../components/AnalyticsCharts';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function StudentAnalytics() {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/analytics/student/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user, token]);

  if (loading) return <div className="p-8">Loading analytics...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Analytics</h1>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 text-sm">Total Submissions</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.totalSubmissions}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 text-sm">Accepted</p>
              <p className="text-3xl font-bold text-green-600">{stats.acceptedSubmissions}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 text-sm">Acceptance Rate</p>
              <p className="text-3xl font-bold text-blue-600">{stats.acceptanceRate}%</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 text-sm">Topics Covered</p>
              <p className="text-3xl font-bold text-purple-600">{Object.keys(stats.topicStats || {}).length}</p>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnalyticsCharts studentId={user.id} type="heatmap" />
          <AnalyticsCharts studentId={user.id} type="weakness" />
        </div>

        <div className="mt-8">
          <AnalyticsCharts studentId={user.id} type="trend" />
        </div>
      </div>
    </div>
  );
}

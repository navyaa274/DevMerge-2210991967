import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import axios from 'axios';
// API Base URL
const API_BASE_URL = 'http://localhost:5002/api';

export default function AnalyticsCharts({ studentId, type = 'heatmap', data: propData }) {
  const { token } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propData) {
      setData(propData);
      setLoading(false);
      return;
    }

    if (!studentId || !['heatmap', 'weakness', 'trend'].includes(type)) {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const url = `${API_BASE_URL}/analytics-advanced/student/${studentId}/${type}`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [studentId, type, token, propData]);

  if (loading) return <div className="p-4">Loading analytics...</div>;

  if (type === 'heatmap') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Submission Heatmap</h3>
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(data || {}).map(([date, count]) => (
            <div
              key={date}
              className={`p-2 rounded text-center text-sm font-semibold ${count === 0 ? 'bg-gray-100' :
                count < 3 ? 'bg-green-100 text-green-800' :
                  count < 6 ? 'bg-green-300 text-green-900' :
                    'bg-green-600 text-white'
                }`}
              title={`${date}: ${count} submissions`}
            >
              {count}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'weakness') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Topic Weakness Analysis</h3>
        <div className="space-y-3">
          {data?.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="font-semibold">{item.topic}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.successRate >= 70 ? 'bg-green-500' :
                      item.successRate >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                    style={{ width: `${item.successRate}%` }}
                  />
                </div>
                <span className="text-sm font-bold">{item.successRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'trend') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Performance Trend</h3>
        <div className="space-y-2">
          {data?.slice(-10).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 border-b">
              <span className="text-sm text-gray-600">
                {new Date(item.date).toLocaleDateString()}
              </span>
              <span className={`px-2 py-1 rounded text-sm font-semibold ${item.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
                }`}>
                {item.status}
              </span>
              <span className="text-sm text-gray-600">{item.runtime}ms</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

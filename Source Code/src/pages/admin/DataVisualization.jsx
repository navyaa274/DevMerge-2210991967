import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function DataVisualization() {
  const { token } = useAuthStore();
  const [visualizations, setVisualizations] = useState([]);
  const [selectedViz, setSelectedViz] = useState('enrollment_trends');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const vizTypes = [
    { id: 'enrollment_trends', name: 'Enrollment Trends', icon: '📈' },
    { id: 'grade_distribution', name: 'Grade Distribution', icon: '📊' },
    { id: 'performance_comparison', name: 'Performance Comparison', icon: '📉' },
    { id: 'engagement_metrics', name: 'Engagement Metrics', icon: '💡' },
    { id: 'resource_usage', name: 'Resource Usage', icon: '📚' }
  ];

  useEffect(() => {
    fetchVisualizationData();
  }, [selectedViz]);

  const fetchVisualizationData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/data-visualization/${selectedViz}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
    } catch (error) {
      console.error('Error fetching visualization data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Data Visualization</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {vizTypes.map(viz => (
            <button
              key={viz.id}
              onClick={() => setSelectedViz(viz.id)}
              className={`p-4 rounded-lg text-center transition-all ${selectedViz === viz.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white hover:bg-gray-50'
                }`}
            >
              <div className="text-3xl mb-2">{viz.icon}</div>
              <div className="text-sm font-semibold">{viz.name}</div>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-xl">Loading visualization...</div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">
              {vizTypes.find(v => v.id === selectedViz)?.name}
            </h2>
            <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">📊</div>
                <p>Chart visualization would render here</p>
                <p className="text-sm mt-2">Integrate with Chart.js or D3.js</p>
              </div>
            </div>
            {data && (
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {data.totalRecords || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {data.average || 0}
                  </div>
                  <div className="text-sm text-gray-600">Average</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {data.highest || 0}
                  </div>
                  <div className="text-sm text-gray-600">Highest</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {data.lowest || 0}
                  </div>
                  <div className="text-sm text-gray-600">Lowest</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

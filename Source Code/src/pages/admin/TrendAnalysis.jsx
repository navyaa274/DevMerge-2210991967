import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

const TrendAnalysis = () => {
  const [userId, setUserId] = useState('');
  const [timeWindow, setTimeWindow] = useState(30);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeTrend = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/trend-analysis/performance/${userId}?timeWindow=${timeWindow}`);
      setTrendData(response.data);
    } catch (error) {
      console.error('Error analyzing trend:', error);
      alert('Failed to analyze trend');
    }
    setLoading(false);
  };

  const getTrendColor = (direction) => {
    const colors = {
      improving: 'text-green-600',
      declining: 'text-red-600',
      stable: 'text-blue-600'
    };
    return colors[direction] || 'text-gray-600';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-500',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-500',
      low: 'bg-blue-100 text-blue-800 border-blue-500',
      positive: 'bg-green-100 text-green-800 border-green-500'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-500';
  };

  const chartData = trendData?.periodMetrics ? {
    labels: trendData.periodMetrics.map((_, i) => `Period ${i + 1}`),
    datasets: [
      {
        label: 'Success Rate (%)',
        data: trendData.periodMetrics.map(p => p.successRate),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  } : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Trend Analysis</h1>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Analyze Student Performance Trend</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Student ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter student ID"
              className="w-full px-4 py-2 border rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Time Window (days)</label>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(parseInt(e.target.value))}
              className="w-full px-4 py-2 border rounded"
            >
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={analyzeTrend}
              disabled={!userId || loading}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Analyzing...' : 'Analyze Trend'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {trendData && trendData.success && (
        <>
          {/* Trend Overview */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Trend Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-600 mb-1">Direction</div>
                <div className={`text-2xl font-bold ${getTrendColor(trendData.trend.direction)}`}>
                  {trendData.trend.direction.toUpperCase()}
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-600 mb-1">Slope</div>
                <div className="text-2xl font-bold text-blue-600">
                  {trendData.trend.slope}
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-600 mb-1">Confidence</div>
                <div className="text-2xl font-bold text-purple-600">
                  {trendData.trend.confidence}%
                </div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-600 mb-1">Strength</div>
                <div className="text-2xl font-bold text-orange-600">
                  {trendData.trend.strength.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded">
              <div className="text-sm text-gray-600">Trend Equation</div>
              <div className="font-mono text-blue-600">{trendData.trend.equation}</div>
            </div>
          </div>

          {/* Chart */}
          {chartData && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Performance Over Time</h2>
              <Line data={chartData} options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: { display: true, text: 'Success Rate (%)' }
                  }
                }
              }} />
            </div>
          )}

          {/* Patterns */}
          {trendData.patterns && trendData.patterns.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Detected Patterns</h2>
              <div className="space-y-4">
                {trendData.patterns.map((pattern, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded border-l-4 ${getSeverityColor(pattern.severity)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold">{pattern.type.replace('_', ' ').toUpperCase()}</div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-white">
                        {pattern.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm">{pattern.description}</div>
                    {pattern.variance && <div className="text-xs mt-1">Variance: {pattern.variance}</div>}
                    {pattern.drop && <div className="text-xs mt-1">Drop: {pattern.drop}%</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forecast */}
          {trendData.forecast && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Forecast</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-sm text-gray-600 mb-1">Predicted Success Rate</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round(trendData.forecast.nextPeriod.predictedSuccessRate)}%
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded">
                  <div className="text-sm text-gray-600 mb-1">Predicted Submissions</div>
                  <div className="text-3xl font-bold text-green-600">
                    {trendData.forecast.nextPeriod.predictedSubmissions}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded">
                  <div className="text-sm text-gray-600 mb-1">Confidence</div>
                  <div className="text-3xl font-bold text-purple-600">
                    {trendData.forecast.nextPeriod.confidence}%
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded border-l-4 border-yellow-500">
                <div className="font-semibold mb-1">Recommendation</div>
                <div className="text-sm">{trendData.forecast.recommendation}</div>
              </div>
            </div>
          )}

          {/* Insights */}
          {trendData.insights && trendData.insights.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Insights & Actions</h2>
              <div className="space-y-3">
                {trendData.insights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded ${
                      insight.type === 'positive' ? 'bg-green-50 border-l-4 border-green-500' :
                      insight.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                      insight.type === 'alert' ? 'bg-red-50 border-l-4 border-red-500' :
                      'bg-blue-50 border-l-4 border-blue-500'
                    }`}
                  >
                    <div className="font-semibold mb-1">{insight.message}</div>
                    <div className="text-sm text-gray-700">💡 {insight.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {trendData && !trendData.success && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          {trendData.message || 'Unable to analyze trend'}
        </div>
      )}
    </div>
  );
};

export default TrendAnalysis;

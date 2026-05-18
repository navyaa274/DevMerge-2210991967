import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnomalyDetection = () => {
  const [systemAnomalies, setSystemAnomalies] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [studentAnomalies, setStudentAnomalies] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSystemAnomalies();
  }, []);

  const fetchSystemAnomalies = async () => {
    try {
      const response = await axios.get('/api/anomaly-detection/system');
      setSystemAnomalies(response.data);
    } catch (error) {
      console.error('Error fetching system anomalies:', error);
    }
  };

  const fetchStudentAnomalies = async () => {
    if (!selectedStudent) return;

    setLoading(true);
    try {
      const response = await axios.get(`/api/anomaly-detection/student/${selectedStudent}`);
      setStudentAnomalies(response.data);
    } catch (error) {
      console.error('Error fetching student anomalies:', error);
    }
    setLoading(false);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-500',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-500',
      low: 'bg-blue-100 text-blue-800 border-blue-500'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-500';
  };

  const getRiskLevelColor = (level) => {
    const colors = {
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    };
    return colors[level] || 'text-gray-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Anomaly Detection</h1>

      {/* System Anomalies */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">System-Wide Anomalies</h2>
          <button
            onClick={fetchSystemAnomalies}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {systemAnomalies ? (
          <>
            <div className="mb-4">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-sm text-gray-600">System Health: </span>
                  <span className={`font-bold ${systemAnomalies.systemHealth === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                    {systemAnomalies.systemHealth?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Anomalies Detected: </span>
                  <span className="font-bold">{systemAnomalies.anomaliesDetected}</span>
                </div>
              </div>
            </div>

            {systemAnomalies.anomalies && systemAnomalies.anomalies.length > 0 ? (
              <div className="space-y-4">
                {systemAnomalies.anomalies.map((anomaly, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded border-l-4 ${getSeverityColor(anomaly.severity)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold">{anomaly.type.replace('_', ' ').toUpperCase()}</div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-white">
                        {anomaly.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm mb-2">{anomaly.message}</div>
                    {anomaly.details && (
                      <div className="text-xs bg-white bg-opacity-50 p-2 rounded">
                        <pre>{JSON.stringify(anomaly.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No anomalies detected. System is operating normally.
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">Loading...</div>
        )}
      </div>

      {/* Student Anomaly Detection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Student Behavior Analysis</h2>
        
        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            placeholder="Enter Student ID"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            onClick={fetchStudentAnomalies}
            disabled={!selectedStudent || loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {studentAnomalies && studentAnomalies.success && (
          <>
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Time Window</div>
                  <div className="font-bold">{studentAnomalies.timeWindow} days</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Anomalies Found</div>
                  <div className="font-bold">{studentAnomalies.anomaliesDetected}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Risk Level</div>
                  <div className={`font-bold ${getRiskLevelColor(studentAnomalies.riskLevel)}`}>
                    {studentAnomalies.riskLevel?.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {studentAnomalies.anomalies && studentAnomalies.anomalies.length > 0 ? (
              <div className="space-y-4">
                {studentAnomalies.anomalies.map((anomaly, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded border-l-4 ${getSeverityColor(anomaly.severity)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold">{anomaly.type.replace('_', ' ').toUpperCase()}</div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-white">
                        {anomaly.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm mb-2">{anomaly.message}</div>
                    {anomaly.details && (
                      <div className="text-xs bg-white bg-opacity-50 p-2 rounded">
                        <pre>{JSON.stringify(anomaly.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-green-600">
                ✓ No anomalies detected for this student. Behavior appears normal.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnomalyDetection;

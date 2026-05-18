import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import API_BASE_URL from '../../config/api';

const RealtimeDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Fetch initial metrics
    fetchMetrics();

    // Connect to WebSocket
    const newSocket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to real-time dashboard');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from real-time dashboard');
      setConnected(false);
    });

    newSocket.on('dashboard:update', (data) => {
      setMetrics(data);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/realtime-dashboard/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMetrics(response.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading real-time dashboard...</div>
      </div>
    );
  }

  const { system, activity, performance, users } = metrics;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Real-time Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {connected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* System Metrics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Uptime</div>
            <div className="text-2xl font-bold text-blue-600">
              {Math.floor(system?.uptime / 3600)}h {Math.floor((system?.uptime % 3600) / 60)}m
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Memory Usage</div>
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((system?.memory?.heapUsed || 0) / 1024 / 1024)}MB
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Active Connections</div>
            <div className="text-2xl font-bold text-green-600">
              {system?.activeConnections || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Submissions/Hour</div>
            <div className="text-2xl font-bold text-orange-600">
              {system?.submissionsLastHour || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Metrics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Current Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Active Users</div>
            <div className="text-3xl font-bold text-blue-600">
              {activity?.activeUsers || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Last 5 minutes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Recent Submissions</div>
            <div className="text-3xl font-bold text-green-600">
              {activity?.recentSubmissions || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Last hour</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Ongoing Exams</div>
            <div className="text-3xl font-bold text-red-600">
              {activity?.ongoingExams || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Right now</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Active Courses</div>
            <div className="text-3xl font-bold text-purple-600">
              {activity?.activeCourses || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">This semester</div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Performance (Last Hour)</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Submissions</div>
            <div className="text-3xl font-bold text-blue-600">
              {performance?.totalSubmissions || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Accepted</div>
            <div className="text-3xl font-bold text-green-600">
              {performance?.acceptedSubmissions || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Success Rate</div>
            <div className="text-3xl font-bold text-purple-600">
              {performance?.successRate || 0}%
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Avg Execution Time</div>
            <div className="text-3xl font-bold text-orange-600">
              {performance?.avgExecutionTime || 0}ms
            </div>
          </div>
        </div>
      </div>

      {/* User Metrics */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">User Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Users</div>
            <div className="text-3xl font-bold text-blue-600">
              {users?.totalUsers || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Active Students</div>
            <div className="text-3xl font-bold text-green-600">
              {users?.activeStudents || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Active Faculty</div>
            <div className="text-3xl font-bold text-purple-600">
              {users?.activeFaculty || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">New Users Today</div>
            <div className="text-3xl font-bold text-orange-600">
              {users?.newUsersToday || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

export default RealtimeDashboard;

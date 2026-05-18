import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  AcademicCapIcon,
  CogIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../services/api/apiClient';

const RegistrarDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/registrar/dashboard/registrar?timeframe=${selectedTimeframe}`);
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAutomation = async (automationType) => {
    try {
      const endpoint = {
        enrollment: '/registrar/enrollment/batch',
        timetable: '/registrar/timetable/generate',
        grading: '/registrar/grading/automate',
        compliance: '/registrar/compliance/report'
      }[automationType];

      await apiClient.post(endpoint, {
        semester: 2,
        academicYear: '2024'
      });

      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error(`Failed to run ${automationType} automation:`, error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};
  const alerts = dashboardData?.alerts || [];
  const insights = dashboardData?.aiInsights || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Registrar Automation Dashboard</h1>
        <p className="text-gray-600 mt-2">AI-powered academic administration and automation</p>
      </div>

      {/* Timeframe Selector */}
      <div className="mb-6 flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Timeframe:</label>
        <select
          value={selectedTimeframe}
          onChange={(e) => setSelectedTimeframe(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="semester">Last Semester</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg"
        >
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Active Alerts</h3>
              <p className="text-sm text-red-700 mt-1">
                {alerts.length} critical issues require attention
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'automation', 'analytics', 'compliance'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Key Metrics Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Students
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {metrics.totalStudents || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm text-gray-500">
                <span className="text-green-600 font-medium">
                  +{metrics.newStudents || 0}
                </span>{' '}
                new this period
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AcademicCapIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Courses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {metrics.activeCourses || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm text-gray-500">
                <span className="text-green-600 font-medium">
                  {metrics.courseUtilization || 0}%
                </span>{' '}
                utilization
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Automation Success
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {metrics.automationSuccess || 0}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm text-gray-500">
                <span className="text-green-600 font-medium">
                  {metrics.automationsRun || 0}
                </span>{' '}
                automations run
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Avg Processing Time
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {metrics.avgProcessingTime || 0}ms
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm text-gray-500">
                <span className="text-green-600 font-medium">
                  Optimized
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Automation Tab */}
      {activeTab === 'automation' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Automation Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Enrollment Automation',
                description: 'Automatically enroll students based on prerequisites and career paths',
                icon: UsersIcon,
                color: 'blue',
                action: 'enrollment'
              },
              {
                title: 'Timetable Generation',
                description: 'Generate AI-optimized timetables with resource allocation',
                icon: CalendarIcon,
                color: 'green',
                action: 'timetable'
              },
              {
                title: 'Grading Automation',
                description: 'Automated grading with anomaly detection',
                icon: ChartBarIcon,
                color: 'yellow',
                action: 'grading'
              },
              {
                title: 'Compliance Reporting',
                description: 'Generate compliance reports with AI insights',
                icon: CheckCircleIcon,
                color: 'purple',
                action: 'compliance'
              }
            ].map((item, index) => (
              <motion.div
                key={item.action}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start">
                  <div className={`flex-shrink-0 p-3 bg-${item.color}-100 rounded-lg`}>
                    <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    <button
                      onClick={() => runAutomation(item.action)}
                      className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-${item.color}-600 hover:bg-${item.color}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${item.color}-500`}
                    >
                      <CogIcon className="h-4 w-4 mr-2" />
                      Run Automation
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics & Insights</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Trends</h3>
              <div className="space-y-4">
                {metrics.performanceTrends?.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{trend.metric}</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 mr-2">
                        {trend.value}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        trend.change > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trend.change > 0 ? '+' : ''}{trend.change}%
                      </span>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-gray-500">No trend data available</p>
                )}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">AI Insights</h3>
              <div className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className="border-l-4 border-blue-400 pl-4 py-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {insight.type}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {insight.description}
                    </p>
                    {insight.suggestedActions && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700">Suggested Actions:</p>
                        <ul className="text-xs text-gray-600 list-disc list-inside mt-1">
                          {insight.suggestedActions.map((action, i) => (
                            <li key={i}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )) || (
                  <p className="text-sm text-gray-500">No insights available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Compliance & Audit</h2>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {metrics.complianceScore || 0}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Overall Compliance</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {metrics.pendingAudits || 0}
                </div>
                <p className="text-sm text-gray-600 mt-1">Pending Audits</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {metrics.criticalIssues || 0}
                </div>
                <p className="text-sm text-gray-600 mt-1">Critical Issues</p>
              </div>
            </div>
          </div>

          {/* Recent Audit Logs */}
          <div className="bg-white p-6 rounded-lg shadow mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Audit Logs</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metrics.recentAudits?.map((audit, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(audit.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {audit.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          audit.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : audit.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {audit.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {audit.actions || 'None'}
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        No audit logs available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarDashboard;

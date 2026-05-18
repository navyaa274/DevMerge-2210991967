import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CogIcon, 
  PlayIcon, 
  StopIcon,
  ChartBarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BookOpenIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import apiClient from '../../services/api/apiClient';

const CompleteAutomationDashboard = () => {
  const [systemStatus, setSystemStatus] = useState('healthy');
  const [activeWorkflows, setActiveWorkflows] = useState([]);
  const [systemAnalytics, setSystemAnalytics] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSystemData();
    const interval = setInterval(fetchSystemData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    try {
      const [healthRes, processesRes, analyticsRes] = await Promise.all([
        apiClient.get('/automation/system-health'),
        apiClient.get('/automation/active-processes'),
        apiClient.get('/automation/system-analytics')
      ]);

      setSystemStatus(healthRes.data.data.status);
      setActiveWorkflows(Object.entries(healthRes.data.data.processes || {}));
      setSystemAnalytics(analyticsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch system data:', error);
    }
  };

  const runWorkflow = async (workflowType, config = {}) => {
    try {
      setLoading(true);
      
      const endpoint = {
        student_journey: `/automation/student-journey/${config.studentId}`,
        course_lifecycle: `/automation/course-lifecycle/${config.courseId}`,
        institutional_ops: '/automation/institutional-operations',
        content_generation: '/automation/content-generation',
        continuous_improvement: '/automation/continuous-improvement'
      }[workflowType];

      await apiClient.post(endpoint, config);
      
      // Refresh data
      await fetchSystemData();
    } catch (error) {
      console.error(`Failed to run ${workflowType} workflow:`, error);
    } finally {
      setLoading(false);
    }
  };

  const workflows = [
    {
      id: 'student_journey',
      title: 'Student Journey Automation',
      description: 'Complete automation from admission to graduation',
      icon: AcademicCapIcon,
      color: 'blue',
      steps: ['Admission', 'Enrollment', 'Learning', 'Assessment', 'Progression', 'Graduation'],
      requiresConfig: true,
      configFields: ['studentId', 'program']
    },
    {
      id: 'course_lifecycle',
      title: 'Course Lifecycle Automation',
      description: 'Automated course creation to completion',
      icon: BookOpenIcon,
      color: 'green',
      steps: ['Creation', 'Content', 'Scheduling', 'Enrollment', 'Delivery', 'Assessment', 'Grading'],
      requiresConfig: true,
      configFields: ['courseId']
    },
    {
      id: 'institutional_ops',
      title: 'Institutional Operations',
      description: 'Complete institutional automation',
      icon: UserGroupIcon,
      color: 'purple',
      steps: ['Enrollment', 'Timetable', 'Grading', 'Compliance', 'Analytics', 'Interventions'],
      requiresConfig: false
    },
    {
      id: 'content_generation',
      title: 'AI Content Generation',
      description: 'Automated content creation workflow',
      icon: LightBulbIcon,
      color: 'yellow',
      steps: ['Syllabus', 'Problems', 'Assessments', 'Tutorials', 'Resources', 'Exercises'],
      requiresConfig: true,
      configFields: ['subject', 'level']
    },
    {
      id: 'continuous_improvement',
      title: 'Continuous Improvement',
      description: 'System optimization and enhancement',
      icon: ArrowTrendingUpIcon,
      color: 'indigo',
      steps: ['Data Collection', 'Analysis', 'Identification', 'Implementation', 'Monitoring'],
      requiresConfig: false
    }
  ];

  const getWorkflowStatus = (workflowId) => {
    const workflow = activeWorkflows.find(([id]) => id === workflowId);
    return workflow ? workflow[1].status : 'idle';
  };

  if (loading && !systemAnalytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Complete Automation Dashboard</h1>
            <p className="text-gray-600 mt-2">AI-powered end-to-end workflow automation</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              systemStatus === 'healthy' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                systemStatus === 'healthy' ? 'bg-green-400' : 'bg-red-400'
              }`} />
              {systemStatus.toUpperCase()}
            </div>
            <button
              onClick={() => runWorkflow('continuous_improvement')}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <RocketLaunchIcon className="h-4 w-4 mr-2" />
              Optimize System
            </button>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {systemAnalytics && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {systemAnalytics.analytics?.users?.total || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm text-gray-500">
                  <span className="text-green-600 font-medium">
                    {systemAnalytics.analytics?.users?.active || 0}
                  </span>{' '}
                  active
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
                    <BookOpenIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Courses
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {systemAnalytics.analytics?.courses?.active || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm text-gray-500">
                  <span className="text-green-600 font-medium">
                    {systemAnalytics.analytics?.courses?.completion_rate ? 
                      (systemAnalytics.analytics.courses.completion_rate * 100).toFixed(1) : 0}%
                  </span>{' '}
                  completion
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
                    <CogIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Automation Success
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {systemAnalytics.analytics?.automation?.success_rate ? 
                          (systemAnalytics.analytics.automation.success_rate * 100).toFixed(1) : 0}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm text-gray-500">
                  <span className="text-green-600 font-medium">
                    {systemAnalytics.analytics?.automation?.automations_run || 0}
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
                    <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Compliance Score
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {systemAnalytics.analytics?.compliance?.compliance_score ? 
                          (systemAnalytics.analytics.compliance.compliance_score * 100).toFixed(1) : 0}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm text-gray-500">
                  <span className="text-green-600 font-medium">
                    {systemAnalytics.analytics?.compliance?.audit_passed || 0}
                  </span>{' '}
                  audits passed
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'workflows', 'analytics', 'monitoring'].map((tab) => (
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
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Workflows */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Active Workflows</h3>
              <div className="space-y-3">
                {workflows.map((workflow) => {
                  const status = getWorkflowStatus(workflow.id);
                  return (
                    <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <workflow.icon className={`h-5 w-5 text-${workflow.color}-600 mr-3`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{workflow.title}</p>
                          <p className="text-xs text-gray-500">{workflow.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          status === 'running' ? 'bg-blue-100 text-blue-800' :
                          status === 'completed' ? 'bg-green-100 text-green-800' :
                          status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
              <div className="space-y-4">
                {systemAnalytics && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <span className="text-sm font-medium text-gray-900">
                        {systemAnalytics.analytics?.performance?.response_time || 0}ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <span className="text-sm font-medium text-green-600">
                        {systemAnalytics.analytics?.performance?.uptime ? 
                          (systemAnalytics.analytics.performance.uptime * 100).toFixed(2) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <span className="text-sm font-medium text-gray-900">
                        {systemAnalytics.analytics?.performance?.error_rate ? 
                          (systemAnalytics.analytics.performance.error_rate * 100).toFixed(3) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Throughput</span>
                      <span className="text-sm font-medium text-gray-900">
                        {systemAnalytics.analytics?.performance?.throughput || 0} req/s
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflows Tab */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Workflow Automation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workflows.map((workflow, index) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start mb-4">
                  <div className={`flex-shrink-0 p-3 bg-${workflow.color}-100 rounded-lg`}>
                    <workflow.icon className={`h-6 w-6 text-${workflow.color}-600`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{workflow.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                  </div>
                </div>

                {/* Workflow Steps */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">Workflow Steps:</p>
                  <div className="flex flex-wrap gap-1">
                    {workflow.steps.map((step, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {step}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Configuration */}
                {workflow.requiresConfig && (
                  <div className="mb-4 p-3 bg-gray-50 rounded">
                    <p className="text-xs font-medium text-gray-700 mb-2">Required Configuration:</p>
                    <div className="space-y-1">
                      {workflow.configFields.map((field) => (
                        <input
                          key={field}
                          type="text"
                          placeholder={field}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          id={`${workflow.id}-${field}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    getWorkflowStatus(workflow.id) === 'running' ? 'bg-blue-100 text-blue-800' :
                    getWorkflowStatus(workflow.id) === 'completed' ? 'bg-green-100 text-green-800' :
                    getWorkflowStatus(workflow.id) === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getWorkflowStatus(workflow.id)}
                  </span>
                  <button
                    onClick={() => {
                      if (workflow.requiresConfig) {
                        const config = {};
                        workflow.configFields.forEach(field => {
                          const value = document.getElementById(`${workflow.id}-${field}`).value;
                          if (value) config[field] = value;
                        });
                        if (Object.keys(config).length === workflow.configFields.length) {
                          runWorkflow(workflow.id, config);
                        } else {
                          alert('Please fill in all required fields');
                        }
                      } else {
                        runWorkflow(workflow.id);
                      }
                    }}
                    disabled={getWorkflowStatus(workflow.id) === 'running'}
                    className={`flex items-center px-3 py-1 text-sm rounded ${
                      getWorkflowStatus(workflow.id) === 'running'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : `bg-${workflow.color}-600 text-white hover:bg-${workflow.color}-700`
                    }`}
                  >
                    {getWorkflowStatus(workflow.id) === 'running' ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Running
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-3 w-3 mr-1" />
                        Run Workflow
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Analytics</h2>
          
          {systemAnalytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Analytics */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Analytics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Users</span>
                    <span className="text-sm font-medium">{systemAnalytics.analytics?.users?.total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Users</span>
                    <span className="text-sm font-medium text-green-600">{systemAnalytics.analytics?.users?.active || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Engagement Rate</span>
                    <span className="text-sm font-medium">
                      {systemAnalytics.analytics?.users?.engagement_rate ? 
                        (systemAnalytics.analytics.users.engagement_rate * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Retention Rate</span>
                    <span className="text-sm font-medium text-green-600">
                      {systemAnalytics.analytics?.users?.retention_rate ? 
                        (systemAnalytics.analytics.users.retention_rate * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Analytics */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Analytics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="text-sm font-medium">{systemAnalytics.analytics?.performance?.response_time || 0}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-medium text-green-600">
                      {systemAnalytics.analytics?.performance?.uptime ? 
                        (systemAnalytics.analytics.performance.uptime * 100).toFixed(2) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className="text-sm font-medium text-red-600">
                      {systemAnalytics.analytics?.performance?.error_rate ? 
                        (systemAnalytics.analytics.performance.error_rate * 100).toFixed(3) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Throughput</span>
                    <span className="text-sm font-medium">{systemAnalytics.analytics?.performance?.throughput || 0} req/s</span>
                  </div>
                </div>
              </div>

              {/* Automation Analytics */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Automation Analytics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Automations Run</span>
                    <span className="text-sm font-medium">{systemAnalytics.analytics?.automation?.automations_run || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Success Rate</span>
                    <span className="text-sm font-medium text-green-600">
                      {systemAnalytics.analytics?.automation?.success_rate ? 
                        (systemAnalytics.analytics.automation.success_rate * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time Saved</span>
                    <span className="text-sm font-medium">{systemAnalytics.analytics?.automation?.time_saved || 0} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Efficiency Gain</span>
                    <span className="text-sm font-medium">{systemAnalytics.analytics?.automation?.efficiency_gain || 0}x</span>
                  </div>
                </div>
              </div>

              {/* Predictive Analytics */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Predictive Analytics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Enrollment Forecast</span>
                    <span className="text-sm font-medium">{systemAnalytics.analytics?.predictions?.enrollment_forecast || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">At-Risk Students</span>
                    <span className="text-sm font-medium text-yellow-600">{systemAnalytics.analytics?.predictions?.at_risk_students || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Resource Needs</span>
                    <span className="text-sm font-medium">{systemAnalytics.analytics?.predictions?.resource_needs || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Performance Trend</span>
                    <span className="text-sm font-medium text-green-600">
                      {systemAnalytics.analytics?.predictions?.performance_trends || 'stable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monitoring Tab */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Monitoring</h2>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Real-time Monitoring</h3>
            <div className="text-sm text-gray-600">
              <p>🔹 System Status: <span className="font-medium text-green-600">{systemStatus}</span></p>
              <p>🔹 Active Workflows: <span className="font-medium">{activeWorkflows.length}</span></p>
              <p>🔹 Last Update: <span className="font-medium">{new Date().toLocaleTimeString()}</span></p>
              <p>🔹 Auto-refresh: <span className="font-medium text-green-600">Every 30 seconds</span></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteAutomationDashboard;

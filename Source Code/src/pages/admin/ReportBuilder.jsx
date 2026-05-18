import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function ReportBuilder() {
  const { token } = useAuthStore();
  const [reportConfig, setReportConfig] = useState({
    name: '',
    type: 'student_performance',
    filters: {
      dateRange: 'semester',
      departments: [],
      courses: [],
      students: []
    },
    metrics: [],
    groupBy: 'course',
    format: 'pdf'
  });
  const [generatedReport, setGeneratedReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'student_performance', label: 'Student Performance' },
    { value: 'course_analytics', label: 'Course Analytics' },
    { value: 'grade_distribution', label: 'Grade Distribution' },
    { value: 'engagement', label: 'Student Engagement' },
    { value: 'faculty_workload', label: 'Faculty Workload' },
    { value: 'custom', label: 'Custom Report' }
  ];

  const availableMetrics = [
    'Average Grade',
    'Submission Rate',
    'Engagement Score',
    'Time Spent',
    'Assignment Completion',
    'Quiz Scores',
    'Participation',
    'Progress Rate'
  ];

  const handleChange = (field, value) => {
    setReportConfig({ ...reportConfig, [field]: value });
  };

  const handleFilterChange = (field, value) => {
    setReportConfig({
      ...reportConfig,
      filters: { ...reportConfig.filters, [field]: value }
    });
  };

  const toggleMetric = (metric) => {
    const metrics = reportConfig.metrics.includes(metric)
      ? reportConfig.metrics.filter(m => m !== metric)
      : [...reportConfig.metrics, metric];
    setReportConfig({ ...reportConfig, metrics });
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/report-builder/generate`,
        reportConfig,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setGeneratedReport(response.data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/report-builder/download`,
        { reportId: generatedReport._id, format: reportConfig.format },
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report.${reportConfig.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Report Builder</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Report Configuration</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Report Name
                  </label>
                  <input
                    type="text"
                    value={reportConfig.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    placeholder="e.g., Q1 Performance Report"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Report Type
                  </label>
                  <select
                    value={reportConfig.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    {reportTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Filters</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Date Range
                  </label>
                  <select
                    value={reportConfig.filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="semester">This Semester</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Group By
                  </label>
                  <select
                    value={reportConfig.groupBy}
                    onChange={(e) => handleChange('groupBy', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="course">Course</option>
                    <option value="department">Department</option>
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="date">Date</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Export Format
                  </label>
                  <select
                    value={reportConfig.format}
                    onChange={(e) => handleChange('format', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Metrics Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Select Metrics</h2>

              <div className="grid grid-cols-2 gap-3">
                {availableMetrics.map(metric => (
                  <label key={metric} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportConfig.metrics.includes(metric)}
                      onChange={() => toggleMetric(metric)}
                      className="mr-3"
                    />
                    <span>{metric}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateReport}
              disabled={loading || !reportConfig.name || reportConfig.metrics.length === 0}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Generating Report...' : 'Generate Report'}
            </button>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Report Preview</h2>

              {generatedReport ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-green-800 font-semibold mb-2">
                      ✓ Report Generated
                    </div>
                    <div className="text-sm text-green-600">
                      {generatedReport.recordCount} records found
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-600">Name:</span>
                      <div className="font-semibold">{reportConfig.name}</div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Type:</span>
                      <div className="font-semibold capitalize">
                        {reportConfig.type.replace('_', ' ')}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Metrics:</span>
                      <div className="font-semibold">
                        {reportConfig.metrics.length} selected
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Format:</span>
                      <div className="font-semibold uppercase">
                        {reportConfig.format}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={downloadReport}
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
                  >
                    📥 Download Report
                  </button>

                  <button
                    onClick={() => setGeneratedReport(null)}
                    className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 font-semibold"
                  >
                    Create New Report
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📊</div>
                  <p>Configure and generate a report to see preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

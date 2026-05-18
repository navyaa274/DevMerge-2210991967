import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function ScheduledReports() {
  const { token } = useAuthStore();
  const [schedules, setSchedules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    reportType: 'student_performance',
    frequency: 'weekly',
    dayOfWeek: 'monday',
    time: '09:00',
    recipients: '',
    format: 'pdf',
    active: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/scheduled-reports`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSchedules(response.data.schedules || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${API_BASE_URL}/scheduled-reports`,
        {
          ...formData,
          recipients: formData.recipients.split(',').map(e => e.trim())
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowForm(false);
      setFormData({
        name: '',
        reportType: 'student_performance',
        frequency: 'weekly',
        dayOfWeek: 'monday',
        time: '09:00',
        recipients: '',
        format: 'pdf',
        active: true
      });
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await axios.put(
        `${API_BASE_URL}/scheduled-reports/${id}`,
        { active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const deleteSchedule = async (id) => {
    if (!window.confirm('Delete this scheduled report?')) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/scheduled-reports/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSchedules(schedules.filter(s => s._id !== id));
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const runNow = async (id) => {
    try {
      await axios.post(
        `${API_BASE_URL}/scheduled-reports/${id}/run`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Report generation started!');
    } catch (error) {
      console.error('Error running report:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Scheduled Reports</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold"
          >
            {showForm ? 'Cancel' : '+ Schedule Report'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">Schedule New Report</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Report Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Report Type
                  </label>
                  <select
                    name="reportType"
                    value={formData.reportType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="student_performance">Student Performance</option>
                    <option value="grade_distribution">Grade Distribution</option>
                    <option value="engagement">Engagement</option>
                    <option value="faculty_workload">Faculty Workload</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Frequency
                  </label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>

                {formData.frequency === 'weekly' && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Day of Week
                    </label>
                    <select
                      name="dayOfWeek"
                      value={formData.dayOfWeek}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Recipients (comma-separated emails)
                </label>
                <input
                  type="text"
                  name="recipients"
                  value={formData.recipients}
                  onChange={handleChange}
                  placeholder="email1@example.com, email2@example.com"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Format</label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-gray-700 font-semibold">Active</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold"
              >
                {loading ? 'Creating...' : 'Create Schedule'}
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.map((schedule) => (
            <div
              key={schedule._id}
              className={`bg-white rounded-lg shadow-md p-6 ${schedule.active ? 'border-l-4 border-green-500' : 'opacity-60'
                }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">{schedule.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {schedule.reportType.replace('_', ' ')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${schedule.active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                  }`}>
                  {schedule.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">📅</span>
                  <span className="capitalize">{schedule.frequency}</span>
                  {schedule.dayOfWeek && (
                    <span className="ml-1 capitalize">on {schedule.dayOfWeek}s</span>
                  )}
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">⏰</span>
                  <span>{schedule.time}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">📧</span>
                  <span>{schedule.recipients?.length || 0} recipients</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-600 mr-2">📄</span>
                  <span className="uppercase">{schedule.format}</span>
                </div>
              </div>

              {schedule.lastRun && (
                <div className="text-xs text-gray-500 mb-4">
                  Last run: {new Date(schedule.lastRun).toLocaleString()}
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => runNow(schedule._id)}
                  className="flex-1 bg-blue-100 text-blue-800 py-2 rounded-lg hover:bg-blue-200 font-semibold text-sm"
                >
                  Run Now
                </button>
                <button
                  onClick={() => toggleActive(schedule._id, schedule.active)}
                  className={`flex-1 py-2 rounded-lg font-semibold text-sm ${schedule.active
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                >
                  {schedule.active ? 'Pause' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteSchedule(schedule._id)}
                  className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 font-semibold text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {schedules.length === 0 && !showForm && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
            No scheduled reports yet. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
}

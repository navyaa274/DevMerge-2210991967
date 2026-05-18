import React, { useMemo, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API_BASE_URL from '../../config/api';

function ViewSubmissions() {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/assignment-submissions/assignment/${assignmentId}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch submissions');
      const data = await response.json();
      setSubmissions(data.submissions || []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId) => {
    const value = window.prompt('Enter grade (0-100):');
    if (value === null) return;
    const grade = Number(value);
    if (Number.isNaN(grade)) {
      setError('Invalid grade');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/assignment-submissions/${submissionId}/grade`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ grade })
        }
      );
      if (!response.ok) throw new Error('Failed to grade submission');
      fetchSubmissions();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredSubmissions = useMemo(() => {
    if (filter === 'all') return submissions;
    if (filter === 'pending') return submissions.filter((s) => s.status !== 'graded');
    return submissions.filter((s) => s.status === filter);
  }, [submissions, filter]);

  if (loading) return <div className="text-center py-12">Loading submissions...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Student Submissions</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        <div className="mb-6 flex gap-4">
          {['all', 'submitted', 'graded', 'pending'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Student</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Submitted</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Grade</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSubmissions.map(submission => (
                <tr key={submission._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{submission.student?.name || 'Student'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                      submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {submission.status || 'submitted'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {submission.grade ?? '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleGrade(submission._id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Grade
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSubmissions.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ViewSubmissions;

import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../../config/api';

function RunContest() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    problems: [],
    courseId: ''
  });
  const [newProblem, setNewProblem] = useState({ title: '', difficulty: 'Easy' });

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/contests`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch contests');
      const data = await response.json();
      // The backend now returns { success: true, data: [...] }
      setContests(data.data || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddProblem = () => {
    if (newProblem.title.trim()) {
      setFormData(prev => ({
        ...prev,
        problems: [...prev.problems, { ...newProblem, id: Date.now() }]
      }));
      setNewProblem({ title: '', difficulty: 'Easy' });
    }
  };

  const handleRemoveProblem = (index) => {
    setFormData(prev => ({
      ...prev,
      problems: prev.problems.filter((_, i) => i !== index)
    }));
  };

  const handleCreateContest = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${API_BASE_URL}/contests`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create contest');
      }

      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        problems: [],
        courseId: ''
      });
      fetchContests();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewDetails = (contestId) => {
    // Navigate to contest details page
    window.location.href = `/faculty/contest/${contestId}`;
  };

  const handleViewLeaderboard = (contestId) => {
    // Navigate to contest leaderboard page
    window.location.href = `/faculty/contest/${contestId}/leaderboard`;
  };

  const handleDeleteContest = async (contestId) => {
    if (!confirm('Are you sure you want to delete this contest?')) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/contests/${contestId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to delete contest');
      }
      
      fetchContests();
    } catch (err) {
      setError(err.message);
    }
  };

  const getContestStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'live';
  };

  if (loading) return <div className="text-center py-12">Loading contests...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Contests</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
          >
            {showCreateForm ? 'Cancel' : 'Create Contest'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Contest</h2>
            <form onSubmit={handleCreateContest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Contest title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  placeholder="Contest description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Problems Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contest Problems
                </label>
                <div className="space-y-2 mb-4">
                  {formData.problems.map((problem, index) => (
                    <div key={problem.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-900 dark:text-white">{problem.title}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveProblem(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newProblem.title}
                    onChange={(e) => setNewProblem(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Problem title"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  />
                  <select
                    value={newProblem.difficulty}
                    onChange={(e) => setNewProblem(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddProblem}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
                  >
                    Add Problem
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Create Contest
              </button>
            </form>
          </div>
        )}

        {/* Contests List */}
        <div className="grid gap-6">
          {contests.map(contest => {
            const status = getContestStatus(contest.startTime, contest.endTime);
            return (
              <div key={contest._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{contest.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{contest.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status === 'live' ? 'bg-green-100 text-green-800' :
                      status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Start</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(contest.startTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">End</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(contest.endTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Problems</p>
                    <p className="font-medium text-gray-900 dark:text-white">{contest.problems?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Participants</p>
                    <p className="font-medium text-gray-900 dark:text-white">{contest.participants?.length || 0}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewDetails(contest._id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleViewLeaderboard(contest._id)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
                  >
                    Leaderboard
                  </button>
                  {status === 'upcoming' && (
                    <button 
                      onClick={() => handleDeleteContest(contest._id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {contests.length === 0 && (
          <div className="text-center py-12 text-gray-600 dark:text-gray-400">
            No contests yet. Create one to get started!
          </div>
        )}
      </div>
    </div>
  );
}

export default RunContest;

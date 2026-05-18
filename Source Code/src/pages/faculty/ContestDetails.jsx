import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import { motion } from 'framer-motion';

export default function ContestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContestDetails();
  }, [id]);

  const fetchContestDetails = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/contests/${id}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch contest details');
      const data = await response.json();
      setContest(data.data || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading contest details...</div>;

  const getContestStatus = (startTime, endTime) => {
    if (!startTime || !endTime) return 'UNKNOWN';
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'UNKNOWN';
    if (now < start) return 'UPCOMING';
    if (now > end) return 'ENDED';
    return 'LIVE';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 p-4 rounded-lg">
          {error}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
        >
          <div className="mb-6">
            <button
              onClick={() => navigate('/faculty/run-contest')}
              className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Contests
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {contest.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                getContestStatus(contest.startTime, contest.endTime) === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                getContestStatus(contest.startTime, contest.endTime) === 'ENDED' ? 'bg-gray-100 text-gray-800' :
                  'bg-green-100 text-green-800'
              }`}>
                {getContestStatus(contest.startTime, contest.endTime)}
              </span>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {contest.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Schedule</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Start: </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(contest.startTime)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">End: </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(contest.endTime)}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Statistics</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Problems: </span>
                  <span className="text-gray-900 dark:text-white">{contest.problems?.length || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Participants: </span>
                  <span className="text-gray-900 dark:text-white">{contest.participants?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {contest.problems && contest.problems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Problems</h3>
              <div className="space-y-3">
                {contest.problems.map((problem, index) => {
                  const probObj = problem.problemId || problem;
                  return (
                    <div key={probObj._id || index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {index + 1}. {probObj.title || 'Untitled Problem'}
                          </h4>
                          {probObj.difficulty && (
                            <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {probObj.difficulty}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            {problem.points || 100} points
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {contest.participants && contest.participants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Participants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {contest.participants.map((participant, index) => {
                  const userObj = participant.userId || participant;
                  return (
                    <div key={userObj._id || index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {userObj.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {userObj.name || 'Anonymous User'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {userObj.email || 'No email provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

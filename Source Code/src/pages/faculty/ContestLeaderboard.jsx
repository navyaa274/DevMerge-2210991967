import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import { motion } from 'framer-motion';
import { TrophyIcon, UserIcon } from '@heroicons/react/24/outline';

export default function ContestLeaderboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContestLeaderboard();
  }, [id]);

  const fetchContestLeaderboard = async () => {
    try {
      // Fetch contest details first
      const contestResponse = await fetch(
        `${API_BASE_URL}/contests/${id}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (!contestResponse.ok) throw new Error('Failed to fetch contest');
      const contestDataRaw = await contestResponse.json();
      const contestData = contestDataRaw.data || contestDataRaw;
      setContest(contestData);

      // Fetch leaderboard data
      const leaderboardResponse = await fetch(
        `${API_BASE_URL}/contests/${id}/leaderboard`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (leaderboardResponse.ok) {
        const leaderboardDataRaw = await leaderboardResponse.json();
        const leaderboardData = leaderboardDataRaw.data || leaderboardDataRaw;
        // Mock leaderboard data if backend doesn't provide it yet
        setLeaderboard(leaderboardData.leaderboard || generateMockLeaderboard(contestData));
      } else {
        // Generate mock leaderboard data
        setLeaderboard(generateMockLeaderboard(contestData));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMockLeaderboard = (contestData) => {
    if (!contestData.participants || contestData.participants.length === 0) {
      return [];
    }
    
    return contestData.participants.map((participant, index) => {
      const userObj = participant.userId || participant;
      return {
        rank: index + 1,
        user: userObj,
        score: Math.floor(Math.random() * 500) + 500, // Mock score between 500-1000
        problemsSolved: Math.floor(Math.random() * (contestData.problems?.length || 5)),
        timeTaken: `${Math.floor(Math.random() * 60) + 30}m`
      };
    });
  };

  if (loading) return <div className="text-center py-12">Loading leaderboard...</div>;

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
      <div className="max-w-6xl mx-auto">
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
            
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {contest?.title} - Leaderboard
              </h1>
              
              <div className="text-right">
                <TrophyIcon className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                No participants yet
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                Leaderboard will appear once students join the contest
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Participant</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Score</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Problems Solved</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Time Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <motion.tr
                      key={entry.user._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`border-b border-gray-100 dark:border-gray-700 ${
                        entry.rank === 1 ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                        entry.rank === 2 ? 'bg-gray-50 dark:bg-gray-700/20' :
                        entry.rank === 3 ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                          entry.rank === 1 ? 'bg-yellow-500 text-white' :
                          entry.rank === 2 ? 'bg-gray-500 text-white' :
                          entry.rank === 3 ? 'bg-orange-600 text-white' :
                            'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                        }`}>
                          {entry.rank}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                              {entry.user.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {entry.user.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {entry.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {entry.score}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900 dark:text-white">
                          {entry.problemsSolved}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-900 dark:text-white">
                          {entry.timeTaken}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

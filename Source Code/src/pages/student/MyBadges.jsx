import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

export default function MyBadges() {
  const { user, token } = useAuthStore();
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [filter, setFilter] = useState('all'); // all, earned, locked
  const [category, setCategory] = useState('all'); // all, skill, achievement, milestone, special

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const [allBadgesRes, userBadgesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/badges`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        
        axios.get(`${API_BASE_URL}/badges/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);
      
      setBadges(allBadgesRes.data);
      setUserBadges(userBadgesRes.data);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const badgeIcons = {
    first_submission: '🚀',
    problem_solver: '💡',
    streak_7: '🔥',
    streak_30: '⚡',
    streak_100: '💥',
    perfect_score: '⭐',
    collaboration_master: '👥',
    quick_learner: '📚',
    contest_winner: '🏆',
    helpful_peer: '🤝',
    code_reviewer: '👀',
    mentor: '🎓',
    early_bird: '🌅',
    night_owl: '🦉',
    speed_demon: '⚡',
    perfectionist: '💎',
    team_player: '🤜🤛',
    innovator: '💡',
    debugger: '🐛',
    optimizer: '⚙️'
  };

  const badgeColors = {
    bronze: 'from-orange-400 to-orange-600',
    silver: 'from-gray-300 to-gray-500',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-purple-400 to-purple-600',
    diamond: 'from-blue-400 to-blue-600'
  };

  const isEarned = (badgeId) => {
    return userBadges.some(ub => ub.badgeId === badgeId || ub._id === badgeId);
  };

  const getBadgeProgress = (badge) => {
    const userBadge = userBadges.find(ub => ub.badgeId === badge._id);
    return userBadge?.progress || 0;
  };

  const getFilteredBadges = () => {
    let filtered = badges;

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(b => b.category === category);
    }

    // Filter by earned status
    if (filter === 'earned') {
      filtered = filtered.filter(b => isEarned(b._id));
    } else if (filter === 'locked') {
      filtered = filtered.filter(b => !isEarned(b._id));
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading badges...</p>
        </div>
      </div>
    );
  }

  const earnedCount = badges.filter(b => isEarned(b._id)).length;
  const filteredBadges = getFilteredBadges();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Badge Collection</h1>
          <p className="text-gray-600">Collect badges by completing challenges and milestones</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-indigo-100">Total Badges</p>
              <svg className="w-8 h-8 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="text-4xl font-bold">{earnedCount}/{badges.length}</p>
            <div className="mt-3">
              <div className="w-full bg-indigo-400 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${(earnedCount / badges.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Gold Badges</p>
              <div className="text-3xl">🥇</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {userBadges.filter(b => badges.find(badge => badge._id === b.badgeId)?.tier === 'gold').length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Silver Badges</p>
              <div className="text-3xl">🥈</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {userBadges.filter(b => badges.find(badge => badge._id === b.badgeId)?.tier === 'silver').length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600">Bronze Badges</p>
              <div className="text-3xl">🥉</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {userBadges.filter(b => badges.find(badge => badge._id === b.badgeId)?.tier === 'bronze').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({badges.length})
                </button>
                <button
                  onClick={() => setFilter('earned')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === 'earned'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Earned ({earnedCount})
                </button>
                <button
                  onClick={() => setFilter('locked')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === 'locked'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Locked ({badges.length - earnedCount})
                </button>
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="skill">Skill Badges</option>
                <option value="achievement">Achievement Badges</option>
                <option value="milestone">Milestone Badges</option>
                <option value="special">Special Badges</option>
              </select>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">
            {filter === 'earned' ? 'Earned Badges' : filter === 'locked' ? 'Locked Badges' : 'All Badges'}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBadges.length > 0 ? (
              filteredBadges.map((badge) => {
                const earned = isEarned(badge._id);
                const progress = getBadgeProgress(badge);
                const userBadge = userBadges.find(ub => ub.badgeId === badge._id);

                return (
                  <div
                    key={badge._id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`cursor-pointer rounded-lg p-6 text-center transition-all ${
                      earned
                        ? `bg-gradient-to-br ${badgeColors[badge.tier || 'bronze']} text-white shadow-lg hover:shadow-xl transform hover:scale-105`
                        : 'bg-gray-100 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div className={`text-5xl mb-3 ${!earned && 'grayscale'}`}>
                      {badgeIcons[badge.type] || '🎖️'}
                    </div>
                    <h3 className={`font-bold text-sm mb-2 ${earned ? 'text-white' : 'text-gray-900'}`}>
                      {badge.name}
                    </h3>
                    <p className={`text-xs mb-3 ${earned ? 'text-white/90' : 'text-gray-600'}`}>
                      {badge.description?.substring(0, 50)}...
                    </p>
                    
                    {earned ? (
                      <div className="text-xs text-white/80">
                        <svg className="w-5 h-5 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {userBadge?.earnedAt && new Date(userBadge.earnedAt).toLocaleDateString()}
                      </div>
                    ) : (
                      <div className="mt-2">
                        <div className="w-full bg-gray-300 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{progress}%</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <p className="text-gray-500">No badges found</p>
              </div>
            )}
          </div>
        </div>

        {/* Badge Detail Modal */}
        {selectedBadge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedBadge(null)}>
            <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <div className={`text-6xl ${!isEarned(selectedBadge._id) && 'grayscale'}`}>
                  {badgeIcons[selectedBadge.type] || '🎖️'}
                </div>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <h3 className="text-2xl font-bold mb-2">{selectedBadge.name}</h3>
              <p className="text-gray-600 mb-4">{selectedBadge.description}</p>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tier:</span>
                  <span className="font-medium capitalize">{selectedBadge.tier || 'Bronze'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium capitalize">{selectedBadge.category || 'Achievement'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Points:</span>
                  <span className="font-medium">{selectedBadge.points || 0} pts</span>
                </div>
              </div>

              {isEarned(selectedBadge._id) ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <svg className="w-12 h-12 text-green-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-green-800 font-medium">Badge Earned!</p>
                  <p className="text-sm text-green-600 mt-1">
                    {userBadges.find(ub => ub.badgeId === selectedBadge._id)?.earnedAt && 
                      new Date(userBadges.find(ub => ub.badgeId === selectedBadge._id).earnedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Progress to unlock:</p>
                  <div className="w-full bg-gray-300 rounded-full h-3 mb-2">
                    <div
                      className="bg-indigo-600 h-3 rounded-full transition-all"
                      style={{ width: `${getBadgeProgress(selectedBadge)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{getBadgeProgress(selectedBadge)}% Complete</p>
                  {selectedBadge.requirement && (
                    <p className="text-xs text-gray-600 mt-2">
                      <span className="font-medium">Requirement:</span> {selectedBadge.requirement}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

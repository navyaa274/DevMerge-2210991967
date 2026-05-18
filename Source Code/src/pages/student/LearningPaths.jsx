import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

export default function LearningPaths() {
  const { user, token } = useAuthStore();
  const [paths, setPaths] = useState([]);
  const [enrolledPaths, setEnrolledPaths] = useState([]);
  const [selectedPath, setSelectedPath] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('browse'); // browse or enrolled

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const query = filter !== 'all' ? `?difficulty=${filter}` : '';
      const [pathsRes, enrolledRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/learning-paths${query}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        
        axios.get(`${API_BASE_URL}/learning-paths/user/${user.id}/enrolled`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);
      
      setPaths(pathsRes.data);
      setEnrolledPaths(enrolledRes.data);
    } catch (error) {
      console.error('Error fetching paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollPath = async (pathId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/learning-paths/${pathId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchData();
      alert('Enrolled successfully!');
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll. Please try again.');
    }
  };

  const isEnrolled = (pathId) => {
    return enrolledPaths.some(ep => ep.pathId === pathId || ep._id === pathId);
  };

  const getPathProgress = (pathId) => {
    const enrolled = enrolledPaths.find(ep => ep.pathId === pathId || ep._id === pathId);
    return enrolled?.progress || 0;
  };

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-700 border-green-300',
    intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    advanced: 'bg-red-100 text-red-700 border-red-300'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading learning paths...</p>
        </div>
      </div>
    );
  }

  const displayPaths = view === 'enrolled' 
    ? paths.filter(p => isEnrolled(p._id))
    : paths;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Paths</h1>
          <p className="text-gray-600">Follow structured paths to master programming skills</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Available Paths</p>
                <p className="text-3xl font-bold text-gray-900">{paths.length}</p>
              </div>
              <div className="text-4xl">🗺️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Enrolled</p>
                <p className="text-3xl font-bold text-gray-900">{enrolledPaths.length}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">
                  {enrolledPaths.filter(ep => ep.progress > 0 && ep.progress < 100).length}
                </p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {enrolledPaths.filter(ep => ep.progress === 100).length}
                </p>
              </div>
              <div className="text-4xl">🎓</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setView('browse')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  view === 'browse'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Browse All
              </button>
              <button
                onClick={() => setView('enrolled')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  view === 'enrolled'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                My Paths ({enrolledPaths.length})
              </button>
            </div>

            <div className="flex gap-2">
              {['all', 'beginner', 'intermediate', 'advanced'].map(level => (
                <button
                  key={level}
                  onClick={() => setFilter(level)}
                  className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                    filter === level
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPaths.length > 0 ? (
            displayPaths.map(path => {
              const enrolled = isEnrolled(path._id);
              const progress = getPathProgress(path._id);

              return (
                <div
                  key={path._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 flex-1">{path.name}</h3>
                      {enrolled && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                          Enrolled
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{path.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Difficulty:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${difficultyColors[path.difficulty] || difficultyColors.beginner}`}>
                          {path.difficulty || 'Beginner'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium text-gray-900">{path.estimatedDuration || 20}h</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Modules:</span>
                        <span className="font-medium text-gray-900">{path.modules?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Content:</span>
                        <span className="font-medium text-gray-900">
                          {path.modules?.reduce((sum, m) => sum + (m.content?.length || 0), 0) || 0} items
                        </span>
                      </div>
                    </div>

                    {enrolled && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-gray-900">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPath(path)}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                      >
                        Details
                      </button>
                      {!enrolled ? (
                        <button
                          onClick={() => enrollPath(path._id)}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                          Enroll
                        </button>
                      ) : (
                        <Link
                          to={`/student/learning-paths/${path._id}`}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium text-center"
                        >
                          Continue
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg mb-2">No learning paths found</p>
              <p className="text-gray-400 text-sm">
                {view === 'enrolled' 
                  ? 'You haven\'t enrolled in any paths yet. Browse available paths to get started!'
                  : 'Check back later for new learning paths.'}
              </p>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedPath && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPath(null)}
          >
            <div 
              className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedPath.name}</h2>
                <button
                  onClick={() => setSelectedPath(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-6">{selectedPath.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Difficulty</p>
                  <p className="font-bold text-gray-900 capitalize">{selectedPath.difficulty || 'Beginner'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-bold text-gray-900">{selectedPath.estimatedDuration || 20} hours</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Topics</p>
                  <p className="font-bold text-gray-900">{selectedPath.topics?.length || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Students</p>
                  <p className="font-bold text-gray-900">{selectedPath.enrollmentCount || 0}</p>
                </div>
              </div>

              {selectedPath.topics && selectedPath.topics.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3">Topics Covered</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPath.topics.map((topic, idx) => (
                      <span 
                        key={idx} 
                        className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPath.skills && selectedPath.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3">Skills You'll Learn</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPath.skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPath.modules && selectedPath.modules.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-3">What's Included</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {(() => {
                      const contentTypes = {};
                      selectedPath.modules.forEach(module => {
                        module.content?.forEach(item => {
                          contentTypes[item.type] = (contentTypes[item.type] || 0) + 1;
                        });
                      });
                      
                      const icons = {
                        video: '🎥',
                        problem: '💻',
                        quiz: '📝',
                        assignment: '📋',
                        reading: '📖'
                      };

                      return Object.entries(contentTypes).map(([type, count]) => (
                        <div key={type} className="bg-gray-50 p-3 rounded-lg flex items-center gap-2">
                          <span className="text-2xl">{icons[type]}</span>
                          <div>
                            <p className="text-sm text-gray-600 capitalize">{type}s</p>
                            <p className="font-bold text-gray-900">{count}</p>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPath(null)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Close
                </button>
                {!isEnrolled(selectedPath._id) && (
                  <button
                    onClick={() => {
                      enrollPath(selectedPath._id);
                      setSelectedPath(null);
                    }}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

export default function LearningPathDetail() {
  const { pathId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeModule, setActiveModule] = useState(-1);
  const [completedItems, setCompletedItems] = useState(new Set());
  const [userProgress, setUserProgress] = useState(null);

  useEffect(() => {
    fetchPathDetails();
  }, [pathId]);

  const fetchPathDetails = async () => {
    try {
      const [pathRes, enrolledRes, progressRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/learning-paths/${pathId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/learning-paths/user/${user.id}/enrolled`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/user-progress/${pathId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: null }))
      ]);

      setPath(pathRes.data);

      const enrolled = enrolledRes.data.find(ep =>
        (ep.pathId && ep.pathId.toString() === pathId) ||
        (ep._id && ep._id.toString() === pathId)
      );
      setIsEnrolled(!!enrolled);

      // Set progress from user progress tracking
      if (progressRes.data) {
        setUserProgress(progressRes.data);
        setProgress(progressRes.data.overallProgress || 0);

        // Build completed items set
        const completed = new Set();
        progressRes.data.completedContent.forEach(item => {
          const key = `${item.moduleIndex}-${item.contentIndex}`;
          completed.add(key);
        });
        setCompletedItems(completed);
      }
    } catch (error) {
      console.error('Error fetching path details:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollPath = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/learning-paths/${pathId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEnrolled(true);
      alert('Enrolled successfully! Start learning now.');
    } catch (error) {
      console.error('Error enrolling:', error);
      alert(typeof error.response?.data?.error === 'string' ? error.response?.data?.error : error.response?.data?.error?.toString() || 'Failed to enroll');
    }
  };

  const handleContentClick = (item, moduleIdx, itemIdx) => {
    if (!isEnrolled) {
      alert('Please enroll in this learning path first!');
      return;
    }

    // Store context for marking completion later
    const contentContext = {
      pathId,
      moduleIndex: moduleIdx,
      contentIndex: itemIdx,
      contentType: item.type,
      contentId: item.contentId || item.title
    };

    if (item.type === 'video') {
      if (item.contentId) {
        navigate(`/student/video/${item.contentId}`, { state: contentContext });
      } else {
        alert('Video not available');
      }
    } else if (item.type === 'problem') {
      if (item.contentId) {
        navigate(`/problems/${item.contentId}`, { state: contentContext });
      } else {
        alert('Problem not available');
      }
    } else if (item.type === 'quiz') {
      if (item.contentId) {
        navigate(`/student/quiz/${item.contentId}`, { state: contentContext });
      } else {
        alert('Quiz not available');
      }
    } else if (item.type === 'reading') {
      navigate(`/student/reading/${item.title}`, {
        state: { reading: item, ...contentContext }
      });
    } else if (item.type === 'assignment') {
      if (item.contentId) {
        navigate(`/student/assignments/${item.contentId}`);
      } else {
        navigate('/student/dashboard');
      }
    }
  };

  const isItemCompleted = (moduleIdx, itemIdx) => {
    const key = `${moduleIdx}-${itemIdx}`;
    return completedItems.has(key);
  };

  const getTotalContent = () => {
    if (!path?.modules) return 0;
    return path.modules.reduce((sum, m) => sum + (m.content?.length || 0), 0);
  };

  const getContentTypeCount = (type) => {
    if (!path?.modules) return 0;
    return path.modules.reduce((sum, m) => {
      return sum + (m.content?.filter(c => c.type === type).length || 0);
    }, 0);
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
          <p className="mt-4 text-gray-600">Loading learning path...</p>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Learning Path Not Found</h2>
          <p className="text-gray-600 mb-4">The learning path you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/student/learning-paths')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Learning Paths
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <button
            onClick={() => navigate('/student/learning-paths')}
            className="mb-6 flex items-center text-white/80 hover:text-white transition"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Learning Paths
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${difficultyColors[path.difficulty] || difficultyColors.beginner}`}>
                  {path.difficulty || 'Beginner'}
                </span>
                {isEnrolled && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ✓ Enrolled
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-4">{path.name}</h1>
              <p className="text-xl text-white/90 mb-6">{path.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{path.estimatedDuration || 20} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>{path.modules?.length || 0} modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{getTotalContent()} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{path.rating?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
            </div>

            {!isEnrolled ? (
              <button
                onClick={enrollPath}
                className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition font-bold text-lg shadow-lg whitespace-nowrap"
              >
                Enroll Now
              </button>
            ) : (
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 min-w-[200px]">
                  <p className="text-sm text-white/80 mb-2">Your Progress</p>
                  <p className="text-4xl font-bold mb-3">{progress}%</p>
                  <div className="w-full bg-white/30 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* What You'll Learn */}
            {path.skills && path.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {path.skills.map((skill, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Course Content */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>

              {path.modules && path.modules.length > 0 ? (
                <div className="space-y-3">
                  {path.modules.map((module, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:border-indigo-300 transition"
                    >
                      <div
                        className="p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                        onClick={() => setActiveModule(activeModule === idx ? -1 : idx)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                {idx + 1}
                              </span>
                              <h3 className="font-bold text-lg text-gray-900">{module.title}</h3>
                            </div>
                            <p className="text-gray-600 text-sm ml-11">{module.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 ml-11">
                              {module.estimatedTime && (
                                <span>⏱️ {module.estimatedTime}h</span>
                              )}
                              {module.content && (
                                <span>📚 {module.content.length} lessons</span>
                              )}
                            </div>
                          </div>
                          <svg
                            className={`w-6 h-6 text-gray-400 transition-transform flex-shrink-0 ${activeModule === idx ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>

                      {/* Module Content */}
                      {activeModule === idx && module.content && module.content.length > 0 && (
                        <div className="border-t border-gray-200 bg-white">
                          <div className="divide-y divide-gray-100">
                            {module.content.map((item, itemIdx) => {
                              const contentIcons = {
                                video: { icon: '🎥', color: 'text-red-600', bg: 'bg-red-50' },
                                problem: { icon: '💻', color: 'text-blue-600', bg: 'bg-blue-50' },
                                quiz: { icon: '📝', color: 'text-purple-600', bg: 'bg-purple-50' },
                                assignment: { icon: '📋', color: 'text-orange-600', bg: 'bg-orange-50' },
                                reading: { icon: '📖', color: 'text-green-600', bg: 'bg-green-50' }
                              };

                              const iconData = contentIcons[item.type] || contentIcons.reading;

                              return (
                                <div
                                  key={itemIdx}
                                  className="p-4 hover:bg-gray-50 transition group"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                      <div className={`w-12 h-12 ${iconData.bg} rounded-lg flex items-center justify-center text-2xl flex-shrink-0 relative`}>
                                        {iconData.icon}
                                        {isItemCompleted(idx, itemIdx) && (
                                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="font-medium text-gray-900 mb-1">{item.title}</p>
                                          {isItemCompleted(idx, itemIdx) && (
                                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                                              Completed
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                          <span className={`capitalize font-medium ${iconData.color}`}>
                                            {item.type}
                                          </span>
                                          {item.duration && (
                                            <span className="flex items-center gap-1">
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                              </svg>
                                              {item.duration} min
                                            </span>
                                          )}
                                          {item.isRequired && (
                                            <span className="text-red-600 font-medium text-xs">● Required</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => handleContentClick(item, idx, itemIdx)}
                                      className={`px-6 py-2 rounded-lg transition font-medium opacity-0 group-hover:opacity-100 flex-shrink-0 ${isItemCompleted(idx, itemIdx)
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                    >
                                      {isItemCompleted(idx, itemIdx) ? 'Review' : 'Start'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  Course content is being developed. Check back soon!
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Includes */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h3 className="font-bold text-lg text-gray-900 mb-4">This course includes</h3>
              <div className="space-y-3">
                {getContentTypeCount('video') > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-xl">
                      🎥
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{getContentTypeCount('video')} Video Lessons</p>
                      <p className="text-sm text-gray-500">HD quality videos</p>
                    </div>
                  </div>
                )}
                {getContentTypeCount('quiz') > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-xl">
                      📝
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{getContentTypeCount('quiz')} Quizzes</p>
                      <p className="text-sm text-gray-500">Test your knowledge</p>
                    </div>
                  </div>
                )}
                {getContentTypeCount('problem') > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl">
                      💻
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{getContentTypeCount('problem')} Coding Problems</p>
                      <p className="text-sm text-gray-500">Hands-on practice</p>
                    </div>
                  </div>
                )}
                {getContentTypeCount('assignment') > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-xl">
                      📋
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{getContentTypeCount('assignment')} Assignments</p>
                      <p className="text-sm text-gray-500">Real-world projects</p>
                    </div>
                  </div>
                )}
                {getContentTypeCount('reading') > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-xl">
                      📖
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{getContentTypeCount('reading')} Reading Materials</p>
                      <p className="text-sm text-gray-500">Comprehensive guides</p>
                    </div>
                  </div>
                )}
              </div>

              {!isEnrolled && (
                <button
                  onClick={enrollPath}
                  className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold"
                >
                  Enroll Now
                </button>
              )}
            </div>

            {/* Topics */}
            {path.topics && path.topics.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4">Topics Covered</h3>
                <div className="flex flex-wrap gap-2">
                  {path.topics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

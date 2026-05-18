import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/courses/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setCourse(response.data);
    } catch (err) {
      console.error('Error fetching course:', err);
      setError(err.response?.data?.error || 'Failed to fetch course');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">{typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred' || 'The course you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/courses')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
          <p className="text-indigo-100 mb-4">{course.code}</p>
          <p className="text-white mb-6">{course.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-indigo-100 text-sm mb-1">Instructor</p>
              <p className="font-semibold">{course.faculty?.name || 'TBA'}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-indigo-100 text-sm mb-1">Students</p>
              <p className="font-semibold">{course.students?.length || 0}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-indigo-100 text-sm mb-1">Credits</p>
              <p className="font-semibold">{course.credits || 3}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-indigo-100 text-sm mb-1">Semester</p>
              <p className="font-semibold">{course.semester || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex gap-4 px-6 border-b overflow-x-auto">
            {['overview', 'materials', 'assignments', 'problems', 'announcements'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-4 font-medium border-b-2 whitespace-nowrap transition ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Course Overview</h3>
                  <p className="text-gray-700 leading-relaxed">{course.description}</p>
                </div>

                {course.modules && course.modules.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Course Modules</h3>
                    <div className="space-y-3">
                      {course.modules.map((module, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Module {module.order || idx + 1}: {module.title}
                          </h4>
                          <p className="text-gray-600 text-sm">{module.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Department</h3>
                  <p className="text-gray-700">{course.department?.name || 'Not specified'}</p>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Course Materials</h3>
                {course.materials && course.materials.length > 0 ? (
                  course.materials.map((material, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{material.title || `Material ${idx + 1}`}</p>
                          <p className="text-sm text-gray-600">{material.type || 'Document'}</p>
                        </div>
                      </div>
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium">
                        Download
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-8">No materials available yet</p>
                )}
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Assignments</h3>
                {course.assignments && course.assignments.length > 0 ? (
                  course.assignments.map((assignment) => (
                    <div key={assignment._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{assignment.title}</h4>
                        <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {assignment.status || 'Pending'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{assignment.description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No deadline'}
                        </p>
                        <Link
                          to={`/student/assignments/${assignment._id}`}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-8">No assignments available yet</p>
                )}
              </div>
            )}

            {activeTab === 'problems' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Coding Problems</h3>
                {course.problems && course.problems.length > 0 ? (
                  course.problems.map((problem) => (
                    <div key={problem._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{problem.title}</h4>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {problem.difficulty}
                            </span>
                            {problem.topics && problem.topics.map((topic, idx) => (
                              <span key={idx} className="text-xs text-gray-600">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Link
                          to={`/problems/${problem._id}`}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm"
                        >
                          Solve
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-8">No problems available yet</p>
                )}
              </div>
            )}

            {activeTab === 'announcements' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Announcements</h3>
                {course.announcements && course.announcements.length > 0 ? (
                  course.announcements.map((announcement) => (
                    <div key={announcement._id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-gray-900">{announcement.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(announcement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-gray-700">{announcement.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-8">No announcements yet</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

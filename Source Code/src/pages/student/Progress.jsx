import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function Progress() {
  const { token } = useAuthStore();
  const [progress, setProgress] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const [progressRes, coursesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/progress`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/courses/enrolled`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setProgress(progressRes.data);
      setCourses(coursesRes.data.courses || []);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading progress...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Progress</h1>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-600 mb-2">Total Courses</div>
            <div className="text-3xl font-bold text-indigo-600">
              {courses.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-600 mb-2">Completed</div>
            <div className="text-3xl font-bold text-green-600">
              {progress?.completedCourses || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-600 mb-2">In Progress</div>
            <div className="text-3xl font-bold text-blue-600">
              {progress?.inProgressCourses || 0}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-600 mb-2">Overall Progress</div>
            <div className="text-3xl font-bold text-purple-600">
              {progress?.overallProgress || 0}%
            </div>
          </div>
        </div>

        {/* Course Progress */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Course Progress</h2>
          <div className="space-y-6">
            {courses.map((course) => {
              const courseProgress = progress?.courses?.find(
                c => c.courseId === course._id
              ) || { progress: 0 };
              
              return (
                <div key={course._id} className="border-b pb-6 last:border-b-0">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{course.title}</h3>
                      <p className="text-gray-600 text-sm">{course.code}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">
                        {courseProgress.progress}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {courseProgress.completedLessons || 0} / {course.totalLessons || 0} lessons
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getProgressColor(courseProgress.progress)}`}
                      style={{ width: `${courseProgress.progress}%` }}
                    />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <div className="text-sm text-gray-600">Assignments</div>
                      <div className="font-semibold">
                        {courseProgress.completedAssignments || 0} / {course.totalAssignments || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Quizzes</div>
                      <div className="font-semibold">
                        {courseProgress.completedQuizzes || 0} / {course.totalQuizzes || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Grade</div>
                      <div className="font-semibold">
                        {courseProgress.grade || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills Progress */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Skills Development</h2>
          <div className="space-y-4">
            {progress?.skills?.map((skill) => (
              <div key={skill.name}>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">{skill.name}</span>
                  <span className="text-indigo-600 font-bold">{skill.level}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getProgressColor(skill.level)}`}
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No skills data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, CheckCircle, Clock, BookOpen, Users, MessageSquare, FileText } from 'lucide-react';
import courseModulesService from '../../services/api/courseModulesService';
import lessonsService from '../../services/api/lessonsService';
import lessonProgressService from '../../services/api/lessonProgressService';
import courseProgressService from '../../services/api/courseProgressService';

const CoursePlayer = ({ courseId }) => {
  const [modules, setModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [courseProgress, setCourseProgress] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      const [modulesResponse, progressResponse, lessonProgressResponse] = await Promise.all([
        courseModulesService.getCourseModules(courseId),
        courseProgressService.getCourseProgress(courseId),
        lessonProgressService.getUserLessonProgress(courseId)
      ]);

      const modulesData = modulesResponse.data || [];
      const progressData = progressResponse.data || null;
      const lessonProgressData = lessonProgressResponse.data || [];

      setModules(modulesData);
      setCourseProgress(progressData);

      // Create lesson progress map
      const progressMap = {};
      lessonProgressData.forEach(item => {
        if (item.progress) {
          progressMap[item._id] = item.progress;
        }
      });
      setLessonProgress(progressMap);

      // Set current module and lesson
      if (progressData && progressData.current_module_id) {
        setCurrentModule(progressData.current_module_id._id || progressData.current_module_id);
      } else if (modulesData.length > 0) {
        setCurrentModule(modulesData[0]._id);
      }

      // Load lessons for current module
      if (currentModule) {
        await loadModuleLessons(currentModule);
      }

    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadModuleLessons = async (moduleId) => {
    try {
      const response = await lessonsService.getModuleLessons(moduleId);
      const lessonsData = response.data || [];
      setLessons(lessonsData);

      // Set current lesson
      if (courseProgress && courseProgress.current_lesson_id) {
        setCurrentLesson(courseProgress.current_lesson_id._id || courseProgress.current_lesson_id);
      } else if (lessonsData.length > 0) {
        setCurrentLesson(lessonsData[0]._id);
      }
    } catch (error) {
      console.error('Error loading module lessons:', error);
    }
  };

  const handleModuleSelect = async (module) => {
    setCurrentModule(module._id);
    await loadModuleLessons(module._id);

    // Update current position
    try {
      await courseProgressService.updateCurrentPosition(courseId, {
        moduleId: module._id
      });
    } catch (error) {
      console.error('Error updating position:', error);
    }
  };

  const handleLessonSelect = async (lesson) => {
    setCurrentLesson(lesson._id);

    // Update current position
    try {
      await courseProgressService.updateCurrentPosition(courseId, {
        moduleId: currentModule,
        lessonId: lesson._id
      });
    } catch (error) {
      console.error('Error updating position:', error);
    }
  };

  const handleLessonComplete = async (lessonId) => {
    try {
      const startTime = Date.now();
      await lessonProgressService.completeLesson(lessonId, {
        time_spent_seconds: Math.floor((Date.now() - startTime) / 1000),
        score: 100 // Could be from quiz/assessment
      });

      // Reload progress data
      const [progressResponse, lessonProgressResponse] = await Promise.all([
        courseProgressService.getCourseProgress(courseId),
        lessonProgressService.getUserLessonProgress(courseId)
      ]);

      setCourseProgress(progressResponse.data);

      const progressMap = {};
      lessonProgressResponse.data.forEach(item => {
        if (item.progress) {
          progressMap[item._id] = item.progress;
        }
      });
      setLessonProgress(progressMap);

    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const navigateLesson = (direction) => {
    const currentIndex = lessons.findIndex(l => l._id === currentLesson);
    if (direction === 'next' && currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      handleLessonSelect(nextLesson);
    } else if (direction === 'prev' && currentIndex > 0) {
      const prevLesson = lessons[currentIndex - 1];
      handleLessonSelect(prevLesson);
    }
  };

  const getCurrentLesson = () => {
    return lessons.find(l => l._id === currentLesson);
  };

  const getLessonProgress = (lessonId) => {
    return lessonProgress[lessonId];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const currentLessonData = getCurrentLesson();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-16'} bg-white border-r transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className={`${sidebarOpen ? 'block' : 'hidden'} text-lg font-semibold`}>Course Content</h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded hover:bg-gray-100"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Progress Overview */}
        {sidebarOpen && courseProgress && (
          <div className="p-4 border-b bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Course Progress</span>
              <span className="text-sm text-blue-600">{courseProgress.progress_percentage || 0}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${courseProgress.progress_percentage || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{courseProgress.completed_lessons || 0} of {courseProgress.total_lessons || 0} lessons</span>
            </div>
          </div>
        )}

        {/* Modules and Lessons */}
        <div className="flex-1 overflow-y-auto">
          {modules.map((module) => (
            <div key={module._id} className="border-b">
              <button
                onClick={() => handleModuleSelect(module)}
                className={`w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                  currentModule === module._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                {sidebarOpen ? (
                  <>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{module.title}</h3>
                      <p className="text-xs text-gray-600">{module.lesson_count || 0} lessons</p>
                    </div>
                    {module.estimated_duration && (
                      <Clock size={14} className="text-gray-500" />
                    )}
                  </>
                ) : (
                  <BookOpen size={16} className="text-gray-600" />
                )}
              </button>

              {sidebarOpen && currentModule === module._id && (
                <div className="bg-gray-50">
                  {lessons.map((lesson) => {
                    const progress = getLessonProgress(lesson._id);
                    return (
                      <button
                        key={lesson._id}
                        onClick={() => handleLessonSelect(lesson)}
                        className={`w-full p-2 pl-6 text-left hover:bg-gray-100 flex items-center gap-2 ${
                          currentLesson === lesson._id ? 'bg-blue-100' : ''
                        }`}
                      >
                        <div className="flex-1 flex items-center gap-2">
                          {progress && progress.completed ? (
                            <CheckCircle size={14} className="text-green-500" />
                          ) : (
                            <div className="w-3 h-3 border-2 border-gray-300 rounded-full"></div>
                          )}
                          <span className="text-sm truncate">{lesson.title}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          {lesson.type === 'video' && <Play size={12} />}
                          {lesson.type === 'pdf' && <FileText size={12} />}
                          {lesson.type === 'quiz' && <BookOpen size={12} />}
                          <span>{lesson.duration}min</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentLessonData && (
              <>
                <h1 className="text-xl font-semibold">{currentLessonData.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={14} />
                  <span>{currentLessonData.duration} min</span>
                  <span>•</span>
                  <span className="capitalize">{currentLessonData.type}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded hover:bg-gray-100">
              <Users size={18} />
            </button>
            <button className="p-2 rounded hover:bg-gray-100">
              <MessageSquare size={18} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {currentLessonData ? (
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                {/* Lesson Content */}
                <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
                  {currentLessonData.type === 'video' && (
                    <div className="aspect-video bg-black rounded mb-4 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Play size={48} className="mx-auto mb-2" />
                        <p>Video Player - {currentLessonData.content_url || 'No URL provided'}</p>
                      </div>
                    </div>
                  )}

                  {currentLessonData.type === 'text' && (
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: currentLessonData.content }} />
                    </div>
                  )}

                  {currentLessonData.type === 'pdf' && (
                    <div className="bg-gray-100 p-8 rounded text-center">
                      <FileText size={48} className="mx-auto mb-4 text-gray-600" />
                      <p className="text-lg mb-2">PDF Document</p>
                      <p className="text-gray-600">{currentLessonData.content_url || 'No URL provided'}</p>
                      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        Open PDF
                      </button>
                    </div>
                  )}

                  {currentLessonData.type === 'quiz' && (
                    <div className="bg-yellow-50 p-8 rounded text-center">
                      <BookOpen size={48} className="mx-auto mb-4 text-yellow-600" />
                      <p className="text-lg mb-2">Interactive Quiz</p>
                      <p className="text-gray-600">Test your knowledge with this quiz</p>
                      <button className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                        Start Quiz
                      </button>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => navigateLesson('prev')}
                    disabled={lessons.findIndex(l => l._id === currentLesson) === 0}
                    className="px-6 py-3 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft size={18} />
                    Previous Lesson
                  </button>

                  <div className="flex gap-3">
                    {currentLessonData && !getLessonProgress(currentLessonData._id)?.completed && (
                      <button
                        onClick={() => handleLessonComplete(currentLesson)}
                        className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Mark Complete
                      </button>
                    )}

                    <button
                      onClick={() => navigateLesson('next')}
                      disabled={lessons.findIndex(l => l._id === currentLesson) === lessons.length - 1}
                      className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Next Lesson
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">No Lesson Selected</h3>
                <p>Select a lesson from the sidebar to begin learning</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;

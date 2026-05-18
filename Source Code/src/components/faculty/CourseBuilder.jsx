import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Edit, Trash2, GripVertical, BookOpen, Clock } from 'lucide-react';
import courseModulesService from '../../services/api/courseModulesService';
import lessonsService from '../../services/api/lessonsService';

const CourseBuilder = ({ courseId }) => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order_index: 0,
    is_published: true,
    estimated_duration: 0
  });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    type: 'text',
    content: '',
    duration: 0,
    is_published: true
  });

  useEffect(() => {
    loadModules();
  }, [courseId]);

  const loadModules = async () => {
    try {
      setLoading(true);
      const response = await courseModulesService.getCourseModules(courseId, true);
      setModules(response.data || []);
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLessons = async (moduleId) => {
    try {
      const response = await lessonsService.getModuleLessons(moduleId, true);
      setLessons(response.data || []);
    } catch (error) {
      console.error('Error loading lessons:', error);
    }
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    loadLessons(module._id);
  };

  const handleCreateModule = async () => {
    try {
      await courseModulesService.createModule(courseId, moduleForm);
      setShowModuleForm(false);
      setModuleForm({ title: '', description: '', order_index: 0, is_published: true, estimated_duration: 0 });
      loadModules();
    } catch (error) {
      console.error('Error creating module:', error);
    }
  };

  const handleUpdateModule = async () => {
    try {
      await courseModulesService.updateModule(selectedModule._id, moduleForm);
      setShowModuleForm(false);
      loadModules();
    } catch (error) {
      console.error('Error updating module:', error);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module? This will also delete all lessons in the module.')) {
      try {
        await courseModulesService.deleteModule(moduleId);
        loadModules();
        if (selectedModule && selectedModule._id === moduleId) {
          setSelectedModule(null);
          setLessons([]);
        }
      } catch (error) {
        console.error('Error deleting module:', error);
      }
    }
  };

  const handleCreateLesson = async () => {
    try {
      await lessonsService.createLesson(selectedModule._id, lessonForm);
      setShowLessonForm(false);
      setLessonForm({ title: '', type: 'text', content: '', duration: 0, is_published: true });
      loadLessons(selectedModule._id);
    } catch (error) {
      console.error('Error creating lesson:', error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(modules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setModules(items);

    // Update order on server
    const moduleOrder = items.map(item => item._id);
    try {
      await courseModulesService.reorderModules(courseId, moduleOrder);
    } catch (error) {
      console.error('Error reordering modules:', error);
      // Revert on error
      loadModules();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Modules Sidebar */}
      <div className="w-1/3 bg-gray-50 p-4 border-r">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Course Modules</h3>
          <button
            onClick={() => {
              setModuleForm({ title: '', description: '', order_index: 0, is_published: true, estimated_duration: 0 });
              setShowModuleForm(true);
            }}
            className="bg-blue-500 text-white px-3 py-1 rounded flex items-center gap-1"
          >
            <Plus size={16} />
            Add Module
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="modules">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {modules.map((module, index) => (
                  <Draggable key={module._id} draggableId={module._id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-3 bg-white rounded border cursor-pointer hover:shadow-md transition-shadow ${
                          selectedModule && selectedModule._id === module._id ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => handleModuleSelect(module)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <div {...provided.dragHandleProps}>
                              <GripVertical size={16} className="text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{module.title}</h4>
                              <p className="text-sm text-gray-600">{module.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <BookOpen size={12} className="text-gray-500" />
                                <span className="text-xs text-gray-500">{module.lesson_count || 0} lessons</span>
                                <Clock size={12} className="text-gray-500" />
                                <span className="text-xs text-gray-500">{module.estimated_duration} min</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModuleForm(module);
                                setShowModuleForm(true);
                              }}
                              className="p-1 text-gray-500 hover:text-blue-500"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteModule(module._id);
                              }}
                              className="p-1 text-gray-500 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Lessons Content */}
      <div className="flex-1 p-4">
        {selectedModule ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedModule.title} - Lessons</h3>
              <button
                onClick={() => {
                  setLessonForm({ title: '', type: 'text', content: '', duration: 0, is_published: true });
                  setShowLessonForm(true);
                }}
                className="bg-green-500 text-white px-3 py-1 rounded flex items-center gap-1"
              >
                <Plus size={16} />
                Add Lesson
              </button>
            </div>

            <div className="space-y-2">
              {lessons.map((lesson) => (
                <div key={lesson._id} className="p-3 bg-white rounded border hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{lesson.title}</h4>
                      <p className="text-sm text-gray-600">{lesson.type} • {lesson.duration} min</p>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1 text-gray-500 hover:text-blue-500">
                        <Edit size={14} />
                      </button>
                      <button className="p-1 text-gray-500 hover:text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a module to view and manage lessons</p>
            </div>
          </div>
        )}
      </div>

      {/* Module Form Modal */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              {moduleForm._id ? 'Edit Module' : 'Create Module'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({...moduleForm, title: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Duration (minutes)</label>
                <input
                  type="number"
                  value={moduleForm.estimated_duration}
                  onChange={(e) => setModuleForm({...moduleForm, estimated_duration: parseInt(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={moduleForm.is_published}
                  onChange={(e) => setModuleForm({...moduleForm, is_published: e.target.checked})}
                  id="is_published"
                />
                <label htmlFor="is_published" className="text-sm">Published</label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={moduleForm._id ? handleUpdateModule : handleCreateModule}
                className="bg-blue-500 text-white px-4 py-2 rounded flex-1"
              >
                {moduleForm._id ? 'Update' : 'Create'}
              </button>
              <button
                onClick={() => setShowModuleForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Form Modal */}
      {showLessonForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Create Lesson</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({...lessonForm, title: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={lessonForm.type}
                  onChange={(e) => setLessonForm({...lessonForm, type: e.target.value})}
                  className="w-full p-2 border rounded"
                >
                  <option value="text">Text</option>
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="document">Document</option>
                  <option value="link">Link</option>
                  <option value="code">Code</option>
                  <option value="interactive">Interactive</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({...lessonForm, content: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows={4}
                  placeholder="Enter lesson content..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({...lessonForm, duration: parseInt(e.target.value) || 0})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={lessonForm.is_published}
                  onChange={(e) => setLessonForm({...lessonForm, is_published: e.target.checked})}
                  id="lesson_published"
                />
                <label htmlFor="lesson_published" className="text-sm">Published</label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={handleCreateLesson}
                className="bg-green-500 text-white px-4 py-2 rounded flex-1"
              >
                Create Lesson
              </button>
              <button
                onClick={() => setShowLessonForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseBuilder;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/api';

function CreateExam() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [examType, setExamType] = useState('mixed');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    startTime: '',
    endTime: '',
    totalMarks: 100,
    shuffleQuestions: true,
    showResults: true,
    negativeMarking: false,
    negativeMarkValue: 0,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    marks: 1
  });

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      setError('Question text is required');
      return;
    }

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion, id: Date.now() }]
    }));

    setCurrentQuestion({
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      marks: 1
    });
    setError('');
  };

  const removeQuestion = (id) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.questions.length === 0) {
        throw new Error('Add at least one question');
      }

      const payload = {
        ...formData,
        course: formData.courseId || null,
        examType
      };

      const response = await fetch(`${API_BASE_URL}/exams`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to create exam');
      
      navigate('/faculty/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Create Exam</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Exam Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Exam Details</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
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
                  placeholder="Exam title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Marks
                </label>
                <input
                  type="number"
                  name="totalMarks"
                  value={formData.totalMarks}
                  onChange={handleFormChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Exam description"
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

            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="shuffleQuestions"
                  checked={formData.shuffleQuestions}
                  onChange={handleFormChange}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Shuffle Questions</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="showResults"
                  checked={formData.showResults}
                  onChange={handleFormChange}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Results Immediately</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="negativeMarking"
                  checked={formData.negativeMarking}
                  onChange={handleFormChange}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Enable Negative Marking</span>
              </label>
            </div>
          </div>

          {/* Add Questions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Questions</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Type
              </label>
              <select
                value={currentQuestion.type}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="mcq">Multiple Choice</option>
                <option value="coding">Coding</option>
                <option value="descriptive">Descriptive</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question
              </label>
              <textarea
                name="question"
                value={currentQuestion.question}
                onChange={handleQuestionChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                placeholder="Enter question text"
              />
            </div>

            {currentQuestion.type === 'mcq' && (
              <div className="mb-4 space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Options
                </label>
                {currentQuestion.options.map((option, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={currentQuestion.correctAnswer === idx}
                      onChange={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: idx }))}
                      className="mt-2"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder={`Option ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Marks
              </label>
              <input
                type="number"
                name="marks"
                value={currentQuestion.marks}
                onChange={handleQuestionChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={addQuestion}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Add Question
            </button>
          </div>

          {/* Questions List */}
          {formData.questions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Questions ({formData.questions.length})
              </h2>
              <div className="space-y-2">
                {formData.questions.map((q, idx) => (
                  <div key={q.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-900 dark:text-white">
                      Q{idx + 1}: {q.question.substring(0, 50)}... ({q.marks} marks)
                    </span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Exam'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/faculty/dashboard')}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateExam;

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BookOpen, FileText, Settings, Eye, EyeOff, Search, Filter } from 'lucide-react';
import questionBankService from '../../services/api/questionBankService';

const QuestionBankManager = ({ courseId }) => {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [selectedQuestionBank, setSelectedQuestionBank] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionBankForm, setShowQuestionBankForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [questionBankForm, setQuestionBankForm] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    difficulty_level: 'Medium',
    tags: '',
    access_level: 'course'
  });
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    difficulty_level: 'Medium',
    points: 1,
    time_limit_seconds: 0,
    explanation: '',
    hint: '',
    tags: '',
    cognitive_level: 'Understand',
    subject: '',
    topic: '',
    subtopic: '',
    options: [
      { option_text: '', option_letter: 'A', is_correct: false },
      { option_text: '', option_letter: 'B', is_correct: false },
      { option_text: '', option_letter: 'C', is_correct: false },
      { option_text: '', option_letter: 'D', is_correct: false }
    ]
  });

  useEffect(() => {
    loadQuestionBanks();
  }, [courseId]);

  const loadQuestionBanks = async () => {
    try {
      setLoading(true);
      const response = await questionBankService.getCourseQuestionBanks(courseId, { include_inactive: true });
      setQuestionBanks(response.data || []);
    } catch (error) {
      console.error('Error loading question banks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionBankDetails = async (questionBankId) => {
    try {
      const response = await questionBankService.getQuestionBank(questionBankId);
      setSelectedQuestionBank(response.data.data.question_bank);
      setQuestions(response.data.data.questions || []);
    } catch (error) {
      console.error('Error loading question bank details:', error);
    }
  };

  const handleCreateQuestionBank = async () => {
    try {
      const tagsArray = questionBankForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      await questionBankService.createQuestionBank({
        ...questionBankForm,
        course_id: courseId,
        tags: tagsArray
      });

      setShowQuestionBankForm(false);
      setQuestionBankForm({
        title: '',
        description: '',
        subject: '',
        topic: '',
        difficulty_level: 'Medium',
        tags: '',
        access_level: 'course'
      });
      loadQuestionBanks();
    } catch (error) {
      console.error('Error creating question bank:', error);
    }
  };

  const handleCreateQuestion = async () => {
    try {
      const tagsArray = questionForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      // Filter out empty options and ensure correct structure
      const validOptions = questionForm.options.filter(opt => opt.option_text.trim() !== '');

      const questionData = {
        ...questionForm,
        tags: tagsArray,
        options: validOptions
      };

      // Remove options from question data if not multiple choice
      if (questionForm.question_type !== 'multiple_choice') {
        delete questionData.options;
      }

      await questionBankService.createQuestion(selectedQuestionBank._id, questionData);

      setShowQuestionForm(false);
      setQuestionForm({
        question_text: '',
        question_type: 'multiple_choice',
        difficulty_level: 'Medium',
        points: 1,
        time_limit_seconds: 0,
        explanation: '',
        hint: '',
        tags: '',
        cognitive_level: 'Understand',
        subject: '',
        topic: '',
        subtopic: '',
        options: [
          { option_text: '', option_letter: 'A', is_correct: false },
          { option_text: '', option_letter: 'B', is_correct: false },
          { option_text: '', option_letter: 'C', is_correct: false },
          { option_text: '', option_letter: 'D', is_correct: false }
        ]
      });
      loadQuestionBankDetails(selectedQuestionBank._id);
    } catch (error) {
      console.error('Error creating question:', error);
    }
  };

  const addQuestionOption = () => {
    const nextLetter = String.fromCharCode(65 + questionForm.options.length);
    setQuestionForm({
      ...questionForm,
      options: [...questionForm.options, { option_text: '', option_letter: nextLetter, is_correct: false }]
    });
  };

  const updateQuestionOption = (index, field, value) => {
    const updatedOptions = [...questionForm.options];
    updatedOptions[index][field] = value;
    setQuestionForm({
      ...questionForm,
      options: updatedOptions
    });
  };

  const removeQuestionOption = (index) => {
    const updatedOptions = questionForm.options.filter((_, i) => i !== index);
    setQuestionForm({
      ...questionForm,
      options: updatedOptions
    });
  };

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = !difficultyFilter || question.difficulty_level === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen size={32} className="text-blue-500" />
            Question Bank Manager
          </h1>
          <p className="text-gray-600 mt-1">Create and manage question banks for assessments</p>
        </div>

        <button
          onClick={() => setShowQuestionBankForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={16} />
          New Question Bank
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Banks Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold mb-4">Question Banks</h3>
            <div className="space-y-2">
              {questionBanks.map((bank) => (
                <button
                  key={bank._id}
                  onClick={() => loadQuestionBankDetails(bank._id)}
                  className={`w-full p-3 text-left hover:bg-gray-50 rounded border ${
                    selectedQuestionBank && selectedQuestionBank._id === bank._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{bank.title}</h4>
                      <p className="text-xs text-gray-600">{bank.question_count} questions</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      bank.is_active ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                </button>
              ))}

              {questionBanks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No question banks yet</p>
                  <p className="text-sm">Create your first question bank</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Questions Content */}
        <div className="lg:col-span-3">
          {selectedQuestionBank ? (
            <div className="space-y-6">
              {/* Question Bank Header */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedQuestionBank.title}</h2>
                    <p className="text-gray-600 mt-1">{selectedQuestionBank.description}</p>
                  </div>
                  <button
                    onClick={() => setShowQuestionForm(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Question
                  </button>
                </div>

                <div className="flex gap-6 text-sm text-gray-600">
                  <span>Subject: {selectedQuestionBank.subject || 'N/A'}</span>
                  <span>Topic: {selectedQuestionBank.topic || 'N/A'}</span>
                  <span>Difficulty: {selectedQuestionBank.difficulty_level}</span>
                  <span>Questions: {selectedQuestionBank.question_count}</span>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex gap-4 items-center">
                  <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded"
                    />
                  </div>

                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="px-3 py-2 border rounded"
                  >
                    <option value="">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3">
                {filteredQuestions.map((question) => (
                  <div key={question._id} className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            question.difficulty_level === 'Easy' ? 'bg-green-100 text-green-800' :
                            question.difficulty_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            question.difficulty_level === 'Hard' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {question.difficulty_level}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {question.question_type.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-600">{question.points} points</span>
                        </div>

                        <p className="text-gray-900 mb-2">{question.question_text}</p>

                        {question.question_type === 'multiple_choice' && (
                          <div className="ml-4 space-y-1">
                            {/* This would show options in a real implementation */}
                            <p className="text-sm text-gray-600">Multiple choice options available</p>
                          </div>
                        )}

                        <div className="flex gap-2 mt-2">
                          {question.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-1 ml-4">
                        <button className="p-1 text-gray-500 hover:text-blue-500">
                          <Eye size={16} />
                        </button>
                        <button className="p-1 text-gray-500 hover:text-green-500">
                          <Edit size={16} />
                        </button>
                        <button className="p-1 text-gray-500 hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredQuestions.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">No questions found</h3>
                    <p>Add your first question to this question bank</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <BookOpen size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Select a Question Bank</h3>
              <p className="text-gray-600">Choose a question bank from the sidebar to view and manage questions</p>
            </div>
          )}
        </div>
      </div>

      {/* Question Bank Form Modal */}
      {showQuestionBankForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create Question Bank</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={questionBankForm.title}
                  onChange={(e) => setQuestionBankForm({...questionBankForm, title: e.target.value})}
                  placeholder="Question Bank Title"
                  className="w-full p-3 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={questionBankForm.description}
                  onChange={(e) => setQuestionBankForm({...questionBankForm, description: e.target.value})}
                  placeholder="Describe the purpose of this question bank..."
                  className="w-full p-3 border rounded resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    value={questionBankForm.subject}
                    onChange={(e) => setQuestionBankForm({...questionBankForm, subject: e.target.value})}
                    placeholder="e.g., Computer Science"
                    className="w-full p-3 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Topic</label>
                  <input
                    type="text"
                    value={questionBankForm.topic}
                    onChange={(e) => setQuestionBankForm({...questionBankForm, topic: e.target.value})}
                    placeholder="e.g., Data Structures"
                    className="w-full p-3 border rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty Level</label>
                  <select
                    value={questionBankForm.difficulty_level}
                    onChange={(e) => setQuestionBankForm({...questionBankForm, difficulty_level: e.target.value})}
                    className="w-full p-3 border rounded"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Access Level</label>
                  <select
                    value={questionBankForm.access_level}
                    onChange={(e) => setQuestionBankForm({...questionBankForm, access_level: e.target.value})}
                    className="w-full p-3 border rounded"
                  >
                    <option value="private">Private</option>
                    <option value="course">Course</option>
                    <option value="department">Department</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags (optional)</label>
                <input
                  type="text"
                  value={questionBankForm.tags}
                  onChange={(e) => setQuestionBankForm({...questionBankForm, tags: e.target.value})}
                  placeholder="Add tags separated by commas"
                  className="w-full p-3 border rounded"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleCreateQuestionBank}
                  className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                >
                  Create Question Bank
                </button>
                <button
                  onClick={() => {
                    setShowQuestionBankForm(false);
                    setQuestionBankForm({
                      title: '',
                      description: '',
                      subject: '',
                      topic: '',
                      difficulty_level: 'Medium',
                      tags: '',
                      access_level: 'course'
                    });
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question Form Modal */}
      {showQuestionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create Question</h2>

            <div className="space-y-6">
              {/* Question Type and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Question Type</label>
                  <select
                    value={questionForm.question_type}
                    onChange={(e) => setQuestionForm({...questionForm, question_type: e.target.value})}
                    className="w-full p-3 border rounded"
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="essay">Essay</option>
                    <option value="code">Code</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select
                    value={questionForm.difficulty_level}
                    onChange={(e) => setQuestionForm({...questionForm, difficulty_level: e.target.value})}
                    className="w-full p-3 border rounded"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Points</label>
                  <input
                    type="number"
                    value={questionForm.points}
                    onChange={(e) => setQuestionForm({...questionForm, points: parseInt(e.target.value) || 1})}
                    className="w-full p-3 border rounded"
                    min="1"
                  />
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium mb-1">Question Text *</label>
                <textarea
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({...questionForm, question_text: e.target.value})}
                  placeholder="Enter your question..."
                  className="w-full p-3 border rounded resize-none"
                  rows={4}
                  required
                />
              </div>

              {/* Multiple Choice Options */}
              {questionForm.question_type === 'multiple_choice' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Answer Options</label>
                    <button
                      type="button"
                      onClick={addQuestionOption}
                      className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Option
                    </button>
                  </div>

                  <div className="space-y-2">
                    {questionForm.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="correct_option"
                          checked={option.is_correct}
                          onChange={() => {
                            const updatedOptions = questionForm.options.map((opt, i) => ({
                              ...opt,
                              is_correct: i === index
                            }));
                            setQuestionForm({...questionForm, options: updatedOptions});
                          }}
                          className="w-4 h-4"
                        />
                        <span className="font-medium w-6">{option.option_letter}.</span>
                        <input
                          type="text"
                          value={option.option_text}
                          onChange={(e) => updateQuestionOption(index, 'option_text', e.target.value)}
                          placeholder={`Option ${option.option_letter}`}
                          className="flex-1 p-2 border rounded"
                        />
                        {questionForm.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeQuestionOption(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Explanation</label>
                  <textarea
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                    placeholder="Explain the correct answer..."
                    className="w-full p-3 border rounded resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Hint</label>
                  <textarea
                    value={questionForm.hint}
                    onChange={(e) => setQuestionForm({...questionForm, hint: e.target.value})}
                    placeholder="Provide a hint for students..."
                    className="w-full p-3 border rounded resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    value={questionForm.subject}
                    onChange={(e) => setQuestionForm({...questionForm, subject: e.target.value})}
                    className="w-full p-3 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Topic</label>
                  <input
                    type="text"
                    value={questionForm.topic}
                    onChange={(e) => setQuestionForm({...questionForm, topic: e.target.value})}
                    className="w-full p-3 border rounded"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Cognitive Level</label>
                  <select
                    value={questionForm.cognitive_level}
                    onChange={(e) => setQuestionForm({...questionForm, cognitive_level: e.target.value})}
                    className="w-full p-3 border rounded"
                  >
                    <option value="Remember">Remember</option>
                    <option value="Understand">Understand</option>
                    <option value="Apply">Apply</option>
                    <option value="Analyze">Analyze</option>
                    <option value="Evaluate">Evaluate</option>
                    <option value="Create">Create</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input
                  type="text"
                  value={questionForm.tags}
                  onChange={(e) => setQuestionForm({...questionForm, tags: e.target.value})}
                  placeholder="Add tags separated by commas"
                  className="w-full p-3 border rounded"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleCreateQuestion}
                  className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                >
                  Create Question
                </button>
                <button
                  onClick={() => {
                    setShowQuestionForm(false);
                    setQuestionForm({
                      question_text: '',
                      question_type: 'multiple_choice',
                      difficulty_level: 'Medium',
                      points: 1,
                      time_limit_seconds: 0,
                      explanation: '',
                      hint: '',
                      tags: '',
                      cognitive_level: 'Understand',
                      subject: '',
                      topic: '',
                      subtopic: '',
                      options: [
                        { option_text: '', option_letter: 'A', is_correct: false },
                        { option_text: '', option_letter: 'B', is_correct: false },
                        { option_text: '', option_letter: 'C', is_correct: false },
                        { option_text: '', option_letter: 'D', is_correct: false }
                      ]
                    });
                  }}
                  className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankManager;

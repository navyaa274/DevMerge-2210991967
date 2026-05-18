import React, { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

const GenerateProblems = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'Easy',
    courseId: ''
  });
  const [generatedProblem, setGeneratedProblem] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const topics = [
    'Arrays', 'Strings', 'Hash Tables', 'Linked Lists', 'Stacks', 'Queues',
    'Trees', 'Graphs', 'Dynamic Programming', 'Recursion', 'Sorting',
    'Searching', 'Two Pointers', 'Sliding Window', 'Greedy', 'Backtracking',
    'Bit Manipulation', 'Math', 'Heap', 'Trie'
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setGeneratedProblem(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/ai/generate-problem`,
        {
          topic: formData.topic,
          difficulty: formData.difficulty
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setGeneratedProblem(response.data.problem);
        setSuccess('Problem generated successfully! Review and save it below.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate problem');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedProblem) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/ai/save-generated-problem`,
        {
          problemData: generatedProblem,
          courseId: formData.courseId || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSuccess('Problem saved successfully! It will be available after approval.');
        setGeneratedProblem(null);
        setFormData({ topic: '', difficulty: 'Easy', courseId: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save problem');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field, value) => {
    setGeneratedProblem({
      ...generatedProblem,
      [field]: value
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          🤖 AI Problem Generator
        </h1>

        {/* Generation Form */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Generate New Problem</h2>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Topic</label>
                <select
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Topic</option>
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Course ID (Optional)</label>
                <input
                  type="text"
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  placeholder="Leave empty for general"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !formData.topic}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all"
            >
              {loading ? '🤖 Generating Problem...' : '✨ Generate Problem with AI'}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-500/20 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
        </div>

        {/* Generated Problem Preview */}
        {generatedProblem && (
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Generated Problem Preview</h2>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-semibold py-2 px-6 rounded-lg transition-all"
              >
                💾 Save Problem
              </button>
            </div>

            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={generatedProblem.title}
                  onChange={(e) => handleEdit('title', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Difficulty & Topics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    generatedProblem.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                    generatedProblem.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {generatedProblem.difficulty}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Topics</label>
                  <div className="flex flex-wrap gap-2">
                    {generatedProblem.topics?.map((topic, idx) => (
                      <span key={idx} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={generatedProblem.description}
                  onChange={(e) => handleEdit('description', e.target.value)}
                  rows={8}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              {/* Constraints */}
              <div>
                <label className="block text-sm font-medium mb-2">Constraints</label>
                <input
                  type="text"
                  value={generatedProblem.constraints}
                  onChange={(e) => handleEdit('constraints', e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Examples */}
              <div>
                <label className="block text-sm font-medium mb-2">Examples</label>
                <div className="space-y-3">
                  {generatedProblem.examples?.map((example, idx) => (
                    <div key={idx} className="bg-gray-700 rounded-lg p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Input</p>
                          <pre className="text-sm bg-gray-800 p-2 rounded">{example.input}</pre>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Output</p>
                          <pre className="text-sm bg-gray-800 p-2 rounded">{example.output}</pre>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Explanation</p>
                          <p className="text-sm">{example.explanation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Cases */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Test Cases ({generatedProblem.testCases?.length || 0})
                </label>
                <div className="space-y-2">
                  {generatedProblem.testCases?.map((test, idx) => (
                    <div key={idx} className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Input</p>
                          <pre className="text-xs bg-gray-800 p-2 rounded mt-1">{test.input}</pre>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Output</p>
                          <pre className="text-xs bg-gray-800 p-2 rounded mt-1">{test.output}</pre>
                        </div>
                      </div>
                      <span className={`ml-4 px-2 py-1 rounded text-xs ${
                        test.isHidden ? 'bg-purple-500/20 text-purple-300' : 'bg-green-500/20 text-green-300'
                      }`}>
                        {test.isHidden ? '🔒 Hidden' : '👁️ Visible'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Starter Code */}
              <div>
                <label className="block text-sm font-medium mb-2">Starter Code</label>
                <div className="space-y-3">
                  {Object.entries(generatedProblem.starterCode || {}).map(([lang, code]) => (
                    <div key={lang}>
                      <p className="text-sm text-gray-400 mb-1 capitalize">{lang}</p>
                      <textarea
                        value={code}
                        onChange={(e) => handleEdit('starterCode', {
                          ...generatedProblem.starterCode,
                          [lang]: e.target.value
                        })}
                        rows={10}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Time Limit (ms)</label>
                  <input
                    type="number"
                    value={generatedProblem.timeLimit}
                    onChange={(e) => handleEdit('timeLimit', parseInt(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Memory Limit (MB)</label>
                  <input
                    type="number"
                    value={generatedProblem.memoryLimit}
                    onChange={(e) => handleEdit('memoryLimit', parseInt(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateProblems;

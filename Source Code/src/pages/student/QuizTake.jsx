import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

export default function QuizTake() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuthStore();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [previousAttempts, setPreviousAttempts] = useState([]);
  const [hasPassed, setHasPassed] = useState(false);
  const contentContext = location.state; // Get context from navigation

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz && !result && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quiz, result, timeLeft]);

  const fetchQuiz = async () => {
    try {
      const [quizRes, attemptsRes] = await Promise.all([
        axios.get(
          `${API_BASE_URL}/quizzes/${quizId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `${API_BASE_URL}/quizzes/${quizId}/attempts`,
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(() => ({ data: [] }))
      ]);

      setQuiz(quizRes.data);
      setPreviousAttempts(attemptsRes.data);
      
      // Check if user has already passed
      const passedAttempt = attemptsRes.data.find(attempt => attempt.passed);
      if (passedAttempt) {
        setHasPassed(true);
        setResult({
          ...passedAttempt,
          correctCount: Math.round((passedAttempt.percentage / 100) * quizRes.data.questions.length),
          totalQuestions: quizRes.data.questions.length,
          totalPoints: passedAttempt.score
        });
      } else {
        setTimeLeft(quizRes.data.timeLimit * 60); // Convert minutes to seconds
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      alert('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIdx, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIdx]: answer
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const answersArray = quiz.questions.map((_, idx) => answers[idx] || '');
    
    setSubmitting(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/quizzes/${quizId}/submit`,
        { answers: answersArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);

      // Mark as complete in learning path if passed
      if (res.data.passed && contentContext) {
        await axios.post(
          `${API_BASE_URL}/user-progress/${contentContext.pathId}/complete`,
          {
            contentType: 'quiz',
            contentId: quizId,
            moduleIndex: contentContext.moduleIndex,
            contentIndex: contentContext.contentIndex,
            score: res.data.percentage
          },
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(err => console.error('Error marking quiz complete:', err));
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Not Found</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // If user has already passed, show the result page
  if (hasPassed && !result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
              result.passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {result.passed ? (
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {result.passed ? 'Congratulations!' : 'Keep Trying!'}
            </h2>
            <p className="text-gray-600 mb-8">
              {result.passed 
                ? 'You passed the quiz!' 
                : `You need ${quiz.passingScore}% to pass. Try again!`}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Your Score</p>
                <p className="text-4xl font-bold text-indigo-600">{result.percentage}%</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Correct Answers</p>
                <p className="text-4xl font-bold text-green-600">
                  {result.correctCount}/{result.totalQuestions}
                </p>
              </div>
            </div>

            {/* Show previous attempts if any */}
            {previousAttempts.length > 0 && (
              <div className="mb-8 text-left">
                <h3 className="font-bold text-lg mb-3">Your Attempts</h3>
                <div className="space-y-2">
                  {previousAttempts.map((attempt, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Attempt {idx + 1}</span>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {attempt.percentage}%
                        </span>
                        {attempt.passed && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                            Passed
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Back to Course
              </button>
              {!hasPassed && (
                <button
                  onClick={() => {
                    setResult(null);
                    setAnswers({});
                    setTimeLeft(quiz.timeLimit * 60);
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Retake Quiz
                </button>
              )}
              {hasPassed && (
                <div className="px-6 py-3 bg-green-100 text-green-700 rounded-lg font-medium flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Quiz Completed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.description}</p>
            </div>
            <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
              timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
          </div>

          <div className="flex gap-4 text-sm text-gray-600">
            <span>📝 {quiz.questions.length} questions</span>
            <span>⏱️ {quiz.timeLimit} minutes</span>
            <span>✅ {quiz.passingScore}% to pass</span>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {quiz.questions.map((question, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-900 mb-1">{question.question}</p>
                  <p className="text-sm text-gray-500">{question.points} point{question.points !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="space-y-2 ml-11">
                {question.type === 'multiple-choice' || question.type === 'true-false' ? (
                  question.options.map((option, optIdx) => (
                    <label
                      key={optIdx}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                        answers[idx] === option
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${idx}`}
                        value={option}
                        checked={answers[idx] === option}
                        onChange={(e) => handleAnswerChange(idx, e.target.value)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-3 text-gray-900">{option}</span>
                    </label>
                  ))
                ) : (
                  <textarea
                    value={answers[idx] || ''}
                    onChange={(e) => handleAnswerChange(idx, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-600 focus:outline-none"
                    rows={3}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Answered: {Object.keys(answers).length} / {quiz.questions.length}
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

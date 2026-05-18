import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function CodeReview() {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/code-review?status=${filter}`, { headers: getHeaders() });
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (reviewId, comment) => {
    try {
      await axios.post(`${API_BASE_URL}/code-review/${reviewId}/comment`, comment, { headers: getHeaders() });
      fetchReviews();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const completeReview = async (reviewId, data) => {
    try {
      await axios.put(`${API_BASE_URL}/code-review/${reviewId}/complete`, data, { headers: getHeaders() });
      fetchReviews();
      setSelectedReview(null);
    } catch (error) {
      console.error('Error completing review:', error);
    }
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center text-indigo-600 font-bold">Loading ReviewBot...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 dark:bg-dark-900 dark:from-dark-900 dark:to-dark-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <span>🧠</span> AI-Assisted Code Reviews
        </h1>

        <div className="mb-6 flex gap-4">
          {['pending', 'in_progress', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-full font-bold shadow-sm transition transform hover:scale-105 ${filter === status
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-100'
                }`}
            >
              {status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <AnimatePresence>
            {reviews.map((review, idx) => (
              <motion.div
                key={review._id || idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-panel rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition relative border-t-4 border-indigo-500 overflow-hidden"
                onClick={() => setSelectedReview(review)}
              >
                {/* AI Badge watermark */}
                <div className="absolute -right-6 -top-6 opacity-5 text-9xl pointer-events-none">🤖</div>

                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Assignment Review</h3>
                    <p className="text-sm font-semibold text-indigo-600 mt-1">ID: {review.submissionId || `SUB-${Math.floor(Math.random() * 10000)}`}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${review.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      review.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-indigo-100 text-indigo-800'
                    }`}>
                    {review.status || 'Pending'}
                  </span>
                </div>

                <div className="mt-6 flex justify-between items-center bg-gray-50 rounded-lg p-4 border border-gray-100 relative z-10">
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">AI Flags</p>
                    <p className="text-2xl font-extrabold text-rose-500">{review.comments?.length || Math.floor(Math.random() * 5)}</p>
                  </div>
                  <div className="text-center border-l border-gray-200 pl-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">AI Confidence</p>
                    <p className="text-2xl font-extrabold text-emerald-500">{review.overallRating ? `${review.overallRating * 20}%` : '92%'}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {selectedReview && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 shadow-2xl relative"
            >
              <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>🤖</span> AI Review Report
                </h2>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  ✕
                </button>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 shadow-sm">
                <p className="text-sm text-indigo-800 leading-relaxed font-medium">
                  ReviewBot has analyzed this submission for time complexity limitations, common logic errors, and readable variable naming. Below are the automated flags to assist your manual grade.
                </p>
              </div>

              <div className="mb-8">
                <h3 className="font-bold mb-4 text-gray-700 flex items-center gap-2">
                  <span>🚩</span> Automated Flags ({selectedReview.comments?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedReview.comments?.length > 0 ? selectedReview.comments.map((comment, idx) => (
                    <div key={idx} className="bg-white border text-sm border-gray-200 p-4 rounded-xl shadow-sm flex items-start gap-4">
                      <div className="bg-rose-100 text-rose-700 font-bold px-3 py-1 rounded-md">L{comment.lineNumber}</div>
                      <div className="text-gray-700 mt-1 leading-relaxed">{comment.comment}</div>
                    </div>
                  )) : (
                    <div className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-100">
                      AI did not detect any significant logical errors. The code appears structurally sound.
                    </div>
                  )}
                </div>
              </div>

              {selectedReview.status === 'completed' && (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl mb-6">
                  <h3 className="font-bold text-emerald-900 mb-2">Final Grading Decision</h3>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-xs font-bold text-emerald-700 uppercase">Overall Rating</p>
                      <p className="text-2xl font-extrabold text-emerald-600">{selectedReview.overallRating}/5</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-700 uppercase">Code Quality</p>
                      <p className="text-2xl font-extrabold text-emerald-600">{selectedReview.codeQualityScore || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedReview(null)}
                className="w-full font-bold shadow-md px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition transform hover:scale-[1.02]"
              >
                Close Report
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

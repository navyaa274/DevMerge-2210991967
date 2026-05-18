import React, { useState, useEffect } from 'react';

function PeerReview() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    fetchSubmissionsForReview();
  }, []);

  const fetchSubmissionsForReview = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/peer-review/submissions',
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch submissions');
      const data = await response.json();
      setSubmissions(data.data || []);
    } catch (err) {
      setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5000/api/peer-review/${selectedSubmission._id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            review: reviewText,
            rating
          })
        }
      );
      if (!response.ok) throw new Error('Failed to submit review');
      
      setSelectedSubmission(null);
      setReviewText('');
      setRating(5);
      fetchSubmissionsForReview();
      alert('Review submitted successfully!');
    } catch (err) {
      setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Unknown error occurred');
    }
  };

  if (loading) return <div className="text-center py-12">Loading submissions...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Peer Review</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
            {typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}
          </div>
        )}

        <div className="grid grid-cols-3 gap-8">
          {/* Submissions List */}
          <div className="col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Submissions to Review</h2>
            <div className="space-y-2">
              {submissions.map(submission => (
                <button
                  key={submission._id}
                  onClick={() => setSelectedSubmission(submission)}
                  className={`w-full text-left p-4 rounded-lg transition ${
                    selectedSubmission?._id === submission._id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <p className="font-medium">{submission.studentName}</p>
                  <p className="text-sm opacity-75">{submission.problemTitle}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Review Form */}
          <div className="col-span-2">
            {selectedSubmission ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedSubmission.problemTitle}
                </h2>

                {/* Code Preview */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Code Submission</h3>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg overflow-auto max-h-64 text-sm">
                    {selectedSubmission.code}
                  </pre>
                </div>

                {/* Review Form */}
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rating
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-3xl ${rating >= star ? '⭐' : '☆'}`}
                        >
                          {rating >= star ? '⭐' : '☆'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Review
                    </label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                      rows="6"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                      placeholder="Provide constructive feedback on this submission..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-600 dark:text-gray-400">
                Select a submission to review
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PeerReview;

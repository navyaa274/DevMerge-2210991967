import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

export default function Mentorship() {
  const { user, token } = useAuthStore();
  const [mentorships, setMentorships] = useState([]);
  const [availableMentors, setAvailableMentors] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [goals, setGoals] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-mentorships'); // my-mentorships, find-mentor

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mentorshipsRes, mentorsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/mentorship/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })),
        
        axios.get(`${API_BASE_URL}/mentorship/mentors`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);
      
      setMentorships(mentorshipsRes.data);
      setAvailableMentors(mentorsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestMentorship = async (mentorId) => {
    try {
      await axios.post(`${API_BASE_URL}/mentorship`, {
        mentorId,
        menteeId: user.id,
        goals: goals.split(',').map(g => g.trim()).filter(Boolean),
        message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowRequestForm(false);
      setSelectedMentor(null);
      setGoals('');
      setMessage('');
      alert('Mentorship request sent successfully!');
      fetchData();
    } catch (error) {
      console.error('Error requesting mentorship:', error);
      alert(typeof error.response?.data?.error === 'string' ? error.response?.data?.error : error.response?.data?.error?.toString() || 'Failed to send request');
    }
  };

  const acceptMentorship = async (mentorshipId) => {
    try {
      await axios.put(`${API_BASE_URL}/mentorship/${mentorshipId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Mentorship accepted!');
      fetchData();
    } catch (error) {
      console.error('Error accepting mentorship:', error);
      alert('Failed to accept mentorship');
    }
  };

  const endMentorship = async (mentorshipId) => {
    if (!confirm('Are you sure you want to end this mentorship?')) return;
    
    try {
      await axios.put(`${API_BASE_URL}/mentorship/${mentorshipId}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Mentorship ended');
      fetchData();
    } catch (error) {
      console.error('Error ending mentorship:', error);
      alert('Failed to end mentorship');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mentorships...</p>
        </div>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800 border-green-300',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    completed: 'bg-blue-100 text-blue-800 border-blue-300',
    rejected: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentorship Program</h1>
          <p className="text-gray-600">Connect with experienced mentors to guide your learning journey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Mentorships</p>
                <p className="text-3xl font-bold text-gray-900">{mentorships.length}</p>
              </div>
              <div className="text-4xl">🤝</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mentorships.filter(m => m.status === 'active').length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mentorships.filter(m => m.status === 'pending').length}
                </p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Available Mentors</p>
                <p className="text-3xl font-bold text-gray-900">{availableMentors.length}</p>
              </div>
              <div className="text-4xl">👨‍🏫</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex gap-4 px-6 border-b">
            {['my-mentorships', 'find-mentor'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-4 font-medium border-b-2 transition capitalize ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* My Mentorships Tab */}
            {activeTab === 'my-mentorships' && (
              <div className="space-y-4">
                {mentorships.length > 0 ? (
                  mentorships.map(mentorship => (
                    <div key={mentorship._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                            {mentorship.mentorId?.name?.charAt(0) || 'M'}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              {mentorship.mentorId?.name || 'Mentor'}
                            </h3>
                            <p className="text-gray-600">{mentorship.mentorId?.email}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {mentorship.mentorId?.department?.name || 'Department'}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[mentorship.status]}`}>
                          {mentorship.status}
                        </span>
                      </div>

                      {mentorship.goals && mentorship.goals.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Goals:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {mentorship.goals.map((goal, idx) => (
                              <li key={idx} className="text-gray-700">{goal}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {mentorship.message && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Message:</h4>
                          <p className="text-gray-700">{mentorship.message}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-sm text-gray-500">
                          Started: {new Date(mentorship.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          {mentorship.status === 'pending' && (
                            <button
                              onClick={() => acceptMentorship(mentorship._id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                            >
                              Accept
                            </button>
                          )}
                          {mentorship.status === 'active' && (
                            <button
                              onClick={() => endMentorship(mentorship._id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                            >
                              End Mentorship
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg mb-2">No mentorships yet</p>
                    <p className="text-gray-400 text-sm mb-4">Find a mentor to start your learning journey</p>
                    <button
                      onClick={() => setActiveTab('find-mentor')}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                    >
                      Find a Mentor
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Find Mentor Tab */}
            {activeTab === 'find-mentor' && (
              <div className="space-y-4">
                {availableMentors.length > 0 ? (
                  availableMentors.map(mentor => (
                    <div key={mentor._id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                            {mentor.name?.charAt(0) || 'M'}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">{mentor.name}</h3>
                            <p className="text-gray-600">{mentor.email}</p>
                            <p className="text-sm text-gray-500 mt-1">{mentor.department?.name || 'Department'}</p>
                            
                            {mentor.expertise && mentor.expertise.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {mentor.expertise.map((skill, idx) => (
                                  <span key={idx} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedMentor(mentor);
                            setShowRequestForm(true);
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                          Request Mentorship
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No mentors available at the moment</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Request Form Modal */}
        {showRequestForm && selectedMentor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Request Mentorship</h2>
                  <p className="text-gray-600">from {selectedMentor.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowRequestForm(false);
                    setSelectedMentor(null);
                    setGoals('');
                    setMessage('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Goals (comma-separated)
                  </label>
                  <textarea
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="3"
                    placeholder="e.g., Learn React, Improve problem-solving skills, Prepare for interviews"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message to Mentor
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows="4"
                    placeholder="Introduce yourself and explain why you'd like this mentorship..."
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowRequestForm(false);
                      setSelectedMentor(null);
                      setGoals('');
                      setMessage('');
                    }}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => requestMentorship(selectedMentor._id)}
                    disabled={!goals.trim() || !message.trim()}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

function CertificationCenter() {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/certifications',
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      if (!response.ok) throw new Error('Failed to fetch certifications');
      const data = await response.json();
      setCertifications(data.data || []);
    } catch (err) {
      setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = (certId) => {
    // In production, generate and download PDF certificate
    alert(`Downloading certificate: ${certId}`);
  };

  if (loading) return <div className="text-center py-12">Loading certifications...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Certification Center</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
            {typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}
          </div>
        )}

        {/* Earned Certifications */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Earned Certifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.filter(c => c.earned).map(cert => (
              <div key={cert._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{cert.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{cert.description}</p>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Earned: {new Date(cert.earnedDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Valid until: {new Date(cert.expiryDate).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadCertificate(cert._id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                >
                  Download Certificate
                </button>
              </div>
            ))}
          </div>
          {certifications.filter(c => c.earned).length === 0 && (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              No certifications earned yet. Complete courses to earn certifications!
            </div>
          )}
        </div>

        {/* Available Certifications */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Available Certifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.filter(c => !c.earned).map(cert => (
              <div key={cert._id} className="bg-gray-100 dark:bg-gray-700 rounded-lg shadow p-6 opacity-75">
                <div className="text-5xl mb-4 grayscale">🎯</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{cert.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{cert.description}</p>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Requirements: {cert.requirements}
                  </p>
                  <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${cert.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    Progress: {cert.progress}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CertificationCenter;

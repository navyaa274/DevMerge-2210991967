import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TwoFactorSetup = () => {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/2fa/enable', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
    } catch (err) {
      setError(typeof err.response?.data?.message === 'string' ? err.response?.data?.message : err.response?.data?.message?.toString() || 'Failed to generate QR code');
    }
  };

  const verifyToken = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/2fa/verify', { token }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      setTimeout(() => navigate('/student/dashboard'), 2000);
    } catch (err) {
      setError(typeof err.response?.data?.message === 'string' ? err.response?.data?.message : err.response?.data?.message?.toString() || 'Invalid token');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900">2FA Enabled!</h2>
          <p className="text-gray-600 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Two-Factor Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Scan the QR code with your authenticator app
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {typeof error === 'string' ? error : error?.toString() || 'Unknown error occurred'}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          {qrCode && (
            <div className="flex justify-center mb-6">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
          )}

          {secret && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Secret Key:</p>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                {secret}
              </code>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Enter 6-digit code from your app
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="000000"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                maxLength={6}
              />
            </div>

            <button
              onClick={verifyToken}
              disabled={loading || !token}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Enable 2FA'}
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorSetup;

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TwoFactorSettings = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/2fa/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnabled(response.data.twoFactorEnabled);
    } catch (err) {
      setError('Failed to check 2FA status');
    } finally {
      setLoading(false);
    }
  };

  const enable2FA = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/2fa/enable', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setShowQR(true);
    } catch (err) {
      setError(typeof err.response?.data?.message === 'string' ? err.response?.data?.message : err.response?.data?.message?.toString() || 'Failed to enable 2FA');
    }
  };

  const verifyAndEnable = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/2fa/verify', { token }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnabled(true);
      setShowQR(false);
      setSuccess('2FA enabled successfully!');
      setToken('');
    } catch (err) {
      setError(typeof err.response?.data?.message === 'string' ? err.response?.data?.message : err.response?.data?.message?.toString() || 'Invalid token');
    }
  };

  const disable2FA = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/2fa/disable', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnabled(false);
      setSuccess('2FA disabled successfully!');
    } catch (err) {
      setError(typeof err.response?.data?.message === 'string' ? err.response?.data?.message : err.response?.data?.message?.toString() || 'Failed to disable 2FA');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Two-Factor Authentication</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {typeof error === 'string' ? error : error?.toString() || 'Unknown error occurred'}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
            <p className="text-sm text-gray-600">
              Add an extra layer of security to your account
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {!enabled && !showQR && (
          <button
            onClick={enable2FA}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Enable 2FA
          </button>
        )}

        {showQR && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img src={qrCode} alt="QR Code" className="w-48 h-48" />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Secret Key:</p>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">{secret}</code>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-digit code from your app
              </label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="000000"
                className="w-full px-3 py-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                maxLength={6}
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={verifyAndEnable}
                disabled={token.length !== 6}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Verify & Enable
              </button>
              <button
                onClick={() => setShowQR(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {enabled && (
          <button
            onClick={disable2FA}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Disable 2FA
          </button>
        )}
      </div>

      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">How to set up 2FA:</h3>
        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
          <li>Click "Enable 2FA" button</li>
          <li>Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)</li>
          <li>Enter the 6-digit code from your app</li>
          <li>Click "Verify & Enable" to complete setup</li>
        </ol>
      </div>
    </div>
  );
};

export default TwoFactorSettings;
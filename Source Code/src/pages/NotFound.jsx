import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
        <p className="text-2xl font-semibold text-gray-900 mb-4">Page Not Found</p>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700">
          Go Home
        </Link>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

export default function BulkOperations() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('users');
  const [operation, setOperation] = useState('');
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBulkOperation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const data = new FormData();
    data.append('operation', operation);
    data.append('type', activeTab);
    if (file) data.append('file', file);
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    try {
      const response = await axios.post(
        `${API_BASE_URL}/bulk-operations`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setResult(response.data);
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Operation failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Bulk Operations</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            {['users', 'courses', 'enrollments', 'grades'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setOperation('');
                  setResult(null);
                }}
                className={`px-6 py-3 font-semibold capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Operation Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Select Operation</h2>
          
          <form onSubmit={handleBulkOperation} className="space-y-6">
            {/* Users Operations */}
            {activeTab === 'users' && (
              <>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Operation</label>
                  <select
                    value={operation}
                    onChange={(e) => setOperation(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  >
                    <option value="">Select Operation</option>
                    <option value="create">Create Users</option>
                    <option value="update">Update Users</option>
                    <option value="delete">Delete Users</option>
                    <option value="activate">Activate Users</option>
                    <option value="deactivate">Deactivate Users</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Upload CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    CSV format: name, email, role, department (for create/update)
                  </p>
                </div>
              </>
            )}

            {/* Courses Operations */}
            {activeTab === 'courses' && (
              <>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Operation</label>
                  <select
                    value={operation}
                    onChange={(e) => setOperation(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  >
                    <option value="">Select Operation</option>
                    <option value="create">Create Courses</option>
                    <option value="update">Update Courses</option>
                    <option value="delete">Delete Courses</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Upload CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    CSV format: title, code, description, credits, semester
                  </p>
                </div>
              </>
            )}

            {/* Enrollments Operations */}
            {activeTab === 'enrollments' && (
              <>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Operation</label>
                  <select
                    value={operation}
                    onChange={(e) => setOperation(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  >
                    <option value="">Select Operation</option>
                    <option value="enroll">Enroll Students</option>
                    <option value="unenroll">Unenroll Students</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Upload CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    CSV format: studentEmail, courseCode
                  </p>
                </div>
              </>
            )}

            {/* Grades Operations */}
            {activeTab === 'grades' && (
              <>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Operation</label>
                  <select
                    value={operation}
                    onChange={(e) => setOperation(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  >
                    <option value="">Select Operation</option>
                    <option value="import">Import Grades</option>
                    <option value="update">Update Grades</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Upload CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    CSV format: studentEmail, courseCode, assignmentId, grade
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Processing...' : 'Execute Bulk Operation'}
            </button>
          </form>
        </div>

        {/* Result */}
        {result && (
          <div className={`rounded-lg shadow-md p-6 ${
            result.success ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <h2 className="text-xl font-bold mb-4">
              {result.success ? '✓ Operation Completed' : '✗ Operation Failed'}
            </h2>
            <p className="mb-4">{result.message}</p>
            
            {result.details && (
              <div className="bg-white rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {result.details.successful || 0}
                    </div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {result.details.failed || 0}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {result.details.total || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>

                {result.details.errors && result.details.errors.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Errors:</h3>
                    <ul className="list-disc list-inside text-sm text-red-600">
                      {result.details.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Download Templates */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Download CSV Templates</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-semibold">Users Template</div>
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-semibold">Courses Template</div>
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-semibold">Enrollments Template</div>
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">📄</div>
              <div className="font-semibold">Grades Template</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

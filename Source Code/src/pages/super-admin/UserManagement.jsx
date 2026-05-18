import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../../config/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({ _id: '', firstName: '', lastName: '', email: '', role: 'student', password: '', department: '' });

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    try {
      let url = `${API_BASE_URL}/users`;
      if (filterRole !== 'all') {
        url += `?role=${filterRole}`;
      }
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.data || []);
    } catch (err) {
      setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('WARNING: Deleting this user is permanent. Proceed?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to delete user');
      fetchUsers();
    } catch (err) {
      setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Unknown error occurred');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (!response.ok) throw new Error('Failed to update user status');
      fetchUsers();
    } catch (err) {
      setError(typeof err.message === 'string' ? err.message : err?.toString() || 'Unknown error occurred');
    }
  };

  const openModal = (mode, user = null) => {
    setModalMode(mode);
    if (mode === 'edit' && user) {
      setFormData({
        _id: user._id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        role: user.role,
        password: '',
        department: user.department?._id || user.department || ''
      });
    } else {
      setFormData({ _id: '', firstName: '', lastName: '', email: '', role: 'student', password: '', department: '' });
    }
    setIsModalOpen(true);
  };

  const submitModal = async (e) => {
    e.preventDefault();
    try {
      const url = modalMode === 'add'
        ? `${API_BASE_URL}/users`
        : `${API_BASE_URL}/users/${formData._id}`;

      const method = modalMode === 'add' ? 'POST' : 'PUT';

      // Don't send blank password on edit
      const payload = { ...formData };
      if (modalMode === 'edit' && !payload.password) {
        delete payload.password;
      }
      if (!payload.department) delete payload.department;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Operation failed');
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter(user => {
    const name = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-dark-900 flex items-center justify-center p-8">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Identity Directory</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></span> Global User Management Override
          </p>
        </div>
        <button onClick={() => openModal('add')} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-purple-500/30 transition-all hover:scale-105">
          + Create Entity
        </button>
      </div>

      {error && (
        <div className="mb-8 p-6 bg-rose-50 dark:bg-rose-900/20 border-l-4 border-rose-500 rounded-2xl">
          <p className="font-bold text-rose-700 dark:text-rose-400 text-sm uppercase tracking-widest">{typeof error === 'string' ? error : error?.message || error?.toString() || 'Unknown error occurred'}</p>
        </div>
      )}

      {/* Control Surface */}
      <div className="glass-panel p-8 mb-8 bg-white dark:bg-dark-800 border-t-8 border-purple-500 rounded-3xl shadow-xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-4 text-xl flex items-center pointer-events-none opacity-50">🔍</div>
            <input
              type="text"
              placeholder="Query Identity UUID, Name, or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-dark-700 rounded-2xl text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-4 ring-purple-500/20 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          <div className="w-full md:w-64">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-dark-700 rounded-2xl text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-4 ring-purple-500/20 text-gray-900 dark:text-white cursor-pointer"
            >
              <option value="all">Global Access (All)</option>
              <option value="student">Student Class</option>
              <option value="faculty">Faculty Nodes</option>
              <option value="hod">HOD Sub-Admins</option>
              <option value="admin">System Admins</option>
              <option value="super_admin">Apex Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="glass-panel rounded-3xl shadow-xl p-8 bg-white dark:bg-dark-800 overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-6">
              <th className="px-6 py-2">Entity ID & Name</th>
              <th className="px-6 py-2">Contact Vector</th>
              <th className="px-6 py-2">Classification</th>
              <th className="px-6 py-2">Node Status</th>
              <th className="px-6 py-2 text-right">Directives</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map((user, idx) => (
              <motion.tr
                key={user._id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-gray-50 dark:bg-dark-900/50 hover:bg-purple-50 hover:dark:bg-purple-900/10 transition-colors shadow-sm rounded-3xl group"
              >
                <td className="py-6 px-6 font-black text-sm text-gray-900 dark:text-white uppercase tracking-tighter rounded-l-3xl border-y border-l border-transparent hover:border-purple-200">
                  {user.name}
                  <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {user._id.slice(-6)}</div>
                </td>
                <td className="py-6 px-6 text-[10px] font-bold text-gray-500 border-y border-transparent">
                  {user.email}
                </td>
                <td className="py-6 px-6 border-y border-transparent">
                  <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${user.role === 'super_admin' ? 'bg-purple-500 text-white shadow-purple-500/20' :
                    user.role === 'admin' ? 'bg-indigo-500 text-white shadow-indigo-500/20' :
                      user.role === 'student' ? 'bg-blue-500 text-white shadow-blue-500/20' :
                        'bg-amber-500 text-white shadow-amber-500/20'
                    }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-6 px-6 border-y border-transparent">
                  <span className={`flex w-fit items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.isActive
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                    {user.isActive ? 'Active Node' : 'Suspended'}
                  </span>
                </td>
                <td className="py-6 px-6 text-right rounded-r-3xl border-y border-r border-transparent">
                  <div className="flex items-center justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openModal('edit', user)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(user._id, user.isActive)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${user.isActive
                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                    >
                      {user.isActive ? 'Revoke' : 'Restore'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="px-4 py-2 bg-rose-100 text-rose-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-200 transition-all shadow-sm"
                    >
                      Purge
                    </button>
                  </div>
                </td>
              </motion.tr>
            )) : (
              <tr>
                <td colSpan="5" className="text-center py-16 text-gray-400 font-black uppercase tracking-widest text-xs">
                  No vectors matched your query parameter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-dark-800 rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100 dark:border-dark-700 border-t-8 border-t-purple-500">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-6">
                {modalMode === 'add' ? 'Provision Identity' : 'Update Identity'}
              </h2>
              <form onSubmit={submitModal} className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">First Name</label>
                    <input required type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-dark-700 text-sm font-bold focus:ring-2 ring-purple-500" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Name</label>
                    <input type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-dark-700 text-sm font-bold focus:ring-2 ring-purple-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Vector (Email)</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-dark-700 text-sm font-bold focus:ring-2 ring-purple-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Classification (Role)</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-dark-700 text-sm font-bold focus:ring-2 ring-purple-500">
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="hod">HOD</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Hash Key (Password) {modalMode === 'edit' && <span className="text-purple-500 italic lowercase font-normal tracking-normal">- Optional if updating</span>}
                  </label>
                  <input required={modalMode === 'add'} type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-dark-700 text-sm font-bold focus:ring-2 ring-purple-500" />
                </div>
                <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100 dark:border-dark-700">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700 transition">Discard</button>
                  <button type="submit" className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/30 transition">{modalMode === 'add' ? 'Inject User' : 'Commit Changes'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

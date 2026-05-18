import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import userService from '../../services/api/userService';
import {
  UserCircleIcon,
  KeyIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
  IdentificationIcon,
  EnvelopeIcon,
  PhoneIcon,
  AtSymbolIcon
} from '@heroicons/react/24/outline';

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    profilePicture: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showAlert('error', 'File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const showAlert = (type, message) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: '', message: '' }), 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await userService.updateProfile(formData);
      // Handle both formats: direct user object or nested { data: { user } }
      const updatedUser = response.data?.user || response.user || response;
      updateUser(updatedUser);
      showAlert('success', 'Profile identity updated successfully.');
    } catch (err) {
      showAlert('error', typeof err === 'string' ? err : err?.toString() || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showAlert('error', 'Authentication mismatch: Passwords do not align.');
      return;
    }

    setLoading(true);
    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showAlert('success', 'Security protocols updated. Password changed.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showAlert('error', typeof err === 'string' ? err : err?.toString() || 'Security integrity error: Could not change password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 lg:p-12 font-sans"
    >
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
            Identity Module
          </h1>
          <p className="text-indigo-600 font-bold uppercase tracking-[0.4em] text-[10px] mt-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(79,70,229,0.5)]"></span>
            Profile Management Layer // Global Access Unit
          </p>
        </header>

        <AnimatePresence>
          {status.message && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              className={`mb-8 p-6 rounded-[2rem] border shadow-xl flex items-center gap-4 ${status.type === 'success'
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/10 dark:border-emerald-800'
                : 'bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-900/10 dark:border-rose-800'
                }`}
            >
              {status.type === 'success' ? <CheckBadgeIcon className="w-6 h-6" /> : <ExclamationCircleIcon className="w-6 h-6" />}
              <span className="font-black uppercase tracking-widest text-[10px]">{status.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Avatar & Summary Card */}
          <div className="lg:col-span-4">
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-800 rounded-[3.5rem] p-10 shadow-3xl border border-slate-100 dark:border-slate-700 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-indigo-600"></div>
              <div className="relative z-10 text-center">
                <div className="w-32 h-32 mx-auto mt-8 border-8 border-white dark:border-slate-800 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden shadow-2xl flex items-center justify-center relative group cursor-pointer">
                  {formData.profilePicture ? (
                    <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-black text-indigo-600 italic">
                      {(user?.name || user?.firstName || user?.email || 'N').charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold uppercase tracking-widest">+ Upload</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <h2 className="mt-6 text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">
                  {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                </h2>
                <div className="mt-2 inline-flex items-center gap-2 px-6 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                  {user?.role} Access Vector
                </div>

                <div className="mt-10 grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-xs font-black text-emerald-500 uppercase">Active</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Sync</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase">Today</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Configuration Area */}
          <div className="lg:col-span-8 flex flex-col gap-12">
            {/* Core Attributes */}
            <section className="bg-white dark:bg-slate-800 rounded-[4rem] p-12 shadow-3xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-10 flex items-center gap-3">
                <IdentificationIcon className="w-8 h-8 text-indigo-600" />
                Core Attributes
              </h3>

              <form onSubmit={handleProfileUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">First Name</label>
                    <div className="group relative opacity-70">
                      <UserCircleIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors" />
                      <input
                        type="text"
                        value={user?.firstName || ''}
                        disabled
                        className="w-full pl-14 pr-8 py-5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Last Name</label>
                    <div className="group relative opacity-70">
                      <UserCircleIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors" />
                      <input
                        type="text"
                        value={user?.lastName || ''}
                        disabled
                        className="w-full pl-14 pr-8 py-5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Communication Node</label>
                    <div className="group relative opacity-70">
                      <EnvelopeIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors" />
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full pl-14 pr-8 py-5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Application Identifier</label>
                    <div className="group relative opacity-70">
                      <IdentificationIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors" />
                      <input
                        type="text"
                        value={user?.studentId || user?.employeeId || 'N/A'}
                        disabled
                        className="w-full pl-14 pr-8 py-5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] text-sm font-bold text-slate-900 dark:text-white focus:outline-none transition-all cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Mobile Vector</label>
                  <div className="group relative">
                    <PhoneIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[2rem] text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Neural Bio (Textual Pattern)</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[2.5rem] text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all resize-none"
                    placeholder="Describe your logical focus..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-6 rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.3em] hover:scale-[1.02] transition-all disabled:opacity-50 shadow-2xl"
                >
                  {loading ? 'Processing Update...' : 'Sync Attributes'}
                </button>
              </form>
            </section>

            {/* Security Interface */}
            <section className="bg-white dark:bg-slate-800 rounded-[4rem] p-12 shadow-3xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-10 flex items-center gap-3">
                <KeyIcon className="w-8 h-8 text-indigo-600" />
                Security Overrides
              </h3>

              <form onSubmit={handlePasswordUpdate} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Current Authorization Key</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[2rem] text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">New Vector Key</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[2rem] text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Confirm New Key</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-[2rem] text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black uppercase text-[10px] tracking-[0.3em] hover:scale-[1.02] transition-all disabled:opacity-50 shadow-2xl shadow-indigo-500/20"
                >
                  {loading ? 'Encrypting...' : 'Override Key'}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

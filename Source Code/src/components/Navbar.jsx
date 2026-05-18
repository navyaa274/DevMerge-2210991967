import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import NotificationCenter from './NotificationCenter';
import DarkModeToggle from './DarkModeToggle';
import SearchModal from './SearchModal';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import HamburgerMenu from './layout/HamburgerMenu';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  // Keyboard shortcut to open search (Ctrl+K or Cmd+K)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getDashboardLink = () => {
    const dashboardLinks = {
      student: '/student/dashboard',
      faculty: '/faculty/dashboard',
      hod: '/hod/dashboard',
      admin: '/admin/dashboard',
      super_admin: '/super-admin/dashboard'
    };
    return dashboardLinks[user?.role] || '/';
  };

  const menuItems = [
    { name: 'Dashboard', path: getDashboardLink() },
    { name: 'AI Tutor', path: '/student/ai-tutor', show: user?.role === 'student' },
    { name: 'My Courses', path: '/student/courses', show: user?.role === 'student' },
    { name: 'Code Lab', path: '/student/labs', show: user?.role === 'student' },
    { name: 'Problems', path: '/problems', show: user?.role === 'student' },
    { name: 'Exams', path: '/exams', show: user?.role === 'student' },
    { name: 'Interview', path: '/student/mock-interview', show: user?.role === 'student' },
    { name: 'Portfolio', path: '/student/portfolio', show: user?.role === 'student' },
  ].filter(item => item.show !== false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/70 dark:bg-dark-900/70 backdrop-blur-xl border-b border-white/20 dark:border-dark-700/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-20 flex justify-between items-center text-slate-900 dark:text-white">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2"
        >
          <Link to="/" className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tighter">
            DevMerge
          </Link>
          <div className="hidden sm:block w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
        </motion.div>

        {user ? (
          <div className="flex items-center gap-2 md:gap-8">
            <div className="hidden lg:flex items-center gap-6">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-xs font-black text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-[0.2em] px-2 py-1 relative group"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 md:gap-5 border-l border-slate-100 dark:border-dark-700 pl-4 md:pl-6">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex items-center gap-2 bg-slate-50 dark:bg-dark-800 border border-slate-100 dark:border-dark-700 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-500 hover:border-indigo-500/30 transition-all"
                title="Search (Cmd+K)"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span>Search</span>
                <kbd className="ml-2 font-mono bg-white dark:bg-dark-950 px-1.5 py-0.5 rounded shadow-sm opacity-60">⌘K</kbd>
              </button>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden p-2 text-slate-400 hover:text-indigo-500 transition-colors"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

              <NotificationCenter />
              <div className="hidden sm:block">
                <DarkModeToggle />
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 md:gap-3 bg-slate-50/50 dark:bg-dark-800/50 p-1 md:p-1.5 pr-2 md:pr-4 rounded-full border border-slate-100 dark:border-dark-700 shadow-sm hover:border-indigo-500/30 transition-all group/profile"
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md group-hover/profile:rotate-12 transition-transform overflow-hidden bg-slate-100 dark:bg-slate-900 border border-indigo-500/30">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      (user?.name || user?.firstName || user?.email || 'N').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none mb-0.5">Node</p>
                    <p className="text-xs font-black text-slate-900 dark:text-white leading-none whitespace-nowrap truncate max-w-[80px]">
                      {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User'}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1 md:p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-full bg-slate-50/50 dark:bg-dark-800/50 border border-slate-100 dark:border-dark-700"
                  title="Logout"
                >
                  <span className="text-lg md:text-xl">🚪</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs font-black text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 uppercase tracking-widest transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="bg-indigo-600 text-white px-5 md:px-8 py-2 md:py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all">
              Join Now
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-dark-900 border-b border-slate-100 dark:border-dark-800 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-slate-100 dark:border-dark-800 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interface Theme</span>
                <DarkModeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
}

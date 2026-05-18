import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { 
  HomeIcon,
  UserIcon,
  BookOpenIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  AcademicCapIcon,
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/cn';
import { Badge } from '../ui/Badge';

const navigationItems = {
  student: [
    { name: 'Dashboard', href: '/student/dashboard', icon: HomeIcon },
    { name: 'Courses', href: '/student/courses', icon: BookOpenIcon },
    { name: 'Assignments', href: '/student/assignments', icon: DocumentTextIcon },
    { name: 'Calendar', href: '/student/calendar', icon: CalendarIcon },
    { name: 'AI Tutor', href: '/student/ai-tutor', icon: AcademicCapIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ],
  faculty: [
    { name: 'Dashboard', href: '/faculty/dashboard', icon: HomeIcon },
    { name: 'Courses', href: '/faculty/courses', icon: BookOpenIcon },
    { name: 'Students', href: '/faculty/students', icon: UsersIcon },
    { name: 'Analytics', href: '/faculty/analytics', icon: ChartBarIcon },
    { name: 'Calendar', href: '/faculty/calendar', icon: CalendarIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ],
  admin: [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon },
    { name: 'Users', href: '/admin/users', icon: UsersIcon },
    { name: 'Courses', href: '/admin/courses', icon: BookOpenIcon },
    { name: 'Departments', href: '/admin/departments', icon: AcademicCapIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  ],
  hod: [
    { name: 'Dashboard', href: '/hod/dashboard', icon: HomeIcon },
    { name: 'Faculty', href: '/hod/faculty', icon: UsersIcon },
    { name: 'Courses', href: '/hod/courses', icon: BookOpenIcon },
    { name: 'Analytics', href: '/hod/analytics', icon: ChartBarIcon },
    { name: 'Broadcast', href: '/hod/global-broadcast', icon: BellIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ],
  super_admin: [
    { name: 'Dashboard', href: '/super-admin/dashboard', icon: HomeIcon },
    { name: 'System', href: '/super-admin/system', icon: Cog6ToothIcon },
    { name: 'Institutions', href: '/super-admin/institutions', icon: AcademicCapIcon },
    { name: 'Analytics', href: '/super-admin/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/super-admin/settings', icon: Cog6ToothIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ],
};

const roleColors = {
  student: 'from-blue-600 to-indigo-600',
  faculty: 'from-emerald-600 to-teal-600',
  admin: 'from-indigo-600 to-purple-600',
  hod: 'from-amber-600 to-orange-600',
  super_admin: 'from-red-600 to-rose-600',
};

export const Navigation = ({ isCollapsed = false, onToggle }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const items = navigationItems[user?.role] || [];
  const userRoleColor = roleColors[user?.role] || 'from-gray-600 to-gray-700';

  const NavItem = ({ item, isMobile = false }) => {
    const isActive = location.pathname === item.href;
    
    return (
      <Link
        to={item.href}
        className={cn(
          'flex items-center px-3 py-2.5 rounded-xl font-medium transition-all duration-200 group',
          isActive
            ? 'bg-gradient-to-r text-white shadow-lg'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white',
          isCollapsed && !isMobile && 'justify-center'
        )}
        style={isActive ? { backgroundImage: `linear-gradient(to right, var(--${user.role}-primary), var(--${user.role}-secondary))` } : {}}
      >
        <item.icon className={cn('w-5 h-5 flex-shrink-0', !isCollapsed && !isMobile && 'mr-3')} />
        {!isCollapsed && !isMobile && (
          <span className="truncate">{item.name}</span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {isMobileMenuOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${userRoleColor} rounded-xl flex items-center justify-center text-white font-bold`}>
                      U
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900 dark:text-white">University</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                    </div>
                  </div>
                </div>

                <nav className="space-y-2">
                  {items.map((item) => (
                    <NavItem key={item.name} item={item} isMobile />
                  ))}
                </nav>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Navigation */}
      <nav className={cn(
        'hidden lg:flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${userRoleColor} rounded-xl flex items-center justify-center text-white font-bold`}>
                  U
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">University</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>
            )}
            {isCollapsed && (
              <div className={`w-10 h-10 bg-gradient-to-br ${userRoleColor} rounded-xl flex items-center justify-center text-white font-bold mx-auto`}>
                U
              </div>
            )}
            <button
              onClick={onToggle}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Bars3Icon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 overflow-y-auto">
          <nav className="space-y-2">
            {items.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={cn(
              'flex items-center w-full px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors',
              isCollapsed && 'justify-center'
            )}
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </nav>
    </>
  );
};

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  ChartBarIcon,
  UserGroupIcon,
  BookOpenIcon,
  CalendarIcon,
  BellIcon,
  TrophyIcon,
  SparklesIcon,
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
        {change && (
          <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            <ArrowTrendingUpIcon className={`w-4 h-4 ${trend === 'up' ? '' : 'rotate-180'}`} />
            <span>{change}</span>
          </div>
        )}
      </div>
      <div className={`p-3 bg-${color}-100 dark:bg-${color}-900/20 rounded-xl`}>
        <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
      </div>
    </div>
  </motion.div>
);

const ActionCard = ({ title, description, icon: Icon, path, color }) => (
  <Link to={path} className="block">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all cursor-pointer group"
    >
      <div className={`inline-flex p-3 bg-${color}-100 dark:bg-${color}-900/20 rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </motion.div>
  </Link>
);

const RecentActivity = ({ activities }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6"
  >
    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
    <div className="space-y-4">
      {activities?.slice(0, 5).map((activity, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
          <div className="flex-1">
            <p className="text-sm text-slate-900 dark:text-white">{activity.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export default function UniversityDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user?.role]);

  const loadDashboardData = async () => {
    try {
      // Mock data based on role
      const mockData = getMockDataByRole(user?.role);
      setStats(mockData.stats);
      setActivities(mockData.activities);
    } catch (error) {
      console.error('Dashboard loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockDataByRole = (role) => {
    const baseData = {
      activities: [
        { title: 'System update completed', time: '2 hours ago' },
        { title: 'New user registration', time: '4 hours ago' },
        { title: 'Backup completed successfully', time: '6 hours ago' },
        { title: 'Security scan passed', time: '8 hours ago' },
        { title: 'Performance optimized', time: '12 hours ago' }
      ]
    };

    switch (role) {
      case 'student':
        return {
          stats: {
            courses: 5,
            assignments: 12,
            grade: 'A-',
            attendance: '92%'
          },
          ...baseData
        };
      case 'faculty':
        return {
          stats: {
            courses: 3,
            students: 85,
            assignments: 24,
            avgGrade: 'B+'
          },
          ...baseData
        };
      case 'admin':
        return {
          stats: {
            users: 1250,
            courses: 45,
            departments: 8,
            activeSessions: 342
          },
          ...baseData
        };
      case 'hod':
        return {
          stats: {
            faculty: 12,
            courses: 18,
            students: 320,
            research: 6
          },
          ...baseData
        };
      case 'super_admin':
        return {
          stats: {
            institutions: 5,
            totalUsers: 15680,
            servers: 12,
            uptime: '99.9%'
          },
          ...baseData
        };
      default:
        return baseData;
    }
  };

  const getRoleSpecificActions = () => {
    switch (user?.role) {
      case 'student':
        return [
          { title: 'My Courses', description: 'View enrolled courses and materials', icon: BookOpenIcon, path: '/student/courses', color: 'blue' },
          { title: 'Assignments', description: 'Submit and track assignments', icon: DocumentTextIcon, path: '/student/assignments', color: 'green' },
          { title: 'AI Tutor', description: 'Get help from AI assistant', icon: SparklesIcon, path: '/student/ai-tutor', color: 'purple' },
          { title: 'Calendar', description: 'View schedule and deadlines', icon: CalendarIcon, path: '/student/calendar', color: 'amber' }
        ];
      case 'faculty':
        return [
          { title: 'Course Management', description: 'Manage courses and content', icon: BookOpenIcon, path: '/faculty/courses', color: 'emerald' },
          { title: 'Students', description: 'View student progress and grades', icon: UserGroupIcon, path: '/faculty/students', color: 'blue' },
          { title: 'Assessments', description: 'Create and grade assignments', icon: AcademicCapIcon, path: '/faculty/assessments', color: 'purple' },
          { title: 'Analytics', description: 'View performance analytics', icon: ChartBarIcon, path: '/faculty/analytics', color: 'rose' }
        ];
      case 'admin':
        return [
          { title: 'User Management', description: 'Manage users and roles', icon: UserGroupIcon, path: '/admin/users', color: 'indigo' },
          { title: 'Course Catalog', description: 'Manage course offerings', icon: BookOpenIcon, path: '/admin/courses', color: 'blue' },
          { title: 'Departments', description: 'Manage academic departments', icon: AcademicCapIcon, path: '/admin/departments', color: 'green' },
          { title: 'System Settings', description: 'Configure system settings', icon: Cog6ToothIcon, path: '/admin/settings', color: 'gray' }
        ];
      case 'hod':
        return [
          { title: 'Faculty Management', description: 'Manage faculty members', icon: UserGroupIcon, path: '/hod/faculty', color: 'amber' },
          { title: 'Department Courses', description: 'Oversee department courses', icon: BookOpenIcon, path: '/hod/courses', color: 'blue' },
          { title: 'Student Analytics', description: 'View student performance', icon: ChartBarIcon, path: '/hod/analytics', color: 'purple' },
          { title: 'Broadcast', description: 'Send announcements', icon: BellIcon, path: '/hod/global-broadcast', color: 'rose' }
        ];
      case 'super_admin':
        return [
          { title: 'System Overview', description: 'Monitor system health', icon: ChartBarIcon, path: '/super-admin/system', color: 'red' },
          { title: 'Institutions', description: 'Manage all institutions', icon: AcademicCapIcon, path: '/super-admin/institutions', color: 'indigo' },
          { title: 'Global Analytics', description: 'View system-wide analytics', icon: ChartBarIcon, path: '/super-admin/analytics', color: 'purple' },
          { title: 'Global Settings', description: 'Configure global settings', icon: Cog6ToothIcon, path: '/super-admin/settings', color: 'gray' }
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  const actions = getRoleSpecificActions();
  const statKeys = Object.keys(stats);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white"
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-indigo-100">
          {user?.role === 'student' && 'Here\'s what\'s happening with your courses today.'}
          {user?.role === 'faculty' && 'Here\'s your teaching overview for today.'}
          {user?.role === 'admin' && 'Here\'s your administrative dashboard.'}
          {user?.role === 'hod' && 'Here\'s your department overview.'}
          {user?.role === 'super_admin' && 'Here\'s your system overview.'}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statKeys.map((key, index) => (
          <StatCard
            key={key}
            title={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
            value={stats[key]}
            change={'+12%'}
            icon={ChartBarIcon}
            color="indigo"
            trend="up"
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions Section */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.map((action, index) => (
              <ActionCard key={index} {...action} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  );
}

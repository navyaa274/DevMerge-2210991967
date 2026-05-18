import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../../config/api';

export default function Courses() {
  const { token, user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, enrolled, available
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, [token]);

  const fetchCourses = async () => {
    try {
      const [coursesRes, enrolledRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/courses/enrolled`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);

      setCourses(coursesRes.data);
      setEnrolledCourses(enrolledRes.data.map(c => c._id));
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollCourse = async (courseId) => {
    try {
      await axios.post(
        `${API_BASE_URL}/courses/${courseId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEnrolledCourses([...enrolledCourses, courseId]);
      alert('Enrolled successfully!');
    } catch (error) {
      console.error('Error enrolling:', error);
      alert(typeof error.response?.data?.error === 'string' ? error.response?.data?.error : error.response?.data?.error?.toString() || 'Failed to enroll');
    }
  };

  const isEnrolled = (courseId) => enrolledCourses.includes(courseId);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = selectedDepartment === 'all' ||
      course.department?.name === selectedDepartment;

    const matchesFilter = filter === 'all' ||
      (filter === 'enrolled' && isEnrolled(course._id)) ||
      (filter === 'available' && !isEnrolled(course._id));

    return matchesSearch && matchesDepartment && matchesFilter;
  });

  const departments = [...new Set(courses.map(c => c.department?.name).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 dark:bg-dark-900 p-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Knowledge Domains</h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-3 flex items-center gap-2">
              Architect your academic trajectory
            </p>
          </div>
          <div className="flex bg-white dark:bg-dark-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-dark-700">
            {['all', 'enrolled', 'available'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Global Catalog Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {[
            { label: 'Total Catalog', value: courses.length, icon: '📚', color: 'indigo' },
            { label: 'Active Enrolls', value: enrolledCourses.length, icon: '✅', color: 'emerald' },
            { label: 'Open Vectors', value: courses.length - enrolledCourses.length, icon: '🎯', color: 'amber' },
            { label: 'Departments', value: departments.length, icon: '🏢', color: 'purple' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className={`glass-panel p-8 rounded-[2rem] shadow-xl bg-white dark:bg-dark-800 border-b-8 border-${stat.color}-500 relative overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 p-6 text-6xl opacity-5 group-hover:scale-125 transition-transform">{stat.icon}</div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Institutional {stat.label}</p>
              <p className={`text-4xl font-black text-${stat.color}-700 dark:text-${stat.color}-400 tracking-tighter leading-none`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Filters */}
        <div className="glass-panel rounded-3xl shadow-xl p-8 bg-white/70 dark:bg-dark-800/70 backdrop-blur-md border border-white/20 dark:border-dark-700 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl">🔍</span>
              <input
                type="text"
                placeholder="Search semantic identifiers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-dark-900 border border-transparent focus:border-indigo-500 rounded-2xl text-xs font-black uppercase tracking-widest focus:outline-none transition-all"
              />
            </div>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl">🏢</span>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-dark-900 border border-transparent focus:border-indigo-500 rounded-2xl text-xs font-black uppercase tracking-widest focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Academic Divisions</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Global Curriculum Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, idx) => {
              const enrolled = isEnrolled(course._id);
              return (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-panel rounded-[2.5rem] shadow-2xl bg-white dark:bg-dark-800 overflow-hidden border border-gray-100 dark:border-dark-700 group flex flex-col h-full"
                >
                  <div className={`p-8 bg-gradient-to-br transition-all duration-500 group-hover:bg-gradient-to-tr ${enrolled
                    ? 'from-emerald-500 to-teal-600'
                    : 'from-indigo-600 to-purple-700'
                    }`}>
                    <div className="flex justify-between items-start mb-6">
                      <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">
                        {course.code}
                      </span>
                      {enrolled && <span className="text-white text-2xl">✅</span>}
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight mb-2 group-hover:scale-[1.02] transition-transform origin-left">{course.title}</h3>
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-4">By {course.faculty?.name || 'Academic Core'}</p>
                  </div>

                  <div className="p-10 flex-1 flex flex-col">
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold leading-relaxed mb-8 line-clamp-3">
                      {course.description || 'Accessing core curriculum data... Subject profile pending full synchronization.'}
                    </p>

                    <div className="space-y-4 mb-10 text-[10px] font-black uppercase tracking-widest">
                      <div className="flex justify-between text-gray-400">
                        <span>Department</span>
                        <span className="text-gray-900 dark:text-white underline decoration-indigo-500 decoration-2">{course.department?.name || 'General'}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Unit Value</span>
                        <span className="text-gray-900 dark:text-white">{course.credits || 4} CR</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>Active Cohort</span>
                        <span className="text-gray-900 dark:text-white">{course.students?.length || 0} Members</span>
                      </div>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-4">
                      <Link
                        to={`/student/courses/${course._id}`}
                        className="py-4 bg-gray-50 dark:bg-dark-900 text-gray-600 dark:text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-gray-100 transition-all border border-gray-100 dark:border-dark-700"
                      >
                        Details
                      </Link>
                      {!enrolled && user?.role === 'student' ? (
                        <button
                          onClick={() => enrollCourse(course._id)}
                          className="py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
                        >
                          Synchronize
                        </button>
                      ) : (
                        <div className="py-4 bg-emerald-500/10 text-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border border-emerald-500/20">
                          Authorized
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-20 px-10 text-center glass-panel rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-dark-700">
              <div className="text-7xl mb-6 grayscale opacity-20">🌫️</div>
              <h3 className="text-xl font-black text-gray-300 uppercase tracking-[0.3em]">Curriculum Void Detected</h3>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">{searchTerm ? 'Adjust search vector to identify courses.' : 'Awaiting institutional data synchronization.'}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

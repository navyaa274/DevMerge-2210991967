import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import hodService from '../../services/api/hodService';
import {
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  FireIcon,
  ClockIcon,
  MapIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ label, value, icon, trend, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-50 dark:border-dark-700 relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-bl-[4rem] -mr-4 -mt-4 group-hover:scale-125 transition-transform duration-700`} />
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 relative z-10">{label}</p>
    <div className="flex items-end gap-3 relative z-10">
      <p className={`text-4xl font-black text-${color}-600 dark:text-${color}-400 italic leading-none`}>{value ?? '—'}</p>
      {trend && <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg mb-1">{trend}</span>}
    </div>
    <div className="text-3xl mt-4 opacity-20 text-right absolute bottom-4 right-6">{icon}</div>
  </motion.div>
);

function HODAnalytics() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [user?.department]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const deptId = user?.department?._id || user?.department;
      if (!deptId) {
        setError('Department scope not identified');
        return;
      }

      const [overviewRes, coursesRes, sectionsRes, perfRes] = await Promise.allSettled([
        hodService.getDepartmentOverview(deptId),
        hodService.getDepartmentCourses(deptId),
        hodService.getWorkloadDistribution(deptId),
        hodService.getFacultyPerformance(deptId)
      ]);

      const overview = overviewRes.status === 'fulfilled' ? overviewRes.value.data : null;
      const courses = coursesRes.status === 'fulfilled' ? coursesRes.value.data : [];
      const sectionsData = sectionsRes.status === 'fulfilled' ? sectionsRes.value.data : [];
      const performance = perfRes.status === 'fulfilled' ? perfRes.value.data : [];

      setFaculties(performance);
      setSections(sectionsData.workloadDistribution || []);

      setAnalytics({
        totalFaculty: performance.length,
        totalCourses: courses.length,
        totalSections: sectionsData.workloadDistribution?.length || 0,
        totalStudents: performance.reduce((sum, f) => sum + (f.students || 0), 0),
        interventionActive: overview?.interventionTotals?.active || 0,
        interventionCritical: overview?.interventionTotals?.critical || 0,
        avgResTime: overview?.interventionTotals?.avgResTime || 0,
        remedialDensity: overview?.remedialDensity || { total: 0, remedial: 0 },
        courseRankings: overview?.courseRankings || [],
        courses: courses
      });
    } catch (err) {
      setError(err.message || 'Failed to load intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoEnroll = async () => {
    try {
      const targetSemesterId = analytics?.courses?.[0]?.semesterId?._id || analytics?.courses?.[0]?.semesterId;
      if (!targetSemesterId) {
        setError('No active semester found in catalog to enroll for.');
        return;
      }
      setLoading(true);
      const res = await hodService.autoAssignStudents(targetSemesterId, { sortBy: 'studentId', dryRun: false });
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => setSuccessMsg(''), 5000);
        await fetchAnalytics();
      }
    } catch (err) {
      setError(err || 'Enrollment automation failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="mt-6 font-black text-indigo-600 uppercase tracking-[0.4em] text-[10px]">Loading Analytics...</p>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-5xl font-black text-slate-800 dark:text-white tracking-tight italic">
            STRATEGIC <span className="text-indigo-600">HUD</span>
          </h1>
          <p className="text-slate-400 font-bold tracking-[0.2em] mt-2 uppercase text-xs">Departmental Intelligence & Resource Matrix</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-dark-800 p-1.5 rounded-2xl gap-1">
            {['overview', 'faculty', 'sections'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-dark-700 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAutoEnroll}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Cog6ToothIcon className="w-4 h-4" />
            Enroll Now
          </motion.button>
          <button onClick={fetchAnalytics} className="p-3 bg-white dark:bg-dark-800 text-slate-400 rounded-2xl border border-slate-100 dark:border-dark-700 hover:text-indigo-600 shadow-sm">
            <FireIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-8 bg-emerald-500 text-white p-4 rounded-3xl font-black text-[10px] uppercase tracking-widest text-center shadow-lg shadow-emerald-500/20">
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {error && <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-2xl text-rose-700 font-bold text-xs uppercase tracking-widest">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard label="Critical Risks" value={analytics?.interventionCritical} icon={<FireIcon className="w-8 h-8" />} trend={`${analytics?.interventionActive} Active`} color="rose" />
        <StatCard label="Res. Velocity" value={`${analytics?.avgResTime}d`} icon={<ClockIcon className="w-8 h-8" />} trend="Interventions" color="teal" />
        <StatCard label="Struggle Index" value={`${analytics?.remedialDensity?.remedial || 0}`} icon={<ChartBarIcon className="w-8 h-8" />} trend="Students" color="amber" />
        <StatCard label="Dept. Strength" value={analytics?.totalFaculty} icon={<UserGroupIcon className="w-8 h-8" />} trend="Active Faculty" color="indigo" />
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-50 dark:border-dark-700">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
              <FireIcon className="w-5 h-5 text-rose-500" /> Instructional Risk Map
            </h2>
            <div className="space-y-4">
              {analytics?.courseRankings?.slice(0, 5).map(rank => (
                <div key={rank.courseId}>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span className="text-slate-600 dark:text-slate-300">{rank.code}: {rank.title}</span>
                    <span className="text-rose-500">{rank.criticalRate}% RISK</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-dark-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${rank.criticalRate}%` }} className="h-full bg-rose-500 rounded-full" />
                  </div>
                </div>
              ))}
              {(!analytics?.courseRankings || analytics.courseRankings.length === 0) && <p className="text-slate-400 text-xs font-bold uppercase text-center py-8">No risk clusters detected</p>}
            </div>
          </div>
          <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-50 dark:border-dark-700">
            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6">Course Catalog</h2>
            <div className="space-y-3">
              {(analytics?.courses || []).slice(0, 6).map(course => (
                <div key={course._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-800 rounded-2xl">
                  <div>
                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{course.title || course.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{course.code} · {course.credits || 0} Credits</p>
                  </div>
                  <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-600 text-[9px] font-black px-3 py-1 rounded-lg uppercase">Sem {course.semesterNumber || '—'}</span>
                </div>
              ))}
              {(!analytics?.courses || analytics.courses.length === 0) && <p className="text-slate-400 text-xs font-bold uppercase text-center py-8">No courses found</p>}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'faculty' && (
        <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] shadow-xl border border-slate-50 dark:border-dark-700 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8"><h2 className="text-xl font-black text-white uppercase tracking-tighter">Faculty Roster</h2><p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest mt-2">{faculties.length} members in department</p></div>
          <div className="divide-y divide-slate-50 dark:divide-dark-700">
            {faculties.map((f, idx) => (
              <div key={f._id} className="flex items-center gap-6 p-6 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shrink-0">{(f.firstName || '?').charAt(0)}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{f.displayName}</p><p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate">{f.email}</p></div>
                <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg uppercase tracking-widest shrink-0">Faculty #{idx + 1}</span>
              </div>
            ))}
            {faculties.length === 0 && <div className="py-20 text-center text-slate-400 font-black text-xs uppercase tracking-widest">No faculty members found for this department</div>}
          </div>
        </div>
      )}

      {activeTab === 'sections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map(sec => {
            const pct = sec.capacity ? Math.round(((sec.enrolledCount || 0) / sec.capacity) * 100) : 0;
            const teacherName = sec.classTeacherName || (sec.classTeacherId ? `${sec.classTeacherId.firstName || ''} ${sec.classTeacherId.lastName || ''}`.trim() : 'Unassigned');
            return (
              <motion.div key={sec._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-dark-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-50 dark:border-dark-700">
                <div className="flex items-center gap-4 mb-6"><div className="w-14 h-14 rounded-2xl bg-violet-600 text-white flex items-center justify-center font-black text-xl">{sec.name}</div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Section</p><p className="text-sm font-black text-slate-900 dark:text-white uppercase">Cap: {sec.capacity}</p></div></div>
                <div className="space-y-3 text-[10px] font-bold"><div className="flex justify-between"><span className="text-slate-400 uppercase tracking-widest">In-Charge</span><span className="text-slate-700 dark:text-slate-200 font-black">{teacherName}</span></div><div className="flex justify-between"><span className="text-slate-400 uppercase tracking-widest">Enrolled</span><span className={`font-black ${pct > 90 ? 'text-rose-500' : 'text-indigo-600'}`}>{sec.enrolledCount || 0} / {sec.capacity}</span></div><div className="h-2 bg-slate-100 dark:bg-dark-800 rounded-full overflow-hidden mt-2"><motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className={`h-full rounded-full ${pct > 90 ? 'bg-rose-500' : 'bg-violet-500'}`} /></div></div>
              </motion.div>
            );
          })}
          {sections.length === 0 && <div className="col-span-full py-20 bg-slate-50 dark:bg-dark-800 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center"><p className="font-black text-slate-400 uppercase tracking-widest text-xs">No sections found</p></div>}
        </div>
      )}
    </motion.div>
  );
}

export default HODAnalytics;

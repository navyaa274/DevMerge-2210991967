import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import facultyService from '../../services/api/facultyService';
import UniversityDashboard from '../../components/dashboard/UniversityDashboard';
import {
  BookOpenIcon,
  ScaleIcon,
  UserGroupIcon,
  RectangleStackIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  TrophyIcon,
  AcademicCapIcon,
  DocumentMagnifyingGlassIcon,
  PresentationChartLineIcon,
  ChevronRightIcon,
  BoltIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';

const ActionButton = ({ icon: Icon, title, subtitle, path, color }) => (
  <Link to={path} className="group flex items-start gap-4 md:gap-6 p-6 md:p-8 bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 hover:border-indigo-500/50 hover:shadow-[0_20px_50px_-12px_rgba(79,70,229,0.3)] transition-all h-full relative overflow-hidden group">
    <div className={`p-4 bg-${color}-500/10 text-${color}-500 rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all relative z-10 shrink-0 border border-${color}-500/20`}>
      <Icon className="w-7 h-7 md:w-8 md:h-8" />
    </div>
    <div className="relative z-10 overflow-hidden">
      <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2 truncate group-hover:text-indigo-400 transition-colors">{title}</h3>
      <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed line-clamp-2 italic">{subtitle}</p>
    </div>
    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 hidden sm:block">
      <ChevronRightIcon className="w-6 h-6 text-indigo-500" />
    </div>
    <div className={`absolute -bottom-12 -right-12 w-24 h-24 bg-${color}-500/5 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
  </Link>
);

export default function FacultyDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      const [statsRes, yearRes, coursesRes] = await Promise.allSettled([
        facultyService.getDashboardStats(user.id),
        facultyService.getActiveYear(),
        facultyService.getAssignedCourses(user.id)
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data || statsRes.value);
      if (yearRes.status === 'fulfilled') setActiveYear(yearRes.value.data || yearRes.value);
      if (coursesRes.status === 'fulfilled') {
        const raw = coursesRes.value.courses || coursesRes.value.data || [];
        setCourses(raw.slice(0, 5));
      }
    } catch (error) {
      console.error('Academic sync failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const syllabusScore = courses.length > 0 ? Math.min(100, Math.round((courses.filter(c => c.syllabus || c.syllabusId).length / courses.length) * 100)) : 0;
  const materialsScore = courses.length > 0 ? Math.min(100, Math.round((courses.filter(c => c.materials?.length > 0 || c.hasResources).length / courses.length) * 100)) : 0;
  const assessmentScore = courses.length > 0 ? Math.min(100, Math.round((courses.filter(c => c.exams?.length > 0 || c.quizzes?.length > 0).length / courses.length) * 100)) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <BoltIcon className="w-8 h-8 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-8 font-black text-indigo-500 uppercase tracking-[0.4em] text-[10px] italic animate-pulse">Synchronizing Academic Records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* University Dashboard Component */}
      <UniversityDashboard />

      {/* Faculty-Specific Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-[1700px] mx-auto font-sans"
      >
        {/* HUD Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-16 lg:mb-24 gap-12">
          <div className="w-full xl:w-auto">
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <span className="px-5 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.4)] italic border border-indigo-400/20">Faculty Terminal</span>
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] italic flex items-center gap-3 bg-white dark:bg-slate-900/50 backdrop-blur-xl px-5 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                {activeYear?.year || 'Active Session'}
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.85] italic select-none">
              Educational <span className="text-indigo-600 dark:text-indigo-400 underline decoration-rose-500/30 decoration-[12px] underline-offset-[12px]">Command</span>
            </h1>
          </div>

          <div className="w-full xl:w-auto bg-white dark:bg-slate-900/50 backdrop-blur-2xl px-8 md:px-12 py-8 rounded-[3rem] md:rounded-[4rem] border border-slate-200 dark:border-slate-800 shadow-3xl flex items-center gap-6 md:gap-10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-950 dark:bg-white rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-white dark:text-slate-950 font-black text-3xl md:text-4xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(255,255,255,0.1)] relative z-10 group-hover:rotate-6 group-hover:scale-105 transition-all duration-500 italic shrink-0">
              {(user.firstName || user.name || 'F').charAt(0)}
            </div>
            <div className="relative z-10 min-w-0">
              <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-2 italic">Authenticated Node</p>
              <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-none italic truncate mb-4">{user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Faculty'}</p>
              <div className="flex items-center gap-3 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] italic bg-emerald-500/5 px-4 py-1.5 rounded-full border border-emerald-500/10 w-fit">
                Identity Verified // Senior Academic
              </div>
            </div>
          </div>
        </div>

        {/* Metric Array */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-16 lg:mb-24">
          {[
            { label: 'Assigned Modules', value: stats?.totalCourses || 0, icon: BookOpenIcon, color: 'indigo' },
            { label: 'Credit Loadout', value: stats?.totalCredits || 0, icon: ScaleIcon, color: 'rose' },
            { label: 'Student Cohort', value: stats?.totalStudents || 0, icon: UserGroupIcon, color: 'violet' },
            { label: 'Academic Sections', value: stats?.totalSections || 0, icon: RectangleStackIcon, color: 'emerald' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -12, scale: 1.02 }}
              className={`bg-white dark:bg-slate-900/50 backdrop-blur-xl p-10 md:p-12 rounded-[3.5rem] md:rounded-[4rem] shadow-2xl border-b-[12px] md:border-b-[16px] border-${stat.color}-500/80 relative overflow-hidden group transition-all duration-500 border border-slate-100 dark:border-slate-800/50`}
            >
              <div className={`p-5 bg-${stat.color}-500/10 rounded-2xl w-fit mb-8 text-${stat.color}-500 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 border border-${stat.color}-500/20 shadow-lg shadow-${stat.color}-500/5`}>
                <stat.icon className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-5 leading-none italic">{stat.label}</p>
              <div className="flex items-baseline gap-3">
                <p className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none italic">{stat.value}</p>
                <span className={`w-3.5 h-3.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.6)]`}></span>
              </div>
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
                <stat.icon className="w-24 h-24 md:w-32 md:h-32" />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-8 flex flex-col gap-10 lg:gap-16">
            {/* Tactical Hub */}
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-2xl rounded-[3.5rem] md:rounded-[4.5rem] p-10 md:p-14 shadow-3xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl md:text-3xl font-black mb-12 md:mb-16 dark:text-white uppercase tracking-tighter flex items-center gap-6 italic leading-none">
                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                  <SparklesIcon className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />
                </div>
                Operational Hub
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <ActionButton icon={BoltIcon} title="Zero-Day Quest" subtitle="Deploy timed algorithmic challenges" path="/faculty/zero-day-quest" color="amber" />
                <ActionButton icon={ChartBarIcon} title="Cog Visualizer" subtitle="Track live lab friction and errors" path="/faculty/cognitive-visualizer" color="rose" />
                <ActionButton icon={AdjustmentsHorizontalIcon} title="Grade Override" subtitle="Tweak neural grading constraints" path="/faculty/auto-grader-override" color="indigo" />
                <ActionButton icon={PuzzlePieceIcon} title="Smart Cohort" subtitle="AI-balanced group formation" path="/faculty/smart-cohort" color="emerald" />
                <ActionButton icon={BookOpenIcon} title="My Courses" subtitle="Manage curriculum and student enrollment" path="/faculty/courses" color="violet" />
                <ActionButton icon={ClipboardDocumentListIcon} title="Assignments" subtitle="Deploy and track student tasks" path="/faculty/create-assignment" color="sky" />
                <ActionButton icon={UserGroupIcon} title="Attendance Ledger" subtitle="Cross-section synchronization" path="/faculty/attendance" color="rose" />
                <ActionButton icon={SparklesIcon} title="AI Copilot" subtitle="Generate content ground in outcomes" path="/faculty/copilot-hub" color="purple" />
                <ActionButton icon={BeakerIcon} title="Lab Architect" subtitle="Synthesize complex coding environments" path="/faculty/ultimate-lab-generator" color="indigo" />
                <ActionButton icon={TrophyIcon} title="Arena Contests" subtitle="Run competitive programming rounds" path="/faculty/run-contest" color="amber" />
                <ActionButton icon={AcademicCapIcon} title="Grading Hub" subtitle="Evaluate and provide feedback" path="/faculty/grading" color="emerald" />
                <ActionButton icon={DocumentMagnifyingGlassIcon} title="Plagiarism" subtitle="Verify academic integrity" path="/faculty/plagiarism-reports" color="rose" />
              </div>
            </div>

            {/* Module Stream */}
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-2xl rounded-[3.5rem] md:rounded-[4.5rem] p-10 md:p-14 shadow-3xl border border-slate-200 dark:border-slate-800 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-16 opacity-[0.02] group-hover:scale-125 group-hover:opacity-[0.05] transition-all duration-1000 text-9xl italic font-black pointer-events-none select-none text-indigo-500">STREAM</div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 md:mb-16 gap-6 relative z-10">
                <h2 className="text-2xl md:text-3xl font-black dark:text-white uppercase tracking-tighter italic leading-none flex items-center gap-5">
                  <div className="w-2 h-10 bg-indigo-600 rounded-full"></div>
                  Pedagogical Stream
                </h2>
                <Link to="/faculty/courses" className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] hover:translate-x-3 transition-all duration-500 inline-flex items-center gap-3 italic bg-indigo-500/5 px-6 py-2.5 rounded-full border border-indigo-500/10">Full Archival Access <ChevronRightIcon className="w-5 h-5" /></Link>
              </div>

              <div className="space-y-6 md:space-y-8 relative z-10">
                {courses.map((course, i) => (
                  <Link key={i} to={`/faculty/copilot/${course._id}`}>
                    <motion.div
                      whileHover={{ x: 15, backgroundColor: 'rgba(79, 70, 229, 0.08)' }}
                      className="flex items-center gap-6 md:gap-10 p-8 md:p-10 bg-slate-50 dark:bg-slate-950/40 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] border border-slate-200 dark:border-slate-800/50 group hover:border-indigo-500/40 transition-all duration-500 shadow-sm"
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-950 text-white rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center font-black shadow-[0_15px_35px_rgba(0,0,0,0.3)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 italic shrink-0 border border-slate-800">
                        <span className="text-2xl md:text-3xl leading-none">{course.code?.slice(-2) || (i + 1)}</span>
                        <span className="text-[8px] uppercase opacity-40 mt-1">NODE</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none mb-4 truncate group-hover:text-indigo-400 transition-colors">{course.title}</p>
                        <div className="flex flex-wrap items-center gap-6 md:gap-10">
                          <p className="text-[10px] md:text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] bg-indigo-500/5 dark:bg-indigo-500/10 px-5 py-2 rounded-xl border border-indigo-500/20 shadow-sm italic">{course.code}</p>
                          <p className="text-[10px] md:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 italic">
                            <UserGroupIcon className="w-5 h-5 text-indigo-400" />
                            Cohort: <span className="text-slate-900 dark:text-white">{course.studentCount || '50+'} Units</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2 italic">Status</p>
                        <p className="text-[11px] font-black text-emerald-500 uppercase italic flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                          On Feed
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                ))}

                {courses.length === 0 && (
                  <div className="py-24 md:py-36 bg-slate-50 dark:bg-slate-950/40 backdrop-blur-xl rounded-[3.5rem] border-4 border-dashed border-slate-200 dark:border-slate-800 text-center px-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-8 border border-slate-200 dark:border-slate-800">
                      <BookOpenIcon className="w-10 h-10 text-slate-300 dark:text-slate-700" />
                    </div>
                    <p className="text-xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] italic mb-4">Workspace Empty</p>
                    <p className="text-[11px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.2em] max-w-[340px] leading-relaxed italic">No instructional modules assigned to this node for the current cycle.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-10 lg:gap-16">
            {/* Readiness Index */}
            <div className="bg-slate-950 rounded-[3.5rem] md:rounded-[4.5rem] p-10 md:p-14 text-white shadow-3xl relative overflow-hidden border-t-[16px] md:border-t-[24px] border-indigo-600">
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-[120px]"></div>
              <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-rose-600/10 rounded-full blur-[120px]"></div>
              
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-12 md:mb-16 italic flex items-center gap-4 relative z-10">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                  <PresentationChartLineIcon className="w-7 h-7 text-indigo-400" />
                </div>
                Readiness Index
              </h3>

              <div className="space-y-10 md:space-y-14 relative z-10">
                {[
                  { label: 'Syllabus Resolution', value: syllabusScore, color: 'indigo', icon: BookOpenIcon },
                  { label: 'Artifact Inventory', value: materialsScore, color: 'rose', icon: RectangleStackIcon },
                  { label: 'Assessment Logic', value: assessmentScore, color: 'emerald', icon: BeakerIcon },
                ].map((v, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.3em] mb-4 italic">
                      <span className="text-slate-400 flex items-center gap-3"><v.icon className="w-5 h-5 text-indigo-400" /> {v.label}</span>
                      <span className={`text-${v.color}-400`}>{v.value}%</span>
                    </div>
                    <div className="h-4 md:h-5 w-full bg-slate-900 rounded-full overflow-hidden p-1 border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${v.value}%` }}
                        transition={{ duration: 2, ease: "circOut", delay: i * 0.3 }}
                        className={`h-full bg-gradient-to-r from-${v.color}-600 to-${v.color}-400 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)]`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16 md:mt-28 p-10 md:p-14 bg-white/5 rounded-[3rem] md:rounded-[3.5rem] border border-white/10 text-center backdrop-blur-2xl relative z-10 group hover:border-indigo-500/50 transition-all duration-700 shadow-2xl">
                <p className="text-7xl md:text-9xl font-black text-white leading-none mb-4 tracking-tighter italic group-hover:scale-110 transition-transform duration-700">
                  {Math.round((syllabusScore + materialsScore + assessmentScore) / 3)}<span className="text-4xl md:text-6xl text-indigo-400 opacity-50 ml-1">%</span>
                </p>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mb-6 italic">Master Quality Index</p>
                <div className="h-2 w-24 md:w-32 bg-indigo-600 mx-auto rounded-full shadow-[0_0_15px_rgba(79,70,229,0.8)]"></div>
              </div>
            </div>

            {/* AI Uplink Card */}
            <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-950 rounded-[3.5rem] md:rounded-[4.5rem] p-10 md:p-14 text-white shadow-3xl relative overflow-hidden group border border-white/5">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:scale-150 transition-transform duration-1000"></div>
              <SparklesIcon className="w-16 h-16 md:w-24 md:h-24 text-white/10 absolute right-10 top-10 md:right-16 md:top-16 rotate-12 transition-all duration-1000 group-hover:rotate-[30deg] group-hover:scale-125" />

              <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-6 relative z-10 leading-[0.9] italic">AI Copilot <br /><span className="text-indigo-300 opacity-60">Matrix Enable</span></h3>
              <p className="text-xs md:text-sm font-bold opacity-70 leading-relaxed uppercase tracking-tight mb-12 md:mb-16 relative z-10 italic max-w-[280px]">
                Synthesize pedagogical content grounded in course outcomes via real-time neural generation.
              </p>

              <Link to="/faculty/copilot-hub" className="block w-full py-7 md:py-8 bg-white text-slate-950 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[11px] shadow-[0_20px_40px_rgba(0,0,0,0.3)] text-center hover:bg-slate-950 hover:text-white transition-all duration-500 transform hover:-translate-y-2 relative z-10 italic border-2 border-transparent hover:border-indigo-500/30">
                Initialize Matrix Uplink →
              </Link>
            </div>

            {/* Activity Log */}
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-2xl rounded-[3.5rem] md:rounded-[4.5rem] p-10 md:p-14 shadow-3xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter mb-10 md:mb-14 italic flex items-center gap-4">
                <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <ClockIcon className="w-6 h-6 text-rose-500" />
                </div>
                Evaluation Log
              </h3>
              <div className="space-y-5 md:space-y-7">
                {[
                  { user: 'Node_A3', action: 'Syncing_Logic_Lab', time: '2m_ago', color: 'indigo' },
                  { user: 'Node_B7', action: 'Upload_Success_MAT', time: '14m_ago', color: 'emerald' },
                  { user: 'Node_X1', action: 'Grading_Batch_0x', time: '1h_ago', color: 'rose' }
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between p-6 md:p-7 bg-slate-50 dark:bg-slate-950/60 backdrop-blur-xl rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800/50 group hover:border-indigo-500/30 transition-all duration-500">
                    <div className="flex items-center gap-5">
                      <div className={`w-3 h-3 bg-${log.color}-500 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)] animate-pulse`}></div>
                      <p className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.3em] italic group-hover:text-indigo-400 transition-colors">{log.user}</p>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">{log.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ClockIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

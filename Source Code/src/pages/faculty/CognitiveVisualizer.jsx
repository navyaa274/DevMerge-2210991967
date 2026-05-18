import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  CpuChipIcon,
  ExclamationCircleIcon,
  MagnifyingGlassCircleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BoltIcon,
  BookOpenIcon,
  ScaleIcon,
  FingerPrintIcon,
  MapIcon,
  CircleStackIcon,
  AcademicCapIcon
} from "@heroicons/react/24/outline";
import facultyService from "../../services/api/facultyService";
import toast from "../../utils/toast";

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${active
        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 active:scale-95'
        : 'bg-white dark:bg-dark-900 text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-100 dark:border-dark-800'
      }`}
  >
    <Icon className="w-5 h-5" />
    {label}
  </button>
);

export default function InstructionalIntelligence() {
  const [activeTab, setActiveTab] = useState('telemetry');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [insights, setInsights] = useState(null);
  const [calibration, setCalibration] = useState(null);
  const [synergy, setSynergy] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const coursesData = await facultyService.getFacultyCourses('ME'); // Hardcoded ID workaround
        const list = coursesData.courses || coursesData.data || [];
        setCourses(list);
        if (list.length > 0) setSelectedCourse(list[0]._id);
      } catch (e) {
        console.error("Init failed", e);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseData();
    }
  }, [selectedCourse]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const [ins, cal, syn, tel] = await Promise.all([
        facultyService.getGlobalCourseInsights(selectedCourse),
        facultyService.getCourseCalibration(selectedCourse),
        facultyService.getSynergyGroups(selectedCourse),
        facultyService.getCognitiveTelemetry()
      ]);
      setInsights(ins);
      setCalibration(cal);
      setSynergy(syn);
      setTelemetry(tel);
    } catch (error) {
      console.error("Data fetch failed", error);
      toast.error("AI Insight nodes are currently recalibrating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] p-8 md:p-12 lg:p-16 pt-24 font-sans relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -left-20 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-[1700px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-600 rounded-xl">
                <CpuChipIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Cognitive Visualizer v2.0</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
              Instructional <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Intelligence</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="bg-white dark:bg-dark-900 p-2 rounded-2xl border border-slate-100 dark:border-dark-800 shadow-xl flex items-center">
              <select
                value={selectedCourse || ''}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="bg-transparent text-[10px] font-black uppercase tracking-widest px-6 py-2 outline-none text-slate-600 dark:text-slate-300 min-w-[200px]"
              >
                {courses.map(c => <option key={c._id} value={c._id}>{c.code}: {c.title}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] text-white font-black uppercase tracking-tight italic">AI Uplink: Synchronized</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-12">
          <TabButton active={activeTab === 'telemetry'} onClick={() => setActiveTab('telemetry')} icon={ChartBarIcon} label="Real-Time Telemetry" />
          <TabButton active={activeTab === 'integrity'} onClick={() => setActiveTab('integrity')} icon={FingerPrintIcon} label="Integrity Matrix" />
          <TabButton active={activeTab === 'syllabus'} onClick={() => setActiveTab('syllabus')} icon={MapIcon} label="Syllabus Sync" />
          <TabButton active={activeTab === 'synergy'} onClick={() => setActiveTab('synergy')} icon={UserGroupIcon} label="Smart Synergy" />
        </div>

        {loading ? (
          <div className="py-40 flex flex-col items-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full mb-8" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Synthesizing Course Cognition</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 gap-12"
            >
              {activeTab === 'telemetry' && (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                    <MetricCard icon={CpuChipIcon} label="Instructional Intensity" value={`${calibration?.cognitiveLoad?.intensity}%`} color="indigo" />
                    <MetricCard icon={ExclamationCircleIcon} label="High Friction Students" value={insights?.performance?.highRiskCount || 0} color="rose" />
                    <MetricCard icon={ShieldCheckIcon} label="Integrity Score" value={`${insights?.integrity?.globalScore}%`} color="emerald" />
                    <MetricCard icon={ScaleIcon} label="Course Calibration" value={calibration?.difficulty} color="amber" />
                  </div>

                  <div className="bg-white dark:bg-dark-900 rounded-[4rem] shadow-3xl border border-slate-100 dark:border-dark-800 p-12 overflow-hidden">
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-10 flex items-center gap-4">
                      <ChartBarIcon className="w-8 h-8 text-indigo-600" />
                      Live Instructional Stream
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b-2 border-slate-50 dark:border-dark-800">
                            <th className="py-6 px-4">Node Identity</th>
                            <th className="py-6 px-4">Focus Concept</th>
                            <th className="py-6 px-4">AI Sentiment</th>
                            <th className="py-6 px-4 text-center">Friction pts</th>
                            <th className="py-6 px-4">Telemetry Stream</th>
                          </tr>
                        </thead>
                        <tbody>
                          {telemetry.map((t, idx) => (
                            <tr key={idx} className="border-b border-slate-50 dark:border-dark-800/50 hover:bg-slate-50 dark:hover:bg-dark-950/40 transition-all group">
                              <td className="py-6 px-4 font-black italic text-slate-900 dark:text-white uppercase">{t.student}</td>
                              <td className="py-6 px-4 font-mono text-xs text-indigo-500 font-bold">{t.topic}</td>
                              <td className="py-6 px-4">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${t.status === 'critical' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 animate-pulse' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                  }`}>
                                  {t.status}
                                </span>
                              </td>
                              <td className="py-6 px-4 text-center font-black text-xl italic">{t.errors}</td>
                              <td className="py-6 px-4">
                                <div className="bg-slate-100 dark:bg-dark-950 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-rose-500 truncate max-w-sm">
                                  {t.lastError}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integrity' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  <div className="bg-white dark:bg-dark-900 rounded-[4rem] p-12 border border-slate-100 dark:border-dark-800 shadow-3xl">
                    <h3 className="text-xl font-black uppercase tracking-tighter italic mb-8 flex items-center gap-4">
                      <FingerPrintIcon className="w-7 h-7 text-rose-500" />
                      Plagiarism Clusters
                    </h3>
                    <div className="space-y-6">
                      {insights?.integrity?.plagiarismClusters?.map((c, i) => (
                        <div key={i} className="p-8 bg-slate-50 dark:bg-dark-950 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 group hover:border-rose-500/30 transition-all">
                          <div className="flex justify-between items-center mb-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cluster Identity: CL-{i + 1}</p>
                            <span className="px-4 py-1 bg-rose-500 text-white text-[9px] font-black uppercase rounded-full">Intensity: {c.intensity}</span>
                          </div>
                          <p className="text-xl font-black italic uppercase italic mb-4">{c.topic}</p>
                          <div className="flex flex-wrap gap-2">
                            {c.students?.map(s => <span key={s} className="px-3 py-1 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg text-[9px] font-black uppercase text-slate-500">{s}</span>)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-[4rem] p-12 text-white shadow-3xl flex flex-col justify-center">
                    <h3 className="text-5xl font-black uppercase tracking-tighter italic mb-8 leading-none">
                      Integrity <br /> <span className="text-rose-500 italic">Alignment</span>
                    </h3>
                    <p className="text-sm font-bold opacity-60 uppercase tracking-tight italic mb-12">
                      AI has identified a {insights?.integrity?.globalScore}% integrity match for this module cycle. Corrective interventions are suggested for 3 clusters.
                    </p>
                    <button className="w-full py-6 bg-rose-600 rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20">
                      Deploy AI Investigation Node
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'syllabus' && (
                <div className="bg-white dark:bg-dark-900 rounded-[4rem] p-12 border border-slate-100 dark:border-dark-800 shadow-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-16 opacity-5">
                    <MapIcon className="w-64 h-64 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-12 flex items-center gap-4 relative z-10">
                    <MapIcon className="w-8 h-8 text-indigo-600" />
                    Pedagogical Velocity Tracker
                  </h3>

                  <div className="space-y-12 relative z-10">
                    {insights?.syllabus?.weeklyAlignment?.map((w, i) => (
                      <div key={i} className="relative pl-12 border-l-2 border-slate-100 dark:border-dark-800">
                        <div className={`absolute top-0 left-[-11px] w-5 h-5 rounded-full border-2 bg-white dark:bg-dark-900 flex items-center justify-center transition-all ${w.status === 'optimal' ? 'border-emerald-500' : 'border-rose-500'}`}>
                          <div className={`w-2 h-2 rounded-full ${w.status === 'optimal' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Week {w.week}</p>
                            <h4 className="text-xl font-black italic uppercase italic">{w.topic}</h4>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Concept Mastery</p>
                            <p className={`text-2xl font-black italic ${w.mastery >= 80 ? 'text-emerald-500' : 'text-rose-500'}`}>{w.mastery}%</p>
                          </div>
                        </div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 italic max-w-2xl leading-relaxed">
                          {w.status === 'optimal' ? 'Cohort is synchronized with instructional targets.' : 'A critical performance lag detected. Remedial bridge suggested before moving to next sector.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'synergy' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {synergy?.groups?.map((g, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -10 }}
                      className="bg-white dark:bg-dark-900 p-10 rounded-[3rem] border border-slate-100 dark:border-dark-800 shadow-2xl relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-all">
                        <SparklesIcon className="w-12 h-12 text-indigo-600" />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-slate-50 dark:border-dark-800 pb-4">Synergy Cohort: {g.groupIndex}</h4>

                      <div className="flex items-center gap-4 mb-10">
                        <div className="text-4xl font-black italic tracking-tighter text-indigo-600">{g.strength}%</div>
                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">Predicted <br /> Synergy Rating</div>
                      </div>

                      <div className="space-y-4 mb-10">
                        {g.students?.map(s => (
                          <div key={s} className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-dark-950 rounded-xl border border-slate-100 dark:border-dark-800">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                            <span className="text-[10px] font-black uppercase italic tracking-tighter">{s}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-6 bg-indigo-600/5 rounded-2xl border border-indigo-600/10">
                        <p className="text-[8px] font-black uppercase tracking-widest text-indigo-600 mb-2">Complementary Power</p>
                        <p className="text-[10px] font-bold italic text-slate-600 dark:text-slate-400 leading-relaxed">{g.complementarySkills}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}

const MetricCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 shadow-2xl group hover:border-indigo-500/30 transition-all">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-${color}-500/10 text-${color}-600 group-hover:scale-110 transition-transform`}>
      <Icon className="w-7 h-7" />
    </div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
    <p className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter">{value}</p>
  </div>
);

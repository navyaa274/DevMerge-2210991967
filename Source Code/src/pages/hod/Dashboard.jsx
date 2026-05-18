import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import hodService from '../../services/api/hodService';
import UniversityDashboard from '../../components/dashboard/UniversityDashboard';
import {
  ShieldCheckIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  UserGroupIcon,
  ClockIcon,
  ChevronRightIcon,
  CubeIcon,
  CpuChipIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

export default function HODDashboard() {
  const { user } = useAuthStore();
  const [deptOverview, setDeptOverview] = useState(null);
  const [cogLoadRisk, setCogLoadRisk] = useState([]);
  const [efficiency, setEfficiency] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchDepartmentIntelligence();
  }, [user]);

  const fetchDepartmentIntelligence = async () => {
    try {
      setLoading(true);
      const targetDeptId = user?.department;

      if (!targetDeptId) {
        setLoading(false);
        return;
      }

      const [overviewRes, cogLoadRes, efficiencyRes] = await Promise.allSettled([
        hodService.getDepartmentOverview(targetDeptId),
        hodService.getCognitiveLoadData(targetDeptId),
        hodService.getEfficiencyMetrics(targetDeptId)
      ]);

      if (overviewRes.status === 'fulfilled') {
        setDeptOverview(overviewRes.value?.data || overviewRes.value || {});
      }

      if (cogLoadRes.status === 'fulfilled') {
        setCogLoadRisk(cogLoadRes.value?.data || cogLoadRes.value || []);
      }

      if (efficiencyRes.status === 'fulfilled') {
        setEfficiency(efficiencyRes.value?.data || efficiencyRes.value || {});
      }
    } catch (error) {
      console.error('Department sync failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="mt-6 text-emerald-600 font-black uppercase tracking-[0.4em] text-[10px]">Accessing Department Intelligence Node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* University Dashboard Component */}
      <UniversityDashboard />

      {/* HOD-Specific Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-[1700px] mx-auto font-sans"
      >
      {/* HUD Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
        <div className="w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-4 py-1.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">Governing Node</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2 bg-slate-100 dark:bg-dark-900 px-4 py-1.5 rounded-full border border-slate-200 dark:border-dark-800">
              <SignalIcon className="w-3 h-3 text-emerald-500 animate-pulse" />
              Node ID: {user.department || 'Main'}
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
            Node <span className="text-emerald-600">Oversight</span>
          </h1>
        </div>

        <div className="w-full xl:w-auto bg-white dark:bg-dark-900 px-6 md:px-10 py-6 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 dark:border-dark-800 shadow-3xl flex items-center gap-4 md:gap-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent"></div>
          <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-600 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl relative z-10 group-hover:rotate-6 transition-transform">
            <ShieldCheckIcon className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div className="relative z-10 min-w-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Authority</p>
            <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-none italic truncate">{user.name}</p>
            <div className="hidden sm:flex items-center gap-2 mt-3 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
              Session Active // Protocol_Clearance
            </div>
          </div>
        </div>
      </div>

      {/* Vital Stream Array */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 mb-12 lg:mb-20">
        {[
          { label: 'Critical Index', value: `${deptOverview?.summary?.overallCriticalRate ?? 0}%`, sub: 'Logic Threshold Alerts', icon: ExclamationTriangleIcon, color: 'rose' },
          { label: 'Tactical Interv.', value: deptOverview?.summary?.totalInterventions ?? 0, sub: 'Faculty Protocol Activity', icon: BoltIcon, color: 'emerald' },
          { label: 'Response Velocity', value: `${deptOverview?.interventionTotals?.avgResTime ?? 0}d`, sub: 'Median Correction Time', icon: ClockIcon, color: 'sky' },
          { label: 'Cognitive Load', value: cogLoadRisk?.length ?? 0, sub: 'Students at Performance Redline', icon: UserGroupIcon, color: 'amber' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10, scale: 1.02 }}
            className={`bg-white dark:bg-dark-900 p-8 md:p-10 rounded-[3rem] md:rounded-[3.5rem] shadow-2xl border-b-[8px] md:border-b-[12px] border-${stat.color}-500/80 relative overflow-hidden group transition-all`}
          >
            <div className={`p-4 bg-${stat.color}-50 dark:bg-${stat.color}-500/10 rounded-2xl w-fit mb-6 text-${stat.color}-600 group-hover:rotate-12 transition-transform`}>
              <stat.icon className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 leading-none">{stat.label}</p>
            <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-3 italic">{stat.value}</p>
            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest opacity-60 italic">{stat.sub}</p>
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-20 h-20 md:w-24 md:h-24" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 flex flex-col gap-8 lg:gap-12">
          {/* Tactical Hub */}
          <div className="bg-white dark:bg-dark-900 rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 shadow-3xl border border-slate-50 dark:border-dark-800">
            <h2 className="text-xl md:text-2xl font-black mb-10 md:mb-12 dark:text-white uppercase tracking-tighter flex items-center gap-4 italic leading-none">
              <BoltIcon className="w-7 h-7 md:w-8 md:h-8 text-emerald-600" /> Administrative Console
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {[
                { name: 'Broadcast', path: '/hod/global-broadcast', icon: '📢', color: 'orange', badge: 'CRIT' },
                { name: 'Variables', path: '/hod/gamification-override', icon: '⚡', color: 'yellow', badge: 'NEW' },
                { name: 'Policy', path: '/hod/policy-engine', icon: '⚙️', color: 'blue', badge: 'SYS' },
                { name: 'Sentiment', path: '/hod/sentiment-analyzer', icon: '🧠', color: 'pink', badge: 'AI' },
                { name: 'Copilot', path: '/hod/copilot', icon: '🤖', color: 'indigo', badge: 'AI' },
                { name: 'Radar', path: '/hod/predictive-radar', icon: '📡', color: 'rose', badge: 'AI' },
                { name: 'Skill Matrix', path: '/hod/skill-matrix', icon: '🔗', color: 'emerald' },
                { name: 'Integrity', path: '/hod/integrity-heatmap', icon: '🛡️', color: 'rose', badge: 'SEC' },
                { name: 'Optimizer', path: '/hod/resource-optimizer', icon: '🗓️', color: 'amber' },
                { name: 'Research', path: '/hod/research-grants', icon: '🔬', color: 'violet' },
                { name: 'Alumni', path: '/hod/alumni-bridge', icon: '🏢', color: 'sky' },
                { name: 'Programs', path: '/hod/programs', icon: '📜', color: 'emerald' },
                { name: 'Outcomes', path: '/hod/program-outcomes', icon: '🎯', color: 'violet' },
                { name: 'Audit', path: '/hod/courses', icon: '📚', color: 'teal' },
                { name: 'Sections', path: '/hod/sections', icon: '👥', color: 'rose' },
                { name: 'Workload', path: '/hod/faculty-load', icon: '⚖️', color: 'indigo' },
                { name: 'Contests', path: '/hod/contests', icon: '🏆', color: 'amber' },
              ].map((action, i) => (
                <Link key={i} to={action.path} className="flex flex-col items-center group relative">
                  {action.badge && (
                    <span className={`absolute -top-2 -right-2 bg-${action.color}-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider z-10 shadow-lg animate-pulse`}>
                      {action.badge}
                    </span>
                  )}
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] border-2 flex items-center justify-center text-2xl md:text-3xl shadow-lg transition-all duration-500 bg-${action.color}-50 dark:bg-${action.color}-500/10 border-${action.color}-100 dark:border-${action.color}-800/20 group-hover:bg-${action.color}-600 group-hover:text-white transform group-hover:-translate-y-2`}>
                    {action.icon}
                  </div>
                  <span className="mt-4 text-[9px] md:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center italic">{action.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Performance Anomalies */}
          <div className="bg-white dark:bg-dark-900 rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 shadow-3xl border border-slate-50 dark:border-dark-800 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-125 transition-transform text-9xl italic font-black pointer-events-none select-none">REDLINE</div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 md:mb-12 gap-4 relative z-10">
              <h2 className="text-xl md:text-2xl font-black dark:text-white uppercase tracking-tighter flex items-center gap-4 italic leading-none">
                <ExclamationTriangleIcon className="w-7 h-7 md:w-8 md:h-8 text-rose-500" />
                Node Anomalies
              </h2>
              <span className="bg-rose-500/5 text-rose-600 px-4 md:px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-500/10 whitespace-nowrap">Tactical Intervention Required</span>
            </div>

            <div className="space-y-4 md:space-y-6 relative z-10">
              {cogLoadRisk.length > 0 ? (
                cogLoadRisk.slice(0, 5).map((risk, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 10 }}
                    className="flex items-center justify-between p-6 md:p-8 bg-slate-50 dark:bg-dark-950/50 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4 md:gap-8 min-w-0">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl italic shrink-0 shadow-lg">
                        {risk.studentName?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic leading-none mb-2 truncate">{risk.studentName}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono italic opacity-60">Trace: 0x{(risk.studentId?.slice(-6) || "ID").toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl md:text-3xl font-black text-rose-600 tracking-tighter leading-none mb-1 italic">{risk.riskScore}</p>
                      <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Load Index</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-20 md:py-32 bg-emerald-500/5 rounded-[3rem] border-4 border-dashed border-emerald-500/10 text-center">
                  <p className="text-sm font-black text-emerald-600 uppercase tracking-[0.4em] italic mb-2">Matrix Optimized</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest max-w-[200px] mx-auto">Zero anomalies detected in active sector.</p>
                </div>
              )}

              <Link to="/hod/sections" className="flex items-center justify-center gap-2 py-4 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:translate-x-1 transition-all italic mt-4">
                Full Oversight Log <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Side Stack */}
        <div className="lg:col-span-4 flex flex-col gap-8 lg:gap-10">
          <div className="bg-slate-900 rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 text-white shadow-3xl relative overflow-hidden border-t-[12px] md:border-t-[20px] border-emerald-600">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter mb-10 md:mb-12 italic flex items-center gap-4 relative z-10">
              <CpuChipIcon className="w-6 h-6 md:w-7 md:h-7 text-emerald-400" /> Operational Efficiency
            </h3>

            <div className="space-y-8 md:space-y-12 relative z-10">
              {[
                { label: 'Response Velocity', value: efficiency?.interventionResolution?.velocityScore || 0, color: 'emerald' },
                { label: 'Oversight Fluidity', value: efficiency?.instructionalResponsiveness?.turnaroundScore || 0, color: 'sky' },
                { label: 'Resource Density', value: deptOverview?.remedialDensity?.total > 0 ? Math.round((deptOverview.remedialDensity.remedial / deptOverview.remedialDensity.total) * 100) : 0, color: 'amber' },
              ].map((v, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-3">
                    <span className="text-slate-400">{v.label}</span>
                    <span className={`text-${v.color}-400 italic`}>{v.value}%</span>
                  </div>
                  <div className="h-3 md:h-4 w-full bg-white/5 rounded-full overflow-hidden p-0.5 md:p-1 border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${v.value}%` }}
                      transition={{ duration: 1.5, ease: "circOut", delay: i * 0.2 }}
                      className={`h-full bg-gradient-to-r from-${v.color}-600 to-${v.color}-400 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 md:mt-24 p-8 md:p-10 bg-white/5 rounded-[2.5rem] md:rounded-[3rem] border border-white/10 text-center backdrop-blur-md relative z-10">
              <p className="text-6xl md:text-8xl font-black text-white leading-none mb-3 tracking-tighter italic">
                {efficiency?.overallEfficiencyIndex || '0.0'}
              </p>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Quality Factor</p>
              <div className="h-1.5 w-16 md:w-24 bg-emerald-600 mx-auto rounded-full"></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 via-emerald-800 to-slate-900 rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 text-white shadow-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-[100px]"></div>
            <CubeIcon className="w-12 h-12 md:w-16 md:h-16 text-white/20 absolute right-8 top-8 md:right-12 md:top-12 rotate-12" />

            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-4 relative z-10 leading-none">Security <br /><span className="text-emerald-300 italic">Clearance</span></h3>
            <p className="text-[10px] md:text-xs font-medium opacity-70 leading-relaxed uppercase tracking-wide mb-8 md:mb-10 relative z-10">
              Departmental oversight is strictly isolated to the {user.department || 'AUTHORIZED'} segment. Protocol Alpha active.
            </p>

            <Link
              to="/hod/audit-logs"
              className="block w-full py-5 md:py-6 bg-white text-emerald-900 rounded-2xl md:rounded-[2rem] font-black uppercase tracking-widest text-[9px] md:text-[10px] shadow-2xl text-center hover:bg-slate-900 hover:text-white transition-all transform hover:-translate-y-1 relative z-10 italic"
            >
              Full System Audit →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
    </div>
  );
}

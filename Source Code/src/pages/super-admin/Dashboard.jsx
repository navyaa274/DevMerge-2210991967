import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import UniversityDashboard from '../../components/dashboard/UniversityDashboard';
import {
  ShieldCheckIcon,
  AcademicCapIcon,
  ChartBarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import API_BASE_URL from '../../config/api';

export default function SuperAdminDashboard() {
  const { token } = useAuthStore();
  const [universityData, setUniversityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniversityData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/institutional/university/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUniversityData(res.data.data);
      } catch (error) {
        console.error('Error fetching university summary:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUniversityData();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 shadow-xl"></div>
        <p className="mt-6 text-purple-600 font-black uppercase tracking-[0.4em] text-[10px]">Accessing Chancellor's Matrix...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* University Dashboard Component */}
      <UniversityDashboard />

      {/* Super Admin-Specific Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-[1700px] mx-auto font-sans"
      >
      {/* Header - Chancellor's Banner */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
        <div className="w-full xl:w-auto">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="bg-purple-600 text-white p-2 md:p-3 rounded-2xl shadow-xl shadow-purple-500/20 group hover:rotate-12 transition-transform">
              <GlobeAltIcon className="w-6 h-6 md:w-8 md:h-8" />
            </span>
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                Chancellor's <span className="text-purple-600">Cockpit</span>
              </h1>
              <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[9px] md:text-[10px] mt-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                Institutional Intelligence · Sector 01 Active
              </p>
            </div>
          </div>
        </div>
        <div className="w-full xl:w-auto flex gap-4 md:gap-6">
          <div className="bg-white dark:bg-dark-900 px-6 md:px-10 py-6 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 dark:border-dark-800 shadow-3xl flex-1 md:flex-none border-l-[10px] md:border-l-[15px] border-purple-500 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent"></div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2 italic">Global Health Index</p>
              <p className="text-4xl md:text-5xl font-black text-purple-600 leading-none italic tracking-tighter">
                {universityData?.universityAcademicHealth?.academicHealthIndex || '0.0'}
                <span className="text-lg md:text-xl text-slate-300 dark:text-slate-600">/10</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Vital Signs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 mb-12 lg:mb-20">
        {[
          {
            label: 'Critical Rate',
            value: `${universityData?.universityAcademicHealth?.criticalRate}%`,
            sub: 'High Risk Focus Nodes',
            icon: <ExclamationTriangleIcon />,
            color: 'rose'
          },
          {
            label: 'Declining Rate',
            value: `${universityData?.universityAcademicHealth?.decliningRate}%`,
            sub: 'Trend Instability Risk',
            icon: <ChartBarIcon />,
            color: 'amber'
          },
          {
            label: 'Resolution Velocity',
            value: `${universityData?.governanceResponsiveness?.avgResolutionDays}d`,
            sub: 'Mean Intervention Speed',
            icon: <ClockIcon />,
            color: 'indigo'
          },
          {
            label: 'Feedback Cycle',
            value: `${universityData?.governanceResponsiveness?.avgFeedbackHours}h`,
            sub: 'Faculty Turnaround Factor',
            icon: <AcademicCapIcon />,
            color: 'emerald'
          }
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10, scale: 1.02 }}
            className={`bg-white dark:bg-dark-900 p-8 md:p-10 rounded-[3rem] md:rounded-[3.5rem] shadow-2xl border-b-[8px] md:border-b-[12px] border-${stat.color}-500 group relative overflow-hidden transition-all duration-300`}
          >
            <div className={`p-4 bg-${stat.color}-50 dark:bg-${stat.color}-900/10 rounded-2xl w-fit mb-6 text-${stat.color}-600 group-hover:rotate-12 transition-transform duration-500`}>
              {React.cloneElement(stat.icon, { className: "w-7 h-7 md:w-8 md:h-8" })}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none italic">{stat.label}</p>
            <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 italic">{stat.value}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider italic opacity-60">{stat.sub}</p>
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none group-hover:scale-125">
              {React.cloneElement(stat.icon, { className: "w-20 h-20 md:w-24 md:h-24" })}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Department Performance Distribution */}
        <div className="lg:col-span-8 space-y-8 lg:space-y-12">
          <div className="bg-white dark:bg-dark-900 p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] shadow-3xl border border-slate-50 dark:border-dark-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-9xl font-black italic pointer-events-none select-none">HEALTH</div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-10 md:mb-14 flex items-center gap-4 italic relative z-10">
              <ChartBarIcon className="w-8 h-8 text-purple-600" />
              Departmental Health Distribution
            </h2>
            <div className="space-y-8 md:space-y-10 relative z-10">
              {universityData?.departmentDistributions.map((dept, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-8">
                  <div className="w-full sm:w-20 text-center sm:text-left">
                    <p className="text-sm md:text-base font-black text-slate-900 dark:text-white leading-none mb-1 italic">{dept.code}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Sector Node</p>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="h-4 md:h-5 w-full bg-slate-100 dark:bg-dark-950 rounded-full overflow-hidden p-0.5 md:p-1 border border-slate-100 dark:border-dark-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${dept.healthIndex * 10}%` }}
                        transition={{ duration: 1.5, delay: i * 0.1 }}
                        className={`h-full rounded-full shadow-lg transition-colors ${dept.healthIndex > 8 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : (dept.healthIndex > 6 ? 'bg-gradient-to-r from-amber-600 to-amber-400' : 'bg-gradient-to-r from-rose-600 to-rose-400')}`}
                      />
                    </div>
                  </div>
                  <div className="w-full sm:w-24 text-right">
                    <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none italic">{dept.healthIndex}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Quality Factor</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* University-Wide Risk Concentration */}
          <div className="bg-white dark:bg-dark-900 p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] shadow-3xl border border-slate-50 dark:border-dark-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-9xl font-black italic pointer-events-none select-none">RISKS</div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-10 md:mb-14 flex items-center gap-4 italic relative z-10">
              <ExclamationTriangleIcon className="w-8 h-8 text-rose-500" />
              Global Risk Concentration
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 relative z-10">
              {universityData?.topInstitutionalRisks.map((risk, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="p-6 md:p-8 bg-slate-50 dark:bg-dark-950/50 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 flex justify-between items-center group/risk hover:border-rose-500/30 transition-all shadow-sm"
                >
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2 italic truncate">{risk.topic}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{risk.totalFlagged} Anomalies Detected</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-2xl md:text-3xl font-black text-rose-600 leading-none italic">{Math.round(risk.criticalIntensity)}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Intensity</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - System Governance */}
        <div className="lg:col-span-4 flex flex-col gap-8 lg:gap-12">
          <div className="bg-white dark:bg-dark-900 p-8 md:p-12 rounded-[3.5rem] md:rounded-[4.5rem] shadow-3xl border border-purple-100 dark:border-purple-900/20 relative overflow-hidden group">
            <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-12 bg-purple-600 dark:bg-purple-900/40 text-white p-4 rounded-3xl border border-purple-500/20 text-center italic shadow-xl shadow-purple-600/10">Cognitive Distribution</h2>

            <div className="flex justify-center mb-12 py-6 relative">
              <div className="relative w-48 h-48 md:w-56 md:h-56">
                {/* Simplified Donut Representation */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="50%" cy="50%" r="40%" stroke="#f1f5f9" strokeWidth="12%" fill="transparent" className="dark:stroke-dark-950" />
                  <motion.circle
                    cx="50%" cy="50%" r="40%" stroke="#10b981" strokeWidth="12%" fill="transparent"
                    strokeDasharray="502"
                    strokeDashoffset={502 - (502 * (universityData?.cognitiveDistribution?.normal || 0)) / 100}
                    transition={{ duration: 2, ease: "circOut" }}
                    strokeLinecap="round"
                    className="shadow-2xl"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-none italic tracking-tighter">{universityData?.cognitiveDistribution?.normal}%</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Stability</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              {[
                { label: 'Normal Node Status', value: universityData?.cognitiveDistribution?.normal, color: 'bg-emerald-500 shadow-emerald-500/30' },
                { label: 'Remedial Intervention', value: universityData?.cognitiveDistribution?.remedial, color: 'bg-rose-500 shadow-rose-500/30' },
                { label: 'Accelerated Stream', value: universityData?.cognitiveDistribution?.accelerated, color: 'bg-indigo-500 shadow-indigo-500/30' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-dark-950/50 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-dark-800 hover:border-purple-500/20 transition-all">
                  <div className="flex items-center gap-4">
                    <span className={`w-3 h-3 rounded-full ${item.color} shadow-lg`}></span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{item.label}</span>
                  </div>
                  <span className="text-xs md:text-sm font-black text-slate-900 dark:text-white tracking-tighter italic">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Governance Index Button */}
          <div className="bg-slate-900 rounded-[3rem] md:rounded-[4rem] p-8 md:p-12 text-white shadow-3xl relative overflow-hidden group border-t-[12px] md:border-t-[20px] border-indigo-600">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full -mr-40 -mt-40 blur-[100px]"></div>
            <p className="text-[10px] md:text-[11px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6 md:mb-10 text-center italic relative z-10">Governance Effectiveness Index</p>
            <div className="text-center mb-10 md:mb-12 relative z-10">
              <p className="text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-none italic underline bg-indigo-600/5 decoration-indigo-500 decoration-dotted underline-offset-[12px] md:underline-offset-[20px]">
                {universityData?.governanceResponsiveness?.governanceIndex || '0.0'}
              </p>
            </div>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 text-center leading-relaxed uppercase tracking-tight relative z-10 max-w-[280px] mx-auto opacity-70">
              {parseFloat(universityData?.governanceResponsiveness?.governanceIndex) >= 8 ? 'Cross-departmental response velocity within the institutional matrix is currently indexed as optimal.' :
                parseFloat(universityData?.governanceResponsiveness?.governanceIndex) >= 5 ? 'Institutional response velocity shows moderate latency but remains within operational parameters.' :
                  'Critical response delay detected in institutional matrix. Governance intervention recommended.'}
            </p>
            <Link
              to="/super-admin/compliance-report"
              className="w-full mt-12 md:mt-16 py-6 bg-white text-indigo-900 rounded-[2rem] font-black uppercase tracking-widest text-[10px] md:text-[11px] hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-2 shadow-2xl relative z-10 italic flex items-center justify-center"
            >
              Full Compliance Report →
            </Link>
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  );
}

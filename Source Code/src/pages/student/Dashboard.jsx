import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CountUp from "react-countup";

import {
  CpuChipIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  SignalIcon,
  CommandLineIcon,
  ArrowRightIcon,
  SparklesIcon,
  TrophyIcon,
  BoltIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline";

import { useAuthStore } from "../../store/authStore";
import studentService from "../../services/api/studentService";
import analyticsService from "../../services/api/analyticsService";
import weaknessService from "../../services/api/weaknessService";
import labService from "../../services/api/labService";

import Leaderboard from "../../components/Gamification/Leaderboard";
import Badges from "../../components/Gamification/Badges";
import Points from "../../components/Gamification/Points";
import UniversityDashboard from "../../components/dashboard/UniversityDashboard";

const STAT_CARDS = [
  { label: "Academic Standing", key: "level", icon: AcademicCapIcon, color: "text-indigo-600" },
  { label: "Predicted Score", key: "score", icon: SignalIcon, color: "text-emerald-600" },
  { label: "Cognitive Gaps", key: "gaps", icon: ChartBarIcon, color: "text-rose-600" },
  { label: "Curriculum Flow", key: "performance", icon: CpuChipIcon, color: "text-amber-600" }
];

const QUICK_ACTIONS = [
  { name: "Problems", path: "/problems", icon: CommandLineIcon, color: "bg-indigo-500" },
  { name: "AI Tutor", path: "/student/ai-tutor", icon: SparklesIcon, color: "bg-violet-500" },
  { name: "Labs", path: "/student/labs", icon: AcademicCapIcon, color: "bg-emerald-500" },
  { name: "Predict", path: "/student/predictive", icon: SignalIcon, color: "bg-rose-500" },
  { name: "Portfolio", path: "/student/developer-portfolio", icon: RocketLaunchIcon, color: "bg-amber-500" }
];

export default function StudentDashboard() {
  const { user } = useAuthStore();

  const [stats, setStats] = useState({});
  const [prediction, setPrediction] = useState({});
  const [weakness, setWeakness] = useState({});
  const [courses, setCourses] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [
        profile,
        predict,
        weak,
        labData
      ] = await Promise.all([
        studentService.getProfileOverview(),
        analyticsService.getPerformancePrediction(user.id),
        weaknessService.getDiagnosis(user.id),
        labService.getSuggestedLabs()
      ]);

      setStats(profile.data);
      setCourses(profile.data.enrolledCourses || []);
      setPrediction(predict);
      setWeakness(weak.analysis);
      setLabs(labData.data || []);
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  const statValues = useMemo(() => ({
    level: prediction?.prediction?.level || "Active",
    score: prediction?.prediction?.predictedExamScore || 0,
    gaps: weakness?.weakTopicsCount || 0,
    performance: stats?.performance?.curriculumCompletion || 0
  }), [prediction, weakness, stats]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-[#020617]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 shadow-xl"></div>
          <p className="mt-6 text-indigo-600 font-black uppercase tracking-[0.4em] text-[10px]">Synchronizing Student Node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* University Dashboard Component */}
      <UniversityDashboard />

      {/* Student-Specific Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Academic Performance Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8"
          >
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">
              Academic Performance
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {STAT_CARDS.map((stat) => (
                <div key={stat.key} className="text-center">
                  <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                  <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                    {typeof statValues[stat.key] === 'number' ? (
                      <CountUp end={statValues[stat.key]} duration={2} />
                    ) : (
                      statValues[stat.key]
                    )}
                  </p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8"
          >
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.name}
                  to={action.path}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-[0.2em] text-center">
                    {action.name}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Enrolled Courses */}
          {courses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8"
            >
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter">
                Enrolled Courses
              </h2>
              <div className="space-y-4">
                {courses.slice(0, 3).map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{course.name}</h3>
                      <p className="text-sm text-slate-500">{course.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-indigo-600">{course.credits} credits</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar - Gamification */}
        <div className="space-y-8">
          <Badges />
          <Points />
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}

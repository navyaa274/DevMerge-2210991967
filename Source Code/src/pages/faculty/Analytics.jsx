import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import axios from "axios";
import API_BASE_URL from "../../config/api";
import { motion } from "framer-motion";
import MainLayout from "../../components/layout/MainLayout";

import {
  ChartBarIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ClockIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  TrophyIcon,
  CpuChipIcon,
  ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";

export default function FacultyAnalytics() {
  const { token, user } = useAuthStore();

  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [timeRange, setTimeRange] = useState("semester");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedCourse, timeRange]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchAnalytics()]);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/analytics/faculty?course=${selectedCourse}&range=${timeRange}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const data = response?.data?.data ?? response?.data ?? null;

      if (data?.gradeDistribution) {
        data.gradeDistribution = data.gradeDistribution.map((item) => ({
          ...item,
          range: item.range?.includes("%") ? item.range : `${item.range}%`
        }));
      }

      setAnalytics(data);

    } catch (error) {
      console.error("Analytics fetch error:", error);
      setAnalytics(null);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allCourses = response?.data?.data || response?.data?.courses || [];
      const facultyId = user?.id || user?._id;

      const mine = allCourses.filter((course) => {
        const facultyIds = course?.facultyIds || [];
        return facultyIds.some(
          (f) => (f?._id || f)?.toString() === facultyId?.toString()
        );
      });

      setCourses(mine);
    } catch (error) {
      console.error("Course fetch error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="flex flex-col items-center">
          <CpuChipIcon className="w-10 h-10 text-indigo-500 animate-pulse" />
          <p className="mt-4 text-indigo-400 text-xs uppercase tracking-widest">
            Loading Analytics...
          </p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center text-slate-400">
          No analytics data available.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-[1600px] mx-auto pt-28 px-6 pb-20 text-slate-300"
      >
        {/* HEADER */}
        <div className="flex flex-col xl:flex-row justify-between gap-8 mb-16">

          <h1 className="text-6xl font-black text-white">
            Sector <span className="text-indigo-500">Analytics</span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-4">

            {/* COURSE FILTER */}
            <div className="relative flex items-center bg-[#0f172a] border border-white/10 rounded-xl">
              <BookOpenIcon className="absolute left-3 w-5 h-5 text-slate-400" />

              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="pl-10 pr-6 py-3 bg-transparent text-white text-sm outline-none"
              >
                <option value="all">All Courses</option>

                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {/* RANGE FILTER */}
            <div className="relative flex items-center bg-[#0f172a] border border-white/10 rounded-xl">
              <ClockIcon className="absolute left-3 w-5 h-5 text-slate-400" />

              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="pl-10 pr-6 py-3 bg-transparent text-white text-sm outline-none"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="semester">Semester</option>
                <option value="year">Year</option>
              </select>
            </div>

          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">

          {[
            {
              label: "Students",
              value: analytics?.totalStudents,
              icon: <UserGroupIcon className="w-6 h-6" />
            },
            {
              label: "Courses",
              value: analytics?.activeCourses,
              icon: <AcademicCapIcon className="w-6 h-6" />
            },
            {
              label: "Assignments",
              value: analytics?.totalAssignments,
              icon: <ClipboardDocumentCheckIcon className="w-6 h-6" />
            },
            {
              label: "Average Grade",
              value: `${analytics?.averageGrade ?? 0}%`,
              icon: <ChartBarIcon className="w-6 h-6" />
            }
          ].map((stat, i) => (

            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="bg-[#0f172a] border border-white/10 p-8 rounded-3xl"
            >
              <div className="flex justify-between mb-4 text-indigo-400">
                {stat.icon}
                <ArrowTrendingUpIcon className="w-5 h-5 opacity-40" />
              </div>

              <p className="text-slate-400 text-xs uppercase">
                {stat.label}
              </p>

              <h2 className="text-4xl font-bold text-white">
                {stat.value ?? 0}
              </h2>

            </motion.div>
          ))}
        </div>

        {/* TOP STUDENTS */}
        <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-10">

          <div className="flex items-center gap-4 mb-8">
            <TrophyIcon className="w-6 h-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-white">
              Top Students
            </h2>
          </div>

          <div className="space-y-4">

            {analytics?.topStudents?.length ? (
              analytics.topStudents.map((student, index) => (

                <div
                  key={student._id || index}
                  className="flex justify-between items-center bg-white/5 p-4 rounded-xl"
                >
                  <span>{student.name}</span>

                  <span className="text-indigo-400 font-bold">
                    {student.averageGrade}%
                  </span>

                </div>

              ))
            ) : (

              <p className="text-slate-400 text-sm">
                No student performance data available.
              </p>

            )}

          </div>
        </div>

      </motion.div>
    </MainLayout>
  );
}
import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { 
    ChartBarIcon, 
    UserGroupIcon, 
    AcademicCapIcon, 
    ClockIcon,
    ArrowTrendingUpIcon,
    FunnelIcon,
    ArrowPathIcon,
    DevicePhoneMobileIcon,
    ComputerDesktopIcon
} from '@heroicons/react/24/outline';

// Sample data for charts
const userActivityData = [
  { month: 'Jan', activeUsers: 1200, newUsers: 300, sessions: 4500 },
  { month: 'Feb', activeUsers: 1350, newUsers: 280, sessions: 4800 },
  { month: 'Mar', activeUsers: 1500, newUsers: 350, sessions: 5200 },
  { month: 'Apr', activeUsers: 1650, newUsers: 320, sessions: 5500 },
  { month: 'May', activeUsers: 1800, newUsers: 400, sessions: 5800 },
  { month: 'Jun', activeUsers: 1950, newUsers: 380, sessions: 6100 }
];

const coursePerformanceData = [
  { course: 'Data Structures', completion: 85, enrollment: 120, avgScore: 78 },
  { course: 'Algorithms', completion: 78, enrollment: 95, avgScore: 82 },
  { course: 'Web Development', completion: 92, enrollment: 150, avgScore: 88 },
  { course: 'Machine Learning', completion: 70, enrollment: 80, avgScore: 75 },
  { course: 'Database Systems', completion: 88, enrollment: 110, avgScore: 85 }
];

const deviceUsageData = [
  { name: 'Desktop', value: 45, color: '#6366f1' },
  { name: 'Mobile', value: 35, color: '#10b981' },
  { name: 'Tablet', value: 20, color: '#f59e0b' }
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6'];

const AdvancedAnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('users');

  useEffect(() => {
    // Fetch real data from API
  }, [timeRange, selectedMetric]);

  return (
    <div className="advanced-analytics-dashboard p-4 md:p-8 lg:p-12 bg-white dark:bg-[#020617] min-h-screen pt-20 md:pt-24 font-sans transition-colors duration-300">
      <div className="max-w-[1700px] mx-auto">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
            <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                    Advanced <span className="text-indigo-600">Analytics</span>
                </h1>
                <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2">
                    <ChartBarIcon className="w-4 h-4 text-indigo-500" />
                    Global Intelligence & Institutional Performance Matrix
                </p>
            </div>

            <div className="flex flex-wrap gap-4 w-full xl:w-auto">
                <div className="relative flex-1 xl:w-64 group">
                    <FunnelIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="w-full pl-14 pr-10 py-4 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none transition-all"
                    >
                        <option value="7days">Temporal: 7 Days</option>
                        <option value="30days">Temporal: 30 Days</option>
                        <option value="6months">Temporal: 6 Months</option>
                        <option value="1year">Temporal: 1 Year</option>
                    </select>
                </div>
                <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3">
                    <ArrowPathIcon className="w-4 h-4" />
                    Sync Matrix
                </button>
            </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
                { label: 'Total Entities', value: '12,456', change: '+12%', color: 'text-indigo-600', icon: UserGroupIcon },
                { label: 'Active Modules', value: '247', change: '+8%', color: 'text-emerald-600', icon: AcademicCapIcon },
                { label: 'Success Rate', value: '78%', change: '+3%', color: 'text-amber-600', icon: ChartBarIcon },
                { label: 'Mean Latency', value: '24ms', change: '-5%', color: 'text-rose-600', icon: ClockIcon },
            ].map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 shadow-xl group hover:border-indigo-500/50 transition-all"
                >
                    <div className="flex justify-between items-start mb-6">
                        <stat.icon className={`w-8 h-8 ${stat.color}`} />
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">{stat.change}</span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
                </motion.div>
            ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* User Activity Trend */}
          <div className="bg-white dark:bg-dark-900 p-8 md:p-12 rounded-[3rem] border border-slate-100 dark:border-dark-800 shadow-3xl">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Activity Pulse</h2>
                <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userActivityData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-dark-800" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '1rem', color: '#fff' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}
                  />
                  <Area type="monotone" dataKey="activeUsers" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="newUsers" stroke="#10b981" strokeWidth={4} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Course Performance */}
          <div className="bg-white dark:bg-dark-900 p-8 md:p-12 rounded-[3rem] border border-slate-100 dark:border-dark-800 shadow-3xl">
            <h2 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white mb-10">Department Performance</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={coursePerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" className="dark:stroke-dark-800" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="course" type="category" width={120} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8', textTransform: 'uppercase' }} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '1rem', color: '#fff' }}
                  />
                  <Bar dataKey="completion" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Device & Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-dark-900 p-8 md:p-12 rounded-[3rem] border border-slate-100 dark:border-dark-800 shadow-3xl">
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white mb-10">Interface Distribution</h2>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={deviceUsageData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {deviceUsageData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '1rem', color: '#fff' }}
                            />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-900 p-8 md:p-12 rounded-[3rem] border border-slate-100 dark:border-dark-800 shadow-3xl">
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white mb-10">Engagement Depth</h2>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={userActivityData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-dark-800" />
                            <XAxis dataKey="month" hide />
                            <YAxis hide />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '1rem', color: '#fff' }}
                            />
                            <Area type="step" dataKey="sessions" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Detailed Analytics Table */}
        <div className="bg-white dark:bg-dark-900 rounded-[3rem] border border-slate-100 dark:border-dark-800 shadow-3xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center">
                <h2 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Telemetry Log</h2>
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Export Full Dataset</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-dark-800/50">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Metric Vector</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Node</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Previous Node</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Delta</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-dark-800">
                        {[
                            { metric: 'Total Users', current: '12,456', prev: '11,123', delta: '+12%', status: 'Optimal' },
                            { metric: 'Course Completions', current: '8,945', prev: '8,234', delta: '+9%', status: 'Optimal' },
                            { metric: 'Average Score', current: '82.5%', prev: '81.2%', delta: '+1.3%', status: 'Stable' },
                            { metric: 'Session Duration', current: '24m 32s', prev: '23m 15s', delta: '+5%', status: 'Optimal' },
                        ].map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors group">
                                <td className="px-8 py-6 font-black text-slate-900 dark:text-white uppercase tracking-tighter">{row.metric}</td>
                                <td className="px-8 py-6 font-bold text-slate-600 dark:text-slate-400">{row.current}</td>
                                <td className="px-8 py-6 font-bold text-slate-600 dark:text-slate-400">{row.prev}</td>
                                <td className="px-8 py-6 text-emerald-500 font-black italic">{row.delta}</td>
                                <td className="px-8 py-6">
                                    <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full">{row.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;

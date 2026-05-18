import React from 'react';
import { motion } from 'framer-motion';
import { 
    FaceSmileIcon, 
    ChatBubbleLeftEllipsisIcon, 
    HeartIcon,
    ArrowTrendingUpIcon,
    ExclamationCircleIcon,
    UserGroupIcon
} from '@heroicons/react/24/outline';

export default function SentimentAnalyzer() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 md:p-8 lg:p-12 max-w-[1700px] mx-auto min-h-screen pt-20 md:pt-24 font-sans"
        >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
                <div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                        Sentiment <span className="text-pink-500">Analyzer</span>
                    </h1>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2">
                        <FaceSmileIcon className="w-4 h-4 text-pink-500" />
                        Departmental Pulse & Student Satisfaction Neural Map
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-pink-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-700 transition-all shadow-xl shadow-pink-600/20">
                        Generate Pulse Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                    { label: 'Overall Satisfaction', value: '8.4/10', icon: HeartIcon, color: 'text-pink-500' },
                    { label: 'Positive Feedback', value: '92%', icon: FaceSmileIcon, color: 'text-emerald-500' },
                    { label: 'Active Discussions', value: '450+', icon: ChatBubbleLeftEllipsisIcon, color: 'text-indigo-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 shadow-xl">
                        <stat.icon className={`w-10 h-10 ${stat.color} mb-6`} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-8 md:p-12 shadow-3xl border border-slate-100 dark:border-dark-800">
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white mb-8">Sentiment Trends</h2>
                    <div className="space-y-6">
                        {[
                            { topic: 'Course Content', score: 88, status: 'Positive' },
                            { topic: 'Lab Facilities', score: 42, status: 'Concerning' },
                            { topic: 'Faculty Support', score: 76, status: 'Neutral' },
                            { topic: 'Campus Life', score: 94, status: 'Excellent' },
                        ].map((trend, i) => (                    <div key={i} className="group cursor-pointer">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{trend.topic}</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                                        trend.status === 'Excellent' ? 'text-emerald-500' :
                                        trend.status === 'Positive' ? 'text-indigo-500' :
                                        trend.status === 'Neutral' ? 'text-amber-500' :
                                        'text-rose-500'
                                    }`}>{trend.status}</span>
                                </div>
                                <div className="h-2 bg-slate-50 dark:bg-dark-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${trend.score > 80 ? 'bg-emerald-500' : trend.score > 60 ? 'bg-indigo-500' : trend.score > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                        style={{ width: `${trend.score}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-pink-900 p-10 rounded-[3rem] text-white shadow-3xl relative overflow-hidden group">
                        <UserGroupIcon className="w-16 h-16 text-pink-400 mb-8 opacity-50 group-hover:scale-110 transition-transform" />
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4 leading-none">AI-Powered<br/>Pulse</h2>
                        <p className="text-pink-100 text-sm font-medium mb-8">Copilot analyzes forum discussions and feedback submissions to detect shifts in departmental morale in real-time.</p>
                        <button className="w-full py-4 bg-white text-pink-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-pink-50 transition-all">
                            View Detailed Analysis
                        </button>
                    </div>

                    <div className="bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 shadow-xl border-l-4 border-l-rose-500">
                        <div className="flex items-center gap-4 mb-4">
                            <ExclamationCircleIcon className="w-6 h-6 text-rose-500" />
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Anomaly Detected</h3>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Sudden drop in sentiment regarding "Lab Infrastructure" in the last 48 hours. Recommend immediate equipment audit.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

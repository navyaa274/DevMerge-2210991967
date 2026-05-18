import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    ShieldCheckIcon, 
    ExclamationTriangleIcon, 
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    FingerPrintIcon
} from '@heroicons/react/24/outline';

const heatmapData = [
    { id: 1, department: 'CS', student: 'A. Smith', similarity: 85, status: 'High Risk', flag: 'Structural' },
    { id: 2, department: 'ECE', student: 'B. Johnson', similarity: 45, status: 'Low Risk', flag: 'Minor' },
    { id: 3, department: 'ME', student: 'C. Williams', similarity: 92, status: 'Critical', flag: 'Logic Clone' },
    { id: 4, department: 'CS', student: 'D. Brown', similarity: 12, status: 'Safe', flag: 'Unique' },
    { id: 5, department: 'CS', student: 'E. Jones', similarity: 78, status: 'Risk', flag: 'Structural' },
];

export default function IntegrityHeatmap() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-8 md:p-8 lg:p-12 max-w-[1700px] mx-auto min-h-screen pt-20 md:pt-24 font-sans"
        >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
                <div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                        Integrity <span className="text-rose-600">Command</span>
                    </h1>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2">
                        <FingerPrintIcon className="w-4 h-4 text-rose-500" />
                        System-Wide Plagiarism & Anomaly Heatmap
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 xl:w-80 group">
                        <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="TRACE STUDENT OR REPOSITORY..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                        />
                    </div>
                    <button className="px-8 py-4 bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-dark-800 transition-all flex items-center gap-3">
                        <FunnelIcon className="w-4 h-4" />
                        Matrix Filter
                    </button>
                    <button className="px-8 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 flex items-center gap-3">
                        <ArrowPathIcon className="w-4 h-4" />
                        Sync Neural Map
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Total Scans', value: '45,201', color: 'text-indigo-600', icon: ShieldCheckIcon },
                    { label: 'Critical Flags', value: '128', color: 'text-rose-600', icon: ExclamationTriangleIcon },
                    { label: 'Neural Accuracy', value: '99.4%', color: 'text-emerald-600', icon: FingerPrintIcon },
                    { label: 'Mean Similarity', value: '14.2%', color: 'text-amber-600', icon: ShieldCheckIcon },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white dark:bg-dark-900 p-8 rounded-[2rem] border border-slate-100 dark:border-dark-800 shadow-xl"
                    >
                        <stat.icon className={`w-8 h-8 ${stat.color} mb-6`} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white dark:bg-dark-900 rounded-[3rem] border border-slate-100 dark:border-dark-800 shadow-3xl overflow-hidden">
                <div className="p-8 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center">
                    <h2 className="text-xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">Detection Log</h2>
                    <span className="px-4 py-1.5 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-full">Live Feed Active</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-dark-800/50">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Entity</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Dept</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Similarity</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Risk Profile</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-dark-800">
                            {heatmapData.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 dark:bg-dark-800 rounded-xl flex items-center justify-center font-black text-slate-400 uppercase italic">
                                                {item.student.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{item.student}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.department}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 w-24 bg-slate-100 dark:bg-dark-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full ${item.similarity > 70 ? 'bg-rose-500' : item.similarity > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${item.similarity}%` }}
                                                />
                                            </div>
                                            <span className="font-black text-[10px] text-slate-900 dark:text-white">{item.similarity}%</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            item.status === 'Critical' ? 'bg-rose-500 text-white' :
                                            item.status === 'High Risk' ? 'bg-rose-500/10 text-rose-500' :
                                            item.status === 'Risk' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-emerald-500/10 text-emerald-500'
                                        }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button className="px-6 py-2 border border-slate-100 dark:border-dark-800 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all">
                                            Inspect Code
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}

import React from 'react';
import { motion } from 'framer-motion';
import { 
    CpuChipIcon, 
    BoltIcon, 
    ServerIcon,
    Battery50Icon,
    CubeIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function ResourceOptimizer() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 md:p-8 lg:p-12 max-w-[1700px] mx-auto min-h-screen pt-20 md:pt-24 font-sans"
        >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
                <div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                        Resource <span className="text-indigo-500">Optimizer</span>
                    </h1>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2">
                        <CpuChipIcon className="w-4 h-4 text-indigo-500" />
                        Infrastructure & Computational Efficiency Matrix
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">
                        Balance Load
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'CPU Utilization', value: '68%', icon: BoltIcon, color: 'text-amber-500' },
                    { label: 'Cloud Spend', value: '$1.2k', icon: ServerIcon, color: 'text-indigo-500' },
                    { label: 'Lab Uptime', value: '99.9%', icon: Battery50Icon, color: 'text-emerald-500' },
                    { label: 'Idle Nodes', value: '12', icon: CubeIcon, color: 'text-slate-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-dark-900 p-8 rounded-[2rem] border border-slate-100 dark:border-dark-800 shadow-xl">
                        <stat.icon className={`w-8 h-8 ${stat.color} mb-6`} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-8 md:p-12 shadow-3xl border border-slate-100 dark:border-dark-800">
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white mb-8">System Health</h2>
                    <div className="space-y-6">
                        <div className="p-6 bg-slate-50 dark:bg-dark-800/50 rounded-2xl border border-slate-100 dark:border-dark-800">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">Compiler Farm</span>
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Optimal</span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-dark-700 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: '85%' }} />
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-dark-800/50 rounded-2xl border border-slate-100 dark:border-dark-800">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">GPU Cluster</span>
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">High Load</span>
                            </div>
                            <div className="h-2 bg-slate-200 dark:bg-dark-700 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500" style={{ width: '92%' }} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-900 p-10 rounded-[3rem] text-white shadow-3xl relative overflow-hidden group">
                    <ArrowTrendingUpIcon className="w-16 h-16 text-indigo-400 mb-8 opacity-50 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                    <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4 leading-none">Cost Optimization<br/>Algorithm</h2>
                    <p className="text-indigo-100 text-sm font-medium mb-8">Neural balancing engine has identified 15% potential savings by re-routing non-critical compute to off-peak hours.</p>
                    <button className="w-full py-4 bg-white text-indigo-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all">
                        Execute Optimization
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

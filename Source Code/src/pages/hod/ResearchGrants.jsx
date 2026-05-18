import React from 'react';
import { motion } from 'framer-motion';
import { 
    BanknotesIcon, 
    BeakerIcon, 
    AcademicCapIcon,
    DocumentTextIcon,
    ArrowUpRightIcon,
    PresentationChartLineIcon
} from '@heroicons/react/24/outline';

export default function ResearchGrants() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 md:p-8 lg:p-12 max-w-[1700px] mx-auto min-h-screen pt-20 md:pt-24 font-sans"
        >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
                <div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                        Research <span className="text-indigo-600">Grants</span>
                    </h1>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2">
                        <BanknotesIcon className="w-4 h-4 text-indigo-500" />
                        Institutional Funding & Research Lifecycle Management
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20">
                        New Grant Proposal
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                    { label: 'Active Grants', value: '24', icon: BeakerIcon, color: 'text-indigo-500' },
                    { label: 'Total Funding', value: '$8.2M', icon: BanknotesIcon, color: 'text-emerald-500' },
                    { label: 'Proposals Pending', value: '12', icon: DocumentTextIcon, color: 'text-amber-500' },
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
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white mb-8">Major Active Grants</h2>
                    <div className="space-y-6">
                        {[
                            { title: 'Neural Ethics in Higher Ed', agency: 'NSF', amount: '$1.2M', lead: 'Dr. Aris' },
                            { title: 'Quantum Error Correction', agency: 'DARPA', amount: '$3.5M', lead: 'Dr. Thorne' },
                            { title: 'Sustainable AI Infrastructure', agency: 'IEEE', amount: '$450k', lead: 'Dr. Chen' },
                        ].map((grant, i) => (
                            <div key={i} className="p-6 bg-slate-50 dark:bg-dark-800/50 rounded-2xl border border-slate-100 dark:border-dark-800 group hover:border-indigo-500 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{grant.title}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{grant.agency} • Lead: {grant.lead}</p>
                                    </div>
                                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">{grant.amount}</span>
                                </div>
                                <div className="flex gap-4">
                                    <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 flex items-center gap-2">
                                        View Details <ArrowUpRightIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-3xl relative overflow-hidden group">
                        <PresentationChartLineIcon className="w-16 h-16 text-indigo-400 mb-8 opacity-30 group-hover:scale-110 transition-transform" />
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4 leading-none">Funding<br/>Analytics</h2>
                        <p className="text-slate-400 text-sm font-medium mb-8">Department funding has grown by 22% year-over-year. Projected Q4 target is $10M.</p>
                        <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
                            Open Analytics Suite
                        </button>
                    </div>

                    <div className="bg-white dark:bg-dark-900 p-10 rounded-[3rem] border border-slate-100 dark:border-dark-800 shadow-xl">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Upcoming Deadlines</h3>
                        <div className="space-y-6">
                            {[
                                { event: 'NIH Research Draft', date: 'Oct 12' },
                                { event: 'Quarterly Grant Audit', date: 'Oct 25' },
                                { event: 'EU Innovation Fund', date: 'Nov 05' },
                            ].map((d, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">{d.event}</span>
                                    <span className="px-4 py-1.5 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-full">{d.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

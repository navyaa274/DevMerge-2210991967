import React from 'react';
import { motion } from 'framer-motion';
import { 
    ScaleIcon, 
    ShieldExclamationIcon, 
    DocumentCheckIcon,
    PencilSquareIcon,
    ExclamationCircleIcon,
    LockClosedIcon
} from '@heroicons/react/24/outline';

export default function PolicyEngine() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 md:p-8 lg:p-12 max-w-[1700px] mx-auto min-h-screen pt-20 md:pt-24 font-sans"
        >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
                <div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                        Policy <span className="text-rose-600">Engine</span>
                    </h1>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2">
                        <ScaleIcon className="w-4 h-4 text-rose-500" />
                        Governance, Compliance & Academic Integrity Protocols
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20">
                        Draft New Policy
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-dark-900 rounded-[3rem] p-8 md:p-12 shadow-3xl border border-slate-100 dark:border-dark-800">
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white mb-8">Active Protocols</h2>
                        <div className="space-y-4">
                            {[
                                { title: 'AI Usage Policy', status: 'Enforced', version: 'v2.4', type: 'Academic' },
                                { title: 'Plagiarism Thresholds', status: 'Review Required', version: 'v1.1', type: 'Integrity' },
                                { title: 'Remote Exam Protocol', status: 'Enforced', version: 'v3.0', type: 'Assessment' },
                                { title: 'Data Privacy Standard', status: 'Enforced', version: 'v1.0', type: 'Compliance' },
                            ].map((policy, i) => (
                                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-dark-800/50 rounded-2xl border border-slate-100 dark:border-dark-800 group hover:border-rose-500 transition-all cursor-pointer">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-white dark:bg-dark-900 rounded-xl flex items-center justify-center">
                                            <DocumentCheckIcon className="w-6 h-6 text-slate-400 group-hover:text-rose-500" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">{policy.title}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{policy.type} • {policy.version}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            policy.status === 'Enforced' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                        }`}>
                                            {policy.status}
                                        </span>
                                        <PencilSquareIcon className="w-5 h-5 text-slate-400 hover:text-rose-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-dark-800 shadow-xl border-l-4 border-l-amber-500">
                        <div className="flex items-center gap-4 mb-6">
                            <ShieldExclamationIcon className="w-8 h-8 text-amber-500" />
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Compliance Alert</h3>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">Recent updates to National Academic Guidelines require a revision of the 'Remote Exam Protocol' by the end of this month.</p>
                        <button className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline">
                            Start Revision Audit →
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-rose-900 p-10 rounded-[3rem] text-white shadow-3xl relative overflow-hidden group">
                        <LockClosedIcon className="w-16 h-16 text-rose-400 mb-8 opacity-50 group-hover:rotate-12 transition-transform" />
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4 leading-none">Smart<br/>Enforcement</h2>
                        <p className="text-rose-100 text-sm font-medium mb-8">The policy engine automatically propagates updates to all relevant course modules and assessment interfaces.</p>
                        <button className="w-full py-4 bg-white text-rose-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-all">
                            Verify Propagations
                        </button>
                    </div>

                    <div className="bg-white dark:bg-dark-900 p-10 rounded-[3rem] border border-slate-100 dark:border-dark-800 shadow-xl">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Policy Reach</h3>
                        <div className="space-y-8">
                            {[
                                { label: 'Faculty Compliance', val: '94%' },
                                { label: 'Student Awareness', val: '82%' },
                                { label: 'Automated Audits', val: '100%' },
                            ].map((s, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                        <span className="text-slate-900 dark:text-white">{s.label}</span>
                                        <span className="text-rose-500">{s.val}</span>
                                    </div>
                                    <div className="h-1 bg-slate-100 dark:bg-dark-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500" style={{ width: s.val }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

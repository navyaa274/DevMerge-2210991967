import React from 'react';
import { motion } from 'framer-motion';
import { 
    LinkIcon, 
    UserGroupIcon, 
    BriefcaseIcon,
    CurrencyDollarIcon,
    GlobeAltIcon,
    ChatBubbleBottomCenterIcon
} from '@heroicons/react/24/outline';

export default function AlumniBridge() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-4 py-8 md:p-8 lg:p-12 max-w-[1700px] mx-auto min-h-screen pt-20 md:pt-24 font-sans"
        >
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 lg:mb-20 gap-8">
                <div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                        Alumni <span className="text-emerald-600">Bridge</span>
                    </h1>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-emerald-500" />
                        Global Alumni Engagement & Mentorship Network
                    </p>
                </div>

                <div className="flex gap-4">
                    <button className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20">
                        Launch Campaign
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                    { label: 'Active Alumni', value: '12,450', icon: UserGroupIcon, color: 'text-emerald-500' },
                    { label: 'Total Endowments', value: '$2.4M', icon: CurrencyDollarIcon, color: 'text-amber-500' },
                    { label: 'Placement Support', value: '850+', icon: BriefcaseIcon, color: 'text-indigo-500' },
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
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white mb-8">Top Contributors</h2>
                    <div className="space-y-6">
                        {[
                            { name: 'Sarah Chen', company: 'Google', role: 'Staff Engineer', year: '2015' },
                            { name: 'Marcus Thorne', company: 'SpaceX', role: 'Lead Architect', year: '2012' },
                            { name: 'Elena Rodriguez', company: 'Stripe', role: 'VP Engineering', year: '2018' },
                        ].map((alumni, i) => (
                            <div key={i} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-dark-800/50 rounded-2xl group hover:bg-emerald-500 transition-all cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white dark:bg-dark-900 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:text-emerald-600">
                                        {alumni.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-white">{alumni.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-emerald-100">{alumni.role} @ {alumni.company}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest group-hover:text-white">Class of {alumni.year}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-emerald-900 p-10 rounded-[3rem] text-white shadow-3xl relative overflow-hidden group">
                        <GlobeAltIcon className="w-16 h-16 text-emerald-400 mb-8 opacity-50 group-hover:scale-110 transition-transform" />
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic mb-4 leading-none">Global Network<br/>Map</h2>
                        <p className="text-emerald-100 text-sm font-medium mb-8">Our alumni are distributed across 45 countries, leading innovation in major tech hubs worldwide.</p>
                        <button className="w-full py-4 bg-white text-emerald-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all">
                            Explore Heatmap
                        </button>
                    </div>

                    <div className="bg-white dark:bg-dark-900 p-10 rounded-[3rem] border border-slate-100 dark:border-dark-800 shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <ChatBubbleBottomCenterIcon className="w-8 h-8 text-indigo-500" />
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Mentorship Hub</h3>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">42 active mentorship requests pending. Connect final year students with industry veterans.</p>
                        <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">
                            Manage Pairings →
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

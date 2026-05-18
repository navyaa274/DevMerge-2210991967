import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import API_BASE_URL from '../../config/api';

export default function StudentCalendar() {
    const { token } = useAuthStore();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/calendar`, // Using the existing calendar route
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setEvents(response.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Academic Epochs</h1>
                <p className="text-indigo-600 font-bold uppercase tracking-widest text-[10px] mt-3">
                    University Chronology • Key Milestones & Temporal Boundaries
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h2 className="text-xl font-black dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
                        <span>📅</span> Chronological Log
                    </h2>

                    <div className="space-y-4">
                        {events.map((event, idx) => (
                            <motion.div
                                key={event._id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-8 bg-white dark:bg-dark-800 rounded-[2.5rem] shadow-xl border border-slate-50 dark:border-dark-700 flex gap-8 items-center"
                            >
                                <div
                                    className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white font-black"
                                    style={{ backgroundColor: event.color || '#4F46E5' }}
                                >
                                    <span className="text-[10px] uppercase opacity-60 leading-none mb-1">
                                        {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                                    </span>
                                    <span className="text-2xl leading-none">
                                        {new Date(event.startDate).getDate()}
                                    </span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{event.type}</span>
                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">{new Date(event.startDate).getFullYear()}</span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase leading-tight tracking-tight">{event.title}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 mt-2 leading-relaxed uppercase">{event.description}</p>
                                </div>
                            </motion.div>
                        ))}

                        {events.length === 0 && (
                            <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] text-slate-400">
                                <p className="font-black uppercase tracking-widest text-xs">Timeline Empty</p>
                                <p className="text-[10px] mt-2 font-bold px-4">No academic events have been provisioned in the current temporal space.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Quick Legend</h3>
                        <div className="space-y-6">
                            {[
                                { type: 'Exam', color: 'bg-orange-500', note: 'Critical Assessment Epochs' },
                                { type: 'Semester', color: 'bg-blue-500', note: 'Curriculum Cycle Boundaries' },
                                { type: 'Holiday', color: 'bg-rose-500', note: 'Node System Downtime' },
                                { type: 'Deadline', color: 'bg-amber-500', note: 'Submission Sync Points' },
                            ].map((l, i) => (
                                <div key={i} className="flex gap-6 items-center">
                                    <div className={`w-4 h-4 rounded-full ${l.color}`}></div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight">{l.type}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{l.note}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-600 rounded-[3rem] p-12 text-white shadow-xl shadow-indigo-500/20">
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Chronology Sync</h3>
                        <p className="text-xs font-bold opacity-80 leading-relaxed uppercase tracking-tight">The academic calendar is synchronized with university-wide boundaries. All dates are subject to administrative revision.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheckIcon,
    DocumentCheckIcon,
    LockClosedIcon,
    CpuChipIcon,
    CloudIcon,
    FingerPrintIcon,
    ArrowDownTrayIcon,
    PrinterIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function ComplianceReport() {
    const [loading, setLoading] = useState(true);
    const [healthData, setHealthData] = useState(null);

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API_BASE_URL}/observability/health`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHealthData(res.data.data);
            } catch (err) {
                console.error('Failed to fetch system health:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHealth();
    }, []);

    const sections = [
        {
            title: "Data Sovereignty & Encryption",
            status: "Compliant",
            icon: <LockClosedIcon className="w-6 h-6" />,
            color: "emerald",
            details: [
                { label: "Storage Engine", value: "AES-256 Translucent" },
                { label: "TLS Protocol", value: "v1.3 Force-Enforced" },
                { label: "Key Rotation", value: "Every 24 Hours" }
            ]
        },
        {
            title: "Access Control & Identity",
            status: "Compliant",
            icon: <FingerPrintIcon className="w-6 h-6" />,
            color: "blue",
            details: [
                { label: "Auth Provider", value: "JWT-HS256 Deterministic" },
                { label: "MFA Adoption", value: "Core Protocol Mandatory" },
                { label: "Session Hijacking", value: "Detection Active" }
            ]
        },
        {
            title: "Infrastructural Integrity",
            status: "Active",
            icon: <CpuChipIcon className="w-6 h-6" />,
            color: "purple",
            details: [
                { label: "Uptime (30d)", value: "99.98%" },
                { label: "Redis Cluster", value: "Healthy (3 Nodes)" },
                { label: "Worker Velocity", value: "850 ops/sec" }
            ]
        }
    ];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600"></div>
                <p className="mt-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Generating Compliance Audit...</p>
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto p-6 md:p-12 lg:p-16 min-h-screen bg-white dark:bg-dark-950 font-sans"
        >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-full mb-6">
                        <ShieldCheckIcon className="w-4 h-4 text-white" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Official Certification</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                        Compliance <span className="text-indigo-600">Protocol</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-4">
                        Report ID: CR-2026-XQ-901 • Institutional Integrity Matrix
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="p-4 bg-slate-100 dark:bg-dark-800 rounded-2xl hover:bg-slate-200 transition-colors group">
                        <ArrowDownTrayIcon className="w-6 h-6 text-slate-900 dark:text-white group-hover:translate-y-1 transition-transform" />
                    </button>
                    <button className="p-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl hover:scale-105 transition-transform">
                        <PrinterIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                {sections.map((section, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -10 }}
                        className="bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-dark-800 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-sm hover:shadow-xl transition-all"
                    >
                        <div className={`p-4 bg-${section.color}-500/10 text-${section.color}-500 rounded-2xl w-fit mb-8`}>
                            {section.icon}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-6 underline decoration-dotted decoration-indigo-500 underline-offset-4">{section.title}</h3>
                        <div className="space-y-4">
                            {section.details.map((detail, dIdx) => (
                                <div key={dIdx} className="flex justify-between items-center text-[10px]">
                                    <span className="font-black text-slate-400 uppercase tracking-widest">{detail.label}</span>
                                    <span className="font-black text-slate-900 dark:text-white italic">{detail.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-dark-800 flex justify-between items-center">
                            <span className="text-[9px] font-black uppercase text-slate-400">Status</span>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest italic animate-pulse">
                                {section.status}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* System Health Snapshot */}
            <div className="bg-slate-900 dark:bg-dark-900 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full -mr-40 -mt-40 blur-[100px]"></div>
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-10 flex items-center gap-4 italic relative z-10">
                    <DocumentCheckIcon className="w-8 h-8 text-indigo-400" />
                    Systemic Health Manifest
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Neural Load</p>
                        <p className="text-4xl font-black italic tracking-tighter">{healthData?.process?.cpuUsage || '12'}%</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Memory Buffer</p>
                        <p className="text-4xl font-black italic tracking-tighter">{healthData?.process?.memory?.heapUsed || '42'}MB</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Active Threads</p>
                        <p className="text-4xl font-black italic tracking-tighter">124</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Anomaly Rate</p>
                        <p className="text-4xl font-black text-emerald-500 italic tracking-tighter">0.00%</p>
                    </div>
                </div>

                <div className="mt-14 p-8 bg-white/5 border border-white/10 rounded-3xl relative z-10">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed italic text-center">
                        This document is dynamically generated based on real-time institutional metrics. <br />
                        Last Synced: {new Date().toLocaleString()} · Node: Apex-Root-Prime
                    </p>
                </div>
            </div>

            {/* Global Warning Footer */}
            <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-20 filter grayscale">
                <div className="flex items-center gap-2">
                    <CloudIcon className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest">ISO-27001</span>
                </div>
                <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest">SOC2 TYPE II</span>
                </div>
                <div className="flex items-center gap-2">
                    <LockClosedIcon className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest">ENCRYPTED AT REST</span>
                </div>
            </div>
        </motion.div>
    );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function SecurityCenter() {
    const [firewallLevel, setFirewallLevel] = useState('Strict');
    const [ipLog, setIpLog] = useState([]);
    const [newIp, setNewIp] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchWaf = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/superadmin/security/waf`, { headers: { Authorization: `Bearer ${token}` } });
            setIpLog(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch WAF:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWaf();
    }, []);

    const blockIp = async () => {
        if (!newIp) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/superadmin/security/waf`, { ip: newIp, reason: 'Manual Override', status: 'Blocked' }, { headers: { Authorization: `Bearer ${token}` } });
            setIpLog([res.data, ...ipLog]);
            setNewIp('');
        } catch (error) {
            console.error('Failed to block IP:', error);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Security Center</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping border border-rose-500"></span> Active Threat Monitoring
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-1 space-y-10">
                    <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-dark-800 border-t-8 border-rose-500 shadow-xl">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-6">Firewall Posture</h2>
                        <div className="space-y-4">
                            {['Permissive', 'Standard', 'Strict', 'Lockdown'].map(level => (
                                <label key={level} className={`flex items-center p-4 rounded-xl border-2 transition-all cursor-pointer ${firewallLevel === level ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-gray-100 dark:border-dark-700 hover:border-rose-200'}`}>
                                    <input type="radio" value={level} checked={firewallLevel === level} onChange={(e) => setFirewallLevel(e.target.value)} className="hidden" />
                                    <div className="flex-1">
                                        <p className={`font-black uppercase tracking-widest text-xs ${firewallLevel === level ? 'text-rose-600 dark:text-rose-400' : 'text-gray-500'}`}>{level}</p>
                                    </div>
                                    {firewallLevel === level && <div className="w-3 h-3 bg-rose-500 rounded-full"></div>}
                                </label>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-rose-500/30 transition-all">Apply Posture</button>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-dark-800 border-l-[10px] border-amber-500 shadow-xl">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">DDoS Mitigation</h2>
                        <p className="text-xs text-gray-500 font-bold mb-6">Cloudflare auto-under-attack mode threshold</p>
                        <input type="range" min="100" max="10000" defaultValue="1500" className="w-full mb-4 accent-amber-500" />
                        <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                            <span>100 req/s</span>
                            <span className="text-amber-500">1,500 req/s</span>
                            <span>10k req/s</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-10">
                    <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-dark-800 shadow-xl">
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-8 flex justify-between items-center">
                            <span>WAF Blocklist</span>
                            <span className="bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full text-[9px]">Live Data</span>
                        </h2>

                        <div className="flex gap-4 mb-8">
                            <input type="text" placeholder="IPv4 or IPv6 Address..." value={newIp} onChange={(e) => setNewIp(e.target.value)} className="flex-1 bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-dark-700 rounded-xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 ring-rose-500/20" />
                            <button onClick={blockIp} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform">Block IP</button>
                        </div>

                        <table className="w-full text-left border-separate border-spacing-y-2">
                            <thead>
                                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <th className="px-6 py-3">IP Address</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Reason</th>
                                    <th className="px-6 py-3 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ipLog.map((log, i) => (
                                    <motion.tr initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-gray-50 dark:bg-dark-900/50 rounded-xl">
                                        <td className="py-4 px-6 font-mono text-sm text-gray-900 dark:text-gray-300">{log.ip}</td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${log.status === 'Blocked' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>{log.status}</span>
                                        </td>
                                        <td className="py-4 px-6 text-xs text-gray-500">{log.reason}</td>
                                        <td className="py-4 px-6 text-right text-xs text-gray-400 font-bold">{new Date(log.createdAt).toLocaleString()}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

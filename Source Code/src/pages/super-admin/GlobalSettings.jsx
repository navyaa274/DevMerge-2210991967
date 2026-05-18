import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function GlobalSettings() {
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        registrationsEnabled: true,
        fileUploadsEnabled: true,
        maxUploadSize: '10MB',
        smtpHost: 'smtp.mailgun.org',
        smtpPort: '587',
        smtpUser: 'postmaster@mg.devmerge.com'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await axios.get(`${API_BASE_URL}/superadmin/settings`, { headers: { Authorization: `Bearer ${token}` } });
                if (res.data && res.data._id) setSettings(res.data);
            } catch (error) {
                console.error('Failed to get settings:', error);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({ ...settings, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/superadmin/settings`, settings, { headers: { Authorization: `Bearer ${token}` } });
            alert('Settings Saved Successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Global Application Settings</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Configuration Override Engine
                    </p>
                </div>
                <button onClick={handleSave} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all">Save Config Matrix</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-dark-800 shadow-xl border-t-8 border-indigo-500">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-8">System Toggles</h2>
                    <div className="space-y-6">
                        <label className="flex items-center justify-between p-5 bg-gray-50 dark:bg-dark-900 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                            <div>
                                <p className="font-black uppercase tracking-widest text-sm text-gray-900 dark:text-white">Maintenance Mode</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Locks out all users except Super Admins</p>
                            </div>
                            <div className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${settings.maintenanceMode ? 'bg-amber-500' : 'bg-gray-200 dark:bg-dark-700'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${settings.maintenanceMode ? 'translate-x-6' : ''}`}></div>
                            </div>
                            <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} className="hidden" />
                        </label>

                        <label className="flex items-center justify-between p-5 bg-gray-50 dark:bg-dark-900 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                            <div>
                                <p className="font-black uppercase tracking-widest text-sm text-gray-900 dark:text-white">Public Registrations</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Allow new users to sign up</p>
                            </div>
                            <div className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${settings.registrationsEnabled ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-dark-700'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${settings.registrationsEnabled ? 'translate-x-6' : ''}`}></div>
                            </div>
                            <input type="checkbox" name="registrationsEnabled" checked={settings.registrationsEnabled} onChange={handleChange} className="hidden" />
                        </label>

                        <label className="flex items-center justify-between p-5 bg-gray-50 dark:bg-dark-900 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors">
                            <div>
                                <p className="font-black uppercase tracking-widest text-sm text-gray-900 dark:text-white">File Uploads</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Allow users to upload profile pics & files</p>
                            </div>
                            <div className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${settings.fileUploadsEnabled ? 'bg-indigo-500' : 'bg-gray-200 dark:bg-dark-700'}`}>
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${settings.fileUploadsEnabled ? 'translate-x-6' : ''}`}></div>
                            </div>
                            <input type="checkbox" name="fileUploadsEnabled" checked={settings.fileUploadsEnabled} onChange={handleChange} className="hidden" />
                        </label>
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-dark-800 shadow-xl">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-8">Infrastructure Config</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Max Upload Size Limit</label>
                            <select name="maxUploadSize" value={settings.maxUploadSize} onChange={handleChange} className="w-full bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-dark-700 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 ring-indigo-500/20 text-gray-900 dark:text-white">
                                <option value="5MB">5 MB</option>
                                <option value="10MB">10 MB</option>
                                <option value="50MB">50 MB</option>
                                <option value="100MB">100 MB</option>
                            </select>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-dark-900 rounded-2xl border border-gray-100 dark:border-dark-700">
                            <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-4">SMTP Email Routing</h3>
                            <div className="space-y-4">
                                <input type="text" name="smtpHost" value={settings.smtpHost} onChange={handleChange} placeholder="Host (e.g., smtp.mailgun.org)" className="w-full bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg px-4 py-2 text-xs font-bold w-full" />
                                <div className="flex gap-4">
                                    <input type="text" name="smtpPort" value={settings.smtpPort} onChange={handleChange} placeholder="Port (587)" className="w-1/3 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg px-4 py-2 text-xs font-bold" />
                                    <input type="text" name="smtpUser" value={settings.smtpUser} onChange={handleChange} placeholder="SMTP Username" className="w-2/3 bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg px-4 py-2 text-xs font-bold" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

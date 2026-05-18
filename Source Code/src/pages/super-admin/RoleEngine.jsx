import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from '../../config/api';

export default function RoleEngine() {
    const [permissionsMatrix, setPermissionsMatrix] = useState([]);
    const [saving, setSaving] = useState(null); // track which row is saving
    const [newModule, setNewModule] = useState('');
    const [addingModule, setAddingModule] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/admin/superadmin/roles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPermissionsMatrix(res.data);
        } catch (error) {
            console.error('Failed to fetch roles:', error);
        }
    };

    const handleToggle = async (perm, field) => {
        const token = localStorage.getItem('token');
        const updatedValue = !perm[field];

        // Optimistically update UI
        setPermissionsMatrix(prev =>
            prev.map(p => p._id === perm._id ? { ...p, [field]: updatedValue } : p)
        );
        setSaving(perm._id + field);

        try {
            await axios.patch(
                `${API_BASE_URL}/admin/superadmin/roles/${perm._id}`,
                { [field]: updatedValue },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            // Revert on failure
            setPermissionsMatrix(prev =>
                prev.map(p => p._id === perm._id ? { ...p, [field]: !updatedValue } : p)
            );
            console.error('Failed to update permission:', error);
        } finally {
            setSaving(null);
        }
    };

    const handleAddModule = async (e) => {
        e.preventDefault();
        if (!newModule.trim()) return;
        const token = localStorage.getItem('token');
        try {
            setAddingModule(true);
            await axios.post(
                `${API_BASE_URL}/admin/superadmin/roles`,
                { module: newModule.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewModule('');
            fetchRoles();
        } catch (error) {
            alert(typeof error.response?.data?.error === 'string' ? error.response?.data?.error : error.response?.data?.error?.toString() || 'Failed to add module');
        } finally {
            setAddingModule(false);
        }
    };

    const toggleRender = (hasAccess, perm, field) => {
        const isThisLoading = saving === perm._id + field;
        return (
            <button
                onClick={() => handleToggle(perm, field)}
                disabled={isThisLoading}
                className={`w-10 h-6 mx-auto rounded-full flex items-center p-0.5 transition-all duration-300 cursor-pointer ${hasAccess ? 'bg-indigo-500 shadow-md shadow-indigo-500/30' : 'bg-gray-200 dark:bg-dark-700'
                    } ${isThisLoading ? 'opacity-50 scale-95' : 'hover:scale-105'}`}
            >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${hasAccess ? 'translate-x-4' : ''}`}></div>
            </button>
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Access Controls</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span> Role-Based Architecture Mapping
                    </p>
                </div>
                {/* Add module form */}
                <form onSubmit={handleAddModule} className="flex gap-3 items-center">
                    <input
                        type="text"
                        value={newModule}
                        onChange={e => setNewModule(e.target.value)}
                        placeholder="New Module Name..."
                        className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-dark-700 text-sm font-bold focus:outline-none focus:ring-2 ring-purple-500 text-gray-900 dark:text-white w-52"
                    />
                    <button
                        type="submit"
                        disabled={addingModule}
                        className="bg-purple-600 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-purple-500/30 hover:scale-105 transition-all disabled:opacity-50"
                    >
                        + Add Module
                    </button>
                </form>
            </div>

            <div className="glass-panel rounded-3xl p-1 bg-white dark:bg-dark-800 shadow-2xl border-t-8 border-purple-600">
                <div className="overflow-x-auto p-8 rounded-3xl bg-white dark:bg-dark-800">
                    <table className="w-full text-center">
                        <thead>
                            <tr className="border-b-2 border-gray-100 dark:border-dark-700">
                                <th className="text-left pb-6 px-4 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Module Identity</th>
                                <th className="pb-6 px-4 text-xs font-black text-blue-500 uppercase tracking-widest">Student</th>
                                <th className="pb-6 px-4 text-xs font-black text-emerald-500 uppercase tracking-widest">Faculty</th>
                                <th className="pb-6 px-4 text-xs font-black text-amber-500 uppercase tracking-widest">Admin Node</th>
                                <th className="pb-6 px-4 text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-50 dark:bg-purple-900/10 rounded-t-2xl">Apex Admin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permissionsMatrix.map((perm, i) => (
                                <tr key={perm._id || i} className="border-b border-gray-50 dark:border-dark-700/50 hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">
                                    <td className="text-left py-6 px-4 font-black uppercase tracking-wider text-sm text-gray-700 dark:text-gray-300">{perm.module}</td>
                                    <td className="py-6 px-4">{toggleRender(perm.student, perm, 'student')}</td>
                                    <td className="py-6 px-4">{toggleRender(perm.faculty, perm, 'faculty')}</td>
                                    <td className="py-6 px-4">{toggleRender(perm.admin, perm, 'admin')}</td>
                                    <td className="py-6 px-4 bg-purple-50 dark:bg-purple-900/5">{toggleRender(perm.superAdmin, perm, 'superAdmin')}</td>
                                </tr>
                            ))}
                            {permissionsMatrix.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                        No role permissions configured yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}

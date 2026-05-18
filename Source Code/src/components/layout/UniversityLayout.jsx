import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuthStore } from "../../store/authStore";

export default function UniversityLayout({ children }) {
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCompact, setIsCompact] = useState(false);
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
    const { user } = useAuthStore();

    useEffect(() => {
        const handleResize = () => {
            const isLg = window.innerWidth >= 1024;
            setIsLargeScreen(isLg);
            if (isLg) setSidebarOpen(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const getUniversityColors = () => {
        const colors = {
            student: {
                primary: 'from-blue-600 to-indigo-600',
                secondary: 'from-indigo-500 to-purple-600',
                accent: 'blue',
                bg: 'bg-blue-50 dark:bg-blue-950/20'
            },
            faculty: {
                primary: 'from-emerald-600 to-teal-600',
                secondary: 'from-teal-500 to-cyan-600',
                accent: 'emerald',
                bg: 'bg-emerald-50 dark:bg-emerald-950/20'
            },
            admin: {
                primary: 'from-indigo-600 to-purple-600',
                secondary: 'from-purple-500 to-pink-600',
                accent: 'indigo',
                bg: 'bg-indigo-50 dark:bg-indigo-950/20'
            },
            hod: {
                primary: 'from-amber-600 to-orange-600',
                secondary: 'from-orange-500 to-red-600',
                accent: 'amber',
                bg: 'bg-amber-50 dark:bg-amber-950/20'
            },
            'super_admin': {
                primary: 'from-red-600 to-rose-600',
                secondary: 'from-rose-500 to-pink-600',
                accent: 'red',
                bg: 'bg-red-50 dark:bg-red-950/20'
            }
        };

        return colors[user?.role] || colors.student;
    };

    const colors = getUniversityColors();

    return (
        <div className={`university-layout min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 font-sans`}>
            {/* Mobile Drawer Overlay */}
            <AnimatePresence>
                {isSidebarOpen && !isLargeScreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* University Sidebar */}
            <div
                className={`
                    fixed inset-y-0 left-0 z-[110]
                    lg:static lg:z-auto transition-all duration-300 ease-in-out
                    bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700
                    ${isLargeScreen ? (isCompact ? "w-[96px]" : "w-[280px]") : isSidebarOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full"}
                    ${!isLargeScreen && "shadow-2xl"}
                    overflow-hidden
                `}
            >
                <Sidebar
                    isCompact={isCompact || (!isLargeScreen && !isSidebarOpen)}
                    setIsCompact={setIsCompact}
                    onMenuToggle={() => isLargeScreen ? setIsCompact(!isCompact) : setSidebarOpen(!isSidebarOpen)}
                    universityColors={colors}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* University Header */}
                <Topbar 
                    onMenuButtonClick={() => isLargeScreen ? setIsCompact(!isCompact) : setSidebarOpen(!isSidebarOpen)} 
                    isCompact={isCompact}
                    universityColors={colors}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                    {/* University Brand Header */}
                    <div className={`sticky top-0 z-50 bg-gradient-to-r ${colors.primary} text-white px-6 py-4 shadow-lg`}>
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <span className="text-white font-black text-lg">U</span>
                                </div>
                                <div>
                                    <h1 className="text-xl font-black uppercase tracking-tighter">
                                        {user?.role === 'student' && 'Student Portal'}
                                        {user?.role === 'faculty' && 'Faculty Portal'}
                                        {user?.role === 'admin' && 'Admin Portal'}
                                        {user?.role === 'hod' && 'HOD Portal'}
                                        {user?.role === 'super_admin' && 'Super Admin Portal'}
                                    </h1>
                                    <p className="text-xs opacity-90 font-medium">
                                        {user?.name} · {user?.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-xs font-medium">Online</span>
                            </div>
                        </div>
                    </div>

                    {/* Content Container */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto"
                    >
                        {children}
                    </motion.div>

                    {/* University Footer */}
                    <div className="mt-auto border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <div className="max-w-7xl mx-auto px-6 py-4">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <span className="text-white font-black text-xs">U</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                        University Management System
                                    </span>
                                </div>
                                <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-500">
                                    <span>© 2024 DevMerge University</span>
                                    <span>·</span>
                                    <span>Version 2.0</span>
                                    <span>·</span>
                                    <span className={`text-${colors.accent}-600 font-medium`}>
                                        {user?.role?.toUpperCase()} MODE
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Background Decorative Elements */}
            <div className="fixed top-0 right-0 -z-10 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-[120px] rounded-full"></div>
            <div className="fixed bottom-0 left-0 -z-10 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 blur-[120px] rounded-full"></div>
        </div>
    );
}

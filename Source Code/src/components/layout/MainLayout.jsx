import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useAuthStore } from "../../store/authStore";

export default function MainLayout({ children }) {
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false); // Mobile Drawer State
    const [isCompact, setIsCompact] = useState(false); // Desktop Compact State
    const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);
    const { user } = useAuthStore();

    useEffect(() => {
        const handleResize = () => {
            const isLg = window.innerWidth >= 1024;
            setIsLargeScreen(isLg);
            if (isLg) setSidebarOpen(false); // Close mobile drawer if we go to desktop
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="layout-container bg-[#f8fafc] dark:bg-[#020617] font-sans">
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

            {/* Sidebar Container */}
            <div
                className={`
                    fixed inset-y-0 left-0 z-[110]
                    lg:static lg:z-auto transition-all duration-300 ease-in-out bg-white dark:bg-dark-950
                    ${isLargeScreen ? (isCompact ? "w-[96px]" : "w-[280px]") : isSidebarOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full"}
                    ${!isLargeScreen && "shadow-2xl"}
                    overflow-hidden
                `}
            >
                <Sidebar
                    isCompact={isCompact || (!isLargeScreen && !isSidebarOpen)}
                    setIsCompact={setIsCompact}
                    onMenuToggle={() => isLargeScreen ? setIsCompact(!isCompact) : setSidebarOpen(!isSidebarOpen)}
                />
            </div>

            {/* Main Content Surface */}
            <div className="layout-content flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#020617] relative">
                <Topbar 
                    onMenuButtonClick={() => isLargeScreen ? setIsCompact(!isCompact) : setSidebarOpen(!isSidebarOpen)} 
                    isCompact={isCompact}
                />

                <main className="layout-main flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="p-4 md:p-8 lg:p-10"
                    >
                        {children}
                    </motion.div>

                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full"></div>
                </main>
            </div>
        </div>
    );
}

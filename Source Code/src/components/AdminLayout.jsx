import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Topbar from "./layout/Topbar";
import HamburgerMenu from "./layout/HamburgerMenu";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [isCompact, setIsCompact] = useState(false);

  // Handle window resize for sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Departments", path: "/admin/departments", icon: "🏢" },
    { name: "Calendar", path: "/admin/calendar", icon: "📆" },
    { name: "Announcements", path: "/admin/announcements", icon: "📢" },
    { name: "Reports", path: "/admin/reports", icon: "📉" },
    { name: "Data Visual", path: "/admin/data-visualization", icon: "👁️" },
    { name: "Scheduled", path: "/admin/scheduled-reports", icon: "⏱️" },
    { name: "Performance", path: "/admin/performance", icon: "🚀" },
    { name: "Trends", path: "/admin/trend-analysis", icon: "📈" },
    { name: "Realtime", path: "/admin/realtime-dashboard", icon: "⚡" },
    { name: "Moderation", path: "/admin/moderation", icon: "⚖️" },
    { name: "API Management", path: "/admin/api-keys", icon: "🔑" },
    { name: "Integrations", path: "/admin/integrations", icon: "🔌" },
    { name: "Settings", path: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <div className="layout-container bg-slate-50 dark:bg-dark-950 font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && window.innerWidth <= 1024 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Shell */}
      <motion.div
        initial={false}
        animate={{
          width: isSidebarOpen ? (isCompact ? "80px" : "280px") : "0px",
          x: isSidebarOpen ? 0 : -280,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-dark-900 border-r border-slate-100 dark:border-dark-800 shadow-2xl fixed lg:static h-screen z-[70] overflow-hidden flex flex-col"
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-50 dark:border-dark-800 shrink-0">
          {!isCompact ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center justify-center text-white font-black text-sm italic">
                NX
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                Nexus
              </span>
            </div>
          ) : (
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl mx-auto shadow-indigo-500/20 flex items-center justify-center text-white font-black text-xs">
              NX
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar pt-8">
          {adminLinks.map((link) => {
            const isActive = location.pathname.includes(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() =>
                  window.innerWidth <= 1024 && setSidebarOpen(false)
                }
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/30"
                    : "text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                {!isCompact && (
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                    {link.name}
                  </span>
                )}
                {isCompact && (
                  <div className="lms-sidebar-tooltip">{link.name}</div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / Toggle */}
        <div className="p-4 border-t border-slate-50 dark:border-dark-800 hidden lg:block">
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="w-full flex items-center justify-center py-4 bg-slate-50 dark:bg-dark-800 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all text-xs font-black uppercase tracking-widest"
          >
            {isCompact ? "➡" : "⬅ Collapse"}
          </button>
        </div>
      </motion.div>

      {/* Main Surface */}
      <div className="layout-content relative bg-white dark:bg-dark-950">
        {/* Top Bar */}
        <Topbar onMenuButtonClick={() => setSidebarOpen(!isSidebarOpen)} />

        {/* Content Scroll Area */}
        <main className="layout-main p-6 md:p-10 lg:p-14 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}

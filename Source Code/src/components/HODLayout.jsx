import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Topbar from "./layout/Topbar";
import HamburgerMenu from "./layout/HamburgerMenu";

export default function HODLayout({ children }) {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  // Handle window resize
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

  const links = [
    { name: "Dashboard", path: "/hod/dashboard", icon: "📊" },
    { name: "Departments", path: "/hod/departments", icon: "🏢" },
    { name: "Programs", path: "/hod/programs", icon: "📚" },
    { name: "Courses", path: "/hod/courses", icon: "📖" },
    { name: "Sections", path: "/hod/sections", icon: "📋" },
    { name: "Faculty Load", path: "/hod/faculty-load", icon: "⚖️" },
    { name: "Analytics", path: "/hod/analytics", icon: "📈" },
    { name: "Manage Faculty", path: "/hod/faculty", icon: "👥" },
    { name: "Accreditation", path: "/hod/accreditation", icon: "🎯" },
    { name: "Program Outcomes", path: "/hod/program-outcomes", icon: "✅" },
    { name: "Audit Logs", path: "/hod/audit-logs", icon: "📝" },
    { name: "Contests", path: "/hod/contests", icon: "🏆" },
    { name: "Copilot", path: "/hod/copilot", icon: "🤖" },
    { name: "Predictive Radar", path: "/hod/predictive-radar", icon: "📡" },
    { name: "Skill Matrix", path: "/hod/skill-matrix", icon: "📊" },
    { name: "Integrity Heatmap", path: "/hod/integrity-heatmap", icon: "🔥" },
    { name: "Resource Optimizer", path: "/hod/resource-optimizer", icon: "⚙️" },
    { name: "Research Grants", path: "/hod/research-grants", icon: "🔬" },
    { name: "Alumni Bridge", path: "/hod/alumni-bridge", icon: "🌉" },
    { name: "Global Broadcast", path: "/hod/global-broadcast", icon: "📢" },
    { name: "Policy Engine", path: "/hod/policy-engine", icon: "🧩" },
    { name: "Sentiment Analyzer", path: "/hod/sentiment-analyzer", icon: "🎭" },
  ];

  return (
    <div className="layout-container flex h-screen bg-slate-50 dark:bg-dark-950 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
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

      {/* Sidebar Shell */}
      <aside
        className={`
            fixed inset-y-0 left-0 z-[110]
            lg:static lg:z-auto bg-white dark:bg-dark-900 border-r border-slate-100 dark:border-dark-800 shadow-2xl
            transition-all duration-300 ease-in-out flex flex-col
            ${isLargeScreen 
                ? (isCompact ? "w-[96px] translate-x-0" : "w-[280px] translate-x-0") 
                : (isSidebarOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full")
            }
        `}
      >
        {/* Sidebar Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-50 dark:border-dark-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-2xl shadow-xl shadow-teal-500/20 flex items-center justify-center text-white font-black text-sm italic shrink-0">
              HD
            </div>
            {!isCompact && (
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic truncate">
                HeadOfDept
              </span>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar pt-8">
          {links.map((link) => {
            const isActive = location.pathname.includes(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => !isLargeScreen && setSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative ${
                  isActive
                    ? "bg-teal-600 text-white shadow-xl shadow-teal-500/30"
                    : "text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="text-xl shrink-0">{link.icon}</span>
                {!isCompact && (
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                    {link.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* Sidebar Toggle */}
        <div className="p-4 border-t border-slate-50 dark:border-dark-800">
            <button
                onClick={() => setIsCompact(!isCompact)}
                className="w-full h-14 flex items-center justify-center bg-slate-50 dark:bg-dark-900 rounded-2xl text-slate-400 hover:text-teal-600 transition-all text-[10px] font-black uppercase tracking-widest gap-2"
            >
                {isCompact ? "→" : "← Collapse"}
            </button>
        </div>
      </aside>

      {/* Main Surface */}
      <div className="layout-content flex-1 flex flex-col min-w-0 bg-white dark:bg-dark-950 relative overflow-hidden">
        {/* Top Bar */}
        <Topbar 
            onMenuButtonClick={() => isLargeScreen ? setIsCompact(!isCompact) : setSidebarOpen(!isSidebarOpen)} 
            isSidebarOpen={isSidebarOpen}
            isLargeScreen={isLargeScreen}
            isCompact={isCompact}
        />

        {/* Content Scroll Area */}
        <main className="layout-main flex-1 p-6 md:p-10 lg:p-14 custom-scrollbar overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

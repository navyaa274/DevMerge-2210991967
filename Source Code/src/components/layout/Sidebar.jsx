import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
    HomeIcon,
    BookOpenIcon,
    CalendarIcon,
    AcademicCapIcon,
    BeakerIcon,
    CommandLineIcon,
    ChatBubbleBottomCenterTextIcon,
    UserGroupIcon,
    ChartBarIcon,
    BriefcaseIcon,
    UserCircleIcon,
    SparklesIcon,
    ShieldCheckIcon,
    Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../store/authStore";
import HamburgerMenu from "./HamburgerMenu";

const SidebarItem = ({ item, isCompact, isActive, colors }) => {
    return (
        <Link
            to={item.path}
            className={`lms-sidebar-item ${isActive ? "lms-sidebar-item-active" : "lms-sidebar-item-inactive"} transition-all duration-300`}
        >
            <div className={`flex items-center justify-center shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <item.icon
                    className={`w-6 h-6 ${isActive ? "text-white" : `text-slate-400 group-hover:text-${colors.accent}-600 dark:group-hover:text-white`}`}
                />
            </div>
            {!isCompact && (
                <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap ${isActive ? 'text-white' : `text-slate-500 dark:text-slate-400 group-hover:text-${colors.accent}-600 dark:group-hover:text-white`}`}
                >
                    {item.name}
                </motion.span>
            )}
            {isActive && (
                <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 w-1 h-8 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                />
            )}
            {isCompact && <div className="lms-sidebar-tooltip">{item.name}</div>}
        </Link>
    );
};

export default function Sidebar({ isCompact, setIsCompact, onMenuToggle, universityColors }) {
    const { user } = useAuthStore();
    const location = useLocation();
    
    const shouldShowHamburger = user?.role === 'faculty' || user?.role === 'student';

    const getNavigation = () => {
        const base = [
            { name: "Dashboard", path: `/${user?.role}/dashboard`, icon: HomeIcon },
        ];

        if (user?.role === "student") {
            return [
                ...base,
                { name: "Courses", path: "/student/courses", icon: BookOpenIcon },
                { name: "AI Tutor", path: "/student/ai-tutor", icon: SparklesIcon },
                { name: "Calendar", path: "/student/calendar", icon: CalendarIcon },
                { name: "Code Lab", path: "/student/labs", icon: CommandLineIcon },
                { name: "Problems", path: "/problems", icon: BeakerIcon },
                { name: "Mock Interview", path: "/student/mock-interview", icon: ChatBubbleBottomCenterTextIcon },
                { name: "Portfolio", path: "/student/portfolio", icon: BriefcaseIcon },
                { name: "Profile", path: "/profile", icon: UserCircleIcon },
            ];
        }

        if (user?.role === "faculty") {
            return [
                ...base,
                { name: "Courses", path: "/faculty/courses", icon: BookOpenIcon },
                { name: "Students", path: "/faculty/students", icon: UserGroupIcon },
                { name: "Assessments", path: "/faculty/assessments", icon: AcademicCapIcon },
                { name: "Analytics", path: "/faculty/analytics", icon: ChartBarIcon },
                { name: "AI Tools", path: "/faculty/ai-tools", icon: SparklesIcon },
                { name: "Profile", path: "/profile", icon: UserCircleIcon },
            ];
        }

        if (user?.role === "admin") {
            return [
                ...base,
                { name: "Users", path: "/admin/users", icon: UserGroupIcon },
                { name: "Courses", path: "/admin/courses", icon: BookOpenIcon },
                { name: "Departments", path: "/admin/departments", icon: AcademicCapIcon },
                { name: "Analytics", path: "/admin/analytics", icon: ChartBarIcon },
                { name: "Settings", path: "/admin/settings", icon: Cog6ToothIcon },
                { name: "Profile", path: "/profile", icon: UserCircleIcon },
            ];
        }

        if (user?.role === "hod") {
            return [
                ...base,
                { name: "Faculty", path: "/hod/faculty", icon: UserGroupIcon },
                { name: "Courses", path: "/hod/courses", icon: BookOpenIcon },
                { name: "Students", path: "/hod/students", icon: AcademicCapIcon },
                { name: "Analytics", path: "/hod/analytics", icon: ChartBarIcon },
                { name: "Broadcast", path: "/hod/global-broadcast", icon: SparklesIcon },
                { name: "Profile", path: "/profile", icon: UserCircleIcon },
            ];
        }

        if (user?.role === "super_admin") {
            return [
                ...base,
                { name: "System", path: "/super-admin/system", icon: ShieldCheckIcon },
                { name: "Users", path: "/super-admin/users", icon: UserGroupIcon },
                { name: "Institutions", path: "/super-admin/institutions", icon: AcademicCapIcon },
                { name: "Analytics", path: "/super-admin/analytics", icon: ChartBarIcon },
                { name: "Settings", path: "/super-admin/settings", icon: Cog6ToothIcon },
                { name: "Profile", path: "/profile", icon: UserCircleIcon },
            ];
        }

        return base;
    };

    const navigation = getNavigation();
    const colors = universityColors || { primary: 'from-indigo-600 to-purple-600', accent: 'indigo' };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900 relative">
            {/* University Logo Section */}
            <div className={`p-6 border-b border-slate-200 dark:border-slate-700 ${isCompact ? 'flex items-center justify-center' : ''}`}>
                {!isCompact ? (
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${colors.primary} rounded-xl flex items-center justify-center text-white font-black shadow-lg`}>
                            U
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                DevMerge
                            </h1>
                            <p className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.2em]">
                                University
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className={`w-10 h-10 bg-gradient-to-br ${colors.primary} rounded-xl flex items-center justify-center text-white font-black shadow-lg`}>
                        U
                    </div>
                )}
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <SidebarItem
                            key={item.name}
                            item={item}
                            isCompact={isCompact}
                            isActive={isActive}
                            colors={colors}
                        />
                    );
                })}
            </nav>

            {/* User Section */}
            <div className={`p-4 border-t border-slate-200 dark:border-slate-700 ${isCompact ? 'flex items-center justify-center' : ''}`}>
                {!isCompact ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <div className={`w-8 h-8 bg-gradient-to-br ${colors.secondary} rounded-lg flex items-center justify-center text-white font-black text-sm`}>
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                                {user?.name}
                            </p>
                            <p className={`text-[9px] font-medium text-${colors.accent}-600 uppercase tracking-[0.2em]`}>
                                {user?.role}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className={`w-8 h-8 bg-gradient-to-br ${colors.secondary} rounded-lg flex items-center justify-center text-white font-black text-sm`}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                )}
            </div>
        </div>
    );
}

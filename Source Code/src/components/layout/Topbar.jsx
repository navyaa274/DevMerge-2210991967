import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, BellIcon, UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import DarkModeToggle from '../DarkModeToggle';
import NotificationCenter from '../NotificationCenter';
import SearchModal from '../SearchModal';
import HamburgerMenu from './HamburgerMenu';

export default function Topbar({ onMenuButtonClick, isSidebarOpen, isLargeScreen, isCompact, universityColors }) {
    const { user, logout } = useAuthStore();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const isSidebarActive = isLargeScreen ? !isCompact : isSidebarOpen;
    const shouldShowHamburger = user?.role === 'faculty' || user?.role === 'student';
    const colors = universityColors || { primary: 'from-indigo-600 to-purple-600', accent: 'indigo' };

    return (
        <>
        <header className="h-20 flex items-center justify-between px-6 md:px-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-700 sticky top-0 z-[90]">
            <div className="flex items-center gap-4">
                {shouldShowHamburger && (
                    <HamburgerMenu
                        isOpen={isSidebarActive}
                        onToggle={onMenuButtonClick}
                        colors={colors}
                    />
                )}

                <Link to="/" className={`flex items-center gap-2 transition-all duration-300 ${isCompact || !isLargeScreen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none absolute'}`}>
                    <div className={`w-8 h-8 bg-gradient-to-br ${colors.primary} rounded-xl flex items-center justify-center text-white font-black italic shadow-lg`}>
                        U
                    </div>
                    <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">DevMerge</span>
                </Link>

                <div className="hidden sm:flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl px-4 py-2.5 w-64 lg:w-96 transition-all focus-within:ring-4 focus-within:ring-indigo-500/10 group">
                    <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search university resources..."
                        className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-slate-600 dark:text-slate-300 placeholder:text-slate-400 font-medium"
                        onClick={() => setIsSearchOpen(true)}
                        readOnly
                    />
                    <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-[10px] font-black text-slate-400 shadow-sm">
                        ⌘K
                    </kbd>
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
                <div className="flex items-center gap-2">
                    <DarkModeToggle />
                    <NotificationCenter />
                </div>

                <div className="h-8 w-px bg-slate-100 dark:bg-slate-700 hidden sm:block"></div>

                <div className="flex items-center gap-3">
                    <Link to="/profile" className="flex items-center gap-3 p-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-500/30 transition-all group lg:pr-4">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors.secondary} flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-105 transition-transform overflow-hidden`}>
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="User" className="w-full h-full object-cover" />
                            ) : (
                                (user?.name || user?.email || 'U').charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="hidden lg:block">
                            <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                                {user?.name}
                            </p>
                            <p className={`text-[9px] font-medium text-${colors.accent}-600 uppercase tracking-[0.2em]`}>
                                {user?.role}
                            </p>
                        </div>
                    </Link>

                    <div className="relative group">
                        <button
                            onClick={logout}
                            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500/30 transition-all group"
                            title="Logout"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}

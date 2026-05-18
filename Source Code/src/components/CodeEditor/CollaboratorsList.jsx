import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CollaboratorsList({ collaborators, currentUser, onInvite }) {
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    const handleInvite = () => {
        if (inviteEmail.trim()) {
            onInvite(inviteEmail);
            setInviteEmail('');
            setShowInvite(false);
        }
    };

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="border-b border-slate-700 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-sm">Collaborators ({collaborators.length})</h3>
                <button
                    onClick={() => setShowInvite(!showInvite)}
                    className="text-indigo-400 hover:text-indigo-300 text-xs font-bold"
                >
                    + Invite
                </button>
            </div>

            <AnimatePresence>
                {showInvite && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-4 overflow-hidden"
                    >
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="Email address"
                                className="flex-1 bg-slate-700 text-white px-3 py-2 rounded text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                onKeyPress={(e) => e.key === 'Enter' && handleInvite()}
                            />
                            <button
                                onClick={handleInvite}
                                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-bold hover:bg-indigo-700"
                            >
                                Send
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-2">
                {collaborators.map((collab, index) => (
                    <motion.div
                        key={collab.userId}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex items-center gap-3 p-2 rounded-lg bg-slate-700/50"
                    >
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: colors[index % colors.length] }}
                        >
                            {collab.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <div className="text-white text-sm font-medium">
                                {collab.userName}
                                {currentUser?._id && collab.userId === currentUser._id && (
                                    <span className="ml-2 text-xs text-slate-400">(You)</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-xs text-slate-400">Active</span>
                            </div>
                        </div>
                        {collab.role && (
                            <span className="px-2 py-1 bg-indigo-600/20 text-indigo-400 rounded text-xs font-bold">
                                {collab.role}
                            </span>
                        )}
                    </motion.div>
                ))}

                {collaborators.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No collaborators yet
                    </div>
                )}
            </div>
        </div>
    );
}

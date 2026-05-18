import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FileExplorer({ files, activeFile, onFileSelect, onFileCreate, onFileDelete }) {
    const [showNewFile, setShowNewFile] = useState(false);
    const [newFileName, setNewFileName] = useState('');

    const handleCreateFile = () => {
        if (newFileName.trim()) {
            onFileCreate(newFileName);
            setNewFileName('');
            setShowNewFile(false);
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-white font-bold text-sm">Files</h3>
                <button
                    onClick={() => setShowNewFile(!showNewFile)}
                    className="text-indigo-400 hover:text-indigo-300 text-xs font-bold"
                >
                    + New
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                <AnimatePresence>
                    {showNewFile && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-2 overflow-hidden"
                        >
                            <div className="flex gap-1 p-2">
                                <input
                                    type="text"
                                    value={newFileName}
                                    onChange={(e) => setNewFileName(e.target.value)}
                                    placeholder="filename.js"
                                    className="flex-1 bg-slate-700 text-white px-2 py-1 rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500"
                                    onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
                                    autoFocus
                                />
                                <button
                                    onClick={handleCreateFile}
                                    className="px-2 py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700"
                                >
                                    ✓
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-1">
                    {files.map((file, index) => (
                        <motion.div
                            key={index}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className={`group flex items-center justify-between px-3 py-2 rounded text-sm font-medium transition-colors ${
                                activeFile?.name === file.name
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-700'
                            }`}
                        >
                            <button
                                onClick={() => onFileSelect(file)}
                                className="flex items-center gap-2 flex-1 text-left"
                            >
                                <span className="text-xs">
                                    {file.name.endsWith('.js') ? '📄' :
                                     file.name.endsWith('.py') ? '🐍' :
                                     file.name.endsWith('.java') ? '☕' :
                                     file.name.endsWith('.cpp') || file.name.endsWith('.c') ? '⚙️' :
                                     file.name.endsWith('.go') ? '🔷' :
                                     file.name.endsWith('.rs') ? '🦀' :
                                     '📄'}
                                </span>
                                <span className="truncate">{file.name}</span>
                            </button>
                            {onFileDelete && files.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Delete ${file.name}?`)) {
                                            onFileDelete(file.name);
                                        }
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity px-1"
                                    title="Delete file"
                                >
                                    ×
                                </button>
                            )}
                        </motion.div>
                    ))}

                    {files.length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            No files yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import { motion } from 'framer-motion';

export default function OutputPanel({ output, isRunning, onClear }) {
    return (
        <motion.div
            initial={{ height: 0 }}
            animate={{ height: 200 }}
            className="bg-slate-800 border-t border-slate-700 overflow-hidden flex flex-col"
        >
            <div className="px-4 py-2 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold text-sm">Output</h3>
                    {isRunning && (
                        <div className="flex items-center gap-2 text-emerald-400 text-xs">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                            Running...
                        </div>
                    )}
                </div>
                {onClear && output && (
                    <button
                        onClick={onClear}
                        className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-xs font-medium hover:bg-slate-600 transition-colors"
                    >
                        Clear
                    </button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto p-4">
                <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
                    {output || 'No output yet. Run your code to see results.'}
                </pre>
            </div>
        </motion.div>
    );
}

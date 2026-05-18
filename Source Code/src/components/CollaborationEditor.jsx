import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import CodeEditor from './CodeEditor';
import { useAuthStore } from '../store/authStore';

export default function CollaborationEditor({ roomId, problemId }) {
  const { user } = useAuthStore();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [participants, setParticipants] = useState([]);
  const [output, setOutput] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL);

    newSocket.on('connect', () => {
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('code-update', (data) => {
      if (data.userId !== newSocket.id) {
        setCode(data.code);
        setLanguage(data.language);
      }
    });

    newSocket.on('output-update', (data) => {
      setOutput(data.output);
    });

    newSocket.on('user-joined', (userId) => {
      setParticipants(prev => [...prev, userId]);
    });

    newSocket.on('user-left', (userId) => {
      setParticipants(prev => prev.filter(id => id !== userId));
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [roomId]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket?.emit('code-change', { roomId, code: newCode, language });
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    socket?.emit('code-change', { roomId, code, language: newLanguage });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-[600px]">
      {/* Editor Main Canvas */}
      <div className="xl:col-span-3 flex flex-col gap-4">
        <div className="glass-panel p-4 rounded-2xl shadow-md flex justify-between items-center bg-white/60 dark:bg-dark-800/60 backdrop-blur-md border border-white/40 dark:border-dark-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👩‍💻</span>
            <div>
              <h2 className="font-extrabold text-gray-900 dark:text-white leading-tight">Live Collaboration Session</h2>
              <p className="text-xs text-emerald-600 font-bold tracking-wider uppercase">Room Active</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <label className="text-sm font-bold text-gray-500 uppercase tracking-widest">Language</label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-dark-600 rounded-xl bg-gray-50 dark:bg-dark-900 text-gray-800 dark:text-white font-mono shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="javascript">JavaScript (Node.js)</option>
              <option value="python">Python 3.9</option>
              <option value="java">Java 17</option>
              <option value="cpp">C++ (GCC)</option>
            </select>
          </div>
        </div>

        <div className="flex-1 glass-panel rounded-2xl shadow-lg border border-gray-200 dark:border-dark-700 overflow-hidden relative">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen mix-blend-multiply filter blur-[80px] opacity-10 pointer-events-none"></div>
          <CodeEditor value={code} onChange={handleCodeChange} language={language} />
        </div>
      </div>

      {/* Sidebar Tooling */}
      <div className="space-y-6 flex flex-col h-full">
        {/* Participants Panel */}
        <motion.div whileHover={{ y: -2 }} className="glass-panel rounded-2xl shadow-md p-5 border border-white/40 dark:border-dark-700 flex-none relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-6xl opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none">👥</div>
          <h3 className="font-extrabold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
            <span>Participants</span>
            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">{participants.length + 1}</span>
          </h3>

          <div className="space-y-3">
            <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex justify-center items-center text-white font-bold shadow-md">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">{user?.name}</p>
                  <p className="text-xs text-gray-500 mt-1">You (Host)</p>
                </div>
              </div>
            </motion.div>

            <AnimatePresence>
              {participants.map((pid, idx) => (
                <motion.div
                  key={pid}
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -10, opacity: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-dark-800 border border-gray-100 dark:border-dark-700 rounded-xl"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex justify-center items-center text-white font-bold shadow-sm">
                      P
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-none">Peer {pid.slice(0, 4)}</p>
                    <p className="text-xs text-emerald-600 mt-1">Connected</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Live Output Panel */}
        <motion.div whileHover={{ y: -2 }} className="glass-panel flex-1 rounded-2xl shadow-md p-5 border border-white/40 dark:border-dark-700 flex flex-col group relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-7xl opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none">⚡</div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <span>Terminal Output</span>
            </h3>
            <span className="relative flex h-3 w-3">
              <span className={output ? "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" : ""}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${output ? "bg-emerald-500" : "bg-gray-400"}`}></span>
            </span>
          </div>

          <div className="flex-1 bg-gray-900 rounded-xl p-4 font-mono text-sm shadow-inner border border-gray-800 relative z-10 overflow-hidden flex flex-col">
            <div className="flex gap-2 mb-3 border-b border-gray-800 pb-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <div className="flex-1 overflow-auto text-emerald-400">
              {output ? (
                <pre className="whitespace-pre-wrap leading-relaxed">{output}</pre>
              ) : (
                <div className="text-gray-500 flex flex-col items-center justify-center h-full opacity-50">
                  <span className="text-2xl mb-2">⌨️</span>
                  <span>Waiting for code execution...</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

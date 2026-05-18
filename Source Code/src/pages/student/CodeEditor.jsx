import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';
import editorService from '../../services/api/editorService';
import { API_BASE_URL } from '../../config/urls';
import CodeEditorComponent from '../../components/CodeEditor/CodeEditor';
import CollaboratorsList from '../../components/CodeEditor/CollaboratorsList';
import ChatPanel from '../../components/CodeEditor/ChatPanel';
import OutputPanel from '../../components/CodeEditor/OutputPanel';
import FileExplorer from '../../components/CodeEditor/FileExplorer';

const languageTemplates = {
    javascript: '// JavaScript Code\nconsole.log("Hello, World!");\n',
    typescript: '// TypeScript Code\nconst message: string = "Hello, World!";\nconsole.log(message);\n',
    python: '# Python Code\nprint("Hello, World!")\n',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n',
    c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}\n',
    go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n',
    rust: 'fn main() {\n    println!("Hello, World!");\n}\n',
    php: '<?php\necho "Hello, World!";\n?>\n',
    ruby: '# Ruby Code\nputs "Hello, World!"\n',
    swift: '// Swift Code\nprint("Hello, World!")\n',
    kotlin: '// Kotlin Code\nfun main() {\n    println("Hello, World!")\n}\n',
    scala: '// Scala Code\nobject Main extends App {\n    println("Hello, World!")\n}\n',
    perl: '# Perl Code\nprint "Hello, World!\\n";\n',
    r: '# R Code\nprint("Hello, World!")\n',
    bash: '#!/bin/bash\necho "Hello, World!"\n',
    sql: '-- SQL Code\nSELECT "Hello, World!" AS message;\n',
    html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>\n',
    css: '/* CSS Code */\nbody {\n    font-family: Arial, sans-serif;\n    background: #f0f0f0;\n    margin: 0;\n    padding: 20px;\n}\n\nh1 {\n    color: #333;\n}\n',
    json: '{\n    "message": "Hello, World!",\n    "status": "success"\n}\n',
    xml: '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n    <message>Hello, World!</message>\n</root>\n',
    yaml: '# YAML Code\nmessage: Hello, World!\nstatus: success\n',
    markdown: '# Hello, World!\n\nThis is a **markdown** document.\n',
    lua: '-- Lua Code\nprint("Hello, World!")\n',
    dart: '// Dart Code\nvoid main() {\n    print("Hello, World!");\n}\n',
    elixir: '# Elixir Code\nIO.puts "Hello, World!"\n',
    haskell: '-- Haskell Code\nmain :: IO ()\nmain = putStrLn "Hello, World!"\n',
    clojure: ';; Clojure Code\n(println "Hello, World!")\n',
    assembly: '; Assembly Code (x86)\nsection .data\n    msg db "Hello, World!", 0xA\n    len equ $ - msg\n\nsection .text\n    global _start\n\n_start:\n    mov eax, 4\n    mov ebx, 1\n    mov ecx, msg\n    mov edx, len\n    int 0x80\n\n    mov eax, 1\n    xor ebx, ebx\n    int 0x80\n'
};

// Language detection patterns
const detectLanguage = (code) => {
    const patterns = {
        html: /<(!DOCTYPE html|html|head|body|div|span|p|h[1-6])/i,
        css: /\{[^}]*(?:color|background|margin|padding|font|display):/i,
        javascript: /(?:const|let|var|function|=>|console\.log|require\(|import\s+.*from)/,
        typescript: /(?:interface|type\s+\w+\s*=|:\s*(?:string|number|boolean)|as\s+\w+)/,
        python: /(?:def\s+\w+|import\s+\w+|from\s+\w+\s+import|print\(|if\s+__name__|class\s+\w+:)/,
        java: /(?:public\s+class|public\s+static\s+void\s+main|System\.out\.println|import\s+java\.)/,
        cpp: /(?:#include\s*<iostream>|std::|cout|cin|namespace\s+std)/,
        c: /(?:#include\s*<stdio\.h>|printf\(|scanf\(|int\s+main\(\))/,
        go: /(?:package\s+main|func\s+main\(\)|import\s+"fmt"|fmt\.Println)/,
        rust: /(?:fn\s+main|let\s+mut|println!|use\s+std::)/,
        php: /<\?php|<\?=|\$\w+\s*=/,
        ruby: /(?:def\s+\w+|puts\s+|require\s+|class\s+\w+\s*<|end\s*$)/m,
        swift: /(?:func\s+\w+|var\s+\w+:\s*\w+|let\s+\w+:\s*\w+|import\s+Foundation)/,
        kotlin: /(?:fun\s+main|val\s+\w+|var\s+\w+|println\()/,
        bash: /(?:^#!\/bin\/bash|echo\s+|if\s+\[|for\s+\w+\s+in)/m,
        sql: /(?:SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|FROM|WHERE|JOIN)\s+/i,
        json: /^\s*[\{\[]/,
        xml: /<\?xml|<\w+[^>]*>/,
        yaml: /^[\w-]+:\s*[\w-]/m,
        markdown: /^#{1,6}\s+|\*\*\w+\*\*|\[.*\]\(.*\)/m,
        r: /(?:<-|library\(|data\.frame|ggplot)/,
        perl: /(?:use\s+strict|my\s+\$|print\s+")/,
        lua: /(?:function\s+\w+|local\s+\w+|end\s*$)/m,
        dart: /(?:void\s+main|import\s+'dart:|class\s+\w+\s*\{)/,
        scala: /(?:object\s+\w+|def\s+\w+|val\s+\w+:\s*\w+)/,
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
        if (pattern.test(code)) {
            return lang;
        }
    }

    return 'javascript'; // default
};

export default function CodeEditor() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, token } = useAuthStore();
    const [socket, setSocket] = useState(null);
    const [roomId, setRoomId] = useState('');
    const [code, setCode] = useState(languageTemplates.javascript);
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [collaborators, setCollaborators] = useState([]);
    const [messages, setMessages] = useState([]);
    const [files, setFiles] = useState([{ name: 'main.js', content: languageTemplates.javascript }]);
    const [activeFile, setActiveFile] = useState({ name: 'main.js', content: languageTemplates.javascript });
    const [showChat, setShowChat] = useState(true);
    const [showFiles, setShowFiles] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const [isDebugging, setIsDebugging] = useState(false);
    const [breakpoints, setBreakpoints] = useState([]);
    const [theme, setTheme] = useState('dark');
    const [fontSize, setFontSize] = useState(14);
    const [isConnected, setIsConnected] = useState(false);
    const [mobileView, setMobileView] = useState('editor'); // 'files', 'editor', 'console', 'chat'
    const editorRef = useRef(null);

    useEffect(() => {
        const urlRoomId = searchParams.get('room');
        const newRoomId = urlRoomId || `room-${Date.now()}`;
        setRoomId(newRoomId);

        if (!urlRoomId) {
            navigate(`/student/code-editor?room=${newRoomId}`, { replace: true });
        }

        initializeSocket(newRoomId);

        return () => {
            if (socket) {
                socket.emit('leave-room', newRoomId);
                socket.disconnect();
            }
        };
    }, []);

    const initializeSocket = (room) => {
        const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:2004', {
            query: { userId: user._id, roomId: room, userName: user.name }
        });

        newSocket.on('connect', () => {
            console.log('Connected to room:', room);
            setIsConnected(true);
            newSocket.emit('join-room', { roomId: room, userId: user._id, userName: user.name });
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
        });

        newSocket.on('collaborators-update', (data) => {
            setCollaborators(data.collaborators);
        });

        newSocket.on('code-update', (data) => {
            if (data.userId !== user._id) {
                setCode(data.code);
                if (data.language) setLanguage(data.language);
            }
        });

        newSocket.on('file-update', (data) => {
            setFiles(data.files);
        });

        newSocket.on('output-update', (data) => {
            setOutput(data.output);
        });

        newSocket.on('chat-message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        newSocket.on('cursor-update', (data) => {
            if (editorRef.current && data.userId !== user._id) {
                editorRef.current.showRemoteCursor(data);
            }
        });

        setSocket(newSocket);
    };

    const handleCodeChange = (newCode) => {
        setCode(newCode);

        // Auto-detect language
        const detectedLang = detectLanguage(newCode);
        if (detectedLang !== language && newCode.length > 50) {
            setLanguage(detectedLang);
        }

        // Update preview for HTML
        if (language === 'html' || detectedLang === 'html') {
            setPreviewContent(newCode);
        }

        if (socket) {
            socket.emit('code-change', {
                roomId,
                code: newCode,
                language,
                userId: user._id
            });
        }
    };

    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);

        // Update code to new language template
        const newCode = languageTemplates[newLang] || languageTemplates.javascript;
        setCode(newCode);

        // Show preview for HTML
        if (newLang === 'html') {
            setShowPreview(true);
            setPreviewContent(newCode);
        }

        const extensions = {
            javascript: 'js',
            typescript: 'ts',
            python: 'py',
            java: 'java',
            cpp: 'cpp',
            c: 'c',
            go: 'go',
            rust: 'rs',
            php: 'php',
            ruby: 'rb',
            swift: 'swift',
            kotlin: 'kt',
            scala: 'scala',
            perl: 'pl',
            r: 'r',
            bash: 'sh',
            sql: 'sql',
            html: 'html',
            css: 'css',
            json: 'json',
            xml: 'xml',
            yaml: 'yaml',
            markdown: 'md',
            lua: 'lua',
            dart: 'dart',
            elixir: 'ex',
            haskell: 'hs',
            clojure: 'clj',
            assembly: 'asm'
        };

        if (activeFile) {
            const baseName = activeFile.name.split('.')[0];
            const newFileName = `${baseName}.${extensions[newLang]}`;
            const updatedFile = { ...activeFile, name: newFileName, content: newCode };
            setActiveFile(updatedFile);

            const updatedFiles = files.map(f =>
                f.name === activeFile.name ? updatedFile : f
            );
            setFiles(updatedFiles);
        }
    };

    const handleRunCode = async () => {
        // For HTML, just show preview
        if (language === 'html') {
            setShowPreview(true);
            setPreviewContent(code);
            setOutput('✅ HTML preview rendered');
            return;
        }

        setIsRunning(true);
        setOutput('⏳ Executing code...\n');

        try {
            const res = await editorService.executeCode(code, language, roomId);

            const result = res.output || 'No output';
            setOutput(`✅ Execution completed\n\n${result}`);

            if (socket) {
                socket.emit('output-change', { roomId, output: result }, (err) => {
                    if (err?.type !== 'cancelation') {
                        console.error('Output emit error:', err?.message || err);
                    }
                });
            }
        } catch (err) {
            const errorMsg = err.response?.data?.error || (typeof err.message === 'string' ? err.message : err?.toString() || 'Unknown error occurred') || 'Execution failed';
            setOutput(`❌ Error\n\n${errorMsg}`);
        } finally {
            setIsRunning(false);
        }
    };

    const handleClearOutput = () => {
        setOutput('');
    };

    const handleNewFile = () => {
        const extensions = {
            javascript: 'js',
            typescript: 'ts',
            python: 'py',
            java: 'java',
            cpp: 'cpp',
            c: 'c',
            go: 'go',
            rust: 'rs',
            php: 'php',
            ruby: 'rb',
            swift: 'swift',
            kotlin: 'kt',
            scala: 'scala',
            perl: 'pl',
            r: 'r',
            bash: 'sh',
            sql: 'sql',
            html: 'html',
            css: 'css',
            json: 'json',
            xml: 'xml',
            yaml: 'yaml',
            markdown: 'md',
            lua: 'lua',
            dart: 'dart',
            elixir: 'ex',
            haskell: 'hs',
            clojure: 'clj',
            assembly: 'asm'
        };
        const ext = extensions[language];
        const newFileName = `untitled-${Date.now()}.${ext}`;
        const newFile = { name: newFileName, content: languageTemplates[language] };
        const updatedFiles = [...files, newFile];
        setFiles(updatedFiles);
        setActiveFile(newFile);
        setCode(newFile.content);

        if (socket) {
            socket.emit('file-update', { roomId, files: updatedFiles });
        }
    };

    const handleSaveFile = async () => {
        if (activeFile) {
            const updatedFiles = files.map(f =>
                f.name === activeFile.name ? { ...f, content: code } : f
            );
            setFiles(updatedFiles);

            // Save to backend
            try {
                await editorService.saveFile(roomId, activeFile.name, code, language);
            } catch (err) {
                console.error('Failed to save file:', err);
            }

            if (socket) {
                socket.emit('file-update', { roomId, files: updatedFiles });
            }

            const toast = document.createElement('div');
            toast.className = 'fixed top-20 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            toast.textContent = '✓ File saved!';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        }
    };

    const handleSendMessage = (message) => {
        if (socket) {
            socket.emit('chat-message', {
                roomId,
                userId: user._id,
                userName: user.name,
                message,
                timestamp: new Date()
            });
        }
    };

    const handleInviteCollaborator = () => {
        copyRoomLink();
    };

    const handleFileSelect = (file) => {
        if (activeFile) {
            const updatedFiles = files.map(f =>
                f.name === activeFile.name ? { ...f, content: code } : f
            );
            setFiles(updatedFiles);
        }

        setActiveFile(file);
        setCode(file.content);
    };

    const handleFileCreate = (name) => {
        const newFile = { name, content: languageTemplates[language] || '// New file\n' };
        const updatedFiles = [...files, newFile];
        setFiles(updatedFiles);
        setActiveFile(newFile);
        setCode(newFile.content);

        if (socket) {
            socket.emit('file-update', { roomId, files: updatedFiles });
        }
    };

    const handleFileDelete = (fileName) => {
        if (files.length === 1) {
            alert('Cannot delete the last file');
            return;
        }

        const updatedFiles = files.filter(f => f.name !== fileName);
        setFiles(updatedFiles);

        if (activeFile?.name === fileName) {
            setActiveFile(updatedFiles[0]);
            setCode(updatedFiles[0].content);
        }

        if (socket) {
            socket.emit('file-update', { roomId, files: updatedFiles });
        }
    };

    const copyRoomLink = () => {
        const roomLink = `${window.location.origin}/student/code-editor?room=${roomId}`;
        navigator.clipboard.writeText(roomLink);

        const toast = document.createElement('div');
        toast.className = 'fixed top-20 right-4 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = '✓ Room link copied!';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const downloadCode = () => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = activeFile?.name || 'code.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="h-screen bg-[#0d1117] flex flex-col overflow-hidden font-sans">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 md:py-4 flex flex-col sm:flex-row sm:items-center justify-between shadow-2xl relative z-50 shrink-0 gap-3 sm:gap-0">
                <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                    <button
                        onClick={() => navigate('/student/dashboard')}
                        className="text-slate-400 hover:text-white transition-colors p-2 md:px-3 lg:py-1.5 rounded-lg hover:bg-white/5 shrink-0"
                        title="Back to Dashboard"
                    >
                        <span className="md:hidden">←</span>
                        <span className="hidden md:inline text-xs font-bold uppercase tracking-widest">← Back</span>
                    </button>
                    <div className="hidden md:block h-6 w-px bg-slate-800"></div>
                    <h1 className="text-white font-black text-xs md:text-sm uppercase tracking-widest italic shrink-0 hidden sm:block">Code Editor</h1>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className={`flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${isConnected
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                                }`}></div>
                            {isConnected ? 'Syncing' : 'Offline'}
                        </div>
                        <div className="px-2 md:px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                            <span className="hidden md:inline">Nodes:</span> {collaborators.length}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="bg-white/5 text-slate-300 px-3 py-1.5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest outline-none border border-white/10 focus:border-indigo-500 cursor-pointer hover:bg-white/10 transition-colors shrink-0"
                    >
                        <optgroup label="Web">
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                        </optgroup>
                        <optgroup label="Popular">
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="c">C</option>
                            <option value="go">Go</option>
                            <option value="rust">Rust</option>
                        </optgroup>
                        {/* other options condensed for brevity in UI */}
                        <optgroup label="Misc">
                            <option value="php">PHP</option>
                            <option value="ruby">Ruby</option>
                            <option value="swift">Swift</option>
                            <option value="sql">SQL</option>
                            <option value="bash">Bash</option>
                        </optgroup>
                    </select>

                    <button onClick={handleNewFile} className="p-1.5 md:px-3 md:py-1.5 bg-white/5 text-slate-300 rounded-xl text-xs font-bold hover:bg-white/10 hover:text-white transition-colors border border-white/5 shrink-0" title="New File">
                        <span className="md:hidden">📄</span>
                        <span className="hidden md:inline">📄 New</span>
                    </button>

                    <button onClick={handleSaveFile} className="p-1.5 md:px-3 md:py-1.5 bg-white/5 text-slate-300 rounded-xl text-xs font-bold hover:bg-white/10 hover:text-white transition-colors border border-white/5 shrink-0" title="Save File">
                        <span className="md:hidden">💾</span>
                        <span className="hidden md:inline">💾 Save</span>
                    </button>

                    <button onClick={downloadCode} className="p-1.5 md:px-3 md:py-1.5 bg-white/5 text-slate-300 rounded-xl text-xs font-bold hover:bg-white/10 hover:text-white transition-colors border border-white/5 shrink-0" title="Download">
                        ⬇️
                    </button>

                    {language === 'html' && (
                        <button onClick={() => setShowPreview(!showPreview)} className={`p-1.5 md:px-3 md:py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 border ${showPreview ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border-white/5'}`} title="Preview">
                            👁️
                        </button>
                    )}

                    <button onClick={copyRoomLink} className="p-1.5 md:px-3 md:py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition-colors shrink-0" title="Copy Link">
                        <span className="md:hidden">🔗</span>
                        <span className="hidden md:inline">🔗 Share</span>
                    </button>

                    <button
                        onClick={handleRunCode}
                        disabled={isRunning}
                        className="px-4 py-1.5 md:py-2 bg-indigo-600 text-white rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors disabled:opacity-50 shrink-0 flex items-center gap-2 italic shadow-lg shadow-indigo-600/20"
                    >
                        {isRunning ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '▶ Execute'}
                    </button>
                </div>
            </header>

            {/* Mobile Nav Tabs */}
            <div className="lg:hidden flex bg-slate-900 border-b border-slate-800 shrink-0">
                <button onClick={() => setMobileView('files')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${mobileView === 'files' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}>
                    Files
                </button>
                <button onClick={() => setMobileView('editor')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${mobileView === 'editor' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}>
                    Editor
                </button>
                <button onClick={() => setMobileView('console')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${mobileView === 'console' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}>
                    Console
                </button>
                <button onClick={() => setMobileView('chat')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${mobileView === 'chat' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5' : 'text-slate-500 hover:text-slate-300'}`}>
                    Chat
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* File Explorer */}
                <AnimatePresence>
                    {(showFiles || mobileView === 'files') && (
                        <motion.div
                            initial={window.innerWidth >= 1024 ? { width: 0 } : false}
                            animate={window.innerWidth >= 1024 ? { width: 250 } : { width: '100%' }}
                            exit={window.innerWidth >= 1024 ? { width: 0 } : false}
                            className={`bg-slate-900 border-r border-slate-800 overflow-hidden shrink-0 ${mobileView === 'files' ? 'block' : 'hidden lg:block'}`}
                        >
                            <FileExplorer
                                files={files}
                                activeFile={activeFile}
                                onFileSelect={handleFileSelect}
                                onFileCreate={handleFileCreate}
                                onFileDelete={handleFileDelete}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Code Editor Area */}
                <div className={`flex-1 flex-col overflow-hidden bg-[#09090b] relative z-10 ${mobileView === 'editor' || mobileView === 'console' ? 'flex' : 'hidden lg:flex'}`}>
                    {/* Active File Tab */}
                    {activeFile && (
                        <div className={`bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-2 ${mobileView === 'console' ? 'hidden lg:flex' : 'flex'}`}>
                            <span className="text-white text-xs font-bold font-mono py-1 px-3 bg-white/5 rounded-lg border border-white/5">{activeFile.name}</span>
                        </div>
                    )}

                    <div className={`flex-1 relative overflow-hidden ${mobileView === 'console' ? 'hidden lg:block' : 'block'}`}>
                        <CodeEditorComponent
                            ref={editorRef}
                            code={code}
                            language={language}
                            theme={theme}
                            fontSize={fontSize}
                            onChange={handleCodeChange}
                            collaborators={collaborators}
                            isDebugging={isDebugging}
                            breakpoints={breakpoints}
                            onBreakpointToggle={(line) => {
                                setBreakpoints(prev =>
                                    prev.includes(line)
                                        ? prev.filter(l => l !== line)
                                        : [...prev, line]
                                );
                            }}
                        />
                    </div>

                    {/* Output Panel / Console */}
                    <div className={`${mobileView === 'console' ? 'flex-1 border-t-0' : 'h-[30vh] lg:h-64 border-t'} border-slate-800 bg-slate-950 flex flex-col relative z-20 ${mobileView === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
                        <OutputPanel
                            output={output}
                            isRunning={isRunning}
                            onClear={handleClearOutput}
                        />
                    </div>

                    {/* HTML Preview Panel */}
                    <AnimatePresence>
                        {showPreview && language === 'html' && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: '40vh' }}
                                exit={{ height: 0 }}
                                className="bg-white border-t border-slate-700 flex flex-col absolute bottom-0 left-0 right-0 z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]"
                            >
                                <div className="px-4 py-2 bg-slate-900 border-b border-slate-700 flex items-center justify-between shadow-md">
                                    <h3 className="text-white font-bold text-xs uppercase tracking-widest">HTML Preview Viewport</h3>
                                    <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-white transition-colors p-1 bg-white/5 rounded-md">
                                        ✕
                                    </button>
                                </div>
                                <div className="flex-1 overflow-hidden bg-white">
                                    <iframe srcDoc={previewContent} className="w-full h-full border-0" sandbox="allow-scripts" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Chat & Collaborators right sidebar */}
                <AnimatePresence>
                    {(showChat || mobileView === 'chat') && (
                        <motion.div
                            initial={window.innerWidth >= 1024 ? { width: 0 } : false}
                            animate={window.innerWidth >= 1024 ? { width: 320 } : { width: '100%' }}
                            exit={window.innerWidth >= 1024 ? { width: 0 } : false}
                            className={`bg-slate-900 border-l border-slate-800 flex-col overflow-hidden z-20 shrink-0 ${mobileView === 'chat' ? 'flex' : 'hidden lg:flex'}`}
                        >
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <CollaboratorsList
                                    collaborators={collaborators}
                                    currentUser={user}
                                    onInvite={handleInviteCollaborator}
                                />
                                <div className="h-px bg-slate-800 w-full shrink-0" />
                                <ChatPanel
                                    messages={messages}
                                    currentUser={user}
                                    onSendMessage={handleSendMessage}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Float Desktop Toggles */}
            <div className="hidden lg:block">
                <button
                    onClick={() => setShowFiles(!showFiles)}
                    className="fixed left-4 bottom-8 w-10 h-10 bg-slate-800/80 backdrop-blur border border-slate-700 text-white rounded-xl hover:bg-slate-700 transition-colors shadow-xl z-50 flex items-center justify-center text-sm"
                    title="Toggle File Explorer"
                >
                    {showFiles ? '◀' : '📁'}
                </button>

                <button
                    onClick={() => setShowChat(!showChat)}
                    className="fixed right-4 bottom-8 w-10 h-10 bg-slate-800/80 backdrop-blur border border-slate-700 text-white rounded-xl hover:bg-slate-700 transition-colors shadow-xl z-50 flex items-center justify-center text-sm"
                    title="Toggle Chat"
                >
                    {showChat ? '▶' : '💬'}
                </button>
            </div>
        </div>
    );
}

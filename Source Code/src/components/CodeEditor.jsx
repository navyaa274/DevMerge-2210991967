import React from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({ value, onChange, language = 'javascript', readOnly = false }) {
  const languageMap = {
    javascript: 'javascript',
    python: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    go: 'go',
    rust: 'rust',
    html: 'html',
    css: 'css',
    sql: 'sql'
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-gray-900 flex flex-col h-full min-h-[400px]">
      <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
        <span className="text-gray-300 text-sm">Language: {language}</span>
      </div>
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={languageMap[language] || 'javascript'}
          theme="vs-dark"
          value={value}
          onChange={(val) => !readOnly && onChange(val || '')}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            tabSize: 4
          }}
        />
      </div>
    </div>
  );
}

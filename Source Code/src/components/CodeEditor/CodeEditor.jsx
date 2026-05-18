import React, { useRef, useImperativeHandle, forwardRef, useEffect, useCallback } from 'react';
import SafeMonacoEditor from './SafeMonacoEditor';

const languageMap = {
    c: 'c',
    cpp: 'cpp',
    javascript: 'javascript',
    typescript: 'typescript',
    python: 'python',
    java: 'java',
    go: 'go',
    rust: 'rust',
    php: 'php',
    ruby: 'ruby',
    swift: 'swift',
    kotlin: 'kotlin',
    scala: 'scala',
    perl: 'perl',
    r: 'r',
    bash: 'shell',
    sql: 'sql',
    html: 'html',
    css: 'css',
    json: 'json',
    xml: 'xml',
    yaml: 'yaml',
    markdown: 'markdown',
    lua: 'lua',
    dart: 'dart',
    elixir: 'elixir',
    haskell: 'haskell',
    clojure: 'clojure',
    assembly: 'asm'
};

const CodeEditor = forwardRef(({
    code,
    language,
    theme,
    fontSize = 14,
    onChange,
    collaborators = [],
    isDebugging,
    breakpoints = [],
    onBreakpointToggle
}, ref) => {
    const editorRef = useRef(null);
    const decorationsCollectionRef = useRef(null);
    const monacoRef = useRef(null);

    const handleEditorDidMount = useCallback((editor) => {
        try {
            editorRef.current = editor;
            
            // Create decorations collection for breakpoints
            if (editor && editor.createDecorationsCollection) {
                decorationsCollectionRef.current = editor.createDecorationsCollection([]);
            }

            // Add click listener for breakpoints
            if (editor && editor.onMouseDown) {
                editor.onMouseDown((e) => {
                    try {
                        if (isDebugging && e?.target) {
                            // Check if clicked on gutter margin
                            const isGutterClick = e.target.type === 2; // MouseTargetType.GUTTER_GLYPH_MARGIN
                            if (isGutterClick && e.target.position) {
                                const line = e.target.position.lineNumber;
                                if (onBreakpointToggle && typeof onBreakpointToggle === 'function') {
                                    onBreakpointToggle(line);
                                }
                            }
                        }
                    } catch (err) {
                        console.error('Breakpoint toggle error:', err?.message || err);
                    }
                });
            }

            console.log('✅ Monaco Editor mounted successfully');
        } catch (err) {
            console.error('Editor mount error:', err?.message || err);
        }
    }, [isDebugging, onBreakpointToggle]);

    // Update breakpoint decorations
    useEffect(() => {
        try {
            if (editorRef.current && decorationsCollectionRef.current && isDebugging) {
                const newDecorations = (breakpoints || []).map(line => ({
                    range: {
                        startLineNumber: line,
                        startColumn: 1,
                        endLineNumber: line,
                        endColumn: 1
                    },
                    options: {
                        isWholeLine: true,
                        className: 'breakpoint-line',
                        glyphMarginClassName: 'breakpoint-glyph',
                        glyphMarginHoverMessage: { value: 'Click to remove breakpoint' }
                    }
                }));

                decorationsCollectionRef.current.set(newDecorations);
            }
        } catch (err) {
            console.error('Breakpoint decoration error:', err?.message || err);
        }
    }, [breakpoints, isDebugging]);

    // Expose editor methods via ref
    useImperativeHandle(ref, () => ({
        getEditor: () => editorRef.current,
        getValue: () => editorRef.current?.getValue() || '',
        setValue: (value) => {
            if (editorRef.current) {
                editorRef.current.setValue(value);
            }
        },
        focus: () => {
            if (editorRef.current) {
                editorRef.current.focus();
            }
        },
        layout: () => {
            if (editorRef.current) {
                editorRef.current.layout();
            }
        },
        showRemoteCursor: (data) => {
            // Placeholder for remote cursor implementation
            console.log('Remote cursor:', data);
        }
    }), []);

    return (
        <div className="flex-1 overflow-hidden relative" style={{ height: '100%' }}>
            <style>{`
                .breakpoint-glyph {
                    background-color: #ef4444;
                    border-radius: 50%;
                    width: 10px !important;
                    height: 10px !important;
                    margin-left: 5px;
                    margin-top: 5px;
                    cursor: pointer;
                }
                .breakpoint-glyph:hover {
                    background-color: #dc2626;
                    box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
                }
                .breakpoint-line {
                    background-color: rgba(239, 68, 68, 0.1);
                    border-left: 3px solid #ef4444;
                }
            `}</style>
            <SafeMonacoEditor
                code={code || ''}
                language={languageMap[language] || 'javascript'}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                fontSize={fontSize || 14}
                onChange={onChange}
                onMount={handleEditorDidMount}
                options={{
                    glyphMargin: isDebugging || false,
                    readOnly: false,
                    scrollbar: {
                        vertical: 'auto',
                        horizontal: 'auto',
                        useShadows: true,
                        verticalSliderSize: 12,
                        horizontalSliderSize: 12
                    },
                    renderWhitespace: 'none',
                    renderControlCharacters: false,
                    renderIndentGuides: true,
                    highlightActiveIndentGuide: true,
                    bracketPairColorization: {
                        enabled: true,
                        independentColorPoolPerBracketType: false
                    }
                }}
            />
        </div>
    );
});

CodeEditor.displayName = 'CodeEditor';

export default CodeEditor;

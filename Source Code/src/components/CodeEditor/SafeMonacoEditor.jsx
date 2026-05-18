import React, { Component } from 'react';
import Editor from '@monaco-editor/react';

/**
 * SafeMonacoEditor - Error boundary wrapper for Monaco Editor
 * Prevents the entire app from crashing if Monaco throws an error
 */
class SafeMonacoEditor extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false,
            errorMessage: null,
            isLoading: true
        };
        this.editorRef = null;
    }

    static getDerivedStateFromError(error) {
        console.error('Monaco Editor Error (getDerivedStateFromError):', error);
        return { 
            hasError: true,
            errorMessage: error?.message || String(error),
            isLoading: false
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Monaco Editor Error (componentDidCatch):', error);
        console.error('Error Info:', errorInfo);
        console.error('Error Stack:', error?.stack);
        this.setState({
            errorMessage: error?.message || 'Monaco Editor failed to load',
            isLoading: false
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, errorMessage: null, isLoading: true });
    };

    handleEditorDidMount = (editor) => {
        try {
            this.editorRef = editor;
            if (this.props.onMount && typeof this.props.onMount === 'function') {
                this.props.onMount(editor, null);
            }
            this.setState({ isLoading: false });
        } catch (err) {
            console.error('Editor mount error:', err?.message || err);
        }
    };

    handleChange = (value) => {
        try {
            if (this.props.onChange && typeof this.props.onChange === 'function') {
                this.props.onChange(value);
            }
        } catch (err) {
            console.error('Monaco onChange error:', err?.message || err);
        }
    };

    render() {
        const { hasError, errorMessage, isLoading } = this.state;

        if (hasError) {
            return (
                <div className="flex-1 bg-slate-800 flex flex-col items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-white font-bold mb-2">Code Editor Failed to Load</h3>
                        <p className="text-slate-400 text-sm mb-4">{errorMessage}</p>
                        <button
                            onClick={this.handleReset}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex-1 overflow-hidden relative" style={{ height: '100%' }}>
                {isLoading && (
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center z-50">
                        <div className="text-center">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-slate-400 text-sm">Loading editor...</p>
                        </div>
                    </div>
                )}
                <Editor
                    height="100%"
                    language={this.props.language || 'javascript'}
                    theme={this.props.theme === 'dark' ? 'vs-dark' : 'light'}
                    value={this.props.code || ''}
                    onChange={this.handleChange}
                    onMount={this.handleEditorDidMount}
                    options={{
                        fontSize: this.props.fontSize || 14,
                        minimap: { enabled: false },
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        automaticLayout: true,
                        tabSize: 4,
                        formatOnPaste: true,
                        formatOnType: true,
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: {
                            other: true,
                            comments: false,
                            strings: false
                        },
                        ...this.props.options
                    }}
                    loading={
                        <div className="flex items-center justify-center h-full bg-slate-800">
                            <div className="text-center">
                                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                <p className="text-slate-400 text-sm">Loading Monaco Editor...</p>
                            </div>
                        </div>
                    }
                />
            </div>
        );
    }
}

export default SafeMonacoEditor;

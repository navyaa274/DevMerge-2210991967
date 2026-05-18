import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        // Log detailed error information
        console.error('ErrorBoundary caught error:', error);
        console.error('Error message:', error?.message);
        console.error('Error stack:', error?.stack);
        console.error('Error info:', errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            const errorMessage = this.state.error?.message || this.state.error?.toString() || 'Unknown error';
            const errorStack = this.state.errorInfo?.componentStack || '';
            
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-900 p-8">
                    <div className="max-w-lg w-full text-center">
                        <div className="w-20 h-20 mx-auto mb-6 bg-rose-100 dark:bg-rose-900/20 rounded-3xl flex items-center justify-center">
                            <svg className="w-10 h-10 text-rose-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            An unexpected error occurred. This section failed to render.
                        </p>
                        {errorMessage && (
                            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-xl border border-rose-200 dark:border-rose-800/30 text-left">
                                <p className="text-xs font-mono text-rose-700 dark:text-rose-300 break-all">
                                    <strong>Error:</strong> {errorMessage}
                                </p>
                                {errorStack && (
                                    <p className="text-xs font-mono text-rose-600 dark:text-rose-400 break-all mt-2 max-h-32 overflow-y-auto">
                                        <strong>Stack:</strong> {errorStack}
                                    </p>
                                )}
                            </div>
                        )}
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-6 py-3 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-6 py-3 bg-slate-200 dark:bg-dark-700 text-slate-900 dark:text-white rounded-xl font-bold text-sm hover:bg-slate-300 dark:hover:bg-dark-600 transition-colors"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

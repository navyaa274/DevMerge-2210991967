const axios = require('axios');

const PISTON_URL = process.env.CODE_EXECUTOR_URL || 'http://localhost:5050';
const EXECUTOR_TYPE = process.env.CODE_EXECUTOR_TYPE || 'piston';

/**
 * Piston Code Executor
 * Supports both local Piston and public Piston API
 */
class PistonExecutor {
    constructor() {
        this.baseURL = PISTON_URL;
        this.executorType = EXECUTOR_TYPE;
        this.timeout = 15000; // 15 seconds
        
        console.log(`Code Executor: ${this.executorType} at ${this.baseURL}`);
    }

    /**
     * Language mapping for Piston
     */
    getLanguageVersion(language) {
        const languageMap = {
            javascript: { language: 'javascript', version: '18.15.0' },
            typescript: { language: 'typescript', version: '5.0.3' },
            python: { language: 'python', version: '3.10.0' },
            java: { language: 'java', version: '15.0.2' },
            cpp: { language: 'c++', version: '10.2.0' },
            c: { language: 'c', version: '10.2.0' },
            csharp: { language: 'csharp', version: '6.12.0' },
            go: { language: 'go', version: '1.16.2' },
            rust: { language: 'rust', version: '1.68.2' },
            ruby: { language: 'ruby', version: '3.0.1' },
            php: { language: 'php', version: '8.2.3' }
        };

        return languageMap[language.toLowerCase()] || languageMap['python'];
    }

    /**
     * Execute code using Piston
     */
    async executeCode(language, code, stdin = '', args = []) {
        try {
            const langConfig = this.getLanguageVersion(language);
            
            // Different payload format for public API
            const payload = this.executorType === 'piston-public' ? {
                language: langConfig.language,
                version: langConfig.version,
                files: [{
                    content: code
                }],
                stdin: stdin || '',
                args: args || []
            } : {
                language: langConfig.language,
                version: langConfig.version,
                files: [{
                    name: this.getFileName(language),
                    content: code
                }],
                stdin: stdin || '',
                args: args || [],
                compile_timeout: 10000,
                run_timeout: 5000
            };

            console.log(`Executing ${language} code via ${this.executorType}...`);
            
            const endpoint = this.executorType === 'piston-public' ? '/execute' : '/execute';
            const response = await axios.post(`${this.baseURL}${endpoint}`, payload, {
                timeout: this.timeout,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = response.data;

            // Format response (same for both)
            return {
                success: !result.compile || result.compile.code === 0,
                output: result.run?.stdout || result.stdout || '',
                error: result.run?.stderr || result.stderr || result.compile?.stderr || '',
                executionTime: result.run?.runtime || 0,
                memory: result.run?.memory || 0,
                exitCode: result.run?.code || result.code || 0
            };

        } catch (error) {
            console.error('Piston execution error:', error.message);
            
            if (error.response) {
                return {
                    success: false,
                    output: '',
                    error: error.response.data?.message || 'Code execution failed',
                    executionTime: 0,
                    memory: 0
                };
            }

            return {
                success: false,
                output: '',
                error: error.message || 'Failed to connect to code executor',
                executionTime: 0,
                memory: 0
            };
        }
    }

    /**
     * Get appropriate filename for language
     */
    getFileName(language) {
        const fileNames = {
            javascript: 'main.js',
            typescript: 'main.ts',
            python: 'main.py',
            java: 'Main.java',
            cpp: 'main.cpp',
            c: 'main.c',
            csharp: 'Main.cs',
            go: 'main.go',
            rust: 'main.rs',
            ruby: 'main.rb',
            php: 'main.php'
        };

        return fileNames[language.toLowerCase()] || 'main.txt';
    }

    /**
     * Get available runtimes from Piston
     */
    async getRuntimes() {
        try {
            const response = await axios.get(`${this.baseURL}/runtimes`, {
                timeout: 5000
            });
            return response.data;
        } catch (error) {
            console.error('Failed to get runtimes:', error.message);
            return [];
        }
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await axios.get(`${this.baseURL}/runtimes`, {
                timeout: 3000
            });
            return {
                status: 'healthy',
                runtimes: response.data.length
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }
}

module.exports = new PistonExecutor();

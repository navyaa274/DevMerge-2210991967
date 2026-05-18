const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const execPromise = util.promisify(exec);

/**
 * System Code Executor
 * Uses local system compilers (Python, Java, C++, etc.)
 * WARNING: Only for development! Not secure for production.
 */
class SystemExecutor {
    constructor() {
        this.tempDir = path.join(__dirname, '../executor/temp');
        this.timeout = 10000; // 10 seconds
        this.maxBuffer = 1024 * 1024; // 1MB
        this.ensureTempDir();
    }

    async ensureTempDir() {
        try {
            await fs.mkdir(this.tempDir, { recursive: true });
        } catch (error) {
            console.error('Failed to create temp directory:', error);
        }
    }

    /**
     * Main execute method - matches dockerExecutor interface
     */
    async execute(code, language, fileName, input = '') {
        console.log(`💻 Using system executor for ${language}`);
        return await this.executeCode(language, code, input);
    }

    /**
     * Execute code using system compilers
     */
    async executeCode(language, code, stdin = '') {
        const sessionId = uuidv4();
        const sessionDir = path.join(this.tempDir, sessionId);

        try {
            // Create session directory
            await fs.mkdir(sessionDir, { recursive: true });

            // Execute based on language
            let result;
            switch (language.toLowerCase()) {
                case 'python':
                    result = await this.executePython(sessionDir, code, stdin);
                    break;
                case 'javascript':
                case 'js':
                    result = await this.executeJavaScript(sessionDir, code, stdin);
                    break;
                case 'java':
                    result = await this.executeJava(sessionDir, code, stdin);
                    break;
                case 'cpp':
                case 'c++':
                    result = await this.executeCpp(sessionDir, code, stdin);
                    break;
                case 'c':
                    result = await this.executeC(sessionDir, code, stdin);
                    break;
                default:
                    throw new Error(`Language ${language} not supported`);
            }

            return result;

        } catch (error) {
            return {
                success: false,
                output: '',
                error: error.message || 'Execution failed',
                executionTime: 0,
                memory: 0
            };
        } finally {
            // Cleanup
            try {
                await fs.rm(sessionDir, { recursive: true, force: true });
            } catch (error) {
                console.error('Cleanup failed:', error);
            }
        }
    }

    /**
     * Execute Python code
     */
    async executePython(sessionDir, code, stdin) {
        const filePath = path.join(sessionDir, 'main.py');
        await fs.writeFile(filePath, code);

        const startTime = Date.now();
        try {
            const { stdout, stderr } = await execPromise(
                `python "${filePath}"`,
                {
                    timeout: this.timeout,
                    input: stdin,
                    maxBuffer: 1024 * 1024
                }
            );
            const executionTime = Date.now() - startTime;

            return {
                success: true,
                output: stdout,
                error: stderr,
                executionTime,
                memory: 0,
                exitCode: 0
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                success: false,
                output: error.stdout || '',
                error: error.stderr || error.message,
                executionTime,
                memory: 0,
                exitCode: error.code || 1
            };
        }
    }

    /**
     * Execute JavaScript code
     */
    async executeJavaScript(sessionDir, code, stdin) {
        const filePath = path.join(sessionDir, 'main.js');
        await fs.writeFile(filePath, code);

        const startTime = Date.now();
        try {
            const { stdout, stderr } = await execPromise(
                `node "${filePath}"`,
                {
                    timeout: this.timeout,
                    input: stdin,
                    maxBuffer: 1024 * 1024
                }
            );
            const executionTime = Date.now() - startTime;

            return {
                success: true,
                output: stdout,
                error: stderr,
                executionTime,
                memory: 0,
                exitCode: 0
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                success: false,
                output: error.stdout || '',
                error: error.stderr || error.message,
                executionTime,
                memory: 0,
                exitCode: error.code || 1
            };
        }
    }

    /**
     * Execute Java code
     */
    async executeJava(sessionDir, code, stdin) {
        // Extract class name from code
        const classNameMatch = code.match(/public\s+class\s+(\w+)/);
        const className = classNameMatch ? classNameMatch[1] : 'Main';
        
        const filePath = path.join(sessionDir, `${className}.java`);
        await fs.writeFile(filePath, code);

        const startTime = Date.now();
        try {
            // Compile
            await execPromise(`javac "${filePath}"`, {
                timeout: this.timeout,
                cwd: sessionDir
            });

            // Run
            const { stdout, stderr } = await execPromise(
                `java -cp "${sessionDir}" ${className}`,
                {
                    timeout: this.timeout,
                    input: stdin,
                    maxBuffer: 1024 * 1024
                }
            );
            const executionTime = Date.now() - startTime;

            return {
                success: true,
                output: stdout,
                error: stderr,
                executionTime,
                memory: 0,
                exitCode: 0
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                success: false,
                output: error.stdout || '',
                error: error.stderr || error.message,
                executionTime,
                memory: 0,
                exitCode: error.code || 1
            };
        }
    }

    /**
     * Execute C++ code
     */
    async executeCpp(sessionDir, code, stdin) {
        const sourceFile = path.join(sessionDir, 'main.cpp');
        const exeFile = path.join(sessionDir, 'main.exe');
        await fs.writeFile(sourceFile, code);

        const startTime = Date.now();
        try {
            // Compile
            await execPromise(`g++ "${sourceFile}" -o "${exeFile}"`, {
                timeout: this.timeout,
                cwd: sessionDir
            });

            // Run
            const { stdout, stderr } = await execPromise(
                `"${exeFile}"`,
                {
                    timeout: this.timeout,
                    input: stdin,
                    maxBuffer: 1024 * 1024
                }
            );
            const executionTime = Date.now() - startTime;

            return {
                success: true,
                output: stdout,
                error: stderr,
                executionTime,
                memory: 0,
                exitCode: 0
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                success: false,
                output: error.stdout || '',
                error: error.stderr || error.message,
                executionTime,
                memory: 0,
                exitCode: error.code || 1
            };
        }
    }

    /**
     * Execute C code
     */
    async executeC(sessionDir, code, stdin) {
        const sourceFile = path.join(sessionDir, 'main.c');
        const exeFile = path.join(sessionDir, 'main.exe');
        await fs.writeFile(sourceFile, code);

        const startTime = Date.now();
        try {
            // Compile
            await execPromise(`gcc "${sourceFile}" -o "${exeFile}"`, {
                timeout: this.timeout,
                cwd: sessionDir
            });

            // Run
            const { stdout, stderr } = await execPromise(
                `"${exeFile}"`,
                {
                    timeout: this.timeout,
                    input: stdin,
                    maxBuffer: 1024 * 1024
                }
            );
            const executionTime = Date.now() - startTime;

            return {
                success: true,
                output: stdout,
                error: stderr,
                executionTime,
                memory: 0,
                exitCode: 0
            };
        } catch (error) {
            const executionTime = Date.now() - startTime;
            return {
                success: false,
                output: error.stdout || '',
                error: error.stderr || error.message,
                executionTime,
                memory: 0,
                exitCode: error.code || 1
            };
        }
    }

    /**
     * Get file extension for language (matches dockerExecutor interface)
     */
    getFileExtension(language) {
        const extensions = {
            javascript: 'js',
            js: 'js',
            typescript: 'ts',
            python: 'py',
            java: 'java',
            cpp: 'cpp',
            'c++': 'cpp',
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
            lua: 'lua',
            dart: 'dart',
            haskell: 'hs'
        };
        return extensions[language.toLowerCase()] || 'txt';
    }

    /**
     * Health check
     */
    async healthCheck() {
        const checks = {
            python: false,
            node: false,
            java: false,
            gcc: false
        };

        try {
            await execPromise('python --version');
            checks.python = true;
        } catch (e) {}

        try {
            await execPromise('node --version');
            checks.node = true;
        } catch (e) {}

        try {
            await execPromise('javac -version');
            checks.java = true;
        } catch (e) {}

        try {
            await execPromise('gcc --version');
            checks.gcc = true;
        } catch (e) {}

        return {
            status: 'healthy',
            compilers: checks,
            message: 'System executor ready (development mode)'
        };
    }
}

module.exports = new SystemExecutor();

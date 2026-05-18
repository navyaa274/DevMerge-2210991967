const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const execPromise = util.promisify(exec);

/**
 * Docker-based Code Executor
 * Provides isolated, secure code execution using Docker containers
 */
class DockerExecutor {
    constructor() {
        this.tempDir = path.join(__dirname, '../executor/temp');
        this.timeout = 10000; // 10 seconds
        this.maxBuffer = 1024 * 1024; // 1MB
        this.cache = new Map(); // Simple execution cache
        this.cacheLimit = 500;
    }

    /**
     * Hash utility for cache key
     */
    getCacheKey(code, language, input) {
        const crypto = require('crypto');
        return crypto.createHash('md5').update(`${language}:${code}:${input}`).digest('hex');
    }

    /**
     * Language to Docker image mapping
     */
    getDockerImage(language) {
        const imageMap = {
            javascript: 'node:20-alpine',
            typescript: 'node:20-alpine',
            python: 'python:3.11-alpine',
            java: 'openjdk:21-slim',
            cpp: 'gcc:13-alpine',
            c: 'gcc:13-alpine',
            go: 'golang:1.21-alpine',
            rust: 'rust:1.75-alpine',
            php: 'php:8.3-alpine',
            ruby: 'ruby:3.3-alpine',
            perl: 'perl:5.38-alpine',
            bash: 'alpine:latest',
            lua: 'lua:5.4-alpine',
            r: 'r-base:4.3-alpine',
            swift: 'swift:5.9-alpine',
            kotlin: 'zenika/kotlin:1.9',
            scala: 'hseeberger/scala-sbt:17.0.1_2.13.12',
            dart: 'google/dart:3.2',
            haskell: 'haskell:9.6'
        };
        return imageMap[language] || null;
    }

    /**
     * Get Docker run command for language
     */
    getDockerCommand(language, fileName, containerPath) {
        const commands = {
            javascript: `node ${containerPath}/${fileName}`,
            typescript: `npx ts-node ${containerPath}/${fileName}`,
            python: `python ${containerPath}/${fileName}`,
            java: `cd ${containerPath} && javac ${fileName} && java ${fileName.replace('.java', '')}`,
            cpp: `cd ${containerPath} && g++ ${fileName} -o main && ./main`,
            c: `cd ${containerPath} && gcc ${fileName} -o main && ./main`,
            go: `cd ${containerPath} && go run ${fileName}`,
            rust: `cd ${containerPath} && rustc ${fileName} && ./$(basename ${fileName} .rs)`,
            php: `php ${containerPath}/${fileName}`,
            ruby: `ruby ${containerPath}/${fileName}`,
            perl: `perl ${containerPath}/${fileName}`,
            bash: `sh ${containerPath}/${fileName}`,
            lua: `lua ${containerPath}/${fileName}`,
            r: `Rscript ${containerPath}/${fileName}`,
            swift: `swift ${containerPath}/${fileName}`,
            kotlin: `cd ${containerPath} && kotlinc ${fileName} -include-runtime -d main.jar && java -jar main.jar`,
            scala: `cd ${containerPath} && scala ${fileName}`,
            dart: `dart ${containerPath}/${fileName}`,
            haskell: `cd ${containerPath} && ghc ${fileName} && ./$(basename ${fileName} .hs)`
        };
        return commands[language] || null;
    }

    /**
     * Execute code using Docker with stdin support
     */
    async executeWithDocker(code, language, fileName) {
        const sessionId = uuidv4();
        const sessionDir = path.join(this.tempDir, sessionId);
        const containerPath = '/code';

        try {
            // Create session directory
            await fs.mkdir(sessionDir, { recursive: true });

            // Write code file
            await fs.writeFile(path.join(sessionDir, fileName), code);

            // Get Docker image and command
            const image = this.getDockerImage(language);
            const command = this.getDockerCommand(language, fileName, containerPath);

            if (!image || !command) {
                throw new Error(`Language '${language}' not supported for Docker execution`);
            }

            // Build Docker run command with stdin support
            const dockerCmd = `docker run --rm -i -v "${sessionDir}:${containerPath}" -w ${containerPath} --memory="512m" --cpus="1" ${image} sh -c "${command}"`;

            console.log(`🐳 Executing with Docker: ${language}`);
            console.log(`📦 Image: ${image}`);

            // Execute with timeout
            const { stdout, stderr } = await execPromise(dockerCmd, {
                timeout: this.timeout,
                maxBuffer: this.maxBuffer
            });

            // Combine stdout and stderr, trim whitespace
            const output = (stdout || stderr || '').trim();
            console.log(`📤 Docker output: ${output}`);
            return { success: true, output };

        } catch (error) {
            // Handle timeout and other errors
            if (error.killed) {
                return { success: false, output: 'Execution timeout (10 seconds)' };
            }
            const output = (error.stdout || error.stderr || error.message || 'Execution error').trim();
            console.error(`❌ Docker error: ${output}`);
            return { success: false, output };
        } finally {
            // Cleanup
            try {
                await fs.rm(sessionDir, { recursive: true, force: true });
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
            }
        }
    }

    /**
     * Execute code using native runtime (fallback)
     */
    async executeNative(code, language, fileName, input = '') {
        const sessionId = uuidv4();
        const sessionDir = path.join(this.tempDir, sessionId);

        try {
            await fs.mkdir(sessionDir, { recursive: true });

            let wrappedCode = code;

            // For JavaScript, wrap in IIFE to create local scope and inject input
            if (language === 'javascript') {
                // Wrap in IIFE to avoid variable redeclaration across multiple executions
                // Each execution gets a fresh scope with unique variable names
                wrappedCode = `
(() => {
    const Input = ${JSON.stringify(input)};
    
    //  stdin for input reading
    const originalReadFileSync = require('fs').readFileSync;
    require('fs').readFileSync = function(fd, encoding) {
        if (fd === 0) return Input;
        return originalReadFileSync.apply(this, arguments);
    };
    
    // Capture console output
    const outputs = [];
    const originalLog = console.log;
    console.log = function(...args) {
        outputs.push(args.map(arg => String(arg)).join(' '));
        originalLog.apply(console, args);
    };
    
    try {
        ${code}
        
        // If solution function exists, call it with input
        if (typeof solution === 'function') {
            const result = solution(Input);
            if (result !== undefined && result !== null) {
                console.log(result);
            }
        }
    } catch (e) {
        console.error(e.message);
    }
})();
`;
            }
            // For Python, wrap to inject input and capture output
            else if (language === 'python') {
                wrappedCode = `
import sys
from io import StringIO

#  stdin
class Input:
    def __init__(self, data):
        self.data = data
        self.pos = 0
    
    def read(self, size=-1):
        if size == -1:
            result = self.data[self.pos:]
            self.pos = len(self.data)
        else:
            result = self.data[self.pos:self.pos+size]
            self.pos += size
        return result
    
    def readline(self):
        end = self.data.find('\\n', self.pos)
        if end == -1:
            result = self.data[self.pos:]
            self.pos = len(self.data)
        else:
            result = self.data[self.pos:end+1]
            self.pos = end + 1
        return result

sys.stdin = Input(${JSON.stringify(input)})

${code}

# If solution function exists, call it with input
if 'solution' in dir() and callable(solution):
    result = solution(${JSON.stringify(input)})
    if result is not None:
        print(result)
`;
            }
            // For Bash, no wrapping needed
            else if (language === 'bash') {
                wrappedCode = code;
            }

            await fs.writeFile(path.join(sessionDir, fileName), wrappedCode);

            let command = '';

            switch (language) {
                case 'javascript':
                    command = `node "${path.join(sessionDir, fileName)}"`;
                    break;
                case 'python':
                    command = `python "${path.join(sessionDir, fileName)}"`;
                    break;
                case 'bash':
                    command = `bash "${path.join(sessionDir, fileName)}"`;
                    break;
                default:
                    throw new Error(`Native execution not supported for ${language}`);
            }

            const { stdout, stderr } = await execPromise(command, {
                timeout: this.timeout,
                maxBuffer: this.maxBuffer
            });

            return { success: true, output: (stdout || stderr || '').trim() };

        } catch (error) {
            if (error.killed) {
                return { success: false, output: 'Execution timeout (10 seconds)' };
            }
            return { success: false, output: (error.stdout || error.stderr || error.message || 'Execution error').trim() };
        } finally {
            try {
                await fs.rm(sessionDir, { recursive: true, force: true });
            } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
            }
        }
    }

    /**
     * Main execute method - tries Docker first, falls back to native
     */
    async execute(code, language, fileName, input = '') {
        const cacheKey = this.getCacheKey(code, language, input);
        if (this.cache.has(cacheKey)) {
            console.log('⚡ Cache Hit: Execution results retrieved from memory');
            return this.cache.get(cacheKey);
        }

        try {
            // For now, use native execution for better compatibility with lab system
            console.log('📝 Using native execution for lab compatibility');
            const result = await this.executeNative(code, language, fileName, input);

            // Success caching
            if (result.success && this.cache.size < this.cacheLimit) {
                this.cache.set(cacheKey, result);
            }

            return result;
        } catch (nativeError) {
            console.warn('⚠️ Native execution failed, trying Docker');
            try {
                const result = await this.executeWithDocker(code, language, fileName);
                if (result.success && this.cache.size < this.cacheLimit) {
                    this.cache.set(cacheKey, result);
                }
                return result;
            } catch (dockerError) {
                console.error('❌ Both execution methods failed');
                return { success: false, output: 'Execution failed: ' + nativeError.message };
            }
        }
    }

    /**
     * Get file extension for language
     */
    getFileExtension(language) {
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
            lua: 'lua',
            dart: 'dart',
            haskell: 'hs'
        };
        return extensions[language] || 'txt';
    }
}

module.exports = new DockerExecutor();

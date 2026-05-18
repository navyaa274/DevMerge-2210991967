const express = require('express');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json({ limit: '100kb' }));

// Authentication middleware for code execution
const authenticateExecutor = (req, res, next) => {
    const apiKey = req.headers['x-executor-key'];
    if (!process.env.EXECUTOR_API_KEY) {
        // If no key configured, allow (development mode) but warn
        console.warn('WARNING: EXECUTOR_API_KEY not set. Executor is unprotected.');
        return next();
    }
    if (!apiKey || apiKey !== process.env.EXECUTOR_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: invalid or missing executor API key' });
    }
    next();
};

const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR);
}

const LANGUAGE_CONFIG = {
    javascript: {
        image: 'node:18-alpine',
        fileExt: 'js',
        command: (file) => ['node', file]
    },
    python: {
        image: 'python:3.10-alpine',
        fileExt: 'py',
        command: (file) => ['python', file]
    },
    cpp: {
        image: 'gcc:latest',
        fileExt: 'cpp',
        command: (file) => ['sh', '-c', `g++ ${file} -o /tmp/out && /tmp/out`]
    },
    c: {
        image: 'gcc:latest',
        fileExt: 'c',
        command: (file) => ['sh', '-c', `gcc ${file} -o /tmp/out && /tmp/out`]
    },
    java: {
        image: 'openjdk:17-slim',
        fileExt: 'java',
        command: (file) => ['sh', '-c', `javac ${file} && java ${file.replace('.java', '')}`]
    },
    go: {
        image: 'golang:1.21-alpine',
        fileExt: 'go',
        command: (file) => ['go', 'run', file]
    },
    rust: {
        image: 'rust:1.75-slim',
        fileExt: 'rs',
        command: (file) => ['sh', '-c', `rustc ${file} -o /tmp/out && /tmp/out`]
    },
    ruby: {
        image: 'ruby:3.2-alpine',
        fileExt: 'rb',
        command: (file) => ['ruby', file]
    },
    php: {
        image: 'php:8.2-cli-alpine',
        fileExt: 'php',
        command: (file) => ['php', file]
    },
    swift: {
        image: 'swift:5.9',
        fileExt: 'swift',
        command: (file) => ['swift', file]
    },
    bash: {
        image: 'bash:5.2',
        fileExt: 'sh',
        command: (file) => ['bash', file]
    },
    csharp: {
        image: 'mcr.microsoft.com/dotnet/sdk:8.0',
        fileExt: 'cs',
        // Compile and run C# file directly — file is already written with full source
        command: (file) => ['sh', '-c', `cp ${file} Program.cs && dotnet-script Program.cs || (csc Program.cs -out:/tmp/out.exe && mono /tmp/out.exe)`]
    }
};

let DOCKER_PATH = 'docker';
const POSSIBLE_PATHS = [
    'C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe',
    'C:\\PROGRA~1\\Docker\\Docker\\resources\\bin\\docker.exe',
    path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Docker\\Docker\\resources\\bin\\docker.exe'),
    '/usr/bin/docker',
    '/usr/local/bin/docker'
];

for (const p of POSSIBLE_PATHS) {
    if (fs.existsSync(p)) {
        DOCKER_PATH = p;
        break;
    }
}

async function checkDocker() {
    try {
        execSync(`"${DOCKER_PATH}" version`, { stdio: 'ignore' });
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Executes code in a Docker container with strict resource limits
 */
app.post('/execute', authenticateExecutor, async (req, res) => {
    const { code, language, testCases = [], timeLimit = 5000 } = req.body;
    let { memoryLimit = '256m', cpuLimit = '0.5' } = req.body;

    // Input validation
    if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Code is required and must be a string' });
    }
    if (code.length > 50 * 1024) {
        return res.status(400).json({ error: 'Code exceeds maximum size of 50KB' });
    }
    if (typeof timeLimit !== 'number' || timeLimit < 1000 || timeLimit > 30000) {
        return res.status(400).json({ error: 'timeLimit must be between 1000 and 30000 ms' });
    }
    if (Array.isArray(testCases) && testCases.length > 50) {
        return res.status(400).json({ error: 'Maximum 50 test cases allowed' });
    }

    // Normalize inputs
    if (typeof memoryLimit === 'number') memoryLimit = `${memoryLimit}m`;
    if (!LANGUAGE_CONFIG[language]) {
        return res.status(400).json({ error: `Unsupported language: ${language}` });
    }

    const isDockerRunning = await checkDocker();
    if (!isDockerRunning) {
        return res.status(503).json({
            error: 'Docker service is not available.',
            instruction: 'Please ensure Docker Desktop is running.'
        });
    }

    const config = LANGUAGE_CONFIG[language];
    const jobId = uuidv4();
    const sourceFile = language === 'java' ? 'Solution.java' : `script.${config.fileExt}`;
    const jobDir = path.join(TEMP_DIR, jobId);

    // Fix Java class name requirement
    let finalCode = code;
    if (language === 'java' && !code.includes('class Solution')) {
        // Simple heuristic to wrap if no class
        if (!code.includes('class')) {
            finalCode = `public class Solution {\n  public static void main(String[] args) {\n    ${code}\n  }\n}`;
        }
    }

    try {
        fs.mkdirSync(jobDir);
        fs.writeFileSync(path.join(jobDir, sourceFile), finalCode);

        const absoluteJobDir = path.resolve(jobDir);
        const results = [];
        let allPassed = true;

        if (testCases.length === 0) {
            const output = await runInDocker(absoluteJobDir, sourceFile, config, "", timeLimit, memoryLimit, cpuLimit);
            return res.json({
                status: output.code === 0 ? 'Accepted' : (output.timedOut ? 'Time Limit Exceeded' : 'Runtime Error'),
                output: output.stdout || output.stderr,
                runtime: output.time,
                timedOut: output.timedOut
            });
        }

        for (const tc of testCases) {
            const output = await runInDocker(absoluteJobDir, sourceFile, config, tc.input || "", timeLimit, memoryLimit, cpuLimit);
            const actual = (output.stdout || "").trim();
            const expected = (tc.output || "").trim();
            const passed = actual === expected && output.code === 0 && !output.timedOut;

            if (!passed) allPassed = false;

            results.push({
                input: tc.input,
                expected: tc.output,
                actual: passed ? actual : (output.timedOut ? 'TLE' : (actual || output.stderr)),
                passed,
                time: output.time,
                timedOut: output.timedOut
            });
        }

        res.json({
            status: allPassed ? 'Accepted' : 'Wrong Answer',
            testResults: results
        });

    } catch (err) {
        console.error('Execution Error:', err);
        res.status(500).json({ error: 'Internal execution error' });
    } finally {
        try {
            // Cleanup: Using a slight delay to ensure file handles are released by Docker
            setTimeout(() => {
                if (fs.existsSync(jobDir)) {
                    fs.rmSync(jobDir, { recursive: true, force: true });
                }
            }, 5000);
        } catch (e) {
            console.error('Cleanup failed:', e.message);
        }
    }
});

function runInDocker(absoluteJobDir, sourceFile, config, input, timeLimit, memoryLimit, cpuLimit) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        let timedOut = false;

        const args = [
            'run', '--rm', '-i',
            '--memory', memoryLimit,
            '--cpus', cpuLimit,
            '--network', 'none',
            '--security-opt', 'no-new-privileges', // Security hardening
            '-v', `${absoluteJobDir}:/app:ro`, // Mount as read-only for safety
            '-w', '/app',
            config.image,
            ...config.command(sourceFile)
        ];

        const child = spawn(DOCKER_PATH, args);

        let stdout = '';
        let stderr = '';

        // Handle timeout manually for better control
        const timer = setTimeout(() => {
            timedOut = true;
            child.kill('SIGKILL');
        }, timeLimit);

        if (input) {
            child.stdin.write(input);
            child.stdin.end();
        }

        child.stdout.on('data', (data) => { stdout += data; });
        child.stderr.on('data', (data) => { stderr += data; });

        child.on('close', (code) => {
            clearTimeout(timer);
            const time = Date.now() - startTime;
            resolve({ code, stdout, stderr, time, timedOut });
        });

        child.on('error', (err) => {
            clearTimeout(timer);
            resolve({ code: 1, stdout: '', stderr: err.message, time: 0, timedOut: false });
        });
    });
}

app.get('/health', async (req, res) => {
    const isDockerRunning = await checkDocker();
    res.json({
        status: isDockerRunning ? 'ok' : 'degraded',
        engine: 'docker',
        dockerRunning: isDockerRunning,
        supportedLanguages: Object.keys(LANGUAGE_CONFIG)
    });
});

app.get('/languages', (req, res) => res.json({ languages: Object.keys(LANGUAGE_CONFIG) }));

app.listen(5001, () => {
    console.log('🚀 Optimized Docker Execution Engine running on port 5001');
    console.log('🐳 Monitoring Docker at:', DOCKER_PATH);
});

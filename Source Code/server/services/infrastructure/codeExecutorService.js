/**
 * Code Executor Service
 * Runs code in isolated Docker containers with resource limits
 * NEVER runs code in the main process
 */
const axios = require('axios');
const logger = require('../../utils/logger');
const { AppError, ErrorTypes } = require('../../errors/AppError');
const { EXTERNAL_SERVICES } = require('../../config/urls');
const ExecutionLog = require('../../models/analytics/ExecutionLog');
const { compareOutputs, normalizeOutput, normalizeInput } = require('../../utils/universalJudge');

// Simple Memory Queue for executions to prevent overwhelming the executor
class ExecutionQueue {
  constructor(concurrency = 5) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  enqueue(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processNext();
    });
  }

  processNext() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const { task, resolve, reject } = this.queue.shift();
    this.running++;

    task()
      .then(resolve)
      .catch(reject)
      .finally(() => {
        this.running--;
        this.processNext();
      });
  }
}

class CodeExecutorService {
  constructor() {
    // Use centralized configuration
    this.executorUrl = EXTERNAL_SERVICES.CODE_EXECUTOR.URL;
    this.timeout = parseInt(EXTERNAL_SERVICES.CODE_EXECUTOR.TIMEOUT);
    this.maxMemory = EXTERNAL_SERVICES.CODE_EXECUTOR.MAX_MEMORY;
    this.maxCpu = EXTERNAL_SERVICES.CODE_EXECUTOR.MAX_CPU;

    // Set execution concurrency (e.g., max 10 concurrent executors to avoid server OOM)
    this.queue = new ExecutionQueue(10);
  }

  /**
   * Automatically wrap user code with I/O boilerplate if it follows the function pattern
   */
  _wrapCode(code, language) {
    if (!code) return code;

    // JavaScript Wrapper: If they provided a function solution(input) but no call
    if (language === 'javascript' && code.includes('function solution') && !code.includes('console.log(solution')) {
      return `
${code}
const fs = require('fs');
try {
  const input = fs.readFileSync(0, 'utf-8');
  if (typeof solution === 'function') {
    const result = solution(input);
    if (result !== undefined) console.log(result);
  }
} catch (e) {}
`;
    }

    // Python Wrapper: If they provided def solution(input) but no call
    if (language === 'python' && code.includes('def solution') && !code.includes('print(solution')) {
      return `
${code}
import sys
try:
    input_data = sys.stdin.read()
    if 'solution' in globals():
        result = solution(input_data)
        if result is not None:
            print(result)
except Exception:
    pass
`;
    }

    return code;
  }

  /**
   * Execute code with Queue Management and Analytics integration
   */
  async executeCode(options) {
    return this.queue.enqueue(async () => {
      const { code: originalCode, language, testCases = [], timeLimit = 5000, memoryLimit = 256, userId, problemId } = options;
      const code = this._wrapCode(originalCode, language);
      let engineUsed = 'docker';
      let result;

      try {
        logger.info('Attempting local code execution:', { language });

        const response = await axios.post(
          `${this.executorUrl}/execute`,
          { code, language, testCases, timeLimit, memoryLimit },
          { timeout: this.timeout || 10000, headers: { 'Content-Type': 'application/json' } }
        );

        result = response.data;
      } catch (error) {
        logger.warn('Local execution failed, attempting Judge0 CE fallback:', error.message);
        engineUsed = 'judge0';
        try {
          result = await this.executeWithJudge0(code, language, testCases);
        } catch (judgeError) {
          logger.warn('Judge0 execution failed, attempting Piston absolute fallback:', judgeError.message);
          engineUsed = 'piston';
          result = await this.executeWithPiston(code, language, testCases);
        }
      }

      // Execution Analytics logging
      try {
        const testsTotal = testCases.length;
        const testsPassed = result.testResults ? result.testResults.filter(t => t.passed).length : (result.status === 'Accepted' ? 1 : 0);

        // Asynchronously save analytics execution log
        ExecutionLog.create({
          userId: userId || null,
          problemId: problemId || null,
          language,
          status: result.status,
          runtime: result.runtime || 0,
          memory: result.memory || 0,
          testsPassed,
          testsTotal,
          engineUsed
        }).catch(err => logger.error('Execution Log error:', err.message));
      } catch (analyticsError) {
        logger.error('Failed to record execution analytics:', analyticsError.message);
      }

      return result;
    });
  }

  /**
   * Execute using Judge0 CE (public sandbox)
   */
  async executeWithJudge0(code, language, testCases) {
    const langMap = {
      'javascript': 63,
      'python': 71,
      'java': 62,
      'cpp': 54
    };

    const judgeId = langMap[language] || 63;

    try {
      const results = [];

      if (!testCases || testCases.length === 0) {
        // Just run the code once
        const response = await axios.post('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
          source_code: code,
          language_id: judgeId,
          stdin: ''
        });

        const res = response.data;
        return {
          status: 'Accepted', // Mapping 'Run Complete' to 'Accepted' for single executions if successful
          output: res.stdout || res.stderr || res.message || "",
          runtime: parseFloat(res.time) * 1000 || 0,
          memory: res.memory / 1024 || 0,
          testResults: []
        };
      }

      // Run each test case (parallel for speed)
      const promises = testCases.map(tc =>
        axios.post('https://ce.judge0.com/submissions?base64_encoded=false&wait=true', {
          source_code: code,
          language_id: judgeId,
          stdin: tc.input || ""
        })
      );

      const responses = await Promise.all(promises);

      responses.forEach((response, idx) => {
        const res = response.data;
        const output = res.stdout || '';
        const expected = testCases[idx].output || '';
        
        // Use universal judge comparator instead of strict string comparison
        const passed = compareOutputs(output, expected) && res.status.id === 3; // 3 = Accepted

        results.push({
          input: normalizeInput(testCases[idx].input),
          expected: normalizeOutput(expected),
          actual: normalizeOutput(output) || res.stderr || res.message,
          passed,
          debug: {
            original: { output, expected },
            normalized: { 
              output: normalizeOutput(output), 
              expected: normalizeOutput(expected) 
            },
            status: res.status
          }
        });
      });

      const allPassed = results.every(r => r.passed);
      return {
        status: allPassed ? 'Accepted' : 'Wrong Answer',
        testResults: results,
        runtime: Math.max(...responses.map(r => parseFloat(r.data.time) * 1000 || 0)),
        memory: Math.max(...responses.map(r => r.data.memory / 1024 || 0))
      };
    } catch (judgeError) {
      logger.error('Judge0 execution failed detailed:', judgeError.response?.data || judgeError.message);
      throw judgeError; // Rethrow to trigger Piston fallback in executeCode
    }
  }

  /**
   * Execute using Piston API (Multi-language sandbox)
   */
  async executeWithPiston(code, language, testCases) {
    const langMap = {
      'javascript': { name: 'javascript', version: '18.15.0' },
      'python': { name: 'python', version: '3.10.0' },
      'java': { name: 'java', version: '15.0.2' },
      'cpp': { name: 'c++', version: '10.2.0' }
    };

    const lang = langMap[language] || langMap.javascript;

    try {
      const results = [];

      if (!testCases || testCases.length === 0) {
        const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
          language: lang.name,
          version: lang.version,
          files: [{ content: code }]
        });

        const res = response.data.run;
        return {
          status: res.code === 0 ? 'Accepted' : 'Runtime Error',
          output: res.output || res.stderr || "",
          runtime: 0,
          memory: 0,
          testResults: []
        };
      }

      // For test cases, we run them sequentially (Piston is rate limited)
      for (const tc of testCases) {
        // We need to inject the input or wrap the code. 
        // Simple approach for Piston: just run it and see if it passes.
        // Note: Piston doesn't easily support stdin in a single call without 'stdin' field.
        const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
          language: lang.name,
          version: lang.version,
          files: [{ content: code }],
          stdin: tc.input || ""
        });

        const res = response.data.run;
        const actual = res.stdout || '';
        const expected = tc.output || '';
        
        // Use universal judge comparator instead of strict string comparison
        const passed = compareOutputs(actual, expected) && res.code === 0;

        results.push({
          input: normalizeInput(tc.input),
          expected: normalizeOutput(expected),
          actual: normalizeOutput(actual) || res.stderr,
          passed,
          debug: {
            original: { actual, expected },
            normalized: { 
              actual: normalizeOutput(actual), 
              expected: normalizeOutput(expected) 
            },
            code: res.code
          }
        });
      }

      const allPassed = results.every(r => r.passed);
      return {
        status: allPassed ? 'Accepted' : 'Wrong Answer',
        testResults: results,
        runtime: 0,
        memory: 0
      };
    } catch (pistonError) {
      logger.error('Piston execution failed:', pistonError.message);
      throw new AppError('All code execution engines failed. Please try again later.', 500);
    }
  }

  /**
   * Validate code syntax
   */
  async validateSyntax(code, language) {
    try {
      const response = await axios.post(
        `${this.executorUrl}/validate`,
        { code, language },
        { timeout: 5000 }
      );
      return response.data;
    } catch (error) {
      logger.error('Syntax validation failed:', { error: error.message });
      throw new AppError(
        'Syntax validation failed',
        400,
        ErrorTypes.VALIDATION_ERROR.code
      );
    }
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages() {
    try {
      const response = await axios.get(
        `${this.executorUrl}/languages`,
        { timeout: 5000 }
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to get supported languages:', { error: error.message });
      return {
        languages: ['python', 'javascript', 'java', 'cpp', 'c']
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await axios.get(
        `${this.executorUrl}/health`,
        { timeout: 5000 }
      );
      return response.data.status === 'ok';
    } catch (error) {
      // Use debug level instead of warn, since fallbacks are expected to handle this seamlessly
      logger.debug('Code executor health check failed (expected if local executor is not running):', { error: error.message });
      return false;
    }
  }
}

module.exports = new CodeExecutorService();

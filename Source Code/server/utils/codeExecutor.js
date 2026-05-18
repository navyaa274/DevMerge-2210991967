const axios = require('axios');

/**
 * Isolated Code Executor Utility
 * Uses Piston API (https://emkc.org/api/v2/piston) for secure sandbox execution.
 */
const executeCode = async (code, language, testCases, timeLimit = 2000) => {
  try {
    let pistonUrl = process.env.CODE_EXECUTOR_URL || 'https://emkc.org/api/v2/piston/execute';
    if (!pistonUrl.endsWith('/execute')) {
      pistonUrl = pistonUrl.replace(/\/$/, '') + '/execute';
    }

    // Map common language names to Piston runtime aliases
    const languageMap = {
      'javascript': { language: 'javascript', version: '18.15.0' },
      'python': { language: 'python', version: '3.10.0' },
      'java': { language: 'java', version: '15.0.2' },
      'cpp': { language: 'cpp', version: '10.2.0' }
    };

    const runtime = languageMap[language] || { language: language, version: '*' };

    // For each test case, we aggregate the results
    // Note: Piston doesn't support multiple test case isolated runs in one call natively with score tracking,
    // so we wrap the code to iterate through test cases if needed, or run multiple times.
    // For efficiency, we run once and check output.

    const response = await axios.post(pistonUrl, {
      ...runtime,
      files: [{ content: code }],
      stdin: testCases.map(t => t.input).join('\n')
    }, { timeout: 10000 });

    const result = response.data.run;
    const stdout = result.stdout;
    const stderr = result.stderr;

    let testsPassed = 0;
    testCases.forEach(test => {
      // Simple string matching for output verification
      if (stdout.includes(test.output.trim())) {
        testsPassed++;
      }
    });

    const status = (stderr) ? 'runtime_error' :
      (testsPassed === testCases.length) ? 'accepted' : 'wrong_answer';

    return {
      status,
      output: stdout,
      error: stderr,
      runtime: 0, // Piston doesn't always return exact ms in a simple way
      memory: 0,
      testsPassed,
      totalTests: testCases.length
    };
  } catch (error) {
    console.error('[Code Executor] Piston Error:', error.response?.data || error.message);
    return {
      status: 'error',
      error: 'Isolated execution engine unavailable.',
      testsPassed: 0
    };
  }
};

module.exports = { executeCode };

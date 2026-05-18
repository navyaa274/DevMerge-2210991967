/**
 * Universal Judge Comparator
 * Handles flexible comparison between actual and expected outputs
 * Supports numbers, arrays, strings, floating point, whitespace normalization
 */

/**
 * ✅ 1. Universal Output Normalizer
 */
function normalizeOutput(output) {
  if (output === undefined || output === null) return '';

  let str = String(output).trim();

  // Remove brackets if array format
  if (str.startsWith('[') && str.endsWith(']')) {
    try {
      const arr = JSON.parse(str);
      str = arr.join(' ');
    } catch (e) {
      // If JSON parsing fails, try to extract content between brackets
      const bracketContent = str.slice(1, -1);
      str = bracketContent.replace(/,/g, ' ');
    }
  }

  // Remove parentheses if tuple format
  if (str.startsWith('(') && str.endsWith(')')) {
    try {
      const tupleContent = str.slice(1, -1);
      str = tupleContent.replace(/,/g, ' ');
    } catch (e) {
      // Continue with original string if parsing fails
    }
  }

  // Normalize whitespace (multiple spaces, tabs, newlines to single space)
  str = str.replace(/\s+/g, ' ').trim();

  // Remove trailing commas and semicolons
  str = str.replace(/[,;]+$/g, '');

  return str;
}

/**
 * ✅ 2. Smart Output Comparator
 */
function compareOutputs(actual, expected) {
  const a = normalizeOutput(actual);
  const b = normalizeOutput(expected);

  // Direct match after normalization
  if (a === b) return true;

  // Handle empty strings
  if (a === '' && b === '') return true;
  if (a === '' || b === '') return false;

  // Numeric comparison
  const aNum = parseFloat(a);
  const bNum = parseFloat(b);
  if (!isNaN(aNum) && !isNaN(bNum)) {
    // For floating point numbers, allow small tolerance
    if (aNum % 1 !== 0 || bNum % 1 !== 0) {
      return Math.abs(aNum - bNum) < 1e-9; // Tolerance for floating point
    }
    return aNum === bNum;
  }

  // Array comparison
  const arrA = a.split(' ').filter(item => item.length > 0);
  const arrB = b.split(' ').filter(item => item.length > 0);

  if (arrA.length !== arrB.length) return false;

  for (let i = 0; i < arrA.length; i++) {
    const itemA = arrA[i].trim();
    const itemB = arrB[i].trim();
    
    if (itemA !== itemB) {
      // Try numeric comparison for individual items
      const itemANum = parseFloat(itemA);
      const itemBNum = parseFloat(itemB);
      if (!isNaN(itemANum) && !isNaN(itemBNum)) {
        if (Math.abs(itemANum - itemBNum) >= 1e-9) {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  return true;
}

/**
 * ✅ 3. Universal Input Parser
 */
function normalizeInput(input) {
  if (!input) return '';

  let str = input.trim();

  // Handle array format [1,2,3] -> "1 2 3"
  if (str.includes('[')) {
    try {
      const arr = JSON.parse(str);
      if (Array.isArray(arr)) {
        str = arr.join(' ');
      }
    } catch (e) {
      // If JSON parsing fails, try manual extraction
      const match = str.match(/\[(.*?)\]/);
      if (match) {
        str = match[1].replace(/,/g, ' ');
      }
    }
  }

  // Handle tuple format (1,2,3) -> "1 2 3"
  if (str.includes('(') && str.includes(')')) {
    try {
      const tupleContent = str.slice(str.indexOf('(') + 1, str.lastIndexOf(')'));
      str = tupleContent.replace(/,/g, ' ');
    } catch (e) {
      // Continue with original string
    }
  }

  // Handle comma-separated values
  if (str.includes(',') && !str.includes('[') && !str.includes('(')) {
    str = str.replace(/,/g, ' ');
  }

  // Normalize whitespace
  str = str.replace(/\s+/g, ' ').trim();

  return str;
}

/**
 * ✅ 4. Judge Execution Pipeline
 */
async function runTestCase(userFunction, testCase) {
  const input = normalizeInput(testCase.input);
  
  let result;
  try {
    result = await userFunction(input);
  } catch (error) {
    result = error.message || 'Runtime Error';
  }

  const expected = testCase.expectedOutput;
  const passed = compareOutputs(result, expected);

  return {
    input,
    expected,
    result,
    passed,
    normalized: {
      input,
      expected: normalizeOutput(expected),
      actual: normalizeOutput(result)
    }
  };
}

/**
 * ✅ 5. Sanitize Test Cases for AI Generator
 */
function sanitizeTestCases(testCases) {
  if (!Array.isArray(testCases)) return [];
  
  return testCases.map(tc => ({
    input: normalizeInput(tc.input || ''),
    expectedOutput: normalizeOutput(tc.expectedOutput || tc.output || ''),
    description: tc.description || 'Test case'
  }));
}

/**
 * ✅ 6. Batch Test Case Runner
 */
async function runAllTestCases(userFunction, testCases) {
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const result = await runTestCase(userFunction, testCase);
    results.push({
      testCaseIndex: i,
      ...result
    });
  }
  
  const allPassed = results.every(r => r.passed);
  const passedCount = results.filter(r => r.passed).length;
  
  return {
    allPassed,
    passedCount,
    totalCount: results.length,
    results,
    summary: {
      status: allPassed ? 'Accepted' : 'Wrong Answer',
      score: `${passedCount}/${results.length}`
    }
  };
}

/**
 * ✅ 7. Advanced Comparison for Debugging
 */
function detailedComparison(actual, expected) {
  const a = normalizeOutput(actual);
  const b = normalizeOutput(expected);
  
  const comparison = {
    original: { actual, expected },
    normalized: { actual: a, expected: b },
    match: a === b,
    type: 'unknown'
  };
  
  // Determine data types
  const aNum = parseFloat(a);
  const bNum = parseFloat(b);
  
  if (!isNaN(aNum) && !isNaN(bNum)) {
    comparison.type = 'numeric';
    comparison.numericDiff = Math.abs(aNum - bNum);
  } else if (a.includes(' ') || b.includes(' ')) {
    comparison.type = 'array';
    comparison.arrays = {
      actual: a.split(' ').filter(item => item.length > 0),
      expected: b.split(' ').filter(item => item.length > 0)
    };
  } else {
    comparison.type = 'string';
  }
  
  return comparison;
}

module.exports = {
  normalizeOutput,
  compareOutputs,
  normalizeInput,
  runTestCase,
  runAllTestCases,
  sanitizeTestCases,
  detailedComparison
};

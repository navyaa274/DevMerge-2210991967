/**
 * Test Runner for System Integration Tests
 * Runs all test suites in Node environment
 */

const FacultySystemTest = require('./src/utils/facultySystemTest.js');
const HODSystemTest = require('./src/utils/hodSystemTest.js');
const StudentSystemTest = require('./src/utils/studentSystemTest.js');

// Set base URL for tests
const BASE_URL = 'http://localhost:5002';

// Override fetch in tests to use full URL
const originalFetch = global.fetch;
global.fetch = function(url, options) {
    if (typeof url === 'string' && url.startsWith('/')) {
        url = BASE_URL + url;
    }
    return originalFetch(url, options);
};

async function runAllTests() {
    console.log('🚀 Running System Integration Tests...\n');

    const testSuites = [
        { name: 'Faculty System', suite: FacultySystemTest },
        { name: 'HOD System', suite: HODSystemTest },
        { name: 'Student System', suite: StudentSystemTest }
    ];

    const results = [];

    for (const testSuite of testSuites) {
        console.log(`\n📋 Running ${testSuite.name} Tests...`);
        try {
            const result = await testSuite.suite.runAllTests();
            const success = result.every(r => r.success);
            results.push({ name: testSuite.name, success, details: result });
        } catch (error) {
            console.log(`❌ ${testSuite.name} Tests failed:`, error.message);
            results.push({ name: testSuite.name, success: false, error: error.message });
        }
    }

    // Summary
    console.log('\n📊 Test Summary:');
    console.log('='.repeat(50));
    
    const passed = results.filter(r => r.result).length;
    const total = results.length;
    
    results.forEach(r => {
        const status = r.result ? '✅ PASS' : '❌ FAIL';
        const error = r.error ? ` (${r.error})` : '';
        console.log(`${status} ${r.name}${error}`);
    });
    
    console.log('='.repeat(50));
    console.log(`Total: ${passed}/${total} test suites passed`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (passed === total) {
        console.log('🎉 All system tests passed!');
    } else {
        console.log('⚠️  Some tests failed. Check the output above.');
    }

    // Restore original fetch
    global.fetch = originalFetch;

    return results;
}

// Run if called directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = { runAllTests };

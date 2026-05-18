
function solution(input) {
  // Write your code here
  return result;
}
const fs = require('fs');
try {
  const input = fs.readFileSync(0, 'utf-8');
  if (typeof solution === 'function') {
    const result = solution(input);
    if (result !== undefined) console.log(result);
  }
} catch (e) {}


function solution(input) {
    const n = parseInt(input.trim());
    return n * n;
}
const input = require('fs').readFileSync(0, 'utf8');
console.log(solution(input));

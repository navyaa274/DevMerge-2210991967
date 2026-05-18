function solution(input) {
  const arr = input.trim().split(' ').map(Number);
  const n = arr[0];
  const numbers = arr.slice(1);

  const result = numbers.reduce((sum, num) => sum + num, 0);

  console.log(result);
}

// Read input and call solution
const input = require('fs').readFileSync(0, 'utf-8');
solution(input);

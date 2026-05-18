const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let input = '';

rl.on('line', (line) => {
  input = line;
});

rl.on('close', () => {
  const parentheses = input.split('');
  const stack = [];

  function isValidSequence() {
    for (let i = 0; i < parentheses.length; i++) {
      const ch = parentheses[i];

      if (ch === '(') {
        stack.push(ch);
      } else if (ch === ')') {
        if (stack.length === 0) {
          return false;
        }
        stack.pop();
      }
    }

    return stack.length === 0;
  }

  function printResult(result) {
    console.log(result.toString());
  }

  const result = isValidSequence();
  printResult(result);
});
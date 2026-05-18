
function solution(input) {
    let tokens;

    if (typeof input === "string") {
        tokens = input.trim().split(/\s+/).map(Number);
    } else {
        tokens = input.flat().map(Number);
    }

    let idx = 0;

    const n = tokens[idx++];
    const W = tokens[idx++];

    const weights = [];
    const values = [];

    for (let i = 0; i < n; i++) {
        weights.push(tokens[idx++]);
        values.push(tokens[idx++]);
    }

    const dp = Array(W + 1).fill(0);

    for (let i = 0; i < n; i++) {
        for (let w = W; w >= weights[i]; w--) {
            dp[w] = Math.max(
                dp[w],
                dp[w - weights[i]] + values[i]
            );
        }
    }

    return dp[W];
}
const fs = require('fs');
try {
  const input = fs.readFileSync(0, 'utf-8');
  if (typeof solution === 'function') {
    const result = solution(input);
    if (result !== undefined) console.log(result);
  }
} catch (e) {}

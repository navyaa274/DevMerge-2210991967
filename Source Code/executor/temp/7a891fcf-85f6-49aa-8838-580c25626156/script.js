
function solution(input) {
    const tokens = input.trim().split(/\s+/).map(Number);
    let idx = 0;

    const N = tokens[idx++];
    const M = tokens[idx++];
    const K = tokens[idx++];

    const edges = [];

    for (let i = 0; i < M; i++) {
        const u = tokens[idx++];
        const v = tokens[idx++];
        const w = tokens[idx++];
        edges.push([u - 1, v - 1, w]);
    }

    const terminals = new Set();
    for (let i = 0; i < K; i++) {
        terminals.add(tokens[idx++] - 1);
    }

    // Kruskal's MST
    edges.sort((a, b) => a[2] - b[2]);

    const parent = Array(N).fill(0).map((_, i) => i);
    const rank = Array(N).fill(0);

    function find(x) {
        if (parent[x] !== x)
            parent[x] = find(parent[x]);
        return parent[x];
    }

    function union(x, y) {
        let rx = find(x);
        let ry = find(y);
        if (rx === ry) return false;

        if (rank[rx] < rank[ry])
            parent[rx] = ry;
        else if (rank[rx] > rank[ry])
            parent[ry] = rx;
        else {
            parent[ry] = rx;
            rank[rx]++;
        }
        return true;
    }

    const mstAdj = Array.from({ length: N }, () => []);
    for (const [u, v, w] of edges) {
        if (union(u, v)) {
            mstAdj[u].push([v, w]);
            mstAdj[v].push([u, w]);
        }
    }

    // Prune non-terminal leaves
    const degree = mstAdj.map(nei => nei.length);
    const queue = [];

    for (let i = 0; i < N; i++) {
        if (degree[i] === 1 && !terminals.has(i)) {
            queue.push(i);
        }
    }

    const removed = Array(N).fill(false);

    while (queue.length) {
        const node = queue.pop();
        removed[node] = true;

        for (const [neighbor] of mstAdj[node]) {
            degree[neighbor]--;
            if (degree[neighbor] === 1 && !terminals.has(neighbor)) {
                queue.push(neighbor);
            }
        }
    }

    let totalWeight = 0;

    for (let u = 0; u < N; u++) {
        if (removed[u]) continue;
        for (const [v, w] of mstAdj[u]) {
            if (!removed[v] && u < v) {
                totalWeight += w;
            }
        }
    }

    return totalWeight;
}
const fs = require('fs');
try {
  const input = fs.readFileSync(0, 'utf-8');
  if (typeof solution === 'function') {
    const result = solution(input);
    if (result !== undefined) console.log(result);
  }
} catch (e) {}

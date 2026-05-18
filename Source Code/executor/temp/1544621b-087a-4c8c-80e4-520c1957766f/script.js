
class TSTNode {
    constructor(char) {
        this.char = char;
        this.left = null;
        this.middle = null;
        this.right = null;
        this.value = null; // stores author when word ends
    }
}

class TernarySearchTree {
    constructor() {
        this.root = null;
    }

    insert(word, value) {
        const insertRec = (node, word, value, index) => {
            const char = word[index];

            if (!node) {
                node = new TSTNode(char);
            }

            if (char < node.char) {
                node.left = insertRec(node.left, word, value, index);
            } else if (char > node.char) {
                node.right = insertRec(node.right, word, value, index);
            } else {
                if (index + 1 < word.length) {
                    node.middle = insertRec(node.middle, word, value, index + 1);
                } else {
                    node.value = value;
                }
            }

            return node;
        };

        this.root = insertRec(this.root, word, value, 0);
    }

    search(word) {
        const searchRec = (node, word, index) => {
            if (!node) return null;

            const char = word[index];

            if (char < node.char) {
                return searchRec(node.left, word, index);
            } else if (char > node.char) {
                return searchRec(node.right, word, index);
            } else {
                if (index === word.length - 1) {
                    return node.value;
                }
                return searchRec(node.middle, word, index + 1);
            }
        };

        return searchRec(this.root, word, 0);
    }

    delete(word) {
        const deleteRec = (node, word, index) => {
            if (!node) return null;

            const char = word[index];

            if (char < node.char) {
                node.left = deleteRec(node.left, word, index);
            } else if (char > node.char) {
                node.right = deleteRec(node.right, word, index);
            } else {
                if (index === word.length - 1) {
                    node.value = null;
                } else {
                    node.middle = deleteRec(node.middle, word, index + 1);
                }
            }

            return node;
        };

        this.root = deleteRec(this.root, word, 0);
    }
}

function solution(input) {
    const tst = new TernarySearchTree();
    const result = [];

    for (const operation of input) {
        if (operation.type === "insert") {
            tst.insert(operation.title, operation.author);
        } else if (operation.type === "search") {
            result.push(tst.search(operation.title));
        } else if (operation.type === "delete") {
            tst.delete(operation.title);
        }
    }

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

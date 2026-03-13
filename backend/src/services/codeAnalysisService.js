const esprima = require('esprima');

const countLOC = (code) => {
  const lines = code.split('\n');
  let loc = 0, commentLines = 0;
  for (const line of lines) {
    const t = line.trim();
    if (t === '') continue;
    if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('*/')) commentLines++;
    else loc++;
  }
  return { loc: loc + commentLines, commentLines };
};

const calculateCommentDensity = (code) => {
  const { loc, commentLines } = countLOC(code);
  if (loc === 0) return 0;
  return Math.round((commentLines / loc) * 100);
};

// Calculate cyclomatic complexity using AST
// Complexity = number of decision points + 1
const calculateComplexity = (code) => {
  try {
    const ast = esprima.parseScript(code, { tolerant: true });
    let complexity = 1; // Base complexity

    const decisionNodes = [
      'IfStatement', 'WhileStatement', 'ForStatement',
      'ForInStatement', 'ForOfStatement', 'DoWhileStatement',
      'CatchClause', 'ConditionalExpression', 'LogicalExpression'
    ];

    const traverse = (node) => {
      if (!node || typeof node !== 'object') return;
      if (decisionNodes.includes(node.type)) complexity++;
      for (const key of Object.keys(node)) {
        if (key === 'type') continue;
        const child = node[key];
        if (Array.isArray(child)) child.forEach(traverse);
        else if (child && typeof child === 'object' && child.type) traverse(child);
      }
    };

    traverse(ast);
    return complexity;
  } catch { return 1; }
};

const calculateMaxFunctionLength = (code) => {
  try {
    const ast = esprima.parseScript(code, { tolerant: true, loc: true });
    let max = 0;
    const traverse = (node) => {
      if (!node || typeof node !== 'object') return;
      if (['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'].includes(node.type)) {
        if (node.loc) {
          const l = node.loc.end.line - node.loc.start.line + 1;
          if (l > max) max = l;
        }
      }
      for (const key of Object.keys(node)) {
        if (key === 'type') continue;
        const child = node[key];
        if (Array.isArray(child)) child.forEach(traverse);
        else if (child && typeof child === 'object' && child.type) traverse(child);
      }
    };
    traverse(ast);
    return max;
  } catch { return 0; }
};

const calculateIfElseDepth = (code) => {
  try {
    const ast = esprima.parseScript(code, { tolerant: true });
    let maxDepth = 0;
    const traverse = (node, depth) => {
      if (!node || typeof node !== 'object') return;
      let d = depth;
      if (node.type === 'IfStatement') {
        d = depth + 1;
        if (d > maxDepth) maxDepth = d;
      }
      for (const key of Object.keys(node)) {
        if (key === 'type') continue;
        const child = node[key];
        if (Array.isArray(child)) child.forEach(c => traverse(c, d));
        else if (child && typeof child === 'object' && child.type) traverse(child, d);
      }
    };
    traverse(ast, 0);
    return maxDepth;
  } catch { return 0; }
};

const countLoops = (code) => {
  try {
    const ast = esprima.parseScript(code, { tolerant: true });
    let count = 0;
    const loopTypes = ['ForStatement', 'WhileStatement', 'DoWhileStatement', 'ForInStatement', 'ForOfStatement'];
    const traverse = (node) => {
      if (!node || typeof node !== 'object') return;
      if (loopTypes.includes(node.type)) count++;
      for (const key of Object.keys(node)) {
        if (key === 'type') continue;
        const child = node[key];
        if (Array.isArray(child)) child.forEach(traverse);
        else if (child && typeof child === 'object' && child.type) traverse(child);
      }
    };
    traverse(ast);
    return count;
  } catch { return 0; }
};

const calculateDuplication = (code) => {
  try {
    const lines = code.split('\n').map(l => l.trim()).filter(l => l !== '' && !l.startsWith('//'));
    if (lines.length < 6) return 0;
    const blocks = new Map();
    let dup = 0;
    for (let i = 0; i <= lines.length - 3; i++) {
      const block = lines.slice(i, i + 3).join('\n');
      if (blocks.has(block)) dup += 3;
      else blocks.set(block, i);
    }
    return Math.min(Math.round((dup / lines.length) * 100), 100);
  } catch { return 0; }
};

const analyzeCode = (code, language = 'javascript') => {
  if (language !== 'javascript') {
    const lines = code.split('\n').filter(l => l.trim() !== '');
    const commentLines = lines.filter(l => {
      const t = l.trim();
      return t.startsWith('#') || t.startsWith('//') || t.startsWith('*');
    }).length;
    const loops = (code.match(/\b(for|while|do)\b/g) || []).length;
    const ifCount = (code.match(/\bif\b/g) || []).length;
    return {
      success: true,
      metrics: {
        loc: lines.length,
        complexity: Math.max(1, Math.ceil(ifCount / 2)),
        commentDensity: lines.length > 0 ? Math.round((commentLines / lines.length) * 100) : 0,
        duplication: 0,
        functionLength: 0,
        ifElseDepth: Math.min(ifCount, 5),
        loops
      }
    };
  }

  try {
    const { loc } = countLOC(code);
    return {
      success: true,
      metrics: {
        loc,
        complexity: calculateComplexity(code),
        commentDensity: calculateCommentDensity(code),
        duplication: calculateDuplication(code),
        functionLength: calculateMaxFunctionLength(code),
        ifElseDepth: calculateIfElseDepth(code),
        loops: countLoops(code)
      }
    };
  } catch (error) {
    return {
      success: false,
      metrics: { loc: 0, complexity: 0, commentDensity: 0, duplication: 0, functionLength: 0, ifElseDepth: 0, loops: 0 },
      error: error.message
    };
  }
};

module.exports = { analyzeCode };
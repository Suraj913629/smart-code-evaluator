const { VM } = require('vm2');

const executeCode = async (code, input, timeout = 5000) => {
  return new Promise((resolve) => {
    try {
      const vm = new VM({ timeout, sandbox: {}, eval: false, wasm: false });
      const inputArgs = Array.isArray(input) ? input : [input];
      const inputJSON = JSON.stringify(inputArgs);
      const wrappedCode = `
        ${code}
        (function() {
          const args = ${inputJSON};
          if (typeof solution === 'function') return solution(...args);
          else if (typeof main === 'function') return main(...args);
          else throw new Error('No solution function found. Please name your function "solution"');
        })()
      `;
      const result = vm.run(wrappedCode);
      resolve({ success: true, output: result, error: null });
    } catch (error) {
      let msg = error.message;
      if (msg.includes('timed out')) msg = 'Time Limit Exceeded: Check for infinite loops.';
      resolve({ success: false, output: null, error: msg });
    }
  });
};

const compareOutputs = (actual, expected) => {
  if (actual === expected) return true;
  if (String(actual).trim() === String(expected).trim()) return true;
  try {
    if (JSON.stringify(actual) === JSON.stringify(expected)) return true;
  } catch (e) {}
  if (!isNaN(actual) && !isNaN(expected)) return parseFloat(actual) === parseFloat(expected);
  return false;
};

module.exports = { executeCode, compareOutputs };
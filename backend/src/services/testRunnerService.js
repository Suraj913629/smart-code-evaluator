const { executeCode, compareOutputs } = require('./sandboxService');

const runTestCases = async (code, testCases, language = 'javascript') => {
  if (language !== 'javascript') {
    return {
      passed: 0, total: testCases.length,
      details: testCases.map((tc, i) => ({ testCaseIndex: i, input: tc.input, expectedOutput: tc.expectedOutput, actualOutput: null, passed: false, visible: tc.visible, error: `${language} execution not supported. Only JavaScript is supported.` }))
    };
  }
  const details = []; let passed = 0;
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const result = await executeCode(code, tc.input);
    let testPassed = false, actualOutput = null, error = null;
    if (result.success) { actualOutput = result.output; testPassed = compareOutputs(actualOutput, tc.expectedOutput); }
    else error = result.error;
    if (testPassed) passed++;
    details.push({ testCaseIndex: i, input: tc.input, expectedOutput: tc.expectedOutput, actualOutput, passed: testPassed, visible: tc.visible !== false, error });
  }
  return { passed, total: testCases.length, details };
};

module.exports = { runTestCases };
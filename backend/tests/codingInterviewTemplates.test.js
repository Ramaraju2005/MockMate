const test = require('node:test');
const assert = require('node:assert/strict');
const { generateStarterTemplate, buildExecutionHarness } = require('../utils/codeTemplates');

test('generateStarterTemplate creates a Python function stub from metadata', () => {
  const question = {
    functionName: 'twoSum',
    functionParameters: [
      { name: 'nums', type: 'int[]' },
      { name: 'target', type: 'int' },
    ],
    returnType: 'int[]',
  };

  const template = generateStarterTemplate(question, 'python');
  assert.match(template, /def twoSum\(nums, target\):/);
  assert.match(template, /return \[\]/);
});

test('buildExecutionHarness wraps user code with visible test cases', () => {
  const question = {
    functionName: 'twoSum',
    functionParameters: [
      { name: 'nums', type: 'int[]' },
      { name: 'target', type: 'int' },
    ],
    returnType: 'int[]',
    visibleTestCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expectedOutput: [0, 1] },
    ],
  };

  const harness = buildExecutionHarness(question, 'python', 'def twoSum(nums, target):\n    return []\n');
  assert.match(harness, /visible_test_cases/);
  assert.match(harness, /expectedOutput/);
});

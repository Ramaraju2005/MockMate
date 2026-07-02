function getLanguageConfig(language) {
  const configs = {
    cpp: {
      extension: 'cpp',
      functionWrapperStart: 'class Solution {\npublic:\n',
      functionWrapperEnd: '};\n',
      defaultReturnValue: 'return {};',
      includeBlock: ['#include <iostream>', '#include <vector>', '#include <string>', 'using namespace std;'],
      mainTemplate: (functionName, signature, driverBody) => [
        '#include <iostream>',
        '#include <vector>',
        '#include <string>',
        'using namespace std;',
        '',
        'class Solution {',
        'public:',
        signature,
        '};',
        '',
        'int main() {',
        ...driverBody,
        '  return 0;',
        '}',
        '',
      ].join('\n'),
    },
    java: {
      extension: 'java',
      functionWrapperStart: 'class Solution {\n',
      functionWrapperEnd: '}\n',
      defaultReturnValue: 'return null;',
      includeBlock: ['import java.util.*;'],
      mainTemplate: (functionName, signature, driverBody) => [
        'import java.util.*;',
        '',
        'class Solution {',
        signature,
        '}',
        '',
        'public class Main {',
        '  public static void main(String[] args) {',
        ...driverBody,
        '  }',
        '}',
        '',
      ].join('\n'),
    },
    python: {
      extension: 'py',
      functionWrapperStart: '',
      functionWrapperEnd: '',
      defaultReturnValue: 'return []',
      includeBlock: [],
      mainTemplate: (functionName, signature, driverBody) => [
        signature,
        '',
        ...driverBody,
        '',
      ].join('\n'),
    },
    javascript: {
      extension: 'js',
      functionWrapperStart: '',
      functionWrapperEnd: '',
      defaultReturnValue: 'return [];',
      includeBlock: [],
      mainTemplate: (functionName, signature, driverBody) => [
        signature,
        '',
        ...driverBody,
        '',
      ].join('\n'),
    },
    c: {
      extension: 'c',
      functionWrapperStart: '',
      functionWrapperEnd: '',
      defaultReturnValue: 'return 0;',
      includeBlock: ['#include <stdio.h>', '#include <stdlib.h>'],
      mainTemplate: (functionName, signature, driverBody) => [
        '#include <stdio.h>',
        '#include <stdlib.h>',
        '',
        signature,
        '',
        'int main() {',
        ...driverBody,
        '  return 0;',
        '}',
        '',
      ].join('\n'),
    },
  };

  return configs[language] || configs.cpp;
}

function buildStarterFunction(question, language) {
  const functionName = question.functionName || 'solution';
  const parameters = question.parameters || [];
  const returnType = question.returnType || 'void';

  switch (language) {
    case 'cpp': {
      const paramSignature = (parameters || []).map((parameter) => `${parameter.type || 'int'} ${parameter.name || 'value'}`).join(', ');
      return [
        'class Solution {',
        'public:',
        `  ${returnType || 'int'} ${functionName}(${paramSignature}) {`,
        '    // Implement your solution here',
        '    return {};',
        '  }',
        '};',
        '',
      ].join('\n');
    }
    case 'java': {
      const paramSignature = (parameters || []).map((parameter) => `${parameter.type || 'int'} ${parameter.name || 'value'}`).join(', ');
      return [
        'class Solution {',
        `  public ${returnType || 'int'} ${functionName}(${paramSignature}) {`,
        '    // Implement your solution here',
        '    return null;',
        '  }',
        '}',
        '',
      ].join('\n');
    }
    case 'python': {
      const paramSignature = (parameters || []).map((parameter) => parameter.name || 'value').join(', ');
      return [
        `def ${functionName}(${paramSignature}):`,
        '    # Implement your solution here',
        '    return []',
        '',
      ].join('\n');
    }
    case 'javascript': {
      const paramSignature = (parameters || []).map((parameter) => parameter.name || 'value').join(', ');
      return [
        `function ${functionName}(${paramSignature}) {`,
        '  // Implement your solution here',
        '  return [];',
        '}',
        '',
      ].join('\n');
    }
    case 'c': {
      const paramSignature = (parameters || []).map((parameter) => `${parameter.type || 'int'} ${parameter.name || 'value'}`).join(', ');
      return [
        `${returnType || 'int'} ${functionName}(${paramSignature}) {`,
        '  // Implement your solution here',
        '  return 0;',
        '}',
        '',
      ].join('\n');
    }
    default:
      return buildStarterFunction(question, 'cpp');
  }
}

function buildDriverCode(question, language) {
  const functionName = question.functionName || 'solution';
  const parameters = question.parameters || [];
  const visibleTestCases = question.visibleTestCases || [];
  const example = visibleTestCases[0] || {};
  const inputValue = example.input || {};
  const sampleLines = [];

  const formatValue = (value) => {
    if (Array.isArray(value)) return `{${value.join(', ')}}`;
    if (typeof value === 'object' && value !== null) {
      const entries = Object.entries(value).map(([key, entryValue]) => `${key} = ${JSON.stringify(entryValue)}`);
      return entries.join(', ');
    }
    return JSON.stringify(value);
  };

  switch (language) {
    case 'cpp': {
      const paramLines = [];
      if (Array.isArray(inputValue)) {
        paramLines.push(`    vector<int> nums = {${inputValue.join(', ')}};`);
      } else if (typeof inputValue === 'object' && inputValue !== null) {
        Object.entries(inputValue).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            paramLines.push(`    vector<int> ${key} = {${value.join(', ')}};`);
          } else {
            paramLines.push(`    int ${key} = ${value};`);
          }
        });
      }

      const callLine = `    cout << s.${functionName}(${Object.keys(inputValue).length ? Object.keys(inputValue).join(', ') : 'nums'});`;
      return [
        'int main() {',
        '    Solution s;',
        ...paramLines,
        '',
        `    cout << s.${functionName}(${Object.keys(inputValue).length ? Object.keys(inputValue).join(', ') : 'nums'});`,
        '    return 0;',
        '}',
        '',
      ].join('\n');
    }
    case 'java': {
      return [
        'public class Main {',
        '  public static void main(String[] args) {',
        '    Solution s = new Solution();',
        '    int[] nums = {1, 2, 3};',
        '    System.out.println(s.' + functionName + '(nums));',
        '  }',
        '}',
        '',
      ].join('\n');
    }
    case 'python': {
      return [
        'if __name__ == "__main__":',
        '    nums = [1, 2, 3]',
        `    print(${functionName}(nums))`,
        '',
      ].join('\n');
    }
    case 'javascript': {
      return [
        'function main() {',
        '  const nums = [1, 2, 3];',
        `  console.log(${functionName}(nums));`,
        '}',
        '',
        'main();',
        '',
      ].join('\n');
    }
    case 'c': {
      return [
        'int main() {',
        '  int nums[] = {1, 2, 3};',
        `  printf("%d", ${functionName}(nums));`,
        '  return 0;',
        '}',
        '',
      ].join('\n');
    }
    default:
      return buildDriverCode(question, 'cpp');
  }
}

function buildLanguageTemplate(question, language) {
  const starter = buildStarterFunction(question, language);
  const driver = buildDriverCode(question, language);
  return {
    editableSection: starter,
    readOnlySection: driver,
    fullTemplate: `${starter}\n${driver}`,
  };
}

module.exports = {
  getLanguageConfig,
  buildStarterFunction,
  buildDriverCode,
  buildLanguageTemplate,
};

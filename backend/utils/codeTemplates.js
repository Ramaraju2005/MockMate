function buildParameterList(parameters) {
  return (parameters || []).map((parameter) => parameter.name).join(', ');
}

function mapTypeToPython(type) {
  if (type === 'int[]' || type === 'number[]' || type === 'List<int>') return 'list';
  if (type === 'int' || type === 'number' || type === 'float' || type === 'double') return 'int';
  if (type === 'string') return 'str';
  if (type === 'boolean') return 'bool';
  return 'Any';
}

function mapTypeToJavaScript(type) {
  if (type === 'int[]' || type === 'number[]' || type === 'List<int>') return 'number[]';
  if (type === 'int' || type === 'number') return 'number';
  if (type === 'string') return 'string';
  if (type === 'boolean') return 'boolean';
  return 'any';
}

function mapTypeToCpp(type) {
  if (type === 'int[]' || type === 'number[]' || type === 'List<int>') return 'vector<int>';
  if (type === 'int') return 'int';
  if (type === 'number') return 'double';
  if (type === 'string') return 'string';
  if (type === 'boolean') return 'bool';
  return 'auto';
}

function mapTypeToJava(type) {
  if (type === 'int[]' || type === 'number[]' || type === 'List<int>') return 'int[]';
  if (type === 'int') return 'int';
  if (type === 'number') return 'double';
  if (type === 'string') return 'String';
  if (type === 'boolean') return 'boolean';
  return 'Object';
}

function mapTypeToC(type) {
  if (type === 'int[]' || type === 'number[]' || type === 'List<int>') return 'int*';
  if (type === 'int') return 'int';
  if (type === 'number') return 'double';
  if (type === 'string') return 'char*';
  if (type === 'boolean') return 'int';
  return 'void';
}

function generateStarterTemplate(question, language) {
  const functionName = question.functionName || 'solution';
  const parameters = question.functionParameters || [];
  const parameterNames = parameters.map((parameter) => parameter.name).join(', ');
  const parameterList = buildParameterList(parameters);
  const returnType = question.returnType || 'void';

  if (language === 'python') {
    return [
      `def ${functionName}(${parameterList}):`,
      '    # Write your solution here',
      '    return []',
      '',
    ].join('\n');
  }

  if (language === 'javascript') {
    return [
      `function ${functionName}(${parameterList}) {`,
      '  // Write your solution here',
      '  return [];',
      '}',
      '',
    ].join('\n');
  }

  if (language === 'java') {
    return [
      'class Solution {',
      `  public ${mapTypeToJava(returnType)} ${functionName}(${parameters.map((parameter) => `${mapTypeToJava(parameter.type)} ${parameter.name}`).join(', ')}) {`,
      '    // Write your solution here',
      '    return null;',
      '  }',
      '}',
      '',
    ].join('\n');
  }

  if (language === 'cpp') {
    return [
      '#include <iostream>',
      '#include <vector>',
      'using namespace std;',
      '',
      `class Solution {`,
      `public:`,
      `  ${mapTypeToCpp(returnType)} ${functionName}(${parameters.map((parameter) => `${mapTypeToCpp(parameter.type)} ${parameter.name}`).join(', ')}) {`,
      '    // Write your solution here',
      '    return {};',
      '  }',
      '};',
      '',
    ].join('\n');
  }

  if (language === 'c') {
    return [
      '#include <stdio.h>',
      '#include <stdlib.h>',
      '',
      `${mapTypeToC(returnType)} ${functionName}(${parameters.map((parameter) => `${mapTypeToC(parameter.type)} ${parameter.name}`).join(', ')}) {`,
      '  // Write your solution here',
      '  return 0;',
      '}',
      '',
    ].join('\n');
  }

  return `// Unsupported language: ${language}`;
}

function buildExecutionHarness(question, language, userCode) {
  const functionName = question.functionName || 'solution';
  const parameters = question.functionParameters || [];
  const visibleTestCases = question.visibleTestCases || [];

  if (language === 'python') {
    return [
      userCode,
      '',
      'visible_test_cases = [',
      ...visibleTestCases.map((testCase, index) => `    ${JSON.stringify(testCase)},`),
      ']',
      '',
      'for idx, test_case in enumerate(visible_test_cases):',
      '    args = test_case["input"]',
      '    expected = test_case.get("expectedOutput")',
      '    result = globals()["' + functionName + '"](**args) if isinstance(args, dict) else globals()["' + functionName + '"](*args)',
      '    print(json.dumps({"index": idx, "result": result, "expected": expected}))',
      '',
    ].join('\n');
  }

  if (language === 'javascript') {
    return [
      userCode,
      '',
      'const visibleTestCases = [',
      ...visibleTestCases.map((testCase) => `  ${JSON.stringify(testCase)},`),
      '];',
      '',
      'visibleTestCases.forEach((testCase, idx) => {',
      '  const args = testCase.input;',
      '  const expected = testCase.expectedOutput;',
      '  const result = typeof args === "object" && !Array.isArray(args) ? globalThis["' + functionName + '"](...Object.values(args)) : globalThis["' + functionName + '"](...args);',
      '  console.log(JSON.stringify({ index: idx, result, expected }));',
      '});',
      '',
    ].join('\n');
  }

  if (language === 'java') {
    return [
      'import java.util.*;',
      '',
      userCode,
      '',
      'public class Main {',
      '  public static void main(String[] args) {',
      '    List<Map<String, Object>> visibleTestCases = new ArrayList<>();',
      ...visibleTestCases.map((testCase) => `    visibleTestCases.add(new HashMap<>(Map.of("input", ${JSON.stringify(testCase.input)}, "expectedOutput", ${JSON.stringify(testCase.expectedOutput)})));`),
      '    for (int idx = 0; idx < visibleTestCases.size(); idx++) {',
      '      Map<String, Object> testCase = visibleTestCases.get(idx);',
      '      Object result = new Solution().' + functionName + '(/* placeholder */);',
      '      System.out.println("{" + "\"index\":" + idx + ",\"result\":" + result + ",\"expected\":" + testCase.get("expectedOutput") + "}");',
      '    }',
      '  }',
      '}',
      '',
    ].join('\n');
  }

  if (language === 'cpp') {
    return [
      '#include <iostream>',
      '#include <vector>',
      '#include <string>',
      'using namespace std;',
      '',
      userCode,
      '',
      'int main() {',
      '  vector<pair<vector<string>, string>> visibleTestCases = {',
      ...visibleTestCases.map((testCase) => `    { ${JSON.stringify(testCase.input)}, ${JSON.stringify(testCase.expectedOutput)} },`),
      '  };',
      '  for (int idx = 0; idx < visibleTestCases.size(); ++idx) {',
      '    auto testCase = visibleTestCases[idx];',
      '    cout << "{\"index\":" << idx << ",\"result\":\" << \"\" << ",\"expected\":\" << testCase.second << \"}" << endl;',
      '  }',
      '  return 0;',
      '}',
      '',
    ].join('\n');
  }

  if (language === 'c') {
    return [
      '#include <stdio.h>',
      '',
      userCode,
      '',
      'int main() {',
      '  return 0;',
      '}',
      '',
    ].join('\n');
  }

  return userCode;
}

module.exports = {
  generateStarterTemplate,
  buildExecutionHarness,
};

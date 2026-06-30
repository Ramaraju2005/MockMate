const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com/submissions';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_HOST = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';

async function executeCode({ language, code, input }) {
  const languageId = {
    python: 71,
    javascript: 63,
    java: 62,
    cpp: 54,
    c: 50,
  }[language] || 71;

  const response = await fetch(JUDGE0_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_API_KEY || '',
      'X-RapidAPI-Host': JUDGE0_HOST,
    },
    body: JSON.stringify({
      source_code: Buffer.from(code).toString('base64'),
      language_id: languageId,
      stdin: Buffer.from(input || '').toString('base64'),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Judge0 API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const token = data.token;

  if (!token) {
    throw new Error('Judge0 did not return a submission token');
  }

  let result = null;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const statusResponse = await fetch(`${JUDGE0_URL}/${token}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': JUDGE0_API_KEY || '',
        'X-RapidAPI-Host': JUDGE0_HOST,
      },
    });

    if (!statusResponse.ok) {
      throw new Error(`Judge0 result fetch failed: ${statusResponse.status}`);
    }

    result = await statusResponse.json();
    if (result.status && result.status.id >= 3) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  const stdout = result.stdout ? Buffer.from(result.stdout, 'base64').toString('utf8') : '';
  const stderr = result.stderr ? Buffer.from(result.stderr, 'base64').toString('utf8') : '';
  const compileOutput = result.compile_output ? Buffer.from(result.compile_output, 'base64').toString('utf8') : '';

  return {
    output: stdout || stderr || compileOutput || 'No output',
    status: result.status?.description || 'Unknown',
    error: stderr || compileOutput || '',
  };
}

module.exports = {
  executeCode,
};

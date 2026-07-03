const DEFAULT_JUDGE0_URL = 'https://ce.judge0.com/submissions';

function buildJudge0Config() {
  const url = process.env.JUDGE0_URL || DEFAULT_JUDGE0_URL;
  const apiKey = process.env.JUDGE0_API_KEY?.trim();
  const host = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';
  const useRapidApi = Boolean(apiKey) && /rapidapi\.com/i.test(url);

  return {
    submitUrl: useRapidApi ? url : `${url}?base64_encoded=true&wait=true`,
    resultUrl: useRapidApi ? url : url,
    headers: useRapidApi
      ? {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': host,
        }
      : {
          'Content-Type': 'application/json',
        },
    useRapidApi,
    apiKey,
  };
}

async function executeCode({ language, code, input }) {
  const { submitUrl, resultUrl, headers, useRapidApi } = buildJudge0Config();
  const languageId = {
    python: 71,
    javascript: 63,
    java: 62,
    cpp: 54,
    c: 50,
  }[language] || 71;

  const response = await fetch(submitUrl, {
    method: 'POST',
    headers,
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
  const result = useRapidApi ? await pollRapidApiResult(resultUrl, headers, data.token) : data;

  if (!result) {
    throw new Error('Judge0 did not return a result');
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

async function pollRapidApiResult(resultUrl, headers, token) {
  if (!token) {
    throw new Error('Judge0 did not return a submission token');
  }

  let result = null;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const statusResponse = await fetch(`${resultUrl}/${token}`, {
      method: 'GET',
      headers,
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

  return result;
}

module.exports = {
  executeCode,
};

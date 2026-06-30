const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();

function extractJson(text) {
  if (!text) return null;
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]);
    } catch (error) {
      // try next parser
    }
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch (parseError) {
        return null;
      }
    }
    return null;
  }
}

async function callGroq(payload) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function getFallbackQuestions({ topics, difficulty, questionCount }) {
  const topicList = topics?.length ? topics : ['Arrays', 'Strings', 'Graphs'];
  const fallback = [];
  const functionNames = ['maxSubArray', 'twoSum', 'merge', 'search'];
  for (let index = 0; index < questionCount; index += 1) {
    const topic = topicList[index % topicList.length];
    const functionName = functionNames[index % functionNames.length];
    fallback.push({
      title: `${topic} Practice Question ${index + 1}`,
      problemStatement: `Solve a ${difficulty?.toLowerCase() || 'medium'} difficulty ${topic.toLowerCase()} problem. Implement the required function and return the expected result.`,
      topic,
      difficulty: difficulty || 'Medium',
      constraints: '1 <= n <= 10^5',
      examples: 'Example: Input -> Output',
      functionName,
      parameters: [{ name: 'nums', type: 'int[]' }],
      returnType: 'int',
      visibleTestCases: [{ input: { nums: [1, 2, 3] }, expectedOutput: 6 }],
      hiddenTestCases: [{ input: { nums: [4, 5, 6] }, expectedOutput: 15 }],
    });
  }
  return fallback;
}

async function generateCodingQuestions({ topics, difficulty, questionCount, aiMode }) {
  const prompt = `You are an expert coding interviewer.
Generate ${questionCount} coding interview questions.
Requirements:
- If aiMode is true, select topics dynamically and include a diverse mix of data structures and algorithms.
- If aiMode is false, use these topics: ${topics.join(', ') || 'Arrays'}.
- Difficulty: ${difficulty || 'Medium'}.
- Do NOT generate full solution source code.
- Return ONLY valid JSON as an array of objects with this schema:
[{"title":"...","problemStatement":"...","difficulty":"...","topic":"...","constraints":"...","examples":"...","functionName":"...","parameters":[{"name":"...","type":"..."}],"returnType":"...","visibleTestCases":[{"input":{},"expectedOutput":null}],"hiddenTestCases":[{"input":{},"expectedOutput":null}]}]
Do not include markdown or explanations.`;

  if (!GROQ_API_KEY && !GEMINI_API_KEY) {
    return getFallbackQuestions({ topics, difficulty, questionCount, aiMode });
  }

  const payload = {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 2200,
    messages: [
      { role: 'system', content: 'You are a technical interviewer. Return strict JSON only.' },
      { role: 'user', content: prompt },
    ],
  };

  try {
    const content = await callGroq(payload);
    const parsed = extractJson(content);
    if (Array.isArray(parsed) && parsed.length) {
      return parsed.slice(0, questionCount);
    }
  } catch (error) {
    console.warn('Groq question generation failed, trying Gemini:', error.message);
  }

  if (GEMINI_API_KEY) {
    try {
      const geminiContent = await callGemini(prompt);
      const parsed = extractJson(geminiContent);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.slice(0, questionCount);
      }
    } catch (error) {
      console.warn('Gemini question generation failed, using fallback:', error.message);
    }
  }

  return getFallbackQuestions({ topics, difficulty, questionCount, aiMode });
}

async function evaluateCodingSession({ questions, sessionResults }) {
  const prompt = `You are an expert coding interviewer and evaluator.
Evaluate the user's coding session.
Return ONLY valid JSON as an array of objects in this shape:
[{"question":"...","problemStatement":"...","code":"...","executionResult":"...","evaluation":"...","optimizedSolution":"...","timeComplexity":"...","spaceComplexity":"...","improvements":"...","codingScore":0,"communicationScore":0,"problemSolvingScore":0,"overallScore":0}]
Session data:
${JSON.stringify(sessionResults.map((result, index) => ({
  question: questions[index]?.title || `Question ${index + 1}`,
  problemStatement: questions[index]?.prompt || '',
  code: result.code || '',
  executionResult: result.executionResult || '',
  transcript: result.transcript || '',
  language: result.language || 'python',
})))}`;

  const payload = {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 2600,
    messages: [
      { role: 'system', content: 'You are a strict coding interview evaluator. Return strict JSON only.' },
      { role: 'user', content: prompt },
    ],
  };

  try {
    const content = await callGroq(payload);
    const parsed = extractJson(content);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.warn('Groq evaluation failed, trying Gemini:', error.message);
  }

  if (GEMINI_API_KEY) {
    try {
      const geminiContent = await callGemini(prompt);
      const parsed = extractJson(geminiContent);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.warn('Gemini evaluation failed, using fallback:', error.message);
    }
  }

  return sessionResults.map((result, index) => ({
    question: questions[index]?.title || `Question ${index + 1}`,
    problemStatement: questions[index]?.prompt || '',
    code: result.code || '',
    executionResult: result.executionResult || '',
    evaluation: 'Review the solution for correctness, clarity, and complexity.',
    optimizedSolution: 'Consider a more efficient approach and add edge-case handling.',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    improvements: 'Practice more test cases and explain your reasoning more clearly.',
    codingScore: 70,
    communicationScore: 72,
    problemSolvingScore: 74,
    overallScore: 72,
  }));
}

module.exports = {
  generateCodingQuestions,
  evaluateCodingSession,
};

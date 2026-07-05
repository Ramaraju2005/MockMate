const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();

function extractJson(text) {
  if (!text) return null;

  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]);
    } catch (error) {
      // fall through
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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function getFallbackQuestions({ subject, difficulty, questionCount }) {
  const subjectStr = Array.isArray(subject) ? subject.join(', ') : subject;
  const baseQuestions = [
    `Explain the core concepts of ${subjectStr} in simple terms.`,
    `Describe a real-world scenario where ${subjectStr} is applied.`,
    `What are the main advantages and disadvantages of ${subjectStr}?`,
    `How would you troubleshoot a common issue in ${subjectStr}?`,
    `Compare ${subjectStr} with a related topic and explain the difference.`,
  ];

  const tailored = baseQuestions.map((question, index) => {
    const difficultyLabel = difficulty?.toLowerCase() || 'medium';
    if (difficultyLabel === 'hard') {
      return `${question} Include a detailed example.`;
    }
    if (difficultyLabel === 'easy') {
      return `${question} Keep your explanation concise.`;
    }
    return `${question} Mention one practical example.`;
  });

  return Array.from({ length: questionCount }, (_, index) => tailored[index % tailored.length]);
}

function getFallbackReport({ questions, answers }) {
  return questions.map((question, index) => ({
    question,
    studentAnswer: answers[index] || '',
    accuracyScore: 65,
    communicationScore: 68,
    overallScore: 66,
    idealAnswer: `A clear and structured answer should explain the main idea, provide an example, and mention any relevant trade-offs for ${question}.`,
    improvementSuggestion: 'Practice by giving a concise explanation first, then add one concrete example and a brief conclusion.',
  }));
}

async function generateQuestions({ subject, difficulty, questionCount }) {
  const subjectStr = Array.isArray(subject) ? subject.join(', ') : subject;
  const prompt = `You are an expert technical interviewer.
Create ${questionCount} interview questions covering the following subject(s): "${subjectStr}" at ${difficulty} difficulty.
Return ONLY a valid JSON array of strings. Each string should be a concise interview question.
Do not include explanations or markdown.`;

  if (!GROQ_API_KEY && !GEMINI_API_KEY) {
    return getFallbackQuestions({ subject, difficulty, questionCount });
  }

  const payload = {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    max_tokens: 1000,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful technical interview generator. Return strict JSON only.',
      },
      { role: 'user', content: prompt },
    ],
  };

  try {
    const content = await callGroq(payload);
    const parsed = extractJson(content);
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed.slice(0, questionCount);
    }
  } catch (error) {
    console.warn('Groq generation failed, falling back to Gemini:', error.message);
  }

  if (GEMINI_API_KEY) {
    try {
      const geminiContent = await callGemini(prompt);
      const parsed = extractJson(geminiContent);
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
        return parsed.slice(0, questionCount);
      }
    } catch (error) {
      console.warn('Gemini generation failed, using local fallback:', error.message);
    }
  }

  return getFallbackQuestions({ subject, difficulty, questionCount });
}

async function evaluateAnswers({ questions, answers }) {
  const prompt = `You are an expert interviewer evaluator.
Evaluate the following interview answers.
Return ONLY valid JSON. Structure it as an array of objects with this exact shape:
[{"question":"...","studentAnswer":"...","accuracyScore":0,"communicationScore":0,"overallScore":0,"idealAnswer":"...","improvementSuggestion":"..."}]
Questions and answers:
${JSON.stringify(
  questions.map((question, index) => ({
    question,
    studentAnswer: answers[index] || '',
  }))
)}

Scoring guidance: accuracyScore, communicationScore, overallScore should be integers from 0 to 100.`;

  const payload = {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 2000,
    messages: [
      {
        role: 'system',
        content: 'You are a strict but fair interview evaluator. Return strict JSON only.',
      },
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
    console.warn('Groq evaluation failed, falling back to Gemini:', error.message);
  }

  if (GEMINI_API_KEY) {
    try {
      const geminiContent = await callGemini(prompt);
      const parsed = extractJson(geminiContent);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      console.warn('Gemini evaluation failed, using local fallback:', error.message);
    }
  }

  return getFallbackReport({ questions, answers });
}

module.exports = {
  generateQuestions,
  evaluateAnswers,
};

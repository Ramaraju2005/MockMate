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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
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

function clampScore(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function estimateCommunicationScore(transcriptText) {
  const content = String(transcriptText || '').trim().toLowerCase();
  if (!content) return 10;

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const hasReasoningWords = /because|therefore|approach|think|complexity|time|space|edge case|iterate|loop|check|condition|return/i.test(content);

  if (wordCount < 8) return hasReasoningWords ? 20 : 10;
  if (wordCount < 18) return hasReasoningWords ? 35 : 15;
  if (wordCount < 35) return hasReasoningWords ? 50 : 25;
  return hasReasoningWords ? 70 : 35;
}

function normalizeCodingFeedback(result, submission) {
  const codeText = String(submission.code || '').trim();
  const transcriptText = String(submission.transcript || '').trim();
  const executionText = String(submission.executionResult || '').trim();
  const hasMeaningfulCode = codeText.length > 0 && codeText !== 'Hello MockMate';
  const hasConversation = transcriptText.length > 0 || (submission.conversationHistory || []).length > 1;
  const ranSuccessfully = hasMeaningfulCode && executionText && !/error|failed|exception|traceback|compile/i.test(executionText);

  const codeQualityFeedback = ranSuccessfully
    ? (result.codeQualityFeedback || result.codeEvaluation || 'Code quality looks acceptable.')
    : 'Code quality was not evaluated because the submission did not run successfully.';

  const codingScore = ranSuccessfully ? clampScore(result.codingScore, 70) : 0;
  const communicationScore = Math.min(
    clampScore(result.communicationScore, estimateCommunicationScore(transcriptText)),
    estimateCommunicationScore(transcriptText)
  );
  const overallScore = clampScore(result.overallScore, Math.round((codingScore + communicationScore) / 2));
  const improvements = result.improvements || (
    hasMeaningfulCode
      ? 'Add more edge-case handling and justify time/space complexity.'
      : 'Submit an implementation first, then explain the approach and complexity.'
  );

  return {
    ...result,
    codeQualityFeedback,
    codingScore,
    communicationScore,
    overallScore,
    improvements,
  };
}

function normalizeModelArray(modelOutput, fallbackLength = 0) {
  if (!Array.isArray(modelOutput)) {
    return Array.from({ length: fallbackLength }, () => ({}));
  }

  return modelOutput;
}

function isPlaceholderSolution(text) {
  const content = String(text || '').trim();
  if (!content) return true;
  return /please review your solution|optimal solution code or approach|review your solution against an optimal implementation/i.test(content);
}

function mergeCodingEvaluation({ submission, groqItem = {}, geminiItem = {} }) {
  const codeText = String(submission.code || '').trim();
  const transcriptText = String(submission.transcript || '').trim();
  const executionText = String(submission.executionResult || '').trim();
  const hasMeaningfulCode = codeText.length > 0 && codeText !== 'Hello MockMate';
  const hasConversation = transcriptText.length > 0 || (submission.conversationHistory || []).length > 1;
  const ranSuccessfully = hasMeaningfulCode && executionText && !/error|failed|exception|traceback|compile/i.test(executionText);

  const codeEvaluation = ranSuccessfully ? (groqItem.codeQualityFeedback || groqItem.codeEvaluation || groqItem.evaluation || '') : 'Code quality was not evaluated because the submission did not run successfully.';
  const communicationEvaluation = geminiItem.communicationEvaluation || geminiItem.evaluation || (
    hasConversation
      ? 'The conversation was captured, but Gemini did not return structured feedback. The candidate engaged in discussion and explained their approach in the interview.'
      : 'No conversation was captured for this question.'
  );

  const codingScore = ranSuccessfully ? clampScore(groqItem.codingScore, 70) : 0;
  const communicationScore = Math.min(
    clampScore(geminiItem.communicationScore, estimateCommunicationScore(transcriptText)),
    estimateCommunicationScore(transcriptText)
  );
  const overallScore = clampScore(
    groqItem.overallScore ?? geminiItem.overallScore,
    Math.round((codingScore + communicationScore) / 2)
  );

  return {
    question: submission.question,
    problemStatement: submission.problemStatement,
    code: submission.code,
    executionResult: submission.executionResult,
    conversationEvaluation: communicationEvaluation || 'No conversation evaluation available.',
    codeEvaluation: codeEvaluation || 'No code evaluation available.',
    optimizedSolution: !isPlaceholderSolution(groqItem.optimizedSolution) ? groqItem.optimizedSolution : (groqItem.optimalSolution || ''),
    timeComplexity: groqItem.timeComplexity || 'N/A',
    spaceComplexity: groqItem.spaceComplexity || 'N/A',
    improvements:
      groqItem.improvements ||
      (hasMeaningfulCode
        ? 'Add more edge-case handling and justify time/space complexity.'
        : 'Submit an implementation first, then explain the approach and complexity.'),
    codingScore,
    communicationScore,
    overallScore,
  };
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
  const sessionSummary = sessionResults.map((result, index) => ({
    question: questions[index]?.title || `Question ${index + 1}`,
    problemStatement: questions[index]?.problemStatement || questions[index]?.prompt || '',
    code: result.code || '',
    executionResult: result.executionResult || '',
    transcript: result.transcript || '',
    conversationHistory: result.conversationHistory || [],
    language: result.language || 'python',
  }));

  try {
    let groqItems = normalizeModelArray(null, sessionSummary.length);
    let geminiItems = normalizeModelArray(null, sessionSummary.length);

    if (GROQ_API_KEY) {
      const groqPrompt = `You are Groq, a senior engineer evaluating only the candidate's code.
For each question, analyze the code, execution result, complexity, performance, and provide an optimal solution.
    Compare the candidate solution against the optimal solution and score code quality based on that comparison.
    Return the code quality feedback as a real review that mentions what the candidate did right, what is missing, and how it differs from the optimal approach.
      Treat the optimal solution as the benchmark and score code quality by comparing the user's code to that benchmark line by line, where applicable.

Session Data:
${JSON.stringify(sessionSummary)}

Return ONLY valid JSON as an array matching this schema:
[
  {
    "question": "Question Title",
    "codeEvaluation": "Detailed code review comparing the candidate code to the optimal solution, covering correctness, style, bugs, edge cases, and performance.",
    "optimizedSolution": "Optimal solution code or approach, written on separate lines with \n between steps or code lines.",
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "improvements": "Specific suggestions to improve the implementation.",
    "codingScore": 85,
    "overallScore": 85
  }
]
Do not include markdown.`;

      try {
        const groqContent = await callGroq({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.2,
          max_tokens: 2200,
          messages: [{ role: 'user', content: groqPrompt }],
        });
        const parsedGroq = extractJson(groqContent);
        groqItems = normalizeModelArray(parsedGroq, sessionSummary.length);
      } catch (e) {
        console.warn('Groq code evaluation failed:', e.message);
      }
    }

    if (GEMINI_API_KEY) {
      const geminiPrompt = `You are Gemini, a communications-focused interview evaluator.
Analyze the full conversation between the interviewer and candidate for each question.
Score only the candidate's communication quality against the coding question and what they actually said.
Use the full conversationHistory and transcript, not just a short summary.
Be strict: if the candidate did not explain the approach, reasoning, complexity, edge cases, or relevance to the question, the score should be low.

Session Data:
${JSON.stringify(sessionSummary)}

Return ONLY valid JSON as an array matching this schema:
[
  {
    "question": "Question Title",
    "communicationEvaluation": "Detailed feedback on clarity, structure, explanation quality, collaboration, and how well the spoken explanation matched the coding question.",
    "communicationScore": 90,
    "overallScore": 90
  }
]
Do not include markdown.`;

      try {
        const geminiContent = await callGemini(geminiPrompt);
        const parsedGemini = extractJson(geminiContent);
        geminiItems = normalizeModelArray(parsedGemini, sessionSummary.length);
      } catch (e) {
        console.warn('Gemini communication evaluation failed:', e.message);
      }
    }

    return sessionSummary.map((submission, index) =>
      normalizeCodingFeedback(
        mergeCodingEvaluation({
          submission,
          groqItem: groqItems[index] || {},
          geminiItem: geminiItems[index] || {},
        }),
        submission
      )
    );
  } catch (error) {
    console.error('Agentic consolidation failed:', error);
  }

  // Fallback if consolidation fails
  return sessionSummary.map((result, index) => ({
    question: result.question,
    problemStatement: result.problemStatement,
    code: result.code,
    executionResult: result.executionResult,
    evaluation: `Technical Code Review:\n${codeEval}\n\nCommunication Review:\n${commEval}`,
    optimizedSolution: 'Please review your solution against optimal algorithms.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    improvements: 'Improve modular design and explain complexity before coding.',
    codingScore: 75,
    communicationScore: 75,
    overallScore: 75,
  })).map((item, index) => normalizeCodingFeedback(item, sessionSummary[index] || {}));
}

async function generateInterviewerResponse({ question, currentCode, transcript, history = [] }) {
  const prompt = `You are a professional, helpful, and friendly technical interviewer.
The candidate is currently solving a coding question during a live interview.
Question:
Title: ${question?.title || "Coding Challenge"}
Problem Statement: ${question?.problemStatement || question?.prompt || ""}
Topic: ${question?.topic || "N/A"}
Difficulty: ${question?.difficulty || "N/A"}

Current Code in Editor:
\`\`\`
${currentCode || ""}
\`\`\`

Candidate Spoke/Said:
"${transcript}"

Recent Conversation History:
${history.map((msg) => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.text}`).join('\n')}

Role Rules:
- Act exactly like a real human interviewer.
- Provide a brief, encouraging, and natural text-only response (maximum 1-2 sentences).
- If the candidate is stuck, gently nudge them or ask a clarifying question.
- If the candidate proposes an approach, confirm if it is correct or ask them about time/space complexity (e.g. "That sounds like a good start. What would be the time complexity of that?").
- Do NOT give the full code solution. Keep the conversation engaging and professional.
- Do NOT output audio, meta-text, or markdown formatting other than plain text.`;

  try {
    const responseText = await callGemini(prompt);
    return responseText.trim();
  } catch (error) {
    console.error("Gemini interviewer response failed, trying Groq:", error.message);
    if (GROQ_API_KEY) {
      try {
        const payload = {
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 150,
          messages: [
            { role: 'system', content: 'You are a technical interviewer. Keep responses under 2 sentences.' },
            { role: 'user', content: prompt },
          ],
        };
        const groqContent = await callGroq(payload);
        return groqContent.trim();
      } catch (groqError) {
        console.error("Groq fallback for interviewer response also failed:", groqError.message);
      }
    }
    return "Interesting approach. Can you explain how you plan to implement that?";
  }
}

module.exports = {
  generateCodingQuestions,
  evaluateCodingSession,
  generateInterviewerResponse,
};


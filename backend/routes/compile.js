const express = require("express");
const Groq = require("groq-sdk");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { language, code, input = "" } = req.body;

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are a code execution engine. Execute the following ${language} code and return ONLY the output.

Rules:
- If the code runs successfully: print ONLY the program's stdout output, nothing else.
- If there is a compile-time error: print in this format:
  ❌ Compile Error:
  Line <N>: <error message>
- If there is a runtime error: print in this format:
  ❌ Runtime Error:
  <ErrorType>: <message> (at line <N> if known)
- Do NOT add explanations, suggestions, or fixes.
- Do NOT wrap output in code blocks or quotes.
${input ? `\nStdin input:\n${input}` : ""}

Code:
\`\`\`${language}
${code}
\`\`\``;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
      temperature: 0,
    });

    const output = response.choices[0].message.content.trim();
    return res.json({ output });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Execution failed", detail: err.message });
  }
});

module.exports = router;
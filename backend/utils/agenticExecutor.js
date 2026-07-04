const Groq = require("groq-sdk");

async function executeCode({ language, code, input = "", question }) {
  try {
    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not configured in environment variables");
    }

    const groq = new Groq({ apiKey });

    const prompt = `You are a code execution engine. Execute the following ${language} code in the context of the coding question and return ONLY the output.

Coding Question Context:
Title: ${question?.title || "Coding Challenge"}
Problem Statement: ${question?.problemStatement || question?.prompt || ""}
Constraints: ${question?.constraints || "None specified"}
Examples: ${question?.examples || "None specified"}

Rules:
- If the code runs successfully: print ONLY the program's stdout output, nothing else.
- If there is a compile-time error: print in this format:
  ❌ Compile Error:
  Line <N>: <error message>
- If there is a runtime error (e.g. out of bounds, null pointer, exception): print in this format:
  ❌ Runtime Error:
  <ErrorType>: <message> (at line <N> if known)
- If the code contains an infinite loop, runs too slowly, or exceeds time constraints: print in this format:
  ❌ Time Limit Exceeded (TLE)
- If the code allocates too much memory or creates memory leaks: print in this format:
  ❌ Memory Limit Exceeded (MLE)
- Do NOT add explanations, suggestions, or fixes.
- Do NOT wrap output in code blocks or quotes.
${input ? `\nStdin input:\n${input}` : ""}

Code:
\`\`\`${language}
${code}
\`\`\``;

    console.log("Sending code execution prompt to Groq model Llama 3.3...");
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
      temperature: 0,
    });

    const output = response.choices[0].message.content.trim();
    console.log("Groq response output:", output);
    const isError = output.includes("❌");

    return {
      output: output || "No output",
      status: isError ? "Error" : "Success",
      error: isError ? output : "",
    };
  } catch (err) {
    console.error("Groq compilation execution failed:", err);
    return {
      output: `Execution failed: ${err.message}`,
      status: "Error",
      error: err.message,
    };
  }
}

module.exports = {
  executeCode,
};

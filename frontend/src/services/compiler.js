const API_URL = import.meta.env.VITE_API_URL || "";

export async function compile(language, code, input = "") {
  const response = await fetch(`${API_URL}/api/compile`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      language,
      code,
      input,
    }),
  });

  return await response.json();
}
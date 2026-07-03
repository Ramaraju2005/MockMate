# MockMate
mock interview with peer +AI

## Coding execution

The coding interview flow uses Judge0 for code execution.

- By default, the backend uses the direct Judge0 CE endpoint and does not require a RapidAPI key.
- To override the endpoint, set `JUDGE0_URL` in `backend/.env`.
- If you want to keep using RapidAPI, also set `JUDGE0_API_KEY` and `JUDGE0_HOST`.

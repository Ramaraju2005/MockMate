const express = require("express");
const { executeCode } = require("../utils/judge0");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { language, code, input = "" } = req.body || {};

    if (!String(code || "").trim()) {
      return res.status(400).json({ error: "Code is required" });
    }

    const execution = await executeCode({
      language,
      code,
      input,
    });

    return res.json(execution);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Execution failed", detail: err.message });
  }
});

module.exports = router;
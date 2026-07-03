const express = require("express");
const axios = require("axios");

const router = express.Router();

const languageMap = {
  java: {
    language: "java",
    versionIndex: "5",
  },
  cpp: {
    language: "cpp17",
    versionIndex: "1",
  },
  python: {
    language: "python3",
    versionIndex: "4",
  },
};

router.post("/", async (req, res) => {
  try {
    const { language, code, input = "" } = req.body;

    const config = languageMap[language];

    if (!config) {
      return res.status(400).json({
        error: "Unsupported language",
      });
    }

    const response = await axios.post(
      "https://api.jdoodle.com/v1/execute",
      {
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
        script: code,
        stdin: input,
        language: config.language,
        versionIndex: config.versionIndex,
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);

    if (err.response) {
      // Forward the exact status and body from JDoodle when available
      return res.status(err.response.status).json(err.response.data);
    }

    res.status(500).json({
      error: "Compilation failed",
      detail: err.message,
    });
  }
});

module.exports = router;
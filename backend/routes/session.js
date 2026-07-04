const express = require("express");
const Session = require("../models/Session");
const router = express.Router();

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
};

router.post("/save", isLoggedIn, async (req, res) => {
  try {
    const {
      roomId,
      interviewerName = "",
      intervieweeName = "",
      interviewDate,
      durationSeconds,
      editorText,
      code,
    } = req.body;

    if (!roomId || !interviewDate) {
      return res.status(400).json({ error: "Missing required fields: roomId and interviewDate" });
    }

    const session = new Session({
      roomId,
      interviewerName,
      intervieweeName,
      interviewDate: new Date(interviewDate),
      durationSeconds,
      editorText: editorText || "",
      code,
    });

    await session.save();

    res.json({ success: true, sessionId: session._id });
  } catch (error) {
    console.error("Save session failed:", error, { body: req.body });
    res.status(500).json({ error: error?.message || "Failed to save interview session" });
  }
});

router.post("/coding/save", isLoggedIn, async (req, res) => {
  try {
    const {
      questions = [],
      report = [],
      interviewerName = "",
      intervieweeName = "",
      interviewDate,
      durationSeconds = 0,
    } = req.body;

    const session = new Session({
      roomId: `coding-${req.user?.id || req.sessionID}-${Date.now()}`,
      interviewerName,
      intervieweeName,
      interviewDate: interviewDate ? new Date(interviewDate) : new Date(),
      durationSeconds,
      editorText: JSON.stringify({ questions, report }),
      code: JSON.stringify(report.map((item) => item.code || "")),
      interviewType: "coding",
      questions,
      report,
    });

    await session.save();

    res.json({ success: true, sessionId: session._id });
  } catch (error) {
    console.error("Save coding session failed:", error, { body: req.body });
    res.status(500).json({ error: error?.message || "Failed to save coding interview report" });
  }
});

module.exports = router;

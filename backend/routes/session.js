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

    if (!roomId || !interviewDate || durationSeconds == null || !code) {
      return res.status(400).json({ error: "Missing required fields" });
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

module.exports = router;

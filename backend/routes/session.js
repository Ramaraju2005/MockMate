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
      userId: req.user?.id || req.sessionID,
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
      userId: req.user?.id || req.sessionID,
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

router.post("/theory/save", isLoggedIn, async (req, res) => {
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
      roomId: `theory-${req.user?.id || req.sessionID}-${Date.now()}`,
      userId: req.user?.id || req.sessionID,
      interviewerName,
      intervieweeName,
      interviewDate: interviewDate ? new Date(interviewDate) : new Date(),
      durationSeconds,
      editorText: JSON.stringify({ questions, report }),
      code: "",
      interviewType: "theory",
      questions,
      report,
    });

    await session.save();

    res.json({ success: true, sessionId: session._id });
  } catch (error) {
    console.error("Save theory session failed:", error, { body: req.body });
    res.status(500).json({ error: error?.message || "Failed to save theory interview report" });
  }
});

router.get("/history", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user?.id || req.sessionID;
    const sessions = await Session.find({ userId }).sort({ createdAt: -1 });

    const peer = [];
    const theory = [];
    const coding = [];

    sessions.forEach((s) => {
      if (s.interviewType === "coding") {
        coding.push(s);
      } else if (s.interviewType === "theory") {
        theory.push(s);
      } else {
        peer.push(s);
      }
    });

    res.json({ peer, theory, coding });
  } catch (error) {
    console.error("Fetch history failed:", error);
    res.status(500).json({ error: error?.message || "Failed to retrieve interview history" });
  }
});

module.exports = router;

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();
const session = require("express-session");
const passport = require("./utils/passport");
const { AccessToken } = require("livekit-server-sdk");
const { generateQuestions, evaluateAnswers } = require('./utils/aiInterview');
const { generateCodingQuestions, evaluateCodingSession } = require('./utils/codingInterview');
const { executeCode } = require('./utils/judge0');
const { buildLanguageTemplate } = require('./utils/languageTemplates');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://8zsgjjtr-5173.inc1.devtunnels.ms";
const allowedOrigins = [FRONTEND_URL, "https://8zsgjjtr-5173.inc1.devtunnels.ms"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman) and listed origins.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// ── Session ───────────────────────────────────────────────────────────────────
// sameSite:"none" + secure:true is required when the frontend (port 5173 tunnel)
// and backend (port 3000 tunnel) are on different subdomains/origins, because
// the browser won't send "lax" cookies on cross-origin redirects from Google.
const isProduction = process.env.NODE_ENV === "production";
const isTunnel =
  FRONTEND_URL.startsWith("https://") &&
  !FRONTEND_URL.includes("localhost");

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // When using Dev Tunnels (https) we MUST use sameSite:none + secure:true
      // so the cookie is sent back to the backend after Google's redirect.
      sameSite: isTunnel || isProduction ? "none" : "lax",
      secure: isTunnel || isProduction,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ── Auth helpers ──────────────────────────────────────────────────────────────
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ message: "Not authenticated" });
}

// ── API routes ────────────────────────────────────────────────────────────────
app.post('/api/interview/generate', isLoggedIn, async (req, res) => {
  try {
    const { subject, difficulty, questionCount } = req.body;

    if (!subject || !difficulty || !questionCount) {
      return res.status(400).json({ error: 'Subject, difficulty, and question count are required.' });
    }

    const questions = await generateQuestions({
      subject,
      difficulty,
      questionCount: Number(questionCount),
    });

    res.json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate interview questions.' });
  }
});

app.post('/api/interview/evaluate', isLoggedIn, async (req, res) => {
  try {
    const { questions, answers } = req.body;

    if (!Array.isArray(questions) || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Questions and answers must be arrays.' });
    }

    const report = await evaluateAnswers({ questions, answers });
    res.json({ report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to evaluate interview answers.' });
  }
});

app.post('/api/coding/generate', isLoggedIn, async (req, res) => {
  try {
    const { topics, difficulty, questionCount, aiMode } = req.body;
    if (!questionCount) {
      return res.status(400).json({ error: 'Question count is required.' });
    }

    const questions = await generateCodingQuestions({
      topics: Array.isArray(topics) ? topics : [],
      difficulty: difficulty || 'Medium',
      questionCount: Number(questionCount),
      aiMode: Boolean(aiMode),
    });

    res.json({ questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate coding interview questions.' });
  }
});

app.post('/api/coding/execute', isLoggedIn, async (req, res) => {
  try {
    const { language, editableCode, question, readOnlyCode } = req.body;
    if (!language || !editableCode || !question) {
      return res.status(400).json({ error: 'Language, editable code, and question are required.' });
    }

    const template = buildLanguageTemplate(question, language);
    const combinedCode = `${editableCode}\n\n${readOnlyCode || template.readOnlySection}`;
    const result = await executeCode({ language, code: combinedCode, input: '' });
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to execute code.' });
  }
});

app.post('/api/coding/template', isLoggedIn, async (req, res) => {
  try {
    const { question, language } = req.body;
    if (!question || !language) {
      return res.status(400).json({ error: 'Question and language are required.' });
    }

    const template = buildLanguageTemplate(question, language);
    res.json(template);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate starter template.' });
  }
});

app.post('/api/coding/evaluate', isLoggedIn, async (req, res) => {
  try {
    const { questions, sessionResults } = req.body;
    if (!Array.isArray(questions) || !Array.isArray(sessionResults)) {
      return res.status(400).json({ error: 'Questions and session results must be arrays.' });
    }

    const report = await evaluateCodingSession({ questions, sessionResults });
    res.json({ report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to evaluate coding interview.' });
  }
});

app.get("/api/auth/me", isLoggedIn, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.displayName,
      email: req.user.emails?.[0]?.value || null,
      photo: req.user.photos?.[0]?.value || null,
    },
  });
});

// Logout — frontend calls POST /api/auth/logout
app.post("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });
});

// Keep the old GET /logout for backwards compat (redirect-based)
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect(FRONTEND_URL);
  });
});

// ── Room management ───────────────────────────────────────────────────────────
const rooms = new Map();

app.post("/api/room", isLoggedIn, (req, res) => {
  const roomId = crypto.randomUUID();
  const roomUrl = `${FRONTEND_URL}/room/${roomId}`;

  rooms.set(roomId, {
    participants: new Set([req.user.id || req.sessionID]),
    createdAt: Date.now(),
  });

  res.json({ roomId, roomUrl });
});

app.get("/api/livekit/token", isLoggedIn, async (req, res) => {
  try {
    const roomName = req.query.room;
    const identity = String(req.user?.id || req.sessionID);

    if (!roomName) {
      return res.status(400).json({ error: "Room name is required" });
    }

    const room = rooms.get(roomName);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (!room.participants.has(identity) && room.participants.size >= 2) {
      return res.status(403).json({ error: "Room is full" });
    }

    room.participants.add(identity);

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      { identity, ttl: "1h" }
    );

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();
    res.json({ token: jwt, url: process.env.LIVEKIT_URL });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// ── MongoDB ping (one-time check) ─────────────────────────────────────────────
const { MongoClient, ServerApiVersion } = require("mongodb");
if (process.env.MONGODB_URI) {
  const client = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });
  client
    .connect()
    .then(() => client.db("admin").command({ ping: 1 }))
    .then(() => {
      console.log("✅ Connected to MongoDB");
      return client.close();
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Mock Interview API is running" });
});

app.get("/test", (req, res) => {
  res.send("Backend working ✅");
});

// ── Google OAuth ──────────────────────────────────────────────────────────────
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    console.log("Google callback — err:", err, "user:", user?.id, "info:", info);

    if (err) {
      console.error("Google auth error:", err);
      return res.redirect(`${FRONTEND_URL}/?login=failed`);
    }

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/?login=failed`);
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("Login error:", loginErr);
        return res.redirect(`${FRONTEND_URL}/?login=failed`);
      }
      console.log("✅ Google login success for:", user.displayName);
      return res.redirect(`${FRONTEND_URL}/?login=success`);
    });
  })(req, res, next);
});

// ── GitHub OAuth ──────────────────────────────────────────────────────────────
app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

app.get("/auth/github/callback", (req, res, next) => {
  passport.authenticate("github", (err, user, info) => {
    console.log("GitHub callback — err:", err, "user:", user?.id, "info:", info);

    if (err) {
      console.error("GitHub auth error:", err);
      return res.redirect(`${FRONTEND_URL}/?login=failed`);
    }

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/?login=failed`);
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("GitHub login error:", loginErr);
        return res.redirect(`${FRONTEND_URL}/?login=failed`);
      }
      console.log("✅ GitHub login success for:", user.displayName);
      return res.redirect(`${FRONTEND_URL}/?login=success`);
    });
  })(req, res, next);
});

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   FRONTEND_URL = ${FRONTEND_URL}`);
  console.log(`   Cookie mode  = ${isTunnel || isProduction ? "secure + sameSite:none" : "lax (localhost)"}`);
});

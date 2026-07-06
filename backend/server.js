const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');
const { MongoStore } = require('connect-mongo');

require('dotenv').config();
const session = require("express-session");
const passport = require("./utils/passport");
const { AccessToken } = require("livekit-server-sdk");
const compileRoute = require("./routes/compile");
const sessionRoute = require("./routes/session");
const { generateQuestions, evaluateAnswers } = require('./utils/aiInterview');
const { generateCodingQuestions, evaluateCodingSession, generateInterviewerResponse } = require('./utils/codingInterview');
const { executeCode } = require('./utils/agenticExecutor');
const { buildLanguageTemplate } = require('./utils/languageTemplates');
const Groq = require("groq-sdk");

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://b2zkf5jm-5173.inc1.devtunnels.ms";
const allowedOrigins = [FRONTEND_URL, "https://b2zkf5jm-5173.inc1.devtunnels.ms"];
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mock-interview";
const isProduction = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.includes("localhost") || origin.includes("127.0.0.1") || origin.endsWith("devtunnels.ms")) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: This origin (${origin}) is not allowed.`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
// app.use(cors({ origin: 'https://vercel.app' }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    store: new MongoStore({
      mongoUrl: mongoUri,
      collectionName: "sessions",
      ttl: 24 * 60 * 60,
    }),
    cookie: {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/compile", compileRoute);
app.use("/api/session", sessionRoute);

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ message: "Not authenticated" });
}

function normalizeCodingLanguage(language) {
  const supportedLanguages = new Set(['python', 'javascript', 'java', 'cpp', 'c']);
  return supportedLanguages.has(language) ? language : 'python';
}

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

const rooms = new Map();

app.post('/api/room', isLoggedIn, (req, res) => {
  const roomId = crypto.randomUUID();
  const roomUrl = `${FRONTEND_URL}/room/${roomId}`;

  rooms.set(roomId, {
    participants: new Set([req.user.id || req.sessionID]),
    createdAt: Date.now(),
  });

  res.json({ roomId, roomUrl });
});

app.post('/api/interview/generate', isLoggedIn, async (req, res) => {
  try {
    const questions = await generateQuestions(req.body || {});
    res.json({ questions });
  } catch (error) {
    console.error('Interview question generation failed:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate interview questions',
    });
  }
});

app.post('/api/interview/evaluate', isLoggedIn, async (req, res) => {
  try {
    const { questions = [], answers = [] } = req.body || {};
    const report = await evaluateAnswers({ questions, answers });

    res.json({ report });
  } catch (error) {
    console.error('Interview evaluation failed:', error);
    res.status(500).json({
      error: error.message || 'Failed to evaluate interview answers',
    });
  }
});

app.post('/api/coding/generate', isLoggedIn, async (req, res) => {
  try {
    const questions = await generateCodingQuestions(req.body || {});
    res.json({ questions });
  } catch (error) {
    console.error('Coding question generation failed:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate coding interview questions',
    });
  }
});

app.post('/api/coding/template', isLoggedIn, (req, res) => {
  try {
    const { question = {}, language } = req.body || {};
    const normalizedLanguage = normalizeCodingLanguage(language);
    const template = buildLanguageTemplate(question, normalizedLanguage);

    res.json(template);
  } catch (error) {
    console.error('Coding template generation failed:', error);
    res.status(500).json({
      error: error.message || 'Failed to build coding template',
    });
  }
});

app.post('/api/coding/execute', isLoggedIn, async (req, res) => {
  try {
    const { language, editableCode, readOnlyCode, question } = req.body || {};
    const normalizedLanguage = normalizeCodingLanguage(language);
    const fullCode = [editableCode || '', readOnlyCode || ''].join('\n');
    const execution = await executeCode({
      language: normalizedLanguage,
      code: fullCode,
      input: '',
      question,
    });

    res.json(execution);
  } catch (error) {
    console.error('Coding execution failed:', error);
    res.status(500).json({
      error: error.message || 'Failed to execute coding submission',
    });
  }
});

app.post('/api/coding/interviewer-respond', async (req, res) => {
  try {
    const { question, currentCode, transcript, history = [] } = req.body || {};
    const responseText = await generateInterviewerResponse({
      question,
      currentCode,
      transcript,
      history,
    });
    res.json({ response: responseText });
  } catch (error) {
    console.error('Interviewer response failed:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate interviewer response',
    });
  }
});

app.post('/api/coding/evaluate', async (req, res) => {
  try {
    const { questions = [], sessionResults = [] } = req.body || {};
    const report = await evaluateCodingSession({ questions, sessionResults });

    res.json({ report });
  } catch (error) {
    console.error('Coding evaluation failed:', error);
    res.status(500).json({
      error: error.message || 'Failed to evaluate coding interview',
    });
  }
});



app.get("/api/livekit/token", isLoggedIn, async (req, res) => {
  try {
    const roomName = req.query.room;
    const identity = String(req.user?.id || req.sessionID);

    if (!roomName) {
      return res.status(400).json({
        error: "Room name is required",
      });
    }

    const room = rooms.get(roomName);

    if (!room) {
      return res.status(404).json({
        error: "Room not found",
      });
    }

    if (
      !room.participants.has(identity) &&
      room.participants.size >= 2
    ) {
      return res.status(403).json({
        error: "Room is full",
      });
    }

    room.participants.add(identity);

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity,
        ttl: "1h",
      }
    );

    token.addGrant({

      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();

    res.json({
      token: jwt,
      url: process.env.LIVEKIT_URL,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to generate token",
    });
  }
});

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });




app.get("/", (req, res) => {
  res.json({ message: "Mock Interview API is running" });
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
app.get("/test", (req, res) => {
  console.log("TEST HIT");
  res.send("Backend working");
});

app.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate("google", (err, user, info) => {
    console.log("ERR:", err);
    console.log("USER:", user);
    console.log("INFO:", info);

    if (err) {
      console.error(err);
      return res.status(500).send(err.message);
    }

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/?login=failed`);
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("LOGIN ERR:", loginErr);
        return res.status(500).send(loginErr.message);
      }

      console.log("LOGIN SUCCESS");
      return res.redirect(`${FRONTEND_URL}/?login=success`);
    });
  })(req, res, next);
});

app.post("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed." });
    }

    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Session destroy error:", destroyErr);
      }
      res.clearCookie("connect.sid", {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
      });
      res.json({ message: "Logged out." });
    });
  });
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const defaultRoomState = {
  code: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello MockMate");
  }
}`,
  language: "java",
  notes: "",
  timerStart: null,
  consoleOutput: "",
};

const roomStates = new Map();
const roomUsers = new Map();

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join-room", (payload) => {
    const roomId = typeof payload === "string" ? payload : payload?.roomId;
    const userName = typeof payload === "object" ? payload?.userName || "Guest" : "Guest";

    if (!roomId) return;

    if (!roomStates.has(roomId)) {
      roomStates.set(roomId, { ...defaultRoomState });
    }

    if (!roomUsers.has(roomId)) {
      roomUsers.set(roomId, {});
    }

    const roomState = roomStates.get(roomId);
    const roomUserMap = roomUsers.get(roomId);
    roomUserMap[socket.id] = userName;

    socket.join(roomId);
    console.log(socket.id, "joined", roomId, "as", userName);

    const usersInRoom = Object.values(roomUserMap);

    io.to(roomId).emit(
      "participants",
      io.sockets.adapter.rooms.get(roomId)?.size || 1
    );
    io.to(roomId).emit("room-users", usersInRoom);

    socket.emit("code-update", roomState.code);
    socket.emit("language-update", roomState.language);
    socket.emit("notes-update", roomState.notes);
    socket.emit("console-output", roomState.consoleOutput);

    if (roomState.timerStart) {
      socket.emit("timer-start", roomState.timerStart);
    }
  });

  socket.on("start-timer", (roomId) => {
    if (!roomStates.has(roomId)) {
      roomStates.set(roomId, { ...defaultRoomState });
    }

    const roomState = roomStates.get(roomId);
    if (!roomState.timerStart) {
      roomState.timerStart = Date.now();
    }

    io.to(roomId).emit("timer-start", roomState.timerStart);
  });

  socket.on("code-change", ({ roomId, code }) => {
    if (!roomStates.has(roomId)) {
      roomStates.set(roomId, { ...defaultRoomState });
    }
    roomStates.get(roomId).code = code;
    socket.to(roomId).emit("code-update", code);
  });

  socket.on("language-change", ({ roomId, language }) => {
    if (!roomStates.has(roomId)) {
      roomStates.set(roomId, { ...defaultRoomState });
    }
    roomStates.get(roomId).language = language;
    socket.to(roomId).emit("language-update", language);
  });

  socket.on("notes-change", ({ roomId, notes }) => {
    if (!roomStates.has(roomId)) {
      roomStates.set(roomId, { ...defaultRoomState });
    }
    roomStates.get(roomId).notes = notes;
    socket.to(roomId).emit("notes-update", notes);
  });

  socket.on("console-output", ({ roomId, output }) => {
    if (!roomStates.has(roomId)) {
      roomStates.set(roomId, { ...defaultRoomState });
    }
    roomStates.get(roomId).consoleOutput = output;
    socket.to(roomId).emit("console-output", output);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);

    socket.rooms.forEach((roomId) => {
      if (roomId === socket.id) return;
      const room = io.sockets.adapter.rooms.get(roomId);
      const roomUserMap = roomUsers.get(roomId);
      if (roomUserMap) {
        delete roomUserMap[socket.id];
        io.to(roomId).emit("room-users", Object.values(roomUserMap));
      }

      if (!room || room.size === 0) {
        roomStates.delete(roomId);
        roomUsers.delete(roomId);
      }
    });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const session = require("express-session");
const passport = require("./utils/passport");
const { AccessToken } = require("livekit-server-sdk");

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = [FRONTEND_URL, "http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy: This origin is not allowed."));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.status(401).json({ message: "Not authenticated" });
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

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;
if (mongoURI) {
  mongoose.connect(mongoURI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => console.error("MongoDB connection error:", err));
}

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

app.post("/api/auth/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie("connect.sid");
      return res.status(204).end();
    });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

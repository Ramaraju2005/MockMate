require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;

const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:5173`;

const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || `${BACKEND_URL}auth/google/callback`;
const GITHUB_CALLBACK_URL =
  process.env.GITHUB_CALLBACK_URL || `${BACKEND_URL}auth/github/callback`;

console.log("BACKEND_URL =", BACKEND_URL);
console.log("GOOGLE_CALLBACK_URL =", GOOGLE_CALLBACK_URL);
console.log("GITHUB_CALLBACK_URL =", GITHUB_CALLBACK_URL);
console.log("FRONTEND_URL =", FRONTEND_URL);
console.log("GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET =", process.env.GOOGLE_CLIENT_SECRET);
console.log("GITHUB_CLIENT_ID =", process.env.GITHUB_CLIENT_ID);
console.log("GITHUB_CLIENT_SECRET =", process.env.GITHUB_CLIENT_SECRET);
// ── Google Strategy ──────────────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// ── GitHub Strategy ──────────────────────────────────────────────────────────
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL,
      scope: ["user:email"],
    },
    (accessToken, refreshToken, profile, done) => {
      // Normalise the profile shape to be consistent with Google's
      profile.provider = "github";
      profile.displayName =
        profile.displayName || profile.username || "GitHub User";
      return done(null, profile);
    }
  )
);

// ── Session helpers ──────────────────────────────────────────────────────────
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;

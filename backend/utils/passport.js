require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const FRONTEND_URL = process.env.FRONTEND_URL || `http://localhost:${PORT}`;

const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || `${BACKEND_URL}auth/google/callback`;
console.log("GOOGLE_CALLBACK_URL =", GOOGLE_CALLBACK_URL);

console.log("BACKEND_URL =", BACKEND_URL);
console.log("GOOGLE_CALLBACK_URL =", GOOGLE_CALLBACK_URL);
console.log("FRONTEND_URL =", FRONTEND_URL);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    
    (accessToken, refreshToken, profile, done) => {
      // Later you can save the user in MongoDB

      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;

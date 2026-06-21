const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const session = require("express-session");
const passport = require("./utils/passport");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// passport

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/");
}

app.get("/profile", isLoggedIn, (req, res) => {
  res.send(`
    <h1>Profile</h1>
    <p>Name: ${req.user.displayName}</p>
    <p>Email: ${req.user.emails[0].value}</p>
    <img src="${req.user.photos[0].value}" />
    <br><br>
    <a href="/logout">Logout</a>
  `);
});

// MongoDB Connection
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);




app.get("/", (req, res) => {
  res.send(`
    <h1>Home</h1>
    <a href="/auth/google">Login with Google</a>
  `);
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("/profile");
  }
);

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

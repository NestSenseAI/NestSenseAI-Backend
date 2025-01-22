require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const passportConfig = require("./passport-config");

const app = express();
router = express.Router();

// Middleware for session handling
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Load Passport.js strategy
passportConfig(passport);

// Routes
router.get("/", (req, res) => {
  res.send("Welcome to Google Authentication with Supabase!");
});

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/dashboard",
  })
);

router.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Hello, ${req.user.name}`);
  } else {
    res.redirect("/auth/google");
  }
});

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

module.exports = router;

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const passportConfig = require("./passport-config");

const app = express();

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
app.get("/", (req, res) => {
  res.send("Welcome to Google Authentication with Supabase!");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/dashboard",
  })
);

app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Hello, ${req.user.name}`);
  } else {
    res.redirect("/auth/google");
  }
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

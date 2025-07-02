require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const passportConfig = require("./passport-config");
const cors = require("cors");

const app = express();
router = express.Router();

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://nest-sense-ai.vercel.app",
  credentials: true
}));

// Middleware for session handling
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Required for cross-site cookie
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    proxy: true // Required when running behind a proxy (like on Render)
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
    failureRedirect: `${process.env.FRONTEND_URL || "https://nest-sense-ai.vercel.app"}/auth`,
    successRedirect: `${process.env.FRONTEND_URL || "https://nest-sense-ai.vercel.app"}/dashboard`,
  })
);

router.get("/auth/status", (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user
  });
});

router.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect(process.env.FRONTEND_URL || "https://nest-sense-ai.vercel.app");
  });
});

module.exports = router;

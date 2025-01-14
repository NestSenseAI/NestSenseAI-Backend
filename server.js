require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const passportConfig = require("./passport-config");
const authRoutes = require("./routes/authRoutes");
const trackingRoutes = require("./routes/trackingRoutes");
const wellnessRoutes = require("./routes/wellnessRoutes");

const app = express();

// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware
app.use(session({ 
  secret: process.env.SESSION_SECRET, 
  resave: false, 
  saveUninitialized: true 
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passportConfig(passport);

// Routes
app.use("/auth", authRoutes);
app.use("/tracking", trackingRoutes);
app.use("/wellness", wellnessRoutes);

// Default Routes
app.get("/", (req, res) => res.send("Google Auth with Supabase!"));
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => res.redirect("/dashboard")
);
app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`Hello, ${req.user.name}`);
  } else {
    res.redirect("/auth/google");
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

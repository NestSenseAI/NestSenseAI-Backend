require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const passportConfig = require("./passport-config");
const authRoutes = require("./routes/authRoutes");
const wellnessRoutes = require("./routes/wellnessRoutes");
const cors = require("cors");
const axios = require("axios");

const app = express();

// CORS Configuration
const corsOptions = {
  origin: ["http://localhost:3000", "https://nest-sense-ai.vercel.app"],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware for parsing request body
app.use(express.json());  // Make sure this middleware is added to parse JSON request bodies

// Use Auth and Wellness routes
app.use("/auth", authRoutes);
app.use("/wellness", wellnessRoutes);

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

// Routes for authentication and user dashboard
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

// API Route for Chat (handling communication with Python backend)
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    // Send message to Python backend for response
    const pythonResponse = await axios.post("https://nestsenseai-solace.onrender.com/api/chat", {
      message: userMessage,
    });

    // Respond with the Python backend's response
    res.status(200).json(pythonResponse.data);
  } catch (error) {
    console.error("Error communicating with Python backend:", error.message);
    res.status(500).json({ error: "Failed to process the request. Please try again later." });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

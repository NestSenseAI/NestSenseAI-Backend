require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const authRoutes = require("./routes/authRoutes");
const trackingRoutes = require("./routes/trackingRoutes");
const wellnessRoutes = require("./routes/wellnessRoutes");

const app = express();

// CORS Configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Added PUT and DELETE for wellness routes
  credentials: true,
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(passport.initialize());
require("./config/passport")(passport);

// Database Connection
connectDB();

// Routes
app.use("/auth", authRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/wellness', wellnessRoutes); // Add wellness routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
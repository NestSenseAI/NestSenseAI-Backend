require("dotenv").config();
const express = require("express");
const passport = require("passport");
//const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(passport.initialize());
require("./config/passport")(passport);

// Database Connection
connectDB();

// Routes
app.use("/auth", authRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

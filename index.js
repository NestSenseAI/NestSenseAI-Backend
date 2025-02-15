require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios'); // Add axios for making HTTP requests
const wellnessRoutes = require('./routes/wellnessRoutes'); // Import wellness routes
const authRoutes = require('./routes/authRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const passportConfig = require("./passport-config");
const googleAuthRoutes = require('./google-auth-supabase/server');
const app = express();

// Middleware
app.use(cors({
  origin: ['https://nest-sense-ai.vercel.app', 'http://localhost:5173'], // Adjust frontend origins
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true}));
app.use(express.json());

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);


// Supabase setup
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test Supabase connection
app.get('/test-supabase', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      return res.status(500).send('Supabase connection failed.');
    }
    res.status(200).send('Supabase is connected!');
  } catch (err) {
    res.status(500).send('Error connecting to Supabase.');
  }
});



// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the NestSenseAI Backend!');
});

app.use('/api/auth', authRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/exercise', exerciseRoutes);
app.use('/', googleAuthRoutes);

// Chat API Route (Forwarding to Python Flask Server)
app.post('/api/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    // Ensure the URL matches the Python bot's correct endpoint
    const pythonResponse = await axios.post('https://nestsenseai-solace.onrender.com/chat', {
      message: userMessage,
    });

    res.status(200).json(pythonResponse.data);
  } catch (error) {
    console.error('Error connecting to Python bot API:', error.message);
    res.status(500).json({ error: 'Failed to connect to bot API' });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

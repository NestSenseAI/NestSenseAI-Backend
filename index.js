require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { createClient } = require('@supabase/supabase-js');

//import the routes
const {register , login} = require('./controllers/authController.js')

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

//supabase connection
// Supabase credentials from .env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

//test the connection - this url can be checked manually to verify whether supabase is connected or not
app.get('/test-supabase', async (req, res) => {
  try {
    // Perform a lightweight query to check the connection
    const { data, error } = await supabase.from('users').select('*').limit(1); // Replace 'test_table' with any table name in your Supabase DB

    if (error) {
      console.error('Supabase error:', error);
      res.status(500).send('Supabase connection failed.');
      return;
    }

    console.log('Supabase is connected!');
    res.status(200).send('Supabase is connected!');
  } catch (err) {
    console.error('Error connecting to Supabase:', err);
    res.status(500).send('Error connecting to Supabase.');
  }
});


// MongoDB Connection



// Passport Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/auth/google/callback', // Ensure correct callback URL
    },
    (accessToken, refreshToken, profile, done) => {
      console.log(profile);
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

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the NestSenseAI Backend!');
});

app.post('/register' , register);
// Google OAuth Routes
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); // Redirect after successful login
  }
);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

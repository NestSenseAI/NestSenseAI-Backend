require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { createClient } = require('@supabase/supabase-js');
const wellnessRoutes = require('./routes/wellnessRoutes'); // Import wellness routes
const { register, getDetails, login } = require('./controllers/authController');

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

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

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


// MongoDB Connection



// Passport Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
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
app.post('/getDetails',getDetails);
app.post('/login',login)
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
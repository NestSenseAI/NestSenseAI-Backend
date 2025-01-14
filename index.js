require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

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

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

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

// Models
const dailyEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to user
  date: { type: String, unique: true, required: true }, // Date in YYYY-MM-DD format
  mood: { type: Number, required: true }, // Mood on a scale (e.g., 1-10)
  energy: { type: Number, required: true }, // Energy level on a scale
  symptoms: { type: [String], default: [] }, // Array of symptoms
});

const DailyEntry = mongoose.model('DailyEntry', dailyEntrySchema);

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the NestSenseAI Backend!');
});

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

// Daily Wellness Tracker Routes
app.post('/api/daily-entry', async (req, res) => {
  const { userId, date, mood, energy, symptoms } = req.body;

  try {
    // Check if an entry for the same date already exists
    const existingEntry = await DailyEntry.findOne({ userId, date });
    if (existingEntry) {
      return res.status(400).json({ message: 'Entry for this date already exists.' });
    }

    // Save the new entry
    const newEntry = new DailyEntry({ userId, date, mood, energy, symptoms });
    await newEntry.save();

    res.status(201).json({ message: 'Daily entry saved successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving daily entry', error });
  }
});

app.get('/api/daily-entry/:date', async (req, res) => {
  const { userId } = req.query; // Get userId from query parameters
  const { date } = req.params;

  try {
    const entry = await DailyEntry.findOne({ userId, date });
    if (!entry) {
      return res.status(404).json({ message: 'Daily entry not found' });
    }
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving daily entry', error });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

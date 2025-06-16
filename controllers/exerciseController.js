// controllers/exerciseController.js

exports.getPlans = (req, res) => {
  res.json({ message: 'getPlans is not implemented yet' });
};

exports.getPlanDetailsHandler = (req, res) => {
  res.json({ message: 'getPlanDetailsHandler is not implemented yet' });
};

exports.createCustomPlan = (req, res) => {
  res.json({ message: 'createCustomPlan is not implemented yet' });
};

exports.getActivities = (req, res) => {
  res.json({ message: 'getActivities is not implemented yet' });
};

exports.getMeals = (req, res) => {
  res.json({ message: 'getMeals is not implemented yet' });
};

// ✅ Your real implementation
const path = require('path');
const SemanticExerciseFinder = require('../utils/SemanticExerciseFinder');

const exerciseFinder = new SemanticExerciseFinder(
    path.join(__dirname, '../data/Enhanced_Postpartum_Exercise_Plan.csv')
);

let exerciseFinderInitialized = false;

exports.getExerciseRecommendations = async (req, res) => {
  try {
    if (!exerciseFinderInitialized) {
      await exerciseFinder.initialize();
      exerciseFinderInitialized = true;
    }

    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing query string.' });
    }

    const results = exerciseFinder.findSimilarExercises(query);
    res.json({ results });
  } catch (err) {
    console.error('❌ Error recommending exercises:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

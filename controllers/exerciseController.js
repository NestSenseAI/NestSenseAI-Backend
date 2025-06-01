const SemanticMealFinder = require('./MealFinder'); // Adjust path if needed

const mealFinder = new SemanticMealFinder('./data/extended_postpartum_diet_dataset.csv');

let mealFinderInitialized = false;

async function getRecommendations(req, res) {
  try {
    if (!mealFinderInitialized) {
      await mealFinder.initialize();
      mealFinderInitialized = true;
    }

    const { query } = req.query;

    if (typeof query !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing query string.' });
    }

    const results = mealFinder.findSimilarMeals(query);
    res.json({ results });
  } catch (err) {
    console.error('Error finding similar meals:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
}




module.exports = { getRecommendations };

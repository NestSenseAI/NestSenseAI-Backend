const express = require('express');
const router = express.Router();

const {
    getPlans,
    getPlanDetailsHandler,
    createCustomPlan,
    getActivities,
    getMeals,
    getExerciseRecommendations // 👈 Import the new controller
} = require('../controllers/exerciseController');

// Existing routes
router.get('/plans', getPlans);
router.get('/plans/:id', getPlanDetailsHandler);
router.post('/plans/custom', createCustomPlan);
router.get('/activities', getActivities);
router.get('/meals', getMeals);

// New route for exercise recommendations
router.post('/recommend', getExerciseRecommendations); // 👈 POST endpoint

module.exports = router;

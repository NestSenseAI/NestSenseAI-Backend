const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");
const passport = require("passport");
const verifyToken = require("../authMiddleware");

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch plans from the 'plans' table
const getPlans = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('plans')
            .select('*');

        if (error) {
            throw error;
        }

        console.log(data); // Debug log to see what data is fetched
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
};

// Get weeks along with related data like plan activities and meals
const getWeeks = async (planId) => {
    const { data: weeks, error } = await supabase
        .from('weeks')
        .select(`
            week_id,
            week_number,
            description,
            plan_activities (
                activity_id,
                time_of_day,
                activities (
                    activity_name,
                    duration_mins
                )
            ),
            plan_meals (
                meal_id,
                time_of_day,
                meals (
                    meal_name,
                    nutritional_value,
                    purpose,
                    modifications
                )
            )
        `)
        .eq('plan_id', planId)
        .order('week_number'); // Ensure that weeks are ordered by week_number

    if (error) {
        console.error('Error fetching weeks:', error);
        throw error;
    }

    console.log('Fetched weeks:', weeks);  // Debug log to check fetched weeks data
    return weeks;
};

// Get full plan details, including related weeks, activities, and meals
const getPlanDetails = async (planId) => {
    try {
        const weeks = await getWeeks(planId);
        console.log('Weeks data in getPlanDetails:', weeks);  // Log to inspect fetched weeks data
        
        return weeks.map(week => ({
            week_number: week.week_number,
            description: week.description,
            plan_activities: week.plan_activities,
            plan_meals: week.plan_meals
        }));
    } catch (error) {
        console.error('Error in getPlanDetails:', error);
        throw error;
    }
};

// Express route handler to fetch details of a specific plan
const getPlanDetailsHandler = async (req, res) => {
    try {
        const planId = parseInt(req.params.planId);
        console.log(planId); // Debug log to ensure planId is received correctly

        if (!planId || isNaN(planId)) {
            return res.status(400).json({ error: 'Invalid plan ID' });
        }

        console.log('Fetching details for plan ID:', planId); // Debug log to track plan details request
        const details = await getPlanDetails(planId);
        res.json(details); // Send the fetched details as JSON response
    } catch (error) {
        console.error('Error handling plan details request:', error);
        res.status(500).json({ error: 'Failed to fetch plan details' });
    }
};

//custom plan controller
const createCustomPlan = async (req, res) => {
    const { planDetails, weeks } = req.body;
    console.log(planDetails, weeks);
    res.status(200).json({ message: 'Custom plan created successfully' });
};

//get activities
const getActivities = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('activities')
            .select('*');

        if (error) {
            throw error;
        }

        console.log('Fetched activities:', data); // Debug log
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
};

//get meals
const getMeals = async (req, res) => {
    const { data, error } = await supabase
        .from('meals')
        .select('*');
    console.log(data);
    res.json(data);
};

// Export the middleware for usage in routes
module.exports = {
    getPlans,
    getPlanDetailsHandler,
    createCustomPlan,
    getActivities,
    getMeals
};

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");
const passport = require("passport");
const verifyToken = require("../authMiddleware");

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const getPlans= async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('plans')
            .select('*')

        if (error) {
            throw error;
        }


        console.log(data)
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Failed to fetch plans' });
    }
};

// More efficient version of getWeeks that includes related data
const getWeeks = async (planId) => {
    const { data: weeks, error } = await supabase
      .from('weeks')
      .select(`
        week_id,
        week_number,
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
      .order('week_number');
  
    if (error) throw error;
    return weeks;
};

// Simplified getPlanDetails that uses a single query
const getPlanDetails = async (planId) => {
    try {
      const weeks = await getWeeks(planId);
      return weeks.map(week => ({
        week_number: week.week_number,
        plan_activities: week.plan_activities,
        plan_meals: week.plan_meals
      }));
    } catch (error) {
      console.error('Error in getPlanDetails:', error);
      throw error;
    }
};

// Express route handler
const getPlanDetailsHandler = async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      console.log(planId)
      
      if (!planId || isNaN(planId)) {
        return res.status(400).json({ error: 'Invalid plan ID' });
      }

      console.log('Fetching details for plan ID:', planId); // Debug log
      const details = await getPlanDetails(planId);
      res.json(details);
    } catch (error) {
      console.error('Error handling plan details request:', error);
      res.status(500).json({ error: 'Failed to fetch plan details' });
    }
};

// Export the middleware
module.exports = {
    getPlans,
    getPlanDetailsHandler
};

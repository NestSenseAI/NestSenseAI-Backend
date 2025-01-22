const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { getPlans, getPlanDetailsHandler, createCustomPlan, getActivities, getMeals } = require("../controllers/exerciseController");

const router = express.Router();

router.get("/getPlans", getPlans);
router.get("/getPlanDetails/:planId", getPlanDetailsHandler);
router.post("/createCustomPlan", createCustomPlan);
router.get("/getActivities", getActivities);
router.get("/getMeals", getMeals);
module.exports = router;


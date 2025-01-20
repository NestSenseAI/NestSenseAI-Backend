const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { getPlans, getPlanDetailsHandler } = require("../controllers/exerciseController");

const router = express.Router();

router.get("/getPlans", getPlans);
router.get("/getPlanDetails/:planId", getPlanDetailsHandler);

module.exports = router;


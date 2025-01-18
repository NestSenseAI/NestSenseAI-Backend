const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
const { register,getDetails,login} = require("../controllers/authController");

const router = express.Router();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// User registration and login
router.post("/register", register);
router.post("/login", login);
router.post("/getDetails",getDetails);

module.exports = router;

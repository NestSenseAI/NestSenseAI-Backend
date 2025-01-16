const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { createClient } = require("@supabase/supabase-js");
const { register, login, googleCallback } = require("../controllers/authController");

const router = express.Router();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// User registration and login
router.post("/register", register);
router.post("/login", login);

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      // Extract user details from the Passport profile
      const { id: googleId, displayName, emails } = req.user;

      const email = emails && emails[0]?.value;

      // Check if the user already exists in the database
      let { data: user, error } = await supabase
        .from("login")
        .select("*")
        .eq("email", email)
        .single();

      if (error && error.code !== "PGRST116") {
        // Handle any unexpected error (e.g., database issue)
        console.error("Supabase error:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (!user) {
        // If the user doesn't exist, insert a new user
        const { data: newUser, error: insertError } = await supabase.from("login").insert([
          {
            google_id: googleId,
            name: displayName,
            email,
          },
        ]);

        if (insertError) {
          console.error("Error creating user:", insertError);
          return res.status(500).json({ error: "Failed to create user" });
        }

        user = newUser[0];
      }

      // Generate a JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Redirect or send the token back
      res.status(200).json({ message: "Authentication successful", token });
    } catch (err) {
      console.error("Error in Google callback:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;

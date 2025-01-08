const express = require("express");
const passport = require("passport");
const { register, login } = require("../controllers/authController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

module.exports = router;

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const passportConfig = require("./passport-config");

const app = express();

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passportConfig(passport);

app.get("/", (req, res) => res.send("Google Auth with Supabase!"));

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login", successRedirect: "/dashboard" })
);

app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) res.send(`Hello, ${req.user.name}`);
  else res.redirect("/auth/google");
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
 

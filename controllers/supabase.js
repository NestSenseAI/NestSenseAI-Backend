require('dotenv').config(); // Load environment variables
const bcrypt = require("bcryptjs");
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials from .env
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

module.exports = supabase; // Export the client to use in your routes


// Function to create a new user
const createUser = async (name, email, password) => {
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into Supabase
    const { data, error } = await supabase.from("users").insert([
      {
        name,
        email,
        password_hash: hashedPassword,
      },
    ]);

    if (error) throw error;

    console.log("User created:", data);
    return data;
  } catch (err) {
    console.error("Error creating user:", err);
  }
};

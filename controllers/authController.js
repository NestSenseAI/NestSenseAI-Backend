const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");
const passport = require("passport");

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to hash the password
const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error; // Rethrow the error to handle it at a higher level
  }
};

// Route to handle email and password registration
exports.register = async (req, res) => {
  console.log("Register route hit");
  const { name, email, password } = req.body;

  try {
    // Check if the email already exists
    const { data: existingUser, error: emailCheckError, count } = await supabase
      .from("login")
      .select("email", { count: "exact" })
      .eq("email", email);

    if (emailCheckError) {
      return res.status(500).json({ error: emailCheckError.message });
    }

    if (count > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert the user into the login table
    const { error } = await supabase.from("login").insert([
      {
        email,
        password_hash: hashedPassword,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      return res.status(500).json({ error: "Failed to register user" });
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ error: "User registration failed" });
  }
};


// Route to get personal details and store them
exports.getDetails = async (req, res) => {
  console.log("Getting details");
  const { name, age, country, state, email } = req.body;

  try {
    // Insert the personal details into the user table
    const { error } = await supabase.from("users").insert([
      {
        name,
        email,
        country,
        state,
        age,
      },
    ]);

    if (error) {
      return res.status(500).json({ error: "Failed to store user details" });
    }

    res.status(201).json({ message: "Details entered successfully" });
  } catch (err) {
    console.error("Error during details insertion:", err);
    res.status(500).json({ error: "Failed to store user details" });
  }
};

// Route to handle login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login route hit");
  console.log(email, password);

  try {
    // Authenticate the user
    const { data, error } = await supabase
      .from("login")
      .select("email, password_hash,id")
      .eq("email", email)
      .single(); // single ensures we get only one result

    if (error || !data) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Compare the password with the stored hashed password using bcrypt
    const passwordMatch = await bcrypt.compare(password, data.password_hash);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // If email and password are correct, generate a JWT token
    const token = jwt.sign(
      { email: data.email }, // Payload
      process.env.JWT_SECRET, // Secret key to sign the token
      { expiresIn: "1h" } // Token expiration (1 hour)
    );

    const {user_id} = await supabase.from("login").select("id").eq("email",email).single();

    // Send the token to the frontend
    res.status(200).json({
      message: "Login successful",
      token,
      id: data.id
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

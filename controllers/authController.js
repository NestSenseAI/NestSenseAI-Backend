const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const supabase = require("./supabase");

//function to hash the password
const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
  }
};

//route to handle email and password registration
exports.register = async (req, res) => {
  console.log("register route hit");
  const { name, email, password } = req.body;

  try {
    // Check if the email already exists
    const { data: existingUser, error: emailCheckError, count } = await supabase
      .from('login')
      .select('email', { count: 'exact' })
      .eq('email', email);

    if (emailCheckError) {
      return res.status(500).json({ error: emailCheckError.message });
    }

    // If no rows found, count will be 0
    if (count > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert the user into the login table
    const { data, error } = await supabase
      .from('login')
      .insert([
        {
          email,
          password_hash: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ error: "User registration failed" });
  }
};

//route to get personal details and store them
exports.getDetails = async(req, res) => {
  console.log("getting details");
  const {}
}


exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

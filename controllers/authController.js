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
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ error: "User registration failed" });
  }
};

//route to get personal details and store them
exports.getDetails = async(req, res) => {
  console.log("getting details");
  const {name , age , country , state , email} = req.body;
  console.log(name , age , country);
  try{
    //insert the personal details into the user table
    const {data , error } = await supabase
    .from('users')
    .insert([
      {
        name : name,
        email : email,
        country : country,
        state : state,
        age : age
      },
    ]);
    res.status(201).json({message : "details entered successfully"})
  }catch(error){
    console.error("Error during registration:", err);
    res.status(500).json({ error: "User registration failed" });
  }
}


exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log("login route hit")
  console.log(email , password)
  try {
    //authenticate the user
    const {data , error} = await supabase
    .from('login')
    .select('email,password_hash')
    .eq('email',email)
    .single(); //single ensures we get only one result

    console.log(data);

    if (error || ! data){
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    //compare the password with the stored hashed password using bcrypt
    const passwordMatch = await bcrypt.compare(password , data.password_hash);
    console.log(passwordMatch);
    if(!passwordMatch){
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // If email and password are correct, generate a JWT token
    const token = jwt.sign(
      { email: data.email },  // Payload, you can add more info here if needed
      process.env.JWT_SECRET,             // Secret key to sign the token
      { expiresIn: '1h' }     // Expiration time for the token (1 hour in this case)
    );

    // Send the token to the frontend
    res.status(200).json({
      message: 'Login successful',
      token,  // Send back the JWT token
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
};

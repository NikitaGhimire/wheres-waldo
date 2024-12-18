const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

//REGISTER USER
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, role } = req.body;
  try {
    //check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists." });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create user
    const newUser = new User({
      username,
      password: hashedPassword,
      role,
    });

    //save the user to database
    await newUser.save();

    //success message
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

//user login
const userLogin = async (req, res) => {
  const { username, password } = req.body;
  // Validate the request
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide both username and password" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    //compare the password match
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    //creating jwt token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    // Send the token as a response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: `Error logging in` });
  }
};

const getUserDetails = async (req, res) => {
  try {
    console.log("User in request:", req.user); // Log req.user to see its contents
    if (!req.user || !req.user.userId) {
      return res.status(400).json({ error: "No user found in the token" });
    }

    const user = await User.findById(req.user.userId); // Ensure you're using userId from token
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ username: user.username });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
};

module.exports = { registerUser, userLogin, getUserDetails };

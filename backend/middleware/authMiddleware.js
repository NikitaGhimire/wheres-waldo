const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
const authenticateUser = (req, res, next) => {
  // Get the Authorization header
  const authHeader = req.header("Authorization");
  // Check if the Authorization header is present
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  const token = authHeader.split(" ")[1]; // Expecting the token in the format: Bearer <token>

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = decoded; // Add user data to the request object
    next(); // Proceed to the next middleware/controller
  } catch (error) {
    console.error("JWT error:", error);
    return res.status(400).json({ message: "Invalid token." });
  }
};

module.exports = { authenticateUser };

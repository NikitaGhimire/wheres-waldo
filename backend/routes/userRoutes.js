const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const { authenticateUser } = require("../middleware/authMiddleware");

//register user route
router.post(
  "/register",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("role")
      .isIn(["author", "normal"])
      .withMessage('Role must be either "author" or "normal"'),
  ],
  userController.registerUser
);

router.post("/login", userController.userLogin);
router.get("/userDetails", authenticateUser, userController.getUserDetails);

module.exports = router;

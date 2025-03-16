const express = require("express");
const router = express.Router();
const scoreboardController = require("../controllers/scoreboardController");
const { authenticateUser } = require("../middleware/authMiddleware");

// Get all scores (sorted by time)
router.get("/api/scoreboard", authenticateUser, scoreboardController.getAllScores);

// Add a new score
router.post("/api/scoreboard", authenticateUser, scoreboardController.addScore);

// Get scores for a specific image
router.get("/api/scoreboard/:imageId", authenticateUser, scoreboardController.getImageScores);

module.exports = router;

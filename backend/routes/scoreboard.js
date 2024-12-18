const express = require("express");
const router = express.Router();
const Scoreboard = require("../models/Scoreboard");

// Get all scores (sorted by time)
router.get("/api/scoreboard", async (req, res) => {
  try {
    const scores = await Scoreboard.find().sort({ time: 1 }); // Sort by time (ascending)
    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Add a new score
router.post("/api/scoreboard", async (req, res) => {
  const { username, title, time, imageId } = req.body;

  if (!username || !title || typeof time !== "number" || !imageId) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const newScore = new Scoreboard({ username, title, time, imageId });
    const savedScore = await newScore.save();
    res.status(201).json(savedScore);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Get scores for a specific image by imageId
router.get("/api/scoreboard/:imageId", async (req, res) => {
  const { imageId } = req.params; // Get imageId from URL parameters

  try {
    // Find scores related to the imageId, and sort by time (ascending)
    const scores = await Scoreboard.find({ imageId }).sort({ time: 1 });
    res.json(scores); // Return the scores for the specific image
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

module.exports = router;

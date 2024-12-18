const mongoose = require("mongoose");

const ScoreboardSchema = new mongoose.Schema({
  username: { type: String, required: true },
  title: { type: String, required: true },
  time: { type: Number, required: true }, // Time in seconds
  createdAt: { type: Date, default: Date.now }, // Timestamp for the game
  imageId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Image",
  }, // Reference to the image
});

// Export the model
module.exports = mongoose.model("Scoreboard", ScoreboardSchema);

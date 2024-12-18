const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  imageId: { type: mongoose.Schema.Types.ObjectId, ref: "Image", required: true },
  character: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Tag", tagSchema);

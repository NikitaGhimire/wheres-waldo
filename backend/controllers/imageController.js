const Image = require("../models/Image");
const mongoose = require("mongoose");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");
const Tag = require("../models/Tag");
const Score = require("../models/Scoreboard");



const uploadImage = async (req, res) => {
  try {
    const { title, authorId, tags } = req.body;
    const file = req.file;

    if (!title || !file || !authorId || !tags) {
      return res
        .status(400)
        .json({ message: "Please provide all required information" });
    }

    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      return res.status(400).json({ message: "Invalid authorId" });
    }

    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    if (author.role !== "author") {
      return res
        .status(403)
        .json({ message: "Only authors can upload images" });
    }

    const parsedTags = JSON.parse(tags);
    if (!Array.isArray(parsedTags) || parsedTags.length !== 3) {
      return res
        .status(400)
        .json({ message: "Tags should be an array of 3 objects" });
    }

    const imageUrl = `uploads/${file.filename}`;
    const image = new Image({
      title,
      url: imageUrl,
      authorId,
    });
    await image.save();

    const tagPromises = parsedTags.map((tag) => {
      if (
        !tag.character ||
        typeof tag.x !== "number" ||
        typeof tag.y !== "number"
      ) {
        throw new Error("Invalid tag format");
      }
      return new Tag({
        imageId: image._id,
        character: tag.character,
        x: tag.x,
        y: tag.y,
      }).save();
    });
    await Promise.all(tagPromises);

    res.status(201).json({ message: "Image uploaded successfully!", image });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//view images
const viewImages = async (req, res) => {
  try {
    const images = await Image.find().populate("authorId", "username");
    res.status(200).json({
      message: "Images retrieved successfully",
      images: images,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//delete images
const deleteImages = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid image ID" });
  }

  try {
    // Find the image by ID
    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // // Ensure the post belongs to the author
    // if (image.authorId.toString() !== userId) {
    //   return res
    //     .status(403)
    //     .json({ error: "Unauthorized to delete this image" });
    // }

    // Delete the image file from the server (uploads folder)
    const imagePath = path.join(__dirname, "../", image.url);
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Failed to delete file:", err);
        return res.status(500).json({ error: "Error deleting file" });
      }
    });

    // Delete the image record from the database
    await Image.deleteOne({ _id: id });

    res.json({ message: "Image deleted successfully" });
  } catch (err) {
    console.error("Error deleting image:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Function to delete all image records from the database
const deleteAllImagesFromDB = async (req, res) => {
  try {
    // Delete all image records from the database
    const result = await Image.deleteMany(); // This will delete all documents in the Image collection

    res.status(200).json({
      message: "All image records deleted successfully",
      deletedCount: result.deletedCount, // Number of records deleted
    });
  } catch (error) {
    console.error("Error deleting image records:", error);
    res.status(500).json({ message: "Error deleting image records" });
  }
};

// In your imageController.js
const getTagsForImage = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid image ID" });
  }

  try {
    const tags = await Tag.find({ imageId: id });
    res.status(200).json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get image by ID
const getImageById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid image ID format" });
    }

    // Find image and populate both author and tags in one query
    const image = await Image.findById(id)
      .populate('authorId', 'username')
      .populate({
        path: 'tags',
        select: 'character x y' // Include _id for tag verification
      });

    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Transform the response to include only necessary data
    // Don't send tag positions to client for security
    const response = {
      _id: image._id,
      title: image.title,
      url: image.url,
      author: image.authorId.username,
      // Only send tag IDs for verification
      tagIds: image.tags.map(tag => tag._id)
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Post a new score
const postScore = async (req, res) => {
  const { username, title, time } = req.body;

  if (!username || !title || typeof time !== "number") {
    return res
      .status(400)
      .json({ message: "Please provide all required information" });
  }

  try {
    const score = new Score({
      username,
      imageTitle: title,
      time,
    });

    await score.save();
    res.status(201).json({ message: "Score saved successfully!", score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all scores
const getScoreboard = async (req, res) => {
  try {
    const scores = await Score.find().sort({ time: 1 }); // Sort by fastest time
    res.status(200).json({ scores });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  uploadImage,
  viewImages,
  deleteImages,
  deleteAllImagesFromDB,
  getTagsForImage,
  postScore,
  getScoreboard,
  getImageById, 
};

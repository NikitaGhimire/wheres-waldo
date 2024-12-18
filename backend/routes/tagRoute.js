const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tagController");
const { authenticateUser } = require("../middleware/authMiddleware");

// Add a tag to an image
router.post("/images/:imageId/tags", authenticateUser, tagController.addTag);

// Get all tags for a specific image
router.get(
  "/images/:imageId/tags",
  authenticateUser,
  tagController.getTagsForImage
);

// Optionally, delete a specific tag
router.delete("/tags/:tagId", authenticateUser, tagController.deleteTag);

module.exports = router;

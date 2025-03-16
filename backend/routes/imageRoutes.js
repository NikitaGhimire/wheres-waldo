const express = require("express");
const router = express.Router();
const imageController = require("../controllers/imageController");
const { authenticateUser } = require("../middleware/authMiddleware");
const upload = require("../config/multerConfig");

// Get all images
router.get("/images", authenticateUser, imageController.viewImages);

// Get single image by ID - no auth required
router.get('/images/:id', imageController.getImageById);

// Upload image (using multer)
router.post(
  "/upload",
  authenticateUser,
  upload.single("image"),
  imageController.uploadImage
);

// Delete image
router.delete("/images/:id", authenticateUser, imageController.deleteImages);

// Delete all images
router.delete(
  "/deleteAllImages",
  authenticateUser,
  imageController.deleteAllImagesFromDB
);

// Get tags for image
router.get("/tags/:id", authenticateUser, imageController.getTagsForImage);

// Scoreboard routes
router.post("/scoreboard", authenticateUser, imageController.postScore);
router.get("/scoreboard", authenticateUser, imageController.getScoreboard);

module.exports = router;

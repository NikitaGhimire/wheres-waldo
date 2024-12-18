const express = require("express");
const router = express.Router();
const imageController = require("../controllers/imageController");
const { authenticateUser } = require("../middleware/authMiddleware");

//get all images
router.get("/images", authenticateUser, imageController.viewImages);

//upload image
//upload image (now using multer to handle file uploads)
router.post(
  "/upload",
  authenticateUser,
  imageController.upload.single("image"),
  imageController.uploadImage
);

//update image
router.put("/images/:id");

//delete image
router.delete("/images/:id", authenticateUser, imageController.deleteImages);

router.delete(
  "/deleteAllImages",
  authenticateUser,
  imageController.deleteAllImagesFromDB
);
// Add to imageRoutes.js
router.get("/tags/:id", authenticateUser, imageController.getTagsForImage);

// Post a new score
router.post("/scoreboard", authenticateUser, imageController.postScore);

// Get all scores
router.get("/scoreboard", authenticateUser, imageController.getScoreboard);

module.exports = router;

const Tag = require("../models/Tag");
const Image = require("../models/Image");

// Add a tag to an image
exports.addTag = async (req, res) => {
  const { character, x, y } = req.body;

  try {
    const image = await Image.findById(req.params.imageId);
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    // Create a new tag
    const tag = new Tag({
      imageId: req.params.imageId,
      character,
      x,
      y,
    });
    await tag.save();

    // Add tag to the image's tags array
    image.tags.push(tag._id);
    await image.save();

    res.status(201).json({ message: "Tag added successfully", tag });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to add tag", details: error.message });
  }
};

// Get all tags for a specific image
exports.getTagsForImage = async (req, res) => {
  try {
    const tags = await Tag.find({ imageId: req.params.imageId });
    if (!tags || tags.length === 0) {
      return res.status(404).json({ error: "No tags found for this image" });
    }
    res.status(200).json({tags, tolerance: 10});
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch tags", details: error.message });
  }
};

// Optionally delete a tag
exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.tagId);
    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    // Remove the tag reference from the associated image
    await Image.findByIdAndUpdate(tag.imageId, { $pull: { tags: tag._id } });

    // Delete the tag
    await tag.remove();
    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete tag", details: error.message });
  }
};

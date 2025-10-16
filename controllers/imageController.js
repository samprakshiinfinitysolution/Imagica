import Image from "../models/Image.js";
import cloudinary from "../config/cloudinary.js";
// ✅ Add single or multiple images

// Delete a single image by category + _id
export const deleteSingleImage = async (req, res) => {
  try {
    const { category, id } = req.params;

    // Find the image
    const image = await Image.findOne({ _id: id, category });
    if (!image) {
      return res.status(404).json({ message: "Image not found in this category" });
    }

    // Delete from Cloudinary using its public_id
    await cloudinary.uploader.destroy(image.public_id);

    // Delete from DB
    await Image.deleteOne({ _id: id });

    res.json({
      message: `Image deleted from category: ${category}`,
      deleted: image
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Delete all images by category
export const deleteImagesByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Find all images of this category
    const images = await Image.find({ category });
    if (!images || images.length === 0) {
      return res.status(404).json({ message: "No images found for this category" });
    }

    // Delete from cloudinary
    await Promise.all(
      images.map(img => cloudinary.uploader.destroy(img.public_id))
    );

    // Delete from DB
    await Image.deleteMany({ category });

    res.json({ message: `All images deleted for category: ${category}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    if (!req.body.category) {
      return res.status(400).json({ message: "Category is required" });
    }

    const savedImages = await Promise.all(
      req.files.map((file) => {
        const newImage = new Image({
          url: file.path,
          public_id: file.filename || file.public_id,
          category: req.body.category, // acts like a folder
        });
        return newImage.save();
      })
    );

    res.status(201).json({
      message: `Images uploaded successfully in category: ${req.body.category}`,
      images: savedImages,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get all unique categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Image.distinct("category");
    const customOrder = ["Upcoming Events"];
    const otherCategories = categories.filter((c) => !customOrder.includes(c));
    const sortedCategories = [...customOrder, ...otherCategories];
    res.json(sortedCategories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get images by category
export const getImagesByCategory = async (req, res) => {
  try {
    const images = await Image.find({ category: req.params.category });
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//deleteing

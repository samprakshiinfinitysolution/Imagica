import Image from "../models/Image.js";
import Category from "../models/Category.js";
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
    // Fetch explicit categories (with timestamps)
    const stored = await Category.find({}, { name: 1, createdAt: 1 }).lean();

    // Get latest image timestamp per category
    const imageAgg = await Image.aggregate([
      { $group: { _id: '$category', lastImageAt: { $max: '$createdAt' } } }
    ]);

    // Build a lookup for image last activity
    const imageMap = {};
    for (const row of imageAgg) {
      if (row && row._id) imageMap[String(row._id)] = row.lastImageAt;
    }

    // Collect all category names from both sources
    const namesSet = new Set();
    stored.forEach((s) => { if (s && s.name) namesSet.add(String(s.name)); });
    Object.keys(imageMap).forEach((k) => namesSet.add(k));

    // Compute lastActivity per category (max of category createdAt and last image upload)
    const categoriesWithActivity = [];
    for (const name of namesSet) {
      const storedEntry = stored.find((s) => String(s.name) === String(name));
      const createdAt = storedEntry ? new Date(storedEntry.createdAt).getTime() : 0;
      const lastImageAt = imageMap[name] ? new Date(imageMap[name]).getTime() : 0;
      const lastActivity = Math.max(createdAt || 0, lastImageAt || 0);
      categoriesWithActivity.push({ name, lastActivity });
    }

    // Sort by lastActivity descending (most recent first)
    categoriesWithActivity.sort((a, b) => b.lastActivity - a.lastActivity);

    // Optionally pin "Upcoming Events" to the very top if it exists
    const pin = 'Upcoming Events';
    const result = [];
    const pinnedIndex = categoriesWithActivity.findIndex(c => c.name === pin);
    if (pinnedIndex !== -1) {
      result.push(categoriesWithActivity[pinnedIndex].name);
    }
    for (const c of categoriesWithActivity) {
      if (c.name === pin) continue;
      result.push(c.name);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new explicit category (optional - categories can also exist implicitly via images)
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) return res.status(400).json({ message: 'Category name is required' });
    const normalized = String(name).trim();
    // case-insensitive check against explicit categories
    const existingCat = await Category.findOne({ name: { $regex: `^${normalized.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}$`, $options: 'i' } });
    if (existingCat) return res.status(409).json({ message: 'Category already exists' });

    // also check implicit categories that come from images collection (case-insensitive)
    const imageCategories = await Image.distinct('category');
    const duplicateInImages = imageCategories.find((c) => String(c || '').trim().toLowerCase() === normalized.toLowerCase());
    if (duplicateInImages) return res.status(409).json({ message: 'Category already exists (matches existing image category)' });

    try {
      const cat = new Category({ name: normalized });
      await cat.save();
      res.status(201).json({ message: 'Category created', category: cat });
    } catch (saveErr) {
      // handle possible race / duplicate key error
      if (saveErr && saveErr.code === 11000) {
        return res.status(409).json({ message: 'Category already exists' });
      }
      throw saveErr;
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get images by category
export const getImagesByCategory = async (req, res) => {
  try {
    // return newest images first
    const images = await Image.find({ category: req.params.category }).sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//deleteing

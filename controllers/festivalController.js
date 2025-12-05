import Festival from "../models/Festival.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// POST /api/festivals
export const createFestival = async (req, res) => {
  try {
    const { festivalname, festivaldate, description } = req.body;

    if (!festivalname || !festivaldate) {
      return res.status(400).json({ message: "festivalname and festivaldate are required" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image file is required" });
    }

    // upload all images to Cloudinary
    const uploaded = await Promise.all(
      req.files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "festivals", resource_type: "image" },
              (error, result) => {
                if (error) return reject(error);
                resolve({ url: result.secure_url, public_id: result.public_id });
              }
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
          })
      )
    );

    const fest = new Festival({
      festivalName: festivalname,
      festivalDate: new Date(festivaldate),
      images: uploaded,
      description: description || undefined,
      createdBy: req.user ? req.user._id : undefined,
    });

    await fest.save();

    res.status(201).json({ message: "Festival created", festival: fest });
  } catch (err) {
    console.error("Error creating festival:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/festivals
export const getFestivals = async (req, res) => {
  try {
    const festivals = await Festival.find().sort({ festivalDate: -1 });
    res.status(200).json(festivals);
  } catch (err) {
    console.error("Error fetching festivals:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/festivals/:id
export const deleteFestival = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: 'Festival id required' });
    const fest = await Festival.findById(id);
    if (!fest) return res.status(404).json({ message: 'Festival not found' });

    // Remove festival document first to avoid blocking on external deletions
    await Festival.findByIdAndDelete(id);

    // Attempt to delete images from Cloudinary (fire-and-forget style)
    if (Array.isArray(fest.images) && fest.images.length > 0) {
      (async () => {
        try {
          await Promise.all(
            fest.images.map(async (img) => {
              try {
                if (img && img.public_id) {
                  await cloudinary.uploader.destroy(img.public_id, { resource_type: 'image' });
                }
              } catch (e) {
                console.warn('Failed to delete cloudinary image', img.public_id, e.message || e);
              }
            })
          );
        } catch (e) {
          console.warn('Cloudinary cleanup error:', e.message || e);
        }
      })();
    }

    return res.status(200).json({ message: 'Festival deleted' });
  } catch (err) {
    console.error('Error deleting festival:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

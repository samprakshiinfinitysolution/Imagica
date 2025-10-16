// controllers/frameController.js
import Frame from "../models/Frame.js";

// ✅ Upload frames (multiple allowed)
export const addFrame = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No frame files uploaded" });
    }

    if (!req.body.category) {
      return res.status(400).json({ message: "Category is required" });
    }

    // If layout data is sent as JSON string (like from frontend form)
    let layoutData = {};
    if (req.body.layout) {
      try {
        layoutData = JSON.parse(req.body.layout);
      } catch (e) {
        console.warn("Invalid layout JSON, using default.");
      }
    }

    const savedFrames = await Promise.all(
      req.files.map((file) => {
        const newFrame = new Frame({
          category: req.body.category.toLowerCase(),
          framePath: `/uploads/frames/${file.filename}`,
          layout: layoutData, // ✅ save layout JSON
        });
        return newFrame.save();
      })
    );

    res.status(201).json({
      message: `Frames uploaded successfully under category: ${req.body.category}`,
      frames: savedFrames,
    });
  } catch (err) {
    console.error("Error uploading frame:", err);
    res.status(500).json({ message: err.message });
  }
};


export const updateFrameLayout = async (req, res) => {
  try {
    const { id } = req.params; // Frame ID
    const { layout } = req.body; // New layout object

    if (!layout) {
      return res.status(400).json({ message: "Layout data is required" });
    }

    const updatedFrame = await Frame.findByIdAndUpdate(
      id,
      { layout },
      { new: true }
    );

    if (!updatedFrame) {
      return res.status(404).json({ message: "Frame not found" });
    }

    res.status(200).json({
      message: "Layout updated successfully",
      frame: updatedFrame
    });
  } catch (error) {
    console.error("Error updating layout:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFramesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const frames = await Frame.find({ category: category.toLowerCase() });

    if (frames.length === 0) {
      return res.status(404).json({ message: "No frames found for this category" });
    }

    res.status(200).json({
      frames: frames.map((frame) => ({
        framePath: frame.framePath,
        layout: frame.layout, // ✅ include layout
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get all frames (optional, admin)
export const getAllFrames = async (req, res) => {
  try {
    const frames = await Frame.find();
    res.status(200).json(frames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

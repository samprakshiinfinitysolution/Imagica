// // controllers/frameController.js
// import Frame from "../models/Frame.js";

// // ✅ Upload frames (multiple allowed)
// export const addFrame = async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({ message: "No frame files uploaded" });
//     }

//     if (!req.body.category) {
//       return res.status(400).json({ message: "Category is required" });
//     }

//     // If layout data is sent as JSON string (like from frontend form)
//     let layoutData = {};
//     if (req.body.layout) {
//       try {
//         layoutData = JSON.parse(req.body.layout);
//       } catch (e) {
//         console.warn("Invalid layout JSON, using default.");
//       }
//     }

//     const savedFrames = await Promise.all(
//       req.files.map((file) => {
//         const newFrame = new Frame({
//           category: req.body.category.toLowerCase(),
//           framePath: `/uploads/frames/${file.filename}`,
//           layout: layoutData, // ✅ save layout JSON
//         });
//         return newFrame.save();
//       })
//     );

//     res.status(201).json({
//       message: `Frames uploaded successfully under category: ${req.body.category}`,
//       frames: savedFrames,
//     });
//   } catch (err) {
//     console.error("Error uploading frame:", err);
//     res.status(500).json({ message: err.message });
//   }
// };


// export const updateFrameLayout = async (req, res) => {
//   try {
//     const { id } = req.params; // Frame ID
//     const { layout } = req.body; // New layout object

//     if (!layout) {
//       return res.status(400).json({ message: "Layout data is required" });
//     }

//     const updatedFrame = await Frame.findByIdAndUpdate(
//       id,
//       { layout },
//       { new: true }
//     );

//     if (!updatedFrame) {
//       return res.status(404).json({ message: "Frame not found" });
//     }

//     res.status(200).json({
//       message: "Layout updated successfully",
//       frame: updatedFrame
//     });
//   } catch (error) {
//     console.error("Error updating layout:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// export const getFramesByCategory = async (req, res) => {
//   try {
//     const { category } = req.params;
//     const frames = await Frame.find({ category: category.toLowerCase() });

//     if (frames.length === 0) {
//       return res.status(404).json({ message: "No frames found for this category" });
//     }

//     res.status(200).json({
//       frames: frames.map((frame) => ({
//         framePath: frame.framePath,
//         layout: frame.layout, // ✅ include layout
//       })),
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // ✅ Get all frames (optional, admin)
// export const getAllFrames = async (req, res) => {
//   try {
//     const frames = await Frame.find();
//     res.status(200).json(frames);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };



import Frame from "../models/Frame.js";
import cloudinary from "../config/cloudinary.js"; // ✅ import your cloudinary config
import streamifier from "streamifier"; // ✅ helps to stream buffer data properly

// normalize layout keys for frontend compatibility
const normalizeLayout = (layout) => {
  if (!layout || typeof layout !== "object") return layout;
  const l = { ...layout };
  // map older 'position' key to 'positionname' which frontend expects
  if (l.position && !l.positionname) {
    l.positionname = l.position;
  }
  // also map camelCase variants just in case
  if (l.positionName && !l.positionname) {
    l.positionname = l.positionName;
  }
  return l;
};

// ✅ Upload frames to Cloudinary
export const addFrame = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No frame files uploaded" });
    }

    if (!req.body.category) {
      return res.status(400).json({ message: "Category is required" });
    }

    let layoutData = {};
    if (req.body.layout) {
      try {
        layoutData = JSON.parse(req.body.layout);
        layoutData = normalizeLayout(layoutData);
      } catch (e) {
        console.warn("⚠️ Invalid layout JSON, using default empty layout");
      }
    }

    // ✅ Upload each image to Cloudinary using stream
    const uploadedFrames = await Promise.all(
      req.files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: "frames",
                resource_type: "image",
              },
              async (error, result) => {
                if (error) return reject(error);

                // ✅ Save frame in MongoDB
                const newFrame = new Frame({
                  category: req.body.category.toLowerCase(),
                  framePath: result.secure_url,
                  layout: layoutData,
                });
                await newFrame.save();
                resolve(newFrame);
              }
            );

            // streamifier required to push file.buffer
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
          })
      )
    );

    res.status(201).json({
      message: `✅ ${uploadedFrames.length} frame(s) uploaded successfully under category: ${req.body.category}`,
      frames: uploadedFrames,
    });
  } catch (err) {
    console.error("❌ Error uploading frame:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// ✅ Update layout
export const updateFrameLayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { layout } = req.body;

    const normalized = normalizeLayout(layout);
    const updatedFrame = await Frame.findByIdAndUpdate(
      id,
      { layout: normalized },
      { new: true }
    );

    res.status(200).json(updatedFrame);
  } catch (err) {
    console.error("Error updating frame layout:", err);
    res.status(500).json({ message: "Failed to update layout" });
  }
};
// ✅ Get frames by category
export const getFramesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const frames = await Frame.find({ category: category.toLowerCase() });

    if (frames.length === 0) {
      return res.status(404).json({ message: "No frames found for this category" });
    }

    res.status(200).json({
      frames: frames.map((frame) => ({
        _id: frame._id,
        framePath: frame.framePath,
        layout: normalizeLayout(frame.layout),
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get all frames
export const getAllFrames = async (req, res) => {
  try {
    const frames = await Frame.find();
    res.status(200).json(
      frames.map((frame) => ({
        _id: frame._id,
        category: frame.category,
        framePath: frame.framePath,
        layout: normalizeLayout(frame.layout),
        createdAt: frame.createdAt,
        updatedAt: frame.updatedAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update frame image (replace the image for a single frame)
export const updateFrameImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload new image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'frames', resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    // Update frame document
    const updated = await Frame.findByIdAndUpdate(id, { framePath: result.secure_url }, { new: true });

    if (!updated) return res.status(404).json({ message: 'Frame not found' });

    res.status(200).json({ message: 'Frame image updated', frame: updated });
  } catch (err) {
    console.error('Error updating frame image:', err);
    res.status(500).json({ message: 'Failed to update frame image', error: err.message });
  }
};

// ✅ Get single frame by ID (normalized layout)
export const getFrameById = async (req, res) => {
  try {
    const { id } = req.params;
    const frame = await Frame.findById(id);
    if (!frame) return res.status(404).json({ message: 'Frame not found' });

    res.status(200).json({
      _id: frame._id,
      category: frame.category,
      framePath: frame.framePath,
      layout: normalizeLayout(frame.layout),
      createdAt: frame.createdAt,
      updatedAt: frame.updatedAt,
    });
  } catch (err) {
    console.error('Error fetching frame by id:', err);
    res.status(500).json({ message: err.message });
  }
};
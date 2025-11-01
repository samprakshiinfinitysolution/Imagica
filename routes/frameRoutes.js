// // routes/frameRoutes.js
// import express from "express";
// import { addFrame, getFramesByCategory, getAllFrames, updateFrameLayout } from "../controllers/frameController.js";
// import uploadFrame from "../middleware/uploadFrame.js";
// import Frame from "../models/Frame.js";

// const router = express.Router();

// router.put("/update-layout/:id", updateFrameLayout);

// // ✅ Upload frames
// router.post("/add", uploadFrame.array("frames", 10), addFrame);

// // ✅ Get frames by category
// router.get("/category/:category", getFramesByCategory);


// router.get("/count", async (req, res) => {
//   try {
//     const count = await Frame.countDocuments();
//     res.json({ count });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });



// router.delete("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedFrame = await Frame.findByIdAndDelete(id);

//     if (!deletedFrame) {
//       return res.status(404).json({ message: "Frame not found" });
//     }

//     res.status(200).json({ message: "Frame deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ✅ Delete all frames in a category
// router.delete("/category/:category", async (req, res) => {
//   try {
//     const { category } = req.params;
//     const result = await Frame.deleteMany({ category: category.toLowerCase() });

//     res.status(200).json({
//       message: `Deleted ${result.deletedCount} frame(s) from category '${category}'`,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// // ✅ New route (modify your existing frames/category route)
// router.get("/category/:type", async (req, res) => {
//   try {
//     const { type } = req.params;
//     const { party } = req.query; // optional query param for party filter

//     let frames = [];

//     if (type.toLowerCase() === "political" && party) {
//       // Political -> fetch frames for that party
//       frames = await Frame.find({ category: party.toLowerCase() });
//     } else {
//       // Normal -> fetch by profile type
//       frames = await Frame.find({ category: type.toLowerCase() });
//     }

//     res.status(200).json({ frames });
//   } catch (error) {
//     console.error("Error fetching frames:", error);
//     res.status(500).json({ message: "Error fetching frames" });
//   }
// });



// // ✅ Get all frames
// router.get("/", getAllFrames);

// export default router;

// routes/frameRoutes.js
import express from "express";
import multer from "multer";
import {
  addFrame,
  getFramesByCategory,
  getAllFrames,
  updateFrameLayout,
} from "../controllers/frameController.js";
import Frame from "../models/Frame.js";

const router = express.Router();

/* ---------------------- MULTER MEMORY STORAGE ---------------------- */
// ✅ Important: Cloudinary upload ke liye memory storage chahiye (disk nahi)
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ---------------------- FRAME ROUTES ---------------------- */

// ✅ Upload frames (Cloudinary)
router.post("/add", upload.array("frames", 10), addFrame);

// ✅ Update layout
router.put("/update-layout/:id", updateFrameLayout);

// ✅ Get frames by category
router.get("/category/:category", getFramesByCategory);

// ✅ Get all frames
router.get("/", getAllFrames);

// ✅ Count total frames
router.get("/count", async (req, res) => {
  try {
    const count = await Frame.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Delete frame by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFrame = await Frame.findByIdAndDelete(id);

    if (!deletedFrame) {
      return res.status(404).json({ message: "Frame not found" });
    }

    res.status(200).json({ message: "Frame deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Delete all frames from a category
router.delete("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const result = await Frame.deleteMany({ category: category.toLowerCase() });
    res.status(200).json({
      message: `Deleted ${result.deletedCount} frame(s) from category '${category}'`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

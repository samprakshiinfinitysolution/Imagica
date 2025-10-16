// routes/frameRoutes.js
import express from "express";
import { addFrame, getFramesByCategory, getAllFrames, updateFrameLayout } from "../controllers/frameController.js";
import uploadFrame from "../middleware/uploadFrame.js";
import Frame from "../models/Frame.js";

const router = express.Router();

router.put("/update-layout/:id", updateFrameLayout);

// ✅ Upload frames
router.post("/add", uploadFrame.array("frames", 10), addFrame);

// ✅ Get frames by category
router.get("/category/:category", getFramesByCategory);


router.get("/count", async (req, res) => {
  try {
    const count = await Frame.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



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

// ✅ Delete all frames in a category
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

// ✅ Get all frames
router.get("/", getAllFrames);

export default router;

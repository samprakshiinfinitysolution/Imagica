

// import express from "express";
// import multer from "multer";
// import fs from "fs";
// import path from "path";
// import { authMiddleware } from "../middleware/authMiddleware.js";
// import {
//   createProfile,
//   getProfiles,
//   deleteAllProfiles,
//   getMyProfile,
//   updateMyProfile,
// } from "../controllers/profileController.js";
// import Profile from "../models/Profile.js";

// const router = express.Router();

// // Ensure uploads folder exists
// const uploadPath = path.join(process.cwd(), "uploads");
// if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// // Multer config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadPath),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
// const upload = multer({ storage });

// // ✅ Public routes
// router.post("/", upload.single("file"), createProfile);
// router.get("/", getProfiles);
// router.delete("/", deleteAllProfiles);

// // ✅ Count route
// router.get("/count", async (req, res) => {
//   try {
//     const count = await Profile.countDocuments();
//     res.status(200).json({ count });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });




// // ✅ New route for category-wise count
// router.get("/profiletype-counts", async (req, res) => {
//   try {
//     const profiles = await Profile.find();
//     const profileTypeCounts = {};

//     // Loop through all profiles
//     profiles.forEach(profile => {
//       if(!profile.profiletype || profile.profiletype.trim() === "") return;

//       // Capitalize first letter for consistency
//       const typeName = profile.profiletype.trim().charAt(0).toUpperCase() + profile.profiletype.trim().slice(1).toLowerCase();

//       profileTypeCounts[typeName] = (profileTypeCounts[typeName] || 0) + 1;
//     });

//     // Optional: ensure all default types appear even if 0
//     const defaultTypes = ["Political","Business","Professional","Personal","Social"];
//     defaultTypes.forEach(type => {
//       if(!profileTypeCounts[type]) profileTypeCounts[type] = 0;
//     });

//     res.status(200).json(profileTypeCounts);
//   } catch(err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });


// // ✅ Category filter route
// router.get("/category/:category", async (req, res) => {
//   try {
//     const { category } = req.params;
//     const profiles = await Profile.find({ categories: category });
//     res.status(200).json(profiles);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });
// // ✅ Authenticated user routes (must come first!)
// router.get("/me", authMiddleware, getMyProfile);
// router.put("/me", authMiddleware, upload.single("file"), updateMyProfile);

// // ✅ Admin routes by ID
// router.put("/:id", upload.single("file"), async (req, res) => {
//   try {
//     const { id } = req.params;

//     const profile = await Profile.findById(id);
//     if (!profile) return res.status(404).json({ message: "Profile not found" });

//     Object.keys(req.body).forEach((key) => {
//       profile[key] = req.body[key];
//     });

//     if (req.file) {
//       if (profile.file) {
//         const oldFilePath = path.join(uploadPath, path.basename(profile.file));
//         if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
//       }
//       profile.file = `/uploads/${req.file.filename}`;
//     }

//     await profile.save();
//     res.status(200).json({ message: "Profile updated successfully", profile });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.delete("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const profile = await Profile.findById(id);
//     if (!profile) return res.status(404).json({ message: "Profile not found" });

//     if (profile.file) {
//       const filePath = path.join(uploadPath, path.basename(profile.file));
//       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//     }

//     await Profile.findByIdAndDelete(id);
//     res.status(200).json({ message: "Profile deleted successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.get("/type/:profiletype", async (req, res) => {
//   try {
//     const { profiletype } = req.params;
//     const profiles = await Profile.find({ profiletype });
//     res.json(profiles);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Error fetching profiles by type" });
//   }
// });

// export default router;

import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createProfile,
  getProfiles,
  deleteAllProfiles,
  getMyProfile,
  updateMyProfile,
} from "../controllers/profileController.js";
import Profile from "../models/Profile.js";

const router = express.Router();

// ✅ Ensure uploads folder exists
const uploadPath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

// ✅ Multer config - use memory storage for better blob handling
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Public routes
router.post("/", upload.single("file"), createProfile);
router.get("/", getProfiles);
router.delete("/", deleteAllProfiles);

// ✅ Count route
router.get("/count", async (req, res) => {
  try {
    const count = await Profile.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Category-wise count
router.get("/profiletype-counts", async (req, res) => {
  try {
    const profiles = await Profile.find();
    const profileTypeCounts = {};

    profiles.forEach((profile) => {
      if (!profile.profiletype || profile.profiletype.trim() === "") return;

      const typeName =
        profile.profiletype.trim().charAt(0).toUpperCase() +
        profile.profiletype.trim().slice(1).toLowerCase();

      profileTypeCounts[typeName] = (profileTypeCounts[typeName] || 0) + 1;
    });

    const defaultTypes = [
      "Political",
      "Business",
      "Professional",
      "Personal",
      "Social",
    ];
    defaultTypes.forEach((type) => {
      if (!profileTypeCounts[type]) profileTypeCounts[type] = 0;
    });

    res.status(200).json(profileTypeCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Category filter route
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const profiles = await Profile.find({ categories: category });
    res.status(200).json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Authenticated user routes (must come before :id routes)
router.get("/me", authMiddleware, getMyProfile);
router.put("/me", authMiddleware, upload.single("file"), updateMyProfile);

// ✅ Place before any route with `/:id`
router.put("/remove-image", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find profile by user ID instead of _id
    const profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Delete old image file from uploads folder if exists
    if (profile.file) {
      const filePath = path.join(uploadPath, path.basename(profile.file));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // Remove file reference in DB
    profile.file = null;
    await profile.save();

    res.status(200).json({
      success: true,
      message: "Profile image removed successfully",
      profile,
    });
  } catch (error) {
    console.error("Error removing image:", error);
    res
      .status(500)
      .json({ message: "Server error while removing image", error: error.message });
  }
});


// ✅ Admin routes by ID
router.put("/:id", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;

    const profile = await Profile.findById(id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    Object.keys(req.body).forEach((key) => {
      profile[key] = req.body[key];
    });

    if (req.file) {
      if (profile.file) {
        const oldFilePath = path.join(uploadPath, path.basename(profile.file));
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
      profile.file = `/uploads/${req.file.filename}`;
    }

    await profile.save();
    res.status(200).json({ message: "Profile updated successfully", profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete profile by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findById(id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    if (profile.file) {
      const filePath = path.join(uploadPath, path.basename(profile.file));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Profile.findByIdAndDelete(id);
    res.status(200).json({ message: "Profile deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Filter profiles by type
router.get("/type/:profiletype", async (req, res) => {
  try {
    const { profiletype } = req.params;
    const profiles = await Profile.find({ profiletype });
    res.json(profiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching profiles by type" });
  }
});

export default router;

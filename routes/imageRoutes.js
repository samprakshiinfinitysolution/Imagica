// import express from "express";
// import {
//   addImage,
//   getImagesByCategory,
//   getAllCategories,
//   deleteImagesByCategory,
//   deleteSingleImage,
// } from "../controllers/imageController.js";
// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary.js";
// import Image from "../models/Image.js";

// const router = express.Router();

// // ✅ Cloudinary storage setup
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     const category = req.body.category || "uncategorized"; // ✅ use body
//     return {
//       folder: `imagica/${category}`,
//       allowed_formats: ["jpg", "png", "jpeg", "webp"],
//       public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
//     };
//   },
// });

// const upload = multer({ storage });

// // ✅ Multiple images upload
// router.post("/upload", upload.array("images", 20), addImage);

// // ✅ Fix: place count route before dynamic routes
// router.get("/count", async (req, res) => {
//   try {
//     const count = await Image.countDocuments();
//     return res.status(200).json({ count });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// router.get("/", getAllCategories);
// router.get("/:category", getImagesByCategory);
// router.delete("/category/:category", deleteImagesByCategory);
// router.delete("/category/:category/:id", deleteSingleImage);

// export default router;


import express from "express";
import {
  addImage,
  getImagesByCategory,
  getAllCategories,
  deleteImagesByCategory,
  deleteSingleImage,
} from "../controllers/imageController.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import Image from "../models/Image.js";

const router = express.Router();

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const category = req.body.category || "uncategorized";
    return {
      folder: `imagica/${category}`,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});
const upload = multer({ storage });

// Routes
router.post("/upload", upload.array("images", 20), addImage);

router.get("/count", async (req, res) => {
  try {
    const count = await Image.countDocuments();
    return res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", getAllCategories);

// ✅ Modified route for category
router.get("/category/:category", getImagesByCategory);

router.delete("/category/:category", deleteImagesByCategory);
router.delete("/category/:category/:id", deleteSingleImage);

export default router;

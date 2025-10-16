// import express from "express";
// import { getNotifications, createNotification } from "../controllers/notificationController.js";
// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary.js";
// import Notification from "../models/Notification.js";

// const router = express.Router();

// // Cloudinary storage
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     const category = req.body.category || "notifications";
//     return {
//       folder: `imagica/${category}`,
//       allowed_formats: ["jpg", "png", "jpeg", "webp"],
//       public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
//     };
//   },
// });

// const upload = multer({ storage });

// // Routes
// router.get("/", getNotifications);
// router.post("/", upload.single("coverImage"), createNotification);


// router.get("/count", async (req, res) => {
//   try {
//     const count = await Notification.countDocuments();
//     res.json({ count });
//   } catch (error) {
//     res.status(500).json({ message: "Error counting notifications", error });
//   }
// });
// export default router;

import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import Notification from "../models/Notification.js";
import {
  getNotifications,
  createNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// ✅ Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const category = req.body.category || "notifications";
    return {
      folder: `imagica/${category}`,
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    };
  },
});

const upload = multer({ storage });

// ✅ Routes
router.get("/", getNotifications);
router.post("/", upload.single("coverImage"), createNotification);

// ✅ DELETE notification by ID
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notification", error });
  }
});

// ✅ Get count of notifications
router.get("/count", async (req, res) => {
  try {
    const count = await Notification.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error counting notifications", error });
  }
});

export default router;

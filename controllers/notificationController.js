import Notification from "../models/Notification.js";

// Get all notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a notification with image
export const createNotification = async (req, res) => {
  try {
    const { title, desc, date, time, category } = req.body;
    const coverImage = req.file?.path || ""; // multer-cloudinary stores file.path as URL

    const newNotification = new Notification({
      title,
      desc,
      date,
      time,
      category,
      coverImage
    });

    const saved = await newNotification.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



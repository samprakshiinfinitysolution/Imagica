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

// Update a notification (supports optional new coverImage upload)
export const updateNotification = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, desc, date, time, category } = req.body;
    const coverImage = req.file?.path; // if a new file uploaded, multer-cloudinary stores URL in path

    const update = { title, desc, date, time, category };
    if (coverImage) update.coverImage = coverImage;

    const updated = await Notification.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return res.status(404).json({ message: 'Notification not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



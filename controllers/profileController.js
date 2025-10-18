import Profile from "../models/Profile.js";

import fs from "fs";
import path from "path";

const uploadPath = path.join(process.cwd(), "uploads");

// ✅ Get profile of logged-in user
export const getMyProfile = async (req, res) => {
  try {
    // ✅ Get user email from token (set by authMiddleware)
    const userEmail = req.user?.email;

    if (!userEmail) {
      return res.status(400).json({ message: "Email not found in token" });
    }

    // ✅ Find profile of the logged-in user
    const profile = await Profile.findOne({ email: userEmail });

    if (!profile) {
      return res.status(404).json({ message: "No profile found for this user" });
    }

    res.status(200).json({ profile });
  } catch (err) {
    console.error("Error in getMyProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Update profile of logged-in user
export const updateMyProfile = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) return res.status(400).json({ message: "Email not found in token" });

    const profile = await Profile.findOne({ email: userEmail });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    // Update fields from req.body
    Object.keys(req.body).forEach((key) => {
      let value = req.body[key];

      // Parse categories if it's a JSON string
      if (key === "categories" && value) {
        if (typeof value === "string") {
          try {
            value = JSON.parse(value);
          } catch {
            value = [value]; // fallback if not JSON
          }
        }
      }

      profile[key] = value;
    });

    // Handle file upload
    if (req.file) {
      if (profile.file) {
        const oldFilePath = path.join(uploadPath, path.basename(profile.file));
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
      profile.file = `/uploads/${req.file.filename}`;
    }

    await profile.save();
    res.status(200).json({ profile });
  } catch (error) {
    console.error("Error in updateMyProfile:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const createProfile = async (req, res) => {
  try {
    const profileData = req.body;

    // Agar file upload hui hai to path add karo
    if (req.file) {
      profileData.file = `/uploads/${req.file.filename}`;
    }

    // ✅ Convert categories to array
    if(profileData.categories) {
  // agar string hai to array me convert karo
  if(typeof profileData.categories === 'string') {
    profileData.categories = [profileData.categories.trim()];
  }
} else {
  profileData.categories = [];
}

    // Check if email already exists
    const existing = await Profile.findOne({ email: profileData.email });
    if (existing) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const profile = await Profile.create(profileData);
    res.status(201).json({ message: "Profile created successfully", profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};


export const getProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find();
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteAllProfiles = async (req, res) => {
  try {
    const result = await Profile.deleteMany({});
    res.status(200).json({
      message: "All profiles deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

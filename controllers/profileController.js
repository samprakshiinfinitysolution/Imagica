import Profile from "../models/Profile.js";
import cloudinary from "../config/cloudinary.js";
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
      // Return an empty profile object (prefilled with email) instead of 404 so
      // frontend can render the profile creation form for new users.
      const emptyProfile = {
        email: userEmail,
        profiletype: "",
        file: null,
        name: "",
        mobile: "",
        categories: [],
        visibleName: true,
        showDesignation: true,
        showMobile: true,
        showCategories: true,
        showAddress: true,
        showInstagram: true,
        showFacebook: true,
        showLinkedIn: true,
        showPosition: true,
        showProfileImage: true,
      };

      return res.status(200).json({ profile: emptyProfile, isNew: true });
    }

    // Ensure `categories` is returned as an array to the frontend
    if (!Array.isArray(profile.categories)) {
      if (typeof profile.categories === "string") {
        profile.categories = profile.categories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
      } else {
        profile.categories = profile.categories || [];
      }
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
    if (!userEmail)
      return res.status(400).json({ message: "Email not found in token" });

    let profile = await Profile.findOne({ email: userEmail });
    // If profile doesn't exist yet, create a new one (so new users can save their data)
    const isNewProfile = !profile;
    if (!profile) {
      profile = new Profile({ email: userEmail });
    }

    // ✅ Update text fields safely
    const booleanFields = [
      "visibleName",
      "showDesignation",
      "showMobile",
      "showCategories",
      "showAddress",
      "showInstagram",
      "showTwitter",
      "showFacebook",
      "showLinkedIn",
      "showPosition",
      "showBusinessName",
      "showBusinessTagline",
      "showProfileImage",
    ];

    Object.keys(req.body).forEach((key) => {
      let value = req.body[key];

      // Handle categories (can be sent as JSON string or comma-separated)
      if (key === "categories" && value) {
        if (typeof value === "string") {
          try {
            value = JSON.parse(value);
          } catch {
            // support comma separated values as fallback
            value = value.split(",").map((v) => v.trim()).filter(Boolean);
          }
        }
      }

      // Coerce known boolean fields coming from form-data (string "true"/"false" or "1"/"0")
      if (booleanFields.includes(key)) {
        if (typeof value === "string") {
          value = value === "true" || value === "1";
        } else {
          value = Boolean(value);
        }
      }

      profile[key] = value;
    });

    // ✅ If a new file was uploaded
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (profile.cloudinary_id) {
        try {
          await cloudinary.uploader.destroy(profile.cloudinary_id);
        } catch (err) {
          console.warn("Old Cloudinary image delete failed:", err.message);
        }
      }

      try {
        let uploadResult;
        
        if (req.file.buffer) {
          // Handle buffer-based upload (from multer with memoryStorage)
          uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "profiles" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(req.file.buffer);
          });
        } else if (req.file.path) {
          // Fallback: Handle file path upload (from multer with local storage)
          uploadResult = await cloudinary.uploader.upload(req.file.path, {
            folder: "profiles",
          });

          // Delete temp file after upload
          fs.unlink(req.file.path, (err) => {
            if (err) console.warn("Temp file cleanup failed:", err.message);
          });
        } else {
          throw new Error("No valid file data in upload");
        }

        // Save new image data
        profile.file = uploadResult.secure_url;
        profile.cloudinary_id = uploadResult.public_id;
      } catch (err) {
        console.error("Error uploading file to Cloudinary:", err);
        return res.status(400).json({ 
          message: "Failed to upload image",
          error: err.message 
        });
      }
    }

    await profile.save();
    res.status(200).json({
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Error in updateMyProfile:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Create new profile (with Cloudinary upload)
export const createProfile = async (req, res) => {
  try {
    const profileData = req.body;

    // Coerce showProfileImage when creating from form-data
    if (typeof profileData.showProfileImage !== "undefined") {
      if (typeof profileData.showProfileImage === "string") {
        profileData.showProfileImage = profileData.showProfileImage === "true" || profileData.showProfileImage === "1";
      } else {
        profileData.showProfileImage = Boolean(profileData.showProfileImage);
      }
    }

    // Coerce showCategories when creating from form-data
    if (typeof profileData.showCategories !== "undefined") {
      if (typeof profileData.showCategories === "string") {
        profileData.showCategories = profileData.showCategories === "true" || profileData.showCategories === "1";
      } else {
        profileData.showCategories = Boolean(profileData.showCategories);
      }
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "profiles",
      });
      profileData.file = result.secure_url;
    }

    if (profileData.categories) {
      if (typeof profileData.categories === "string") {
        profileData.categories = [profileData.categories.trim()];
      }
    } else {
      profileData.categories = [];
    }

    const existing = await Profile.findOne({ email: profileData.email });
    if (existing) return res.status(400).json({ message: "Profile already exists" });

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

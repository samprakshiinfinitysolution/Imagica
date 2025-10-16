import Profile from "../models/Profile.js";



// ✅ Get profile of logged-in user
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user._id; // set by authMiddleware
    const profile = await Profile.findOne({ user: userId }); // assuming your Profile has a `user` field

    if (!profile) return res.status(404).json({ message: "Profile not found" });

    res.status(200).json({ profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update profile of logged-in user
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user._id; // from authMiddleware
    const profile = await Profile.findOne({ user: userId });

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
    res.status(200).json({ profile });
  } catch (error) {
    console.error(error);
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

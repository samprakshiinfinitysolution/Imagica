import Admin from "../models/adminModel.js";

export const createAdmin = async (req, res) => {
  try {
    const { adminId, password } = req.body;
    const admin = new Admin({ adminId, password });
    await admin.save();
    res.status(201).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Error creating admin", error });
  }
};


// ✅ Verify Admin Login
export const verifyAdmin = async (req, res) => {
  try {
    const { adminId, password } = req.body;
    const admin = await Admin.findOne({ adminId });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (admin.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(200).json({ message: "Login successful", admin });
  } catch (error) {
    res.status(500).json({ message: "Error verifying admin", error });
  }
};
import Admin from "../models/adminModel.js";
import jwt from "jsonwebtoken";


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

    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.password !== password) return res.status(401).json({ message: "Invalid password" });

    // generate JWT
    const token = jwt.sign(
      { id: admin._id, adminId: admin.adminId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error verifying admin", error });
  }
};


export const adminLogout = async (req, res) => {
  try {
    // Since JWT is stateless, the backend doesn't store session
    // Frontend should remove the token from localStorage
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Error logging out", error });
  }
};
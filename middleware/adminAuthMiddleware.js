import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

export const adminAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No admin token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find admin by ID from the token payload
    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin || !decoded.adminId) {
      return res.status(403).json({ success: false, message: "Forbidden: Not an admin" });
    }

    // Attach admin data to the request object
    req.admin = admin;
    next();
  } catch (error) {
    console.error("Admin Auth error:", error);
    res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired admin token" });
  }
};

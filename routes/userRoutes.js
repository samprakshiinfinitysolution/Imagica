// routes/userRoutes.js
import express from "express";
import { requestOTP, verifyOTP, resendOTP, me, logout } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/request-otp", requestOTP);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.get("/me", authMiddleware, me);
router.post("/logout", authMiddleware, logout); // ✅ logout route

router.get("/count", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Fetch all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-otp -otpExpiry"); // remove sensitive fields
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a user
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

// controllers/userController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import BlacklistedToken from "../models/BlacklistedToken.js";
import Profile from "../models/Profile.js";

import { generateOTP } from "../utils/generateOTP.js";
import { sendOTPEmail } from "../utils/sendOTPEmail.js";

// ---------------- Request OTP ----------------
export const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });
    let user = await User.findOne({ email });

    // Rate-limit window: do not send another OTP within this many seconds
    const MIN_SECONDS_BETWEEN_OTPS = 30;
    const now = Date.now();

    if (user) {
      // If last OTP was sent recently, avoid sending again immediately
      if (user.lastOtpSentAt && now - new Date(user.lastOtpSentAt).getTime() < MIN_SECONDS_BETWEEN_OTPS * 1000) {
        return res.status(200).json({ message: `OTP already sent recently. Please wait ${MIN_SECONDS_BETWEEN_OTPS} seconds before requesting again.` });
      }

      // Generate and store new OTP for existing user (always require OTP flow)
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      user.otp = otp;
      user.otpExpiry = otpExpiry;
      user.forceOTP = false; // reset flag if present
      user.lastOtpSentAt = new Date();
      await user.save();

      await sendOTPEmail(email, otp);
      req.session.email = email;

      return res.status(200).json({ message: "OTP sent successfully", userExists: true });
    } else {
      // New user → create + send OTP
      const otp = generateOTP();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      const newUser = await User.create({
        email,
        otp,
        otpExpiry,
        lastOtpSentAt: new Date(),
      });

      req.session.email = email;

      await sendOTPEmail(email, otp);

      return res.status(200).json({ message: "OTP sent successfully", userExists: false });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: error.message || "Internal server error" });
  }
};

// ---------------- Verify OTP ----------------
// export const verifyOTP = async (req, res) => {
//   try {
//     const { otp, email } = req.body;
//     if (!email) return res.status(400).json({ message: "Email is required" });

//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (!user.otp || !user.otpExpiry || Date.now() > user.otpExpiry.getTime()) {
//       return res.status(400).json({ message: "OTP expired. Please request a new one." });
//     }

//     if (String(user.otp).trim() !== String(otp).trim()) {
//       return res.status(400).json({ message: "Invalid OTP" });
//     }

//     // OTP clear
//     user.otp = null;
//     user.otpExpiry = null;
//     await user.save();

//     // JWT generate
//     const token = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // ✅ decide isNewUser
//     const isNewUser = !user.profileCompleted && user.forceOTP === false;

//     return res.status(200).json({
//       message: "OTP verified successfully",
//       token,
//       email: user.email,
//       isNewUser,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };
export const verifyOTP = async (req, res) => {
  try {
    const { otp, email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ OTP expiry check
    if (!user.otp || !user.otpExpiry || Date.now() > user.otpExpiry.getTime()) {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    // ✅ OTP match check
    if (String(user.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ✅ OTP clear
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // ✅ JWT generate
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ Profile check by email
    const profile = await Profile.findOne({ email: user.email });
    const isNewUser = !profile; // agar profile nahi hai toh new user

    return res.status(200).json({
      message: "OTP verified successfully",
      token,
      email: user.email,
      isNewUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ---------------- Resend OTP ----------------
export const resendOTP = async (req, res) => {
  try {
    const email = req.body.email || req.session.email;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Rate-limit resend: avoid sending multiple OTPs in quick succession
    const MIN_SECONDS_BETWEEN_OTPS = 30;
    const now = Date.now();
    if (user.lastOtpSentAt && now - new Date(user.lastOtpSentAt).getTime() < MIN_SECONDS_BETWEEN_OTPS * 1000) {
      return res.status(200).json({ message: `OTP already sent recently. Please wait ${MIN_SECONDS_BETWEEN_OTPS} seconds before resending.` });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.lastOtpSentAt = new Date();
    await user.save();

    await sendOTPEmail(email, otp);

    return res.status(200).json({ message: "OTP resent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// ---------------- Auto Login (JWT Verify) ----------------
export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-otp -otpExpiry");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// ---------------- Logout ----------------
// controllers/userController.js


export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(" ")[1];

      const decoded = jwt.decode(token);

      if (decoded?.exp) {
        await BlacklistedToken.create({
          token,
          expiresAt: new Date(decoded.exp * 1000),
        });
      }

      // ✅ Set forceOTP so next login requires OTP
      await User.findByIdAndUpdate(decoded.id, { forceOTP: true });
    }

    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.clearCookie("connect.sid");
      return res.status(200).json({
        success: true,
        message: "Logged out successfully. Token removed.",
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

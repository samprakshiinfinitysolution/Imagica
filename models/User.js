import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  otp: String,
  otpExpiry: Date,
  lastOtpSentAt: Date,
  profileCompleted: { type: Boolean, default: false }, // checks if user completed profile
  createdAt: { type: Date, default: Date.now },
  forceOTP: { type: Boolean, default: false }, // new: forces OTP after logout
});

const User = mongoose.model("User", userSchema);
export default User;



// import jwt from "jsonwebtoken";
// import BlacklistedToken from "../models/BlacklistedToken.js";

// export const authMiddleware = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ success: false, message: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1]; // Bearer <token>

//     if (!token) {
//       return res.status(401).json({ success: false, message: "Invalid token format" });
//     }

//     // ✅ check if token is blacklisted
//     const blacklisted = await BlacklistedToken.findOne({ token });
//     if (blacklisted) {
//       return res.status(401).json({ success: false, message: "Token expired or blacklisted" });
//     }

//     // ✅ verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // { id, email }

//     next();
//   } catch (error) {
//     console.error("Auth error:", error);
//     return res.status(401).json({ success: false, message: "Token expired or invalid" });
//   }
// };


import jwt from "jsonwebtoken";
import User from "../models/User.js";
import BlacklistedToken from "../models/BlacklistedToken.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Check if token is blacklisted
    const blacklisted = await BlacklistedToken.findOne({ token });
    if (blacklisted) {
      return res.status(401).json({ success: false, message: "Token has been invalidated. Please log in again." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach full user data to the request object
    const user = await User.findById(decoded.id).select("-otp -otpExpiry -password");

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
  }
};



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

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Must have at least { email: ..., id: ... }
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
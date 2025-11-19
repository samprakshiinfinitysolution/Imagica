
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import userRoutes from "./routes/userRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import frameRoutes from "./routes/frameRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DEV: Robust CORS responder (mirrors request origin) to avoid CORS issues
// Note: This is permissive and intended for development / testing only.
app.use((req, res, next) => {
  const origin = req.headers.origin || req.get('origin');
  if (origin) {
    // Mirror the origin to allow credentials
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ✅ CORS setup
// app.use(
//   cors({
//     origin: ["http://localhost:5173"], // frontend local URL
//     credentials: true,
//   })
// );

// ✅ Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 60 * 5,
    }),
    cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 5 },
  })
);

// 🧹 Remove old local upload system
// ❌ No need to serve /uploads folder anymore since frames go to Cloudinary
// const uploadPath = path.join(process.cwd(), "uploads");
// if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
// app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ API Routes
app.use("/api/frames", frameRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admins", adminRoutes);
app.use("/api/notifications", notificationRoutes);

// ✅ Example Cloudinary frame image (for testing only)
// https://res.cloudinary.com/your-cloud-name/image/upload/v1730000/frames/abc.png

// ✅ Optional: Serve frontend build (for deployment)
const distPath = path.join(__dirname, "public/dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ✅ Connect MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5001;
    const HOST = process.env.HOST || "0.0.0.0";

    app.listen(PORT, HOST, () => {
      const hostDisplay = HOST === "0.0.0.0" ? "localhost" : HOST;
      console.log(`🚀 Server running at http://${hostDisplay}:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

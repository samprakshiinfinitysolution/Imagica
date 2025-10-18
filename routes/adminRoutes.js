import express from "express";
import { adminLogout, createAdmin, verifyAdmin } from "../controllers/adminController.js";
import { adminAuthMiddleware } from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// POST /api/admins
router.post("/", createAdmin);
router.post("/login", verifyAdmin);
router.post("/logout", adminAuthMiddleware, adminLogout);

export default router
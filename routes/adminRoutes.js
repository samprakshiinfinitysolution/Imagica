import express from "express";
import { createAdmin, verifyAdmin } from "../controllers/adminController.js";

const router = express.Router();

// POST /api/admins
router.post("/", createAdmin);
router.post("/login", verifyAdmin);

export default router;

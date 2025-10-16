// routes/feedbackRoutes.js
import express from "express";
import { checkFeedbackStatus, addFeedback, getAllFeedbacks, getFeedbackCount, deleteFeedback } from "../controllers/feedbackController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Protected routes
router.get("/check-feedback", authMiddleware, checkFeedbackStatus);
router.post("/add-feedback", authMiddleware, addFeedback);
router.get("/all", getAllFeedbacks);
router.get("/count", getFeedbackCount);
router.delete("/:id", deleteFeedback);

export default router;

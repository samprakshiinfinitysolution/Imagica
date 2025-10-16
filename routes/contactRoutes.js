import express from "express";
import { createContact, getContacts, deleteContact } from "../controllers/contactController.js";

const router = express.Router();

router.post("/", createContact);   // ➕ Save form data
router.get("/", getContacts);      // 📂 Get all
router.delete("/:id", deleteContact); // ❌ Delete

export default router;

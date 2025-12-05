    import express from "express";
    import { createFestival, getFestivals, deleteFestival } from "../controllers/festivalController.js";
    import uploadFrame from "../middleware/uploadFrame.js";

    const router = express.Router();

    // POST /api/festivals - multipart/form-data with fields: festivalname, festivaldate, description (optional), images[]
    router.post("/", uploadFrame.array("images", 10), createFestival);

    // GET /api/festivals
    router.get("/", getFestivals);

    // DELETE /api/festivals/:id
    router.delete("/:id", deleteFestival);

    export default router;
    
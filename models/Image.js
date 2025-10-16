import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },        // Cloudinary URL
    public_id: { type: String, required: true },  // Cloudinary ID (for delete)
    category: { type: String, required: true },   // Category
  },
  { timestamps: true }
);

export default mongoose.model("Image", imageSchema);

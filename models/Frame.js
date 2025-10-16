import mongoose from "mongoose";

const frameSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    framePath: { type: String, required: true },
    layout: {
      photo: { type: Object },
      name: { type: Object },
      position: { type: Object },
      designation: { type: Object },
      businessName: { type: Object },
      instagram: { type: Object },
      facebook: { type: Object },
      linkedin: { type: Object },
      twitter: { type: Object }
    }
  },
  { timestamps: true }
);

export default mongoose.model("Frame", frameSchema);

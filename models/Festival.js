import mongoose from "mongoose";

const festivalSchema = new mongoose.Schema(
  {
    festivalName: { type: String, required: true },
    festivalDate: { type: Date, required: true },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
      },
    ],
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Festival", festivalSchema);

import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String },      // optional
    email: { type: String },     // optional
    subject: { type: String },   // optional
    message: { type: String },   // optional
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;

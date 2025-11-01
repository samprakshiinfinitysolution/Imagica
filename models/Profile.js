// backend/models/Profile.js
import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  profiletype:{ type: String},
  file:{ type: String},  //image ki file
  name: { type: String,  },
  mobile: { type: String },
  email: { type: String },  
  language: { type: String },
  religion: { type: String },
  birthDate: { type: Date },
  address: { type: String },
  
categories: { type: [String], default: [] },
  businessName:{type:String},
  businessTagline:{type:String},  
cloudinary_id: { type: String },
partyname:{type:String},
positionname:{type:String},

// profesissional
designation: { type: String},

  gender: { type: String },
  country: { type: String },
  state: { type: String },
  city: { type: String },
  instatext:{ type:String},
  social_twitter:{ type:String},
  social_facebook:{ type:String},
  social_linkedin:{type:String},

  visibleName: { type: Boolean, default: true },
showDesignation: { type: Boolean, default: true },
showMobile: { type: Boolean, default: true },
showAddress: { type: Boolean, default: true },
showInstagram: { type: Boolean, default: true },
showTwitter: { type: Boolean, default: true },
showFacebook: { type: Boolean, default: true },
showLinkedIn: { type: Boolean, default: true },
showPosition: { type: Boolean, default: true },
showBusinessName: { type: Boolean, default: true },
showBusinessTagline: { type: Boolean, default: true },

}, { timestamps: true });

const Profile = mongoose.model("Political", profileSchema);


export default Profile;

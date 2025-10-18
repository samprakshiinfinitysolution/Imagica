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
categories: { type: [String], default: [] },
  businessName:{type:String},
  businessTagline:{type:String},  

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

}, { timestamps: true });

const Profile = mongoose.model("Political", profileSchema);


export default Profile;

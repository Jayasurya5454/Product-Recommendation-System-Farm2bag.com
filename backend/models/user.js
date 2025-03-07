const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mobileNumber: {
    type: String,
    required: false,
    unique: true,
  },
  lastVisit: {
    type: Date,
    default: Date.now,
  },
  age: {
    type: Number,
    required: false,
  },
  gender: {
    type: String,
    required: false,
  },
  weight: {
    type: Number,
    required: false,
  },
  height: {
    type: Number,
    required: false,
  },
  bmi: {
    type: Number,
    required: false,
  },
  medicalConditions: {
    type: [String],
    required: false,
  },
  skinType: {
    type: String,
    required: false,
  },
  occupation: {
    type: String,
    required: false,
  },
  dietType: {
    type: String,
    enum: ["vegetarian", "vegan", "keto", "none"],
    default: "none",
  },
  preferredSeasonalProducts: {
    type: [String],
    required: false,
  },
  purchaseHistory: [{
    productId: String,
    purchaseDate: Date,
  }],
  rewardPoints: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('user', UserSchema);
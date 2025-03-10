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
    type: [String],
    required: false,
  },
  occupation: {
    type: [String],
    enum: ['athlete', 'businessman', 'homemaker', 'teenager', 'child', 'employee', 'senior citizen'],
    required: false, 
  },
  dietType: {
    type: String,
    enum: ["vegetarian", "vegan", "keto", "none"],
    default: "none",
  },
  
});

module.exports = mongoose.model('user', UserSchema);
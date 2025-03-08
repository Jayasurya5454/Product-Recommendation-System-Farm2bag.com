const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  category: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  //photo is a url 
 photos: {
   type: String,
   required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  nutritionalInfo: {
    calories: { type: Number, required: false },
    protein: { type: Number, required: false },
    fiber: { type: Number, required: false },
    vitamins: { type: [String], required: false },
  },
  healthConditions: {
    type: [String],
    required: false,
  },
  seasonal: {
    type: [String],
    enum: ["summer", "rainy", "winter", "spring", "autumn", "monsoon"], 
    required: false,
  },
  skinTypeCompatibility: {
    type: String,
    enum : ['oily', 'dry', 'combination', 'normal'],
    required: false,
  },
  complementaryProducts: {
    type: [String],
    required: false,
  },
  occupationTags: {
    type: [String],
    enum : ['athlete', 'businessman', 'homemaker', 'teenager', 'child', 'employee', 'senior citizen'],
    required: false,
  },
  recipePairings: {
    type: [String],
    required: false,
  },
  discount: {
    type: Number,
    default: 0,
  },
  trendingScore: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Product', ProductSchema);
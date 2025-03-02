const mongoose = require('mongoose');

const AllProductSchema =new mongoose.Schema({
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
  photos: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  weights: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model('AllProducts', AllProductSchema);


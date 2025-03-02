const mongoose = require('mongoose');
const AllProductSchema = new mongoose.Schema({
  weights: {
    type: Number,
    required: true,
    default: 0,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});

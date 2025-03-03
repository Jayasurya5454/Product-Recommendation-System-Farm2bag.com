const mongoose = require('mongoose');


const AllProductSchema =new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  },

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

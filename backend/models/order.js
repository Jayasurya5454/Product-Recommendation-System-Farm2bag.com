const mongoose = require('mongoose');
const OrderSchema =new mongoose.Schema({
  user: {
    type: String,
    ref: 'user',
  },
  address: {
    type: String,
    required: true,
  },
  items: [
    {
      type: String,
      ref: 'product',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', OrderSchema);

const mongoose = require('mongoose');
const OrderSchema = new Schema({
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

module.exports = mongoose.model('order', OrderSchema);

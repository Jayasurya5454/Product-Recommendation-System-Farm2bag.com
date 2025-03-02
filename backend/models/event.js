const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  userId: { type: String, ref: "User", required: true },
  productId: { type: String, ref: "Product", required: true },
  eventType: {
    type: String,
    enum: ["view", "search", "add_to_cart", "favourite", "purchase"],
    required: true,
  },
  weight: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Event", EventSchema);

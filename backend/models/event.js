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
  context: {
    device: { type: String, enum: ["mobile", "desktop", "tablet"], required: false },
    location: { type: String, required: false },
    timeOfDay: { type: String, enum: ["morning", "afternoon", "evening", "night"], required: false },
  },
  sessionId: { type: String, required: false },
  rating: { type: Number, min: 1, max: 5, required: false },
});

module.exports = mongoose.model("Event", EventSchema);
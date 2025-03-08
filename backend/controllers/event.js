const Event = require('../models/event.js');
const AllProduct = require('../models/allProducts.js');
const EVENT_WEIGHTS = {
    view: 1,
    search: 2,
    add_to_cart: 3,
    favourite: 5,
    purchase: 7,
};

// Track user events
module.exports.trackEvent = async (req, res) => {
    try {
        const { userId, productId, eventType,context,sessionId } = req.body;
        console.log("Received event data:", { userId, productId, eventType, context, sessionId });
        const weight = EVENT_WEIGHTS[eventType];
        if (!weight) {
            return res.status(400).json({ message: 'Invalid event type' });
        }
        const event = new Event({ userId, productId, eventType, weight,context,sessionId });
        let allproduct = await AllProduct.findOne({ productId });
        if (!allproduct) {
            allproduct = new AllProduct({ productId, weights: weight });
        } else {
            allproduct.weights += weight;
        }
        await allproduct.save();
        await event.save();
        res.status(201).json({ message: 'Event tracked successfully' });
    } catch (error) {
      console.error("Error tracking event:", error);
      res.status(500).json({ message: error.message });
    }
  };

// Remove user events
module.exports.removeEvent = async (req, res) => {
    try {
        const { userId, productId, eventType } = req.body;
        const event = await Event.findOneAndDelete({ userId, productId, eventType });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        const weight = EVENT_WEIGHTS[eventType];
        let allproduct = await AllProduct.findOne({ productId });
        if (allproduct) {
            allproduct.weights -= weight;
            await allproduct.save();
        }
        res.status(200).json({ message: 'Event removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user events

module.exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('userId').populate('productId');
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
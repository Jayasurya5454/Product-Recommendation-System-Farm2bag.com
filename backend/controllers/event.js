const Event = require('../models/event.js');

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
        const { userId, productId, eventType } = req.body;
        const weight = EVENT_WEIGHTS[eventType];
        if (!weight) {
            return res.status(400).json({ message: 'Invalid event type' });
        }
        const event = new Event({ userId, productId, eventType, weight });
        await event.save();
        res.status(201).json({ message: 'Event tracked successfully' });
    } catch (error) {
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

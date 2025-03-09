
const Order = require('../models/order.js');


const CreateOrder = async (req, res) => {
    try {
        const { userId, address, items } = req.body;
        const order = new Order({ userId, address, items });
        await order.save();
        res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { CreateOrder, getOrders };

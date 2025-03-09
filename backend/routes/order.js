const express = require('express');
const router = express.Router();
const { CreateOrder, getOrders } = require('../controllers/order');
router.post('/', CreateOrder);
router.get('/', getOrders);

module.exports = router;

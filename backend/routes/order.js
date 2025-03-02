const express = require('express');
const router = express.Router();
const { CreateOrder, getorders } = require('../controllers/order');
router.post('/', CreateOrder);
router.get('/', getorders);

module.exports = router;

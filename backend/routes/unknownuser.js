const express = require('express');

const router = express.Router();
const { getAllProducts } = require('../controllers/unknownuser.js');


router.get('/', getAllProducts);

module.exports = router;
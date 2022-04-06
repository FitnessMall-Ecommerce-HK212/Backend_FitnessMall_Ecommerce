const express = require('express');
const router = express.Router();

const momoPayment = require('../controllers/paymentController');
router.post('/momo', momoPayment);

module.exports = router;
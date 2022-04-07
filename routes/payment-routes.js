const express = require('express');
const router = express.Router();

const { momoPayment, checkPayment } = require('../controllers/paymentController');
router.post('/momo', momoPayment);
router.get('/momo/check_payment', checkPayment);

module.exports = {
    routes: router
}
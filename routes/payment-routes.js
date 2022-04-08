const express = require('express');
const router = express.Router();

const { momoPayment,
    zalopayPayment,
    cashPayment,
    paypalPayment,
    checkPaymentMoMo,
    checkPaymentZalopay,
    checkPaymentPaypal } = require('../controllers/paymentController');

router.post('/momo', momoPayment);
router.post('/zalopay', zalopayPayment);
router.post('/paypal', paypalPayment);
router.post('/cash', cashPayment);
router.get('/momo/check_payment', checkPaymentMoMo);
router.get('/zalopay/check_payment', checkPaymentZalopay);
router.get('/paypal/check_payment', checkPaymentPaypal);

module.exports = {
    routes: router
}
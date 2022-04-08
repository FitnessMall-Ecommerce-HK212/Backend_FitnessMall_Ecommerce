const express = require('express');
const router = express.Router();

const { momoPayment, checkPaymentMoMo, deleteR } = require('../controllers/paymentController');
router.post('/momo', momoPayment);
router.get('/momo/check_payment', checkPaymentMoMo);
router.delete('/test/delete', deleteR);

module.exports = {
    routes: router
}
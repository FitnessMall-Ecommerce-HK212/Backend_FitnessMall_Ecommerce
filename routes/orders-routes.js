const express = require('express');
const {addOrder, 
       getAllOrders, 
       getOrder,
       updateOrder,
       deleteOrder
      } = require('../controllers/ordersController');
const momoPayment = require('../controllers/paymentController');

const router = express.Router();

router.post('/payment', momoPayment);
// router.post('/order', addOrder);
// router.get('/orders', getAllOrders);
// router.get('/order/:id', getOrder);
// router.put('/order/:id', updateOrder);
// router.delete('/order/:id', deleteOrder);


module.exports = router;
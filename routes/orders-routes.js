const express = require('express');
const { addOrder,
      getAllOrders,
      getOrder,
      updateOrder,
      deleteOrder,
      getShippingFee,
      getShipState
} = require('../controllers/ordersController');

const router = express.Router();

router.get('/order/shipping_fee', getShippingFee);

router.post('/order', addOrder);

router.get('/orders/:username', getAllOrders);
router.get('/order/:username/:orderID', getOrder);

router.delete('/order/:orderID', deleteOrder);

router.get('/order_state/:orderID/ship', getShipState);

// router.post('/order', addOrder);
// router.get('/orders', getAllOrders);
// router.get('/order/:id', getOrder);
// router.put('/order/:id', updateOrder);
// router.delete('/order/:id', deleteOrder);


module.exports = {
    routes: router
}
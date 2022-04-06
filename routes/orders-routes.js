const express = require('express');
const {addOrder, 
       getAllOrders, 
       getOrder,
       updateOrder,
       deleteOrder
      } = require('../controllers/ordersController');

const router = express.Router();

router.post('/order', addOrder);
router.get('/orders/:username', getAllOrders);
router.get('/order/:username/:orderID', getOrder);
router.put('/order/:id', updateOrder);
router.delete('/order/:id', deleteOrder);


module.exports = {
    routes: router
}
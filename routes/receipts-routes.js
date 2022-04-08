const express = require('express');
const {addReceipt, 
       getAllReceipts, 
       getReceipt,
       updateReceipt,
       deleteReceipt
      } = require('../controllers/receiptsController');

const router = express.Router();

// router.post('/receipt', addReceipt);
// router.get('/receipts', getAllReceipts);
router.get('/receipt/:receiptID', getReceipt);
// router.put('/receipt/:id', updateReceipt);
// router.delete('/receipt/:id', deleteReceipt);


module.exports = {
    routes: router
}
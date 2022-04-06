const express = require('express');
const {
        getHotItems,
        addItem, 
       getAllItems, 
       getItem,
       updateItem,
       deleteItem,
       addFeedBack,
      } = require('../controllers/itemsController');

const router = express.Router();

router.get('/items/hot', getHotItems);
router.get('/items', getAllItems);
router.get('/item/:itemID', getItem);
router.post('/item/feedback', addFeedBack);
// router.post('/item', addItem);
// router.put('/item/:id', updateItem);
// router.delete('/item/:id', deleteItem);


module.exports = {
      routes: router
  }
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

router.get('/hot', getHotItems);
router.post('/feedback', addFeedBack);
router.get('/:id', getItem);
// router.post('/item', addItem);
// router.get('/items', getAllItems);
// router.get('/item/:id', getItem);
// router.put('/item/:id', updateItem);
// router.delete('/item/:id', deleteItem);


module.exports = router;
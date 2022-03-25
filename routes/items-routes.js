const express = require('express');
const {addItem, 
       getAllItems, 
       getItem,
       updateItem,
       deleteItem
      } = require('../controllers/usersController');

const router = express.Router();

router.post('/item', addItem);
router.get('/items', getAllItems);
router.get('/item/:id', getItem);
router.put('/item/:id', updateItem);
router.delete('/item/:id', deleteItem);


module.exports = {
    routes: router
}
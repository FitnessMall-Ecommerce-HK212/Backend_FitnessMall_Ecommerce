const express = require('express');
const {addItemType, 
       getAllItemTypes, 
       getItemType,
       updateItemType,
       deleteItemType
      } = require('../controllers/usersController');

const router = express.Router();

router.post('/itemType', addItemType);
router.get('/itemTypes', getAllItemTypes);
router.get('/itemType/:id', getItemType);
router.put('/itemType/:id', updateItemType);
router.delete('/itemType/:id', deleteItemType);


module.exports = {
    routes: router
}
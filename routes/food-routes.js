const express = require('express');
const {addFood, 
       getAllFoods, 
       getFood,
       updateFood,
       deleteFood
      } = require('../controllers/usersController');

const router = express.Router();

router.post('/food', addFood);
router.get('/foods', getAllFoods);
router.get('/food/:id', getFood);
router.put('/food/:id', updateFood);
router.delete('/food/:id', deleteFood);


module.exports = {
    routes: router
}
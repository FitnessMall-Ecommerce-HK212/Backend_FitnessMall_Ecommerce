const express = require('express');
const {addFood, 
       getAllFoods, 
       getFood,
       updateFood,
       deleteFood,
       updateFeedback
      } = require('../controllers/usersController');

const router = express.Router();

router.get('/update', updateFeedback);
router.post('/food', addFood);
router.get('/foods', getAllFoods);
router.get('/food/:id', getFood);
router.put('/food/:id', updateFood);
router.delete('/food/:id', deleteFood);


module.exports = {
    routes: router
}
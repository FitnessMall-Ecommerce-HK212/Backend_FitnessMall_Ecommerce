const express = require('express');
const { addFood,
    addFoodFeedBack,
    getAllFoods,
    getFood,
    updateFood,
    deleteFood
} = require('../controllers/foodController');

const router = express.Router();

// router.post('/food', addFood);
router.get('/foods', getAllFoods);
router.get('/food/:food_id', getFood);
router.post('/food/feedback', addFoodFeedBack);
// router.put('/food/:id', updateFood);
// router.delete('/food/:id', deleteFood);

module.exports = {
    routes: router
}
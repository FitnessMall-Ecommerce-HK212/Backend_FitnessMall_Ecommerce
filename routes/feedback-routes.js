const express = require('express');
const {addFeedback, 
       getAllFeedbacks, 
       getFeedback,
       updateFeedback,
       deleteFeedback
      } = require('../controllers/feedbacksController');

const router = express.Router();

router.post('/feedback', addFeedback);
router.get('/feedbacks', getAllFeedbacks);
router.get('/feedback/:id', getFeedback);
router.put('/feedback/:id', updateFeedback);
router.delete('/feedback/:id', deleteFeedback);


module.exports = {
    routes: router
}
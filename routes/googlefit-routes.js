const express = require('express');
const { getGoogleFitData,
    getGoogleFitDataReturn,
    getUserGoogleFitData
} = require('../controllers/googlefitController');

const router = express.Router();

// SESSION
router.get('/google_fit/data/:username', getUserGoogleFitData);
router.get('/google_fit', getGoogleFitData);
router.get('/google_fit_return', getGoogleFitDataReturn);

module.exports = {
  routes: router
}
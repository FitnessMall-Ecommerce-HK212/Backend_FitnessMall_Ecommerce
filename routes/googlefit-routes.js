const express = require('express');
const { getGoogleFitData,
    getGoogleFitDataReturn,
    getUserGoogleFitData,
    createGoogleFitData
} = require('../controllers/googlefitController');

const router = express.Router();

// SESSION
router.get('/google_fit/data/:username', getUserGoogleFitData);
router.get('/google_fit', getGoogleFitData);
router.get('/google_fit_return', getGoogleFitDataReturn);
router.post('/google_fit_create', createGoogleFitData);

module.exports = {
  routes: router
}